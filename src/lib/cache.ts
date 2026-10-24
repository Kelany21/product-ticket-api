import { Redis } from 'ioredis';
import { logger } from '../config/logger';

const NAMESPACE = 'cache:v1';

export const cacheKey = (...parts: string[]): string => [NAMESPACE, ...parts].join(':');

/**
 * Cache-aside read-through: serve from Redis when present, otherwise call
 * `load`, populate Redis with `ttlSeconds`, and return the freshly loaded
 * value. Redis errors are logged and treated as a cache miss so the API
 * stays available when Redis is down.
 */
export async function cacheAside<T>(
  redis: Redis,
  key: string,
  ttlSeconds: number,
  load: () => Promise<T>,
): Promise<{ value: T; hit: boolean }> {
  try {
    const cached = await redis.get(key);
    if (cached !== null) {
      return { value: JSON.parse(cached) as T, hit: true };
    }
  } catch (err) {
    logger.warn({ err, key }, 'Cache read failed, falling back to source');
  }

  const value = await load();

  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    logger.warn({ err, key }, 'Cache write failed');
  }

  return { value, hit: false };
}
