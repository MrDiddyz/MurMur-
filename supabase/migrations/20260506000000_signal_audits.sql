create extension if not exists pgcrypto;

create table if not exists public.signal_audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  website text not null,
  industry text not null,
  notes text,
  report jsonb not null,
  score integer not null check (score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists signal_audits_user_created_idx on public.signal_audits (user_id, created_at desc);

alter table public.signal_audits enable row level security;

create policy "Users can read their own signal audits"
  on public.signal_audits for select
  using (auth.uid() = user_id);

create policy "Users can insert their own signal audits"
  on public.signal_audits for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own signal audits"
  on public.signal_audits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own signal audits"
  on public.signal_audits for delete
  using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_signal_audits_updated_at on public.signal_audits;
create trigger set_signal_audits_updated_at
  before update on public.signal_audits
  for each row execute function public.set_updated_at();
