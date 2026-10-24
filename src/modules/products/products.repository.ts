import type { Knex } from 'knex';
import { Product, toProduct } from './products.types';

export class ProductsRepository {
  constructor(private readonly db: Knex) {}

  async findAll(): Promise<Product[]> {
    const rows = await this.db('products')
      .select('product_code', 'product_title', 'product_price')
      .orderBy('id', 'asc');
    return rows.map(toProduct);
  }
}
