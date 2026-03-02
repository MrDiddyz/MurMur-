CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    actor_type TEXT NOT NULL CHECK (actor_type IN ('admin', 'api_key')),
    actor_id TEXT,
    action TEXT NOT NULL,
    path TEXT NOT NULL,
    method TEXT NOT NULL,
    ip INET,
    status_code INTEGER NOT NULL,
    meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor_created_at
    ON audit_log (actor_type, actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_action_created_at
    ON audit_log (action, created_at DESC);
