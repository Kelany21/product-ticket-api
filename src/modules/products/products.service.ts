import type { Redis } from 'ioredis';
import { cacheAside, cacheKey } from '../../lib/cache';
import { ProductsRepository } from './products.repository';
import { Product } from './products.types';

export class ProductsService {
  constructor(
    private readonly repository: ProductsRepository,
    private readonly redis: Redis,
    private readonly cacheTtlSeconds: number,
  ) {}

  async listProducts(): Promise<{ products: Product[]; cacheHit: boolean }> {
    const { value, hit } = await cacheAside(
      this.redis,
      cacheKey('products', 'all'),
      this.cacheTtlSeconds,
      () => this.repository.findAll(),
    );

    return { products: value, cacheHit: hit };
  }
}
