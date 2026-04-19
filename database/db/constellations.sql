CREATE TABLE IF NOT EXISTS constellations (
  id BIGSERIAL PRIMARY KEY,
  principle TEXT NOT NULL,
  quote_text TEXT NOT NULL,
  next_id BIGINT REFERENCES constellations(id) ON DELETE SET NULL,
  difficulty SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  published_at TIMESTAMPTZ,
  engagement_score NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (engagement_score >= 0)
);

CREATE INDEX IF NOT EXISTS idx_constellations_next_id ON constellations(next_id);
CREATE INDEX IF NOT EXISTS idx_constellations_published_at ON constellations(published_at);
CREATE INDEX IF NOT EXISTS idx_constellations_engagement_score ON constellations(engagement_score DESC);
