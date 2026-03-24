CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  amount INTEGER,
  currency TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- executions
CREATE TABLE IF NOT EXISTS executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal TEXT,
  status TEXT,
  output TEXT,
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
