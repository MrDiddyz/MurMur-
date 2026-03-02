import fs from 'node:fs/promises';
import path from 'node:path';
import { db } from './db';

const runMigrations = async (): Promise<void> => {
  const migrationsDir = path.resolve(process.cwd(), 'database/migrations');
  const files = (await fs.readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf-8');
    await db.query(sql);
    console.log(`Applied migration: ${file}`);
  }

  await db.end();
};

runMigrations().catch(async (error) => {
  console.error('Migration failed:', error.message);
  await db.end();
  process.exit(1);
});
