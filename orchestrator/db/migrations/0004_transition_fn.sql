-- Atomic transition: update runs.state + append run_events in one transaction.
-- Relies on the trigger guard to reject invalid transitions.

CREATE OR REPLACE FUNCTION transition_run_state(
  p_run_id uuid,
  p_to_state run_state,
  p_event_type text,
  p_actor text DEFAULT 'system',
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS runs
LANGUAGE plpgsql
AS $$
DECLARE
  v_run runs%ROWTYPE;
BEGIN
  -- Lock the row to prevent race transitions
  SELECT * INTO v_run
  FROM runs
  WHERE run_id = p_run_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Run not found (run_id=%)', p_run_id
      USING ERRCODE = 'P0002';
  END IF;

  -- Update state (trigger enforces validity)
  UPDATE runs
  SET state = p_to_state
  WHERE run_id = p_run_id
  RETURNING * INTO v_run;

  -- Append event
  INSERT INTO run_events (run_id, type, actor, occurred_at, payload)
  VALUES (p_run_id, p_event_type, COALESCE(p_actor,'system'), now(), COALESCE(p_payload,'{}'::jsonb));

  RETURN v_run;
END;
$$;

-- Convenience: create run + emit run.received in one call
CREATE OR REPLACE FUNCTION create_run(
  p_user_id uuid,
  p_org_id uuid,
  p_project_id uuid,
  p_request_text text,
  p_request_locale text,
  p_request_json jsonb DEFAULT '{}'::jsonb,
  p_idempotency_key text DEFAULT NULL
)
RETURNS runs
LANGUAGE plpgsql
AS $$
DECLARE
  v_run runs%ROWTYPE;
BEGIN
  INSERT INTO runs (user_id, org_id, project_id, request_text, request_locale, request_json, idempotency_key)
  VALUES (p_user_id, p_org_id, p_project_id, p_request_text, p_request_locale, COALESCE(p_request_json,'{}'::jsonb), p_idempotency_key)
  RETURNING * INTO v_run;

  INSERT INTO run_events (run_id, type, actor, occurred_at, payload)
  VALUES (v_run.run_id, 'run.received', 'system', now(), jsonb_build_object('text', p_request_text));

  RETURN v_run;
END;
$$;
