import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.string().default('info'),

  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USER: z.string().default('app'),
  DB_PASSWORD: z.string().default('app'),
  DB_NAME: z.string().default('product_ticket_api'),
  DATABASE_URL: z.string().optional(),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_URL: z.string().optional(),

  PRODUCTS_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(120),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  databaseUrl:
    parsed.data.DATABASE_URL ??
    `postgres://${parsed.data.DB_USER}:${parsed.data.DB_PASSWORD}@${parsed.data.DB_HOST}:${parsed.data.DB_PORT}/${parsed.data.DB_NAME}`,
  redisUrl: parsed.data.REDIS_URL ?? `redis://${parsed.data.REDIS_HOST}:${parsed.data.REDIS_PORT}`,
};
