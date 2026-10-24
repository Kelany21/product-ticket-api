import knexFactory, { Knex } from 'knex';
import { env } from './env';

export const knex: Knex = knexFactory({
  client: 'pg',
  connection: env.databaseUrl,
  pool: { min: 2, max: 10 },
});
