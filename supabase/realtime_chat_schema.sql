-- Realtime chat schema (idempotent and production-safe)
create extension if not exists "uuid-ossp";

-- *** Table definitions ***
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    username varchar(24) not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,

    -- username should be 3 to 24 characters long containing alphabets, numbers and underscores
    constraint username_validation check (username ~* '^[A-Za-z0-9_]{3,24}$')
);
comment on table public.profiles is 'Holds all of users profile information';

create table if not exists public.messages (
    id uuid not null primary key default uuid_generate_v4(),
    profile_id uuid default auth.uid() references public.profiles(id) on delete cascade not null,
    content varchar(500) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.messages is 'Holds individual messages within a chat room.';

-- Helpful indexes for common message queries
create index if not exists messages_profile_id_created_at_idx
    on public.messages (profile_id, created_at desc);

-- *** Add table to publication to enable realtime (idempotent) ***
do $$
begin
    if exists (
        select 1
        from pg_publication
        where pubname = 'supabase_realtime'
    )
    and not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'messages'
    ) then
        alter publication supabase_realtime add table public.messages;
    end if;
end;
$$;

-- Function to create a new row in profiles table upon signup
-- Safely handles missing/invalid/duplicate usernames from metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    raw_username text;
    base_username text;
    candidate_username text;
    attempt integer := 0;
begin
    -- If profile already exists (retries/replays), do nothing.
    if exists (select 1 from public.profiles p where p.id = new.id) then
        return new;
    end if;

    -- Keep only allowed characters; fallback if empty/invalid length.
    raw_username := coalesce(new.raw_user_meta_data->>'username', '');
    raw_username := regexp_replace(raw_username, '[^A-Za-z0-9_]', '', 'g');

    if length(raw_username) between 3 and 24 then
        base_username := raw_username;
    else
        base_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 18);
    end if;

    candidate_username := left(base_username, 24);

    -- Retry on unique username collisions.
    loop
        begin
            insert into public.profiles (id, username)
            values (new.id, candidate_username);
            exit;
        exception
            when unique_violation then
                attempt := attempt + 1;
                if attempt > 20 then
                    raise exception 'Could not allocate unique username for user %', new.id;
                end if;

                candidate_username := left(base_username, 19) || '_' || lpad(attempt::text, 4, '0');
        end;
    end loop;

    return new;
end;
$$;

-- Trigger to call `handle_new_user` when new user signs up (idempotent)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();

-- Minimal RLS to keep messages/profile writes scoped to authenticated user.
alter table public.profiles enable row level security;
alter table public.messages enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_own'
    ) then
        create policy profiles_select_own on public.profiles
            for select
            using (auth.uid() = id);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_own'
    ) then
        create policy profiles_update_own on public.profiles
            for update
            using (auth.uid() = id)
            with check (auth.uid() = id);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'messages' and policyname = 'messages_select_authenticated'
    ) then
        create policy messages_select_authenticated on public.messages
            for select
            to authenticated
            using (true);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'messages' and policyname = 'messages_insert_own'
    ) then
        create policy messages_insert_own on public.messages
            for insert
            to authenticated
            with check (auth.uid() = profile_id);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'messages' and policyname = 'messages_delete_own'
    ) then
        create policy messages_delete_own on public.messages
            for delete
            to authenticated
            using (auth.uid() = profile_id);
    end if;
end;
$$;
