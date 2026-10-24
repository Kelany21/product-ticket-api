import type { NextFunction, Request, Response } from 'express';
import { ProductsService } from './products.service';

export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { products, cacheHit } = await this.service.listProducts();
      res.set('X-Cache', cacheHit ? 'HIT' : 'MISS');
      res.status(200).json({ data: products });
    } catch (err) {
      next(err);
    }
  };
}
