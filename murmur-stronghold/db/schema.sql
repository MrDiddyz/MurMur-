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
