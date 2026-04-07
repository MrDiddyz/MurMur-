-- Optional extension for embeddings; safe no-op when unavailable.
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION
  WHEN undefined_file THEN
    RAISE NOTICE 'pgvector extension not installed, skipping';
END;
$$;
