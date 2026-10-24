import { Router } from 'express';
import type { Knex } from 'knex';
import type { Redis } from 'ioredis';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

export function createProductsRouter(db: Knex, redis: Redis, cacheTtlSeconds: number): Router {
  const repository = new ProductsRepository(db);
  const service = new ProductsService(repository, redis, cacheTtlSeconds);
  const controller = new ProductsController(service);

  const router = Router();
  router.get('/', controller.list);
  return router;
}
