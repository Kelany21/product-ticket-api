import { createApp } from './app';
import { env } from './config/env';
import { knex } from './config/db';
import { redis } from './config/redis';
import { logger } from './config/logger';

const app = createApp({
  db: knex,
  redis,
  productsCacheTtlSeconds: env.PRODUCTS_CACHE_TTL_SECONDS,
});

const server = app.listen(env.PORT, () => {
  logger.info(`Server listening on port ${env.PORT}`);
});

async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close();
  await Promise.allSettled([knex.destroy(), redis.quit()]);
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
