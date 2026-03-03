-- Enable pgcrypto for UUID generation
create extension if not exists pgcrypto;

-- ───── Profiles (linked to auth.users) ─────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  plan text not null default 'free' check (plan in ('free','pro')),
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name',''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ───── Projects ─────
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  bpm int,
  key text,
  status text not null default 'idea',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute procedure public.set_updated_at();

-- ───── Tracks ─────
create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  file_path text not null,
  duration_seconds int,
  type text not null default 'music',
  created_at timestamptz not null default now()
);

-- ───── Exports ─────
create table if not exists public.exports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  format text not null,
  file_path text not null,
  created_at timestamptz not null default now()
);

-- ───── Subscriptions ─────
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  status text not null,
  renewal_date timestamptz,
  created_at timestamptz not null default now()
);

-- ───── AI Jobs (stub) ─────
create table if not exists public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id),
  job_type text not null,
  status text not null default 'queued',
  result_file_path text,
  created_at timestamptz not null default now()
);
