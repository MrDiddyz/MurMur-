create extension if not exists "pgcrypto";

create table if not exists runs (
  id uuid primary key default gen_random_uuid(),
  input text not null,
  outputs jsonb not null,
  scores jsonb not null,
  winner text not null,
  created_at timestamptz not null default now()
);

create table if not exists agent_stats (
  agent text primary key,
  wins int not null default 0,
  weight float not null default 1
);

insert into agent_stats (agent, wins, weight)
values
  ('TeacherAgent', 0, 1),
  ('ExperimentalAgent', 0, 1),
  ('ThinkTankAgent', 0, 1),
  ('ReflectiveAgent', 0, 1)
on conflict (agent) do nothing;

create or replace function increment_agent_win(agent_name text)
returns void
language plpgsql
as $$
begin
  update agent_stats
  set wins = wins + 1,
      weight = least(5, weight + 0.1)
  where agent = agent_name;
end;
$$;
