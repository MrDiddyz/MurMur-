create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists archive_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  type text not null,
  title text not null,
  content text not null,
  tags text[] not null default '{}',
  emotional_tone text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists signal_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  input jsonb not null,
  output jsonb not null,
  clarity_score int,
  created_at timestamptz not null default now()
);

create table if not exists council_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  context text not null,
  agent_outputs jsonb not null,
  final_output jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists events (
  event_id uuid primary key default gen_random_uuid(),
  type text not null,
  source text not null,
  user_id uuid references users(id),
  payload jsonb not null default '{}'::jsonb,
  timestamp timestamptz not null default now()
);

create index if not exists idx_archive_project_created on archive_items(project_id, created_at desc);
create index if not exists idx_signal_project_created on signal_runs(project_id, created_at desc);
create index if not exists idx_council_project_created on council_runs(project_id, created_at desc);
create index if not exists idx_events_type_time on events(type, timestamp desc);
