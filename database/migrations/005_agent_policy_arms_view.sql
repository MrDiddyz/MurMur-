create or replace view agent_policy_arms_view as
select
  agent_id,
  arm,
  alpha,
  beta,
  pulls,
  last_reward,
  updated_at,
  (alpha / nullif(alpha + beta, 0)) as expected_mean
from agent_policy_arms;
