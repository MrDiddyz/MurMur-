import { Pool, PoolClient, QueryResultRow } from 'pg';
import { config } from './config';

export const db = new Pool({
  connectionString: config.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

export const query = async <T extends QueryResultRow>(text: string, values?: unknown[]): Promise<T[]> => {
  const result = await db.query<T>(text, values);
  return result.rows;
};

export const withTransaction = async <T>(executor: (client: PoolClient) => Promise<T>): Promise<T> => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await executor(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
