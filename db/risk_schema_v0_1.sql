create extension if not exists "pgcrypto";

create table public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  created_at timestamptz not null default now()
);

create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  full_name text,
  age integer,
  work_status text,
  family_responsibility text,
  primary_goal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.health_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  sleep_quality integer,
  stress_level integer,
  activity_level integer,
  symptom_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.financial_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  monthly_income numeric(12,2),
  monthly_expenses numeric(12,2),
  emergency_savings numeric(12,2),
  debt_total numeric(12,2),
  insurance_summary text,
  retirement_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.risk_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  health_score numeric(5,2),
  resilience_score numeric(5,2),
  burnout_risk numeric(5,2),
  insurance_gap_score numeric(5,2),
  longevity_pressure_score numeric(5,2),
  snapshot_version text not null default 'v0.1',
  rationale jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category text not null,
  priority text not null,
  title text not null,
  description text not null,
  rationale jsonb not null default '{}'::jsonb,
  confidence_score numeric(5,2),
  status text not null default 'open',
  created_by_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.followups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  recommendation_id uuid references public.recommendations(id) on delete set null,
  due_at timestamptz not null,
  status text not null default 'pending',
  message text,
  cadence text,
  created_by_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  recommendation_id uuid references public.recommendations(id) on delete set null,
  followup_id uuid references public.followups(id) on delete set null,
  outcome text,
  difficulty_score integer,
  usefulness_score integer,
  free_text text,
  created_at timestamptz not null default now()
);

create table public.learning_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  recommendation_id uuid references public.recommendations(id) on delete set null,
  event_type text not null,
  signal jsonb not null default '{}'::jsonb,
  model_version text not null default 'v0.1',
  created_at timestamptz not null default now()
);

create table public.debug_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  recommendation_id uuid references public.recommendations(id) on delete set null,
  followup_id uuid references public.followups(id) on delete set null,
  failure_type text not null,
  severity text not null,
  details jsonb not null default '{}'::jsonb,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  agent_name text not null,
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb not null default '{}'::jsonb,
  confidence_score numeric(5,2),
  run_status text not null default 'completed',
  created_at timestamptz not null default now()
);
