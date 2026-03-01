create extension if not exists "pgcrypto";

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_type text not null,
  platform text not null default 'discord',
  guild_id text,
  channel_id text,
  user_id_hash text,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists events_created_at_idx on public.events (created_at desc);
create index if not exists events_type_idx on public.events (event_type);

create table if not exists public.actions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  action_type text not null,
  platform text not null default 'discord',
  guild_id text,
  channel_id text,
  correlation_id text,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb
);

create index if not exists actions_created_at_idx on public.actions (created_at desc);
create index if not exists actions_type_idx on public.actions (action_type);

create table if not exists public.metrics_hourly (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  platform text not null default 'discord',
  guild_id text,
  window_start timestamptz not null,
  window_end timestamptz not null,
  messages int not null default 0,
  active_users int not null default 0,
  new_members int not null default 0
);

create index if not exists metrics_hourly_window_idx on public.metrics_hourly (window_start desc);
