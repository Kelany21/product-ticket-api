import express, { Express } from 'express';
import pinoHttp from 'pino-http';
import type { Knex } from 'knex';
import type { Redis } from 'ioredis';
import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { createProductsRouter } from './modules/products/products.routes';
import { createTicketsRouter } from './modules/tickets/tickets.routes';

export interface AppDependencies {
  db: Knex;
  redis: Redis;
  productsCacheTtlSeconds: number;
}

export function createApp({ db, redis, productsCacheTtlSeconds }: AppDependencies): Express {
  const app = express();

  app.use(pinoHttp({ logger }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  app.use('/api/v1/products', createProductsRouter(db, redis, productsCacheTtlSeconds));
  app.use('/api/v1/tickets', createTicketsRouter(db));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
