create extension if not exists "pgcrypto";
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  description text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create table if not exists archive_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  type text not null,
  title text not null,
  content text not null,
  tags text[] default '{}',
  emotional_tone text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create table if not exists signal_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  archive_item_id uuid references archive_items(id) on delete set null,
  input jsonb not null,
  output jsonb not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create table if not exists council_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  signal_run_id uuid references signal_runs(id) on delete set null,
  agents jsonb not null,
  final_output jsonb not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  source text not null,
  user_id uuid references users(id) on delete set null,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_archive_project_created on archive_items(project_id, created_at desc);
create index if not exists idx_signal_project_created on signal_runs(project_id, created_at desc);
create index if not exists idx_council_project_created on council_runs(project_id, created_at desc);
create index if not exists idx_events_type_created on events(type, created_at desc);
