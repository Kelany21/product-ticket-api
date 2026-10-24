import request from 'supertest';
import { buildTestContext, closeTestContext, TestContext } from '../helpers/test-context';

describe('POST /api/v1/tickets', () => {
  let ctx: TestContext;

  beforeAll(() => {
    ctx = buildTestContext();
  });

  afterAll(async () => {
    await closeTestContext(ctx);
  });

  beforeEach(async () => {
    await ctx.db('tickets').del();
  });

  it('creates a ticket and returns 201', async () => {
    const res = await request(ctx.app).post('/api/v1/tickets').send({
      ticket_number: 1001,
      subject: 'Login page is broken',
      description: 'Clicking submit does nothing.',
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({
      ticket_number: 1001,
      subject: 'Login page is broken',
      description: 'Clicking submit does nothing.',
    });
  });

  it('returns 422 when required fields are missing or empty', async () => {
    const res = await request(ctx.app).post('/api/v1/tickets').send({
      ticket_number: 1002,
      subject: '',
      description: '',
    });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 when ticket_number is not an integer', async () => {
    const res = await request(ctx.app).post('/api/v1/tickets').send({
      ticket_number: 'not-a-number',
      subject: 'Subject',
      description: 'Description',
    });

    expect(res.status).toBe(422);
  });

  it('returns 409 when ticket_number already exists', async () => {
    const payload = {
      ticket_number: 2001,
      subject: 'Duplicate test',
      description: 'First one wins.',
    };

    const first = await request(ctx.app).post('/api/v1/tickets').send(payload);
    expect(first.status).toBe(201);

    const second = await request(ctx.app).post('/api/v1/tickets').send(payload);
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('CONFLICT');
  });
});
