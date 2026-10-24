import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 2,
  retryStrategy: (attempt) => Math.min(attempt * 200, 2000),
  lazyConnect: false,
});

redis.on('error', (err) => {
  // Cache is a performance optimization, not a hard dependency: log and let
  // callers fall back to the database rather than crashing the process.
  logger.warn({ err }, 'Redis connection error');
});
