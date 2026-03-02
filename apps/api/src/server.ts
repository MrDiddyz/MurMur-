import { app } from './app';
import { config } from '../../../shared/config';
import { db } from '../../../shared/db';
import { closeQueues, closeRedisConnection } from '../../../shared/queue';

const server = app.listen(config.API_PORT, () => {
  console.log(`API running on port ${config.API_PORT}`);
});

let shuttingDown = false;

const shutdown = async (signal: string): Promise<void> => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    await closeQueues();
    await Promise.all([db.end(), closeRedisConnection()]);
    process.exit(0);
  });
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
