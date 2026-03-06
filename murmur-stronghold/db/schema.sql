CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS payment_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  intent_id INT NOT NULL,
  status TEXT NOT NULL,
  retries INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_runs (
  id SERIAL PRIMARY KEY,
  run_id TEXT NOT NULL,
  goal TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_intents (
  id SERIAL PRIMARY KEY,
  email TEXT,
  goal TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_jobs_intent_id ON jobs(intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);

CREATE TABLE IF NOT EXISTS webhook_events (
  event_id TEXT PRIMARY KEY,
  received_at TIMESTAMP DEFAULT NOW(),
  payload JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  secret_hash TEXT NOT NULL,
  last_seen_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS device_analytics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC(18,4) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS access_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON device_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_access_links_lookup ON access_links(user_id, expires_at, consumed_at);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_owner_read" ON profiles;
CREATE POLICY "profiles_owner_read" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_owner_update" ON profiles;
CREATE POLICY "profiles_owner_update" ON profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_owner_insert" ON profiles;
CREATE POLICY "profiles_owner_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "devices_owner_rw" ON devices;
CREATE POLICY "devices_owner_rw" ON devices
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "analytics_owner_rw" ON device_analytics;
CREATE POLICY "analytics_owner_rw" ON device_analytics
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "access_links_owner_rw" ON access_links;
CREATE POLICY "access_links_owner_rw" ON access_links
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION create_access_link(
  p_user_id UUID,
  p_token TEXT,
  p_ttl_seconds INTEGER
)
RETURNS access_links
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  inserted access_links;
BEGIN
  IF p_ttl_seconds < 60 OR p_ttl_seconds > 86400 THEN
    RAISE EXCEPTION 'ttl out of range';
  END IF;

  INSERT INTO access_links (user_id, token_hash, expires_at)
  VALUES (
    p_user_id,
    crypt(p_token, gen_salt('bf')),
    NOW() + make_interval(secs => p_ttl_seconds)
  )
  RETURNING * INTO inserted;

  RETURN inserted;
END;
$$;

CREATE OR REPLACE FUNCTION consume_access_link(
  p_user_id UUID,
  p_token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_id UUID;
BEGIN
  SELECT id INTO target_id
  FROM access_links
  WHERE user_id = p_user_id
    AND consumed_at IS NULL
    AND expires_at > NOW()
    AND token_hash = crypt(p_token, token_hash)
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF target_id IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE access_links
  SET consumed_at = NOW()
  WHERE id = target_id
    AND consumed_at IS NULL;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION verify_device_secret(
  p_device_id UUID,
  p_secret TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT secret_hash INTO stored_hash
  FROM devices
  WHERE id = p_device_id
    AND revoked_at IS NULL;

  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE devices
  SET last_seen_at = NOW()
  WHERE id = p_device_id;

  RETURN stored_hash = crypt(p_secret, stored_hash);
END;
$$;
