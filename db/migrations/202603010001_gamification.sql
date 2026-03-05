create table if not exists modules (
  id text primary key,
  name text not null,
  description text,
  prerequisite_module_id text references modules(id)
);

create table if not exists module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  module_id text references modules(id),
  completed_at timestamptz default now(),
  unique (user_id, module_id)
);

create table if not exists badges (
  id text primary key,
  name text not null,
  criteria jsonb
);

create table if not exists user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  badge_id text references badges(id),
  awarded_at timestamptz default now(),
  unique (user_id, badge_id)
);
