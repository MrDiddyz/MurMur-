-- 1) Observations / metrics
create table if not exists murmur_observations (
  id bigserial primary key,
  user_id uuid,
  source text not null,
  metric_key text not null,
  metric_value double precision not null,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- 2) Evolution proposals
create table if not exists murmur_evolution_proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  status text not null default 'draft',
  title text not null,
  hypothesis text not null,
  change_type text not null,
  patch jsonb not null,
  score double precision,
  risk double precision,
  evidence jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Applied baselines / history
create table if not exists murmur_evolution_baselines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  proposal_id uuid references murmur_evolution_proposals(id),
  baseline jsonb not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_obs_user_time on murmur_observations(user_id, created_at desc);
create index if not exists idx_prop_user_time on murmur_evolution_proposals(user_id, created_at desc);
