create extension if not exists "pgcrypto";

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  source text not null default 'app',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.reflections enable row level security;

create policy "service role can manage reflections"
  on public.reflections
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create index if not exists idx_reflections_created_at on public.reflections(created_at desc);
