import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('products').del();

  await knex('products').insert([
    { product_code: 'SKU-001', product_title: 'Wireless Mouse', product_price: 19.99 },
    { product_code: 'SKU-002', product_title: 'Mechanical Keyboard', product_price: 79.5 },
    { product_code: 'SKU-003', product_title: '27" Monitor', product_price: 229.0 },
  ]);
}
