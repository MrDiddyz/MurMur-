CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

DO $$ BEGIN
  CREATE TYPE run_state AS ENUM (
    'RECEIVED','CONTEXT_ASSEMBLED','PLAN_CREATED','AGENTS_RUNNING','EVALUATING',
    'NEEDS_HUMAN_REVIEW','REVISING','APPROVED','COMMITTED','SCHEDULED','EXECUTED',
    'MEASURING','COMPLETED','FAILED','CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE approval_policy AS ENUM ('AUTO','HUMAN_REQUIRED','REJECT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE risk_level AS ENUM ('LOW','MEDIUM','HIGH');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE approval_status AS ENUM ('REQUESTED','APPROVED','DENIED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE artifact_type AS ENUM ('text','json','pdf','deck','tasks','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS runs (
  run_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL,
  org_id          uuid NULL,
  project_id      uuid NULL,
  state           run_state NOT NULL DEFAULT 'RECEIVED',
  approval        approval_policy NOT NULL DEFAULT 'AUTO',
  risk            risk_level NOT NULL DEFAULT 'LOW',
  request_text    text NOT NULL,
  request_locale  text NULL,
  request_json    jsonb NOT NULL DEFAULT '{}'::jsonb,
  context_json    jsonb NULL,
  plan_json       jsonb NULL,
  final_output    jsonb NULL,
  evaluation_json jsonb NULL,
  error_json      jsonb NULL,
  idempotency_key text NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz NULL
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_runs_updated_at ON runs;
CREATE TRIGGER trg_runs_updated_at
BEFORE UPDATE ON runs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_runs_user_created_at ON runs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_runs_org_project_created_at ON runs (org_id, project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_runs_state_created_at ON runs (state, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_runs_idempotency
ON runs (user_id, idempotency_key)
WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS run_events (
  event_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id         uuid NULL REFERENCES runs(run_id) ON DELETE SET NULL,
  type           text NOT NULL,
  actor          text NOT NULL DEFAULT 'system',
  occurred_at    timestamptz NOT NULL DEFAULT now(),
  payload        jsonb NOT NULL DEFAULT '{}'::jsonb,
  source         text NULL,
  source_event_id text NULL
);

CREATE INDEX IF NOT EXISTS idx_run_events_run_time ON run_events (run_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_run_events_type_time ON run_events (type, occurred_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_run_events_source_id
ON run_events (source, source_event_id)
WHERE source IS NOT NULL AND source_event_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS agent_runs (
  agent_run_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id         uuid NOT NULL REFERENCES runs(run_id) ON DELETE CASCADE,
  agent_name     text NOT NULL,
  agent_mode     text NULL,
  variant        int NULL,
  prompt_template_id uuid NULL,
  input_json     jsonb NOT NULL DEFAULT '{}'::jsonb,
  output_json    jsonb NULL,
  citations_json jsonb NULL,
  tool_traces    jsonb NULL,
  token_in       int NULL,
  token_out      int NULL,
  cost_usd       numeric(12,6) NULL,
  started_at     timestamptz NOT NULL DEFAULT now(),
  ended_at       timestamptz NULL,
  status         text NOT NULL DEFAULT 'ok'
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_run_agent_time ON agent_runs (run_id, agent_name, started_at DESC);

CREATE TABLE IF NOT EXISTS evaluations (
  evaluation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id        uuid NOT NULL REFERENCES runs(run_id) ON DELETE CASCADE,
  alignment     numeric(5,4) NULL,
  originality   numeric(5,4) NULL,
  clarity       numeric(5,4) NULL,
  market_fit    numeric(5,4) NULL,
  risk_score    numeric(5,4) NULL,
  effort        numeric(5,4) NULL,
  impact        numeric(5,4) NULL,
  overall       numeric(5,4) NULL,
  flags         text[] NOT NULL DEFAULT ARRAY[]::text[],
  recommended_action text NOT NULL,
  notes         text NULL,
  raw_json      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evaluations_run_time ON evaluations (run_id, created_at DESC);

CREATE TABLE IF NOT EXISTS approvals (
  approval_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id        uuid NOT NULL REFERENCES runs(run_id) ON DELETE CASCADE,
  status        approval_status NOT NULL DEFAULT 'REQUESTED',
  requested_at  timestamptz NOT NULL DEFAULT now(),
  reviewer_id   uuid NULL,
  decided_at    timestamptz NULL,
  reason        text NULL,
  summary_json  jsonb NULL,
  proposed_json jsonb NULL
);

CREATE INDEX IF NOT EXISTS idx_approvals_run_time ON approvals (run_id, requested_at DESC);

CREATE TABLE IF NOT EXISTS tasks (
  task_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL,
  org_id        uuid NULL,
  project_id    uuid NULL,
  run_id        uuid NULL REFERENCES runs(run_id) ON DELETE SET NULL,
  title         text NOT NULL,
  description   text NULL,
  status        text NOT NULL DEFAULT 'todo',
  priority      int NOT NULL DEFAULT 3,
  week          int NULL,
  due_date      date NULL,
  meta_json     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON tasks;
CREATE TRIGGER trg_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_tasks_user_project_status ON tasks (user_id, project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_run_id ON tasks (run_id);

CREATE TABLE IF NOT EXISTS artifacts (
  artifact_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id        uuid NULL REFERENCES runs(run_id) ON DELETE SET NULL,
  user_id       uuid NOT NULL,
  org_id        uuid NULL,
  project_id    uuid NULL,
  type          artifact_type NOT NULL DEFAULT 'other',
  name          text NOT NULL,
  content_type  text NULL,
  uri           text NOT NULL,
  sha256        text NULL,
  meta_json     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artifacts_run ON artifacts (run_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artifacts_user_project ON artifacts (user_id, project_id, created_at DESC);

CREATE TABLE IF NOT EXISTS project_memory (
  memory_id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL,
  org_id        uuid NULL,
  project_id    uuid NULL,
  key           text NOT NULL,
  value_json    jsonb NOT NULL,
  source_run_id uuid NULL REFERENCES runs(run_id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_memory_updated_at ON project_memory;
CREATE TRIGGER trg_memory_updated_at
BEFORE UPDATE ON project_memory
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE UNIQUE INDEX IF NOT EXISTS uq_project_memory_key
ON project_memory (user_id, project_id, key);
