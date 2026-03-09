CREATE TABLE IF NOT EXISTS runs_state_transitions (
  from_state run_state NOT NULL,
  to_state   run_state NOT NULL,
  PRIMARY KEY (from_state, to_state)
);

INSERT INTO runs_state_transitions (from_state, to_state) VALUES
  ('RECEIVED', 'CONTEXT_ASSEMBLED'),
  ('RECEIVED', 'FAILED'),
  ('RECEIVED', 'CANCELLED'),

  ('CONTEXT_ASSEMBLED', 'PLAN_CREATED'),
  ('CONTEXT_ASSEMBLED', 'FAILED'),
  ('CONTEXT_ASSEMBLED', 'CANCELLED'),

  ('PLAN_CREATED', 'AGENTS_RUNNING'),
  ('PLAN_CREATED', 'FAILED'),
  ('PLAN_CREATED', 'CANCELLED'),

  ('AGENTS_RUNNING', 'EVALUATING'),
  ('AGENTS_RUNNING', 'FAILED'),
  ('AGENTS_RUNNING', 'CANCELLED'),

  ('EVALUATING', 'NEEDS_HUMAN_REVIEW'),
  ('EVALUATING', 'REVISING'),
  ('EVALUATING', 'APPROVED'),
  ('EVALUATING', 'FAILED'),
  ('EVALUATING', 'CANCELLED'),

  ('REVISING', 'EVALUATING'),
  ('REVISING', 'FAILED'),
  ('REVISING', 'CANCELLED'),

  ('NEEDS_HUMAN_REVIEW', 'APPROVED'),
  ('NEEDS_HUMAN_REVIEW', 'FAILED'),
  ('NEEDS_HUMAN_REVIEW', 'CANCELLED'),

  ('APPROVED', 'COMMITTED'),
  ('APPROVED', 'FAILED'),
  ('APPROVED', 'CANCELLED'),

  ('COMMITTED', 'SCHEDULED'),
  ('COMMITTED', 'COMPLETED'),
  ('COMMITTED', 'FAILED'),
  ('COMMITTED', 'CANCELLED'),

  ('SCHEDULED', 'EXECUTED'),
  ('SCHEDULED', 'FAILED'),
  ('SCHEDULED', 'CANCELLED'),

  ('EXECUTED', 'MEASURING'),
  ('EXECUTED', 'FAILED'),
  ('EXECUTED', 'CANCELLED'),

  ('MEASURING', 'COMPLETED'),
  ('MEASURING', 'FAILED'),
  ('MEASURING', 'CANCELLED')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION is_valid_run_transition(from_s run_state, to_s run_state)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM runs_state_transitions t
    WHERE t.from_state = from_s AND t.to_state = to_s
  );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION trg_enforce_run_state_transition()
RETURNS trigger AS $$
DECLARE
  ok boolean;
BEGIN
  IF NEW.state IS DISTINCT FROM OLD.state THEN
    ok := is_valid_run_transition(OLD.state, NEW.state);

    IF NOT ok THEN
      RAISE EXCEPTION 'Invalid run state transition: % -> % (run_id=%)',
        OLD.state, NEW.state, OLD.run_id
        USING ERRCODE = '23514';
    END IF;

    IF NEW.state = 'COMPLETED' AND OLD.state IS DISTINCT FROM 'COMPLETED' THEN
      NEW.completed_at := now();
    END IF;

    IF NEW.state IN ('FAILED','CANCELLED') AND NEW.completed_at IS NULL THEN
      NEW.completed_at := now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_runs_state_transition_guard ON runs;
CREATE TRIGGER trg_runs_state_transition_guard
BEFORE UPDATE OF state ON runs
FOR EACH ROW
EXECUTE FUNCTION trg_enforce_run_state_transition();
