CREATE TABLE IF NOT EXISTS api_keys (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    scopes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    CONSTRAINT ck_api_keys_name_not_empty CHECK (char_length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_is_active_created_at
    ON api_keys (is_active, created_at DESC);
