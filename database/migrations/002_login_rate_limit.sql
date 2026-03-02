CREATE TABLE IF NOT EXISTS login_attempts (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    ip INET NOT NULL,
    success BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email_created_at
    ON login_attempts (email, created_at DESC)
    WHERE success = FALSE;

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_created_at
    ON login_attempts (ip, created_at DESC)
    WHERE success = FALSE;
