CREATE TABLE IF NOT EXISTS ideas (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    strategy TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    idea_id INTEGER REFERENCES ideas(id) ON DELETE CASCADE,
    engagement FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS strategy_memory (
    id SERIAL PRIMARY KEY,
    strategy TEXT NOT NULL,
    score FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_strategy_memory_strategy
ON strategy_memory(strategy);
