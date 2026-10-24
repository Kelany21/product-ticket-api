#!/bin/sh
set -e

echo "Running database migrations..."
npx knex --knexfile dist/knexfile.js migrate:latest

if [ "${RUN_SEEDS:-true}" = "true" ]; then
  echo "Running database seeds..."
  npx knex --knexfile dist/knexfile.js seed:run
fi

echo "Starting application..."
exec "$@"
