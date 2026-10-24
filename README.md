# Product & Ticket API

A modular Node.js / Express REST API built for the backend technical assessment: a cached
product catalog endpoint and a support ticket submission endpoint, backed by PostgreSQL
(via Knex) and Redis, fully containerized with Docker Compose.

## Tech stack

- **Runtime:** Node.js 20, Express, TypeScript
- **Database:** PostgreSQL + Knex.js (migrations & query builder)
- **Cache:** Redis (`ioredis`), cache-aside pattern
- **Validation:** Zod
- **Testing:** Jest + Supertest (integration tests against real Postgres/Redis)
- **Containerization:** Docker, Docker Compose

## Architecture

```
src/
  config/        env loading & validation, db/redis clients, logger
  db/
    migrations/  Knex migrations (products, tickets)
    seeds/       seed data for products
  modules/
    products/    routes -> controller -> service -> repository
    tickets/     routes -> controller -> service -> repository
  middleware/    request validation, global error handler, 404 handler
  lib/           ApiError, cache-aside helper
  app.ts         Express app wiring (framework-agnostic of entrypoint)
  server.ts      process entrypoint, graceful shutdown
```

Each module is self-contained: **repository** does raw data access, **service** holds
business logic (caching, conflict mapping), **controller** adapts HTTP <-> service, **routes**
wires it to Express. Errors are raised as `ApiError` anywhere in the stack and handled in one
place by the global error middleware, which returns a consistent
`{ error: { code, message, details? } }` shape.

## API

### `GET /api/v1/products`

Cache-aside through Redis: on a cache miss, reads from Postgres, writes the result to Redis
under `cache:v1:products:all` with a 120s TTL, and returns it; a hit is served straight from
Redis (`X-Cache: HIT` / `MISS` response header shows which happened).

```json
{ "data": [{ "product_code": "SKU-001", "product_title": "Wireless Mouse", "product_price": 19.99 }] }
```

### `POST /api/v1/tickets`

```json
{ "ticket_number": 1001, "subject": "Login broken", "description": "Submit does nothing." }
```

- `201` on success, with the created ticket.
- `422` if `ticket_number` is missing/not an integer, or `subject`/`description` are
  missing or empty.
- `409` if `ticket_number` already exists (enforced by a unique DB index; the service maps
  Postgres's unique-violation error rather than pre-checking, avoiding a race condition).

## Running it

Requires Docker and Docker Compose.

```bash
cp .env.example .env
docker-compose up --build
```

This starts `app`, `db` (Postgres, with a healthcheck) and `redis` (with a healthcheck); the
app container waits for both to be healthy, then runs migrations and seeds the product table
before starting the server on `http://localhost:3000`.

```bash
curl http://localhost:3000/api/v1/products
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{"ticket_number": 1, "subject": "Test", "description": "Testing"}'
```

### Environment variables

See [`.env.example`](.env.example) for the full list (server port/log level, Postgres
connection, Redis connection, and `PRODUCTS_CACHE_TTL_SECONDS`).

## Running the tests

Tests run against real Postgres/Redis instances (no mocking of the database or cache), using
a separate Compose file so they don't collide with your dev stack:

```bash
npm install
docker-compose -f docker-compose.test.yml up -d
npm test
docker-compose -f docker-compose.test.yml down
```

`npm test` applies migrations to the test database automatically before running. Coverage
includes: products payload shape, cache miss -> DB fetch -> Redis populate with TTL, cache
hit served without touching the DB; ticket creation (201), validation failures (422), and
duplicate `ticket_number` rejection (409).

## Local development (without Docker)

```bash
npm install
# point DB_HOST/REDIS_HOST at local or dockerized Postgres/Redis in .env
npm run migrate
npm run seed
npm run dev
```
