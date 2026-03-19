create extension if not exists pgcrypto;

create table if not exists episodes (
  id uuid primary key default gen_random_uuid(),
  user_prompt text not null,
  final_output text not null,
  winner_agent text not null,
  rationale text,
  score numeric,
  feedback integer,
  created_at timestamptz default now(),
  constraint episodes_feedback_check check (feedback in (-1, 1) or feedback is null)
);

create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid references episodes(id) on delete cascade,
  agent_name text not null,
  input_text text not null,
  output_text text not null,
  score numeric,
  created_at timestamptz default now()
);

create index if not exists idx_agent_runs_episode_id on agent_runs(episode_id);
create index if not exists idx_episodes_created_at on episodes(created_at desc);
