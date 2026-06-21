-- 1) Policy “header” per agent (for locking/versioning)
create table if not exists agent_policy (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null unique,           -- "PAPI" | "EMMY" | ...
  policy_type text not null default 'beta_thompson',
  version int not null default 1,
  updated_at timestamptz not null default now()
);

-- 2) Arms for each agent policy with alpha/beta params
create table if not exists agent_policy_arms (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,                  -- matches agent_policy.agent_id
  arm text not null,                       -- e.g. "swing_08"
  alpha float8 not null default 1,
  beta  float8 not null default 1,
  pulls bigint not null default 0,
  last_reward float8,
  updated_at timestamptz not null default now(),
  unique (agent_id, arm)
);

-- 3) Optional: track which arm was used for a track (audit)
create table if not exists agent_arm_assignments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  track_id uuid,                           -- references tracks(id) if you have it
  agent_id text not null,
  arm text not null,
  reward_total float8,
  reward_dim float8,                       -- e.g. groove/emotion/contrast/spatial dimension reward
  meta jsonb
);

-- 4) (Recommended) RPC: atomic select + update in one transaction
-- We'll do selection in app, but update via RPC for concurrency safety.
create or replace function bandit_update_arm(
  p_agent_id text,
  p_arm text,
  p_reward float8
) returns void
language plpgsql
as $$
begin
  update agent_policy_arms
  set
    alpha = alpha + greatest(0, least(1, p_reward)),
    beta  = beta  + (1 - greatest(0, least(1, p_reward))),
    pulls = pulls + 1,
    last_reward = p_reward,
    updated_at = now()
  where agent_id = p_agent_id and arm = p_arm;

  if not found then
    -- if arm doesn't exist yet, create it with 1/1 priors then apply update
    insert into agent_policy_arms(agent_id, arm, alpha, beta, pulls, last_reward, updated_at)
    values (
      p_agent_id,
      p_arm,
      1 + greatest(0, least(1, p_reward)),
      1 + (1 - greatest(0, least(1, p_reward))),
      1,
      p_reward,
      now()
    )
    on conflict (agent_id, arm) do update
      set
        alpha = agent_policy_arms.alpha + greatest(0, least(1, p_reward)),
        beta  = agent_policy_arms.beta  + (1 - greatest(0, least(1, p_reward))),
        pulls = agent_policy_arms.pulls + 1,
        last_reward = p_reward,
        updated_at = now();
  end if;

  -- bump policy header timestamp
  insert into agent_policy(agent_id, updated_at)
  values (p_agent_id, now())
  on conflict (agent_id) do update
    set updated_at = now(),
        version = agent_policy.version + 1;
end;
$$;

-- RLS setup (simple: only service role writes; reads can be allowed to authenticated)
alter table agent_policy enable row level security;
alter table agent_policy_arms enable row level security;
alter table agent_arm_assignments enable row level security;

-- read policies
-- make migration idempotent when re-applied
 drop policy if exists "read agent_policy" on agent_policy;
 drop policy if exists "read agent_policy_arms" on agent_policy_arms;
 drop policy if exists "block writes agent_policy" on agent_policy;
 drop policy if exists "block writes agent_policy_arms" on agent_policy_arms;
 drop policy if exists "block writes agent_arm_assignments" on agent_arm_assignments;

create policy "read agent_policy"
on agent_policy for select
to authenticated
using (true);

create policy "read agent_policy_arms"
on agent_policy_arms for select
to authenticated
using (true);

-- write policies (block client writes; do via Edge functions service role)
create policy "block writes agent_policy"
on agent_policy for all
to authenticated
using (false) with check (false);

create policy "block writes agent_policy_arms"
on agent_policy_arms for all
to authenticated
using (false) with check (false);

create policy "block writes agent_arm_assignments"
on agent_arm_assignments for all
to authenticated
using (false) with check (false);

-- permit rpc execution to authenticated clients if needed; RLS still applies for non-service keys
revoke all on function bandit_update_arm(text, text, float8) from public;
grant execute on function bandit_update_arm(text, text, float8) to authenticated;
