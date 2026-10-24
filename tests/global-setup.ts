import dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Runs once before the whole test run, in its own process. Applies the
 * migrations to the test database (started separately via
 * `docker-compose -f docker-compose.test.yml up -d`) so test files only
 * need to deal with row-level fixtures, not schema setup.
 */
export default async function globalSetup(): Promise<void> {
  dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

  execSync('npx knex --knexfile knexfile.ts migrate:latest', {
    stdio: 'inherit',
    env: process.env,
  });
}
