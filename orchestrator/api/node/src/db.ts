import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@postgres:5432/orchestrator';
export const pool = new Pool({ connectionString });
