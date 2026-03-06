CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  device_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rules (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  match_json JSONB NOT NULL,
  score_delta INTEGER NOT NULL DEFAULT 0,
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alerts (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'ack', 'resolved')),
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  explain JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  alert_id BIGINT REFERENCES alerts(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rules_enabled ON rules(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_alerts_status_created_at ON alerts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_alert_id_created_at ON audit_log(alert_id, created_at DESC);

-- Seed rules for golden run:
-- 1) door_sensor + door_open: base 30 + 45 => 75 (alert)
-- 2) motion + motion: base 40 + 20 => 60 (no alert)
-- 3) any tamper: base 60 + 10 => 70 (alert)
INSERT INTO rules (name, enabled, match_json, score_delta, severity)
VALUES
  (
    'Door open escalation',
    true,
    '{"all":[{"field":"source","op":"eq","value":"door_sensor"},{"field":"event_type","op":"eq","value":"door_open"}]}'::jsonb,
    45,
    'high'
  ),
  (
    'Motion routine weighting',
    true,
    '{"all":[{"field":"source","op":"eq","value":"motion"},{"field":"event_type","op":"eq","value":"motion"}]}'::jsonb,
    20,
    'medium'
  ),
  (
    'Tamper escalation',
    true,
    '{"all":[{"field":"event_type","op":"eq","value":"tamper"}]}'::jsonb,
    10,
    'critical'
  )
ON CONFLICT (name) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  match_json = EXCLUDED.match_json,
  score_delta = EXCLUDED.score_delta,
  severity = EXCLUDED.severity;
