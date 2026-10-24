import request from 'supertest';
import { buildTestContext, closeTestContext, TestContext } from '../helpers/test-context';

describe('GET /api/v1/products', () => {
  let ctx: TestContext;

  beforeAll(() => {
    ctx = buildTestContext();
  });

  afterAll(async () => {
    await closeTestContext(ctx);
  });

  beforeEach(async () => {
    await ctx.db('products').del();
    await ctx.db('products').insert([
      { product_code: 'SKU-001', product_title: 'Wireless Mouse', product_price: 19.99 },
      { product_code: 'SKU-002', product_title: 'Mechanical Keyboard', product_price: 79.5 },
    ]);
    await ctx.redis.flushdb();
  });

  it('serves a cache miss from the database with the expected payload shape', async () => {
    const res = await request(ctx.app).get('/api/v1/products');

    expect(res.status).toBe(200);
    expect(res.headers['x-cache']).toBe('MISS');
    expect(res.body.data).toEqual([
      { product_code: 'SKU-001', product_title: 'Wireless Mouse', product_price: 19.99 },
      { product_code: 'SKU-002', product_title: 'Mechanical Keyboard', product_price: 79.5 },
    ]);
  });

  it('populates Redis on a miss with a TTL around 120 seconds', async () => {
    await request(ctx.app).get('/api/v1/products');

    const ttl = await ctx.redis.ttl('cache:v1:products:all');
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(120);
  });

  it('serves subsequent requests from the cache without hitting the database', async () => {
    const first = await request(ctx.app).get('/api/v1/products');
    expect(first.headers['x-cache']).toBe('MISS');

    // Mutate the DB directly: if the second request were still a cache miss,
    // it would see this change. Seeing the stale payload proves it came
    // from Redis, not Postgres.
    await ctx.db('products').del();

    const second = await request(ctx.app).get('/api/v1/products');
    expect(second.status).toBe(200);
    expect(second.headers['x-cache']).toBe('HIT');
    expect(second.body.data).toEqual(first.body.data);
  });
});
