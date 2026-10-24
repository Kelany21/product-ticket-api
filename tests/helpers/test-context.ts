import knexFactory, { Knex } from 'knex';
import Redis from 'ioredis';
import type { Express } from 'express';
import { createApp } from '../../src/app';
import { env } from '../../src/config/env';

export interface TestContext {
  app: Express;
  db: Knex;
  redis: Redis;
}

export function buildTestContext(): TestContext {
  const db = knexFactory({ client: 'pg', connection: env.databaseUrl, pool: { min: 1, max: 5 } });
  const redis = new Redis(env.redisUrl);
  const app = createApp({ db, redis, productsCacheTtlSeconds: env.PRODUCTS_CACHE_TTL_SECONDS });
  return { app, db, redis };
}

export async function closeTestContext(ctx: TestContext): Promise<void> {
  await Promise.allSettled([ctx.db.destroy(), ctx.redis.quit()]);
}
