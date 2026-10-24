import dotenv from 'dotenv';
import path from 'path';

// Runs before test modules are required, so src/config/env.ts picks up
// these values instead of the development .env (dotenv never overwrites
// variables already present in process.env).
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
