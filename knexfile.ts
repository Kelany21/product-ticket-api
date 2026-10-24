import path from 'path';
import type { Knex } from 'knex';
import { env } from './src/config/env';

// When this file runs compiled (dist/knexfile.js, via plain `node`/`npx knex`
// in production), __dirname is `dist`, so this same relative suffix resolves
// to the compiled `dist/src/db/...` output. When it runs as source
// (knexfile.ts, via ts-node in local dev/tests), __dirname is the project
// root, so it resolves to `src/db/...` directly. One config, two contexts.
const isCompiled = __filename.endsWith('.js');
const extension = isCompiled ? 'js' : 'ts';

const config: Knex.Config = {
  client: 'pg',
  connection: env.databaseUrl,
  pool: { min: 2, max: 10 },
  migrations: {
    directory: path.join(__dirname, 'src/db/migrations'),
    extension,
  },
  seeds: {
    directory: path.join(__dirname, 'src/db/seeds'),
    extension,
  },
};

export default config;
