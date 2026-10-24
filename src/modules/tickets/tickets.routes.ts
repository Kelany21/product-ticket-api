import { Router } from 'express';
import type { Knex } from 'knex';
import { validateBody } from '../../middleware/validate';
import { TicketsController } from './tickets.controller';
import { TicketsRepository } from './tickets.repository';
import { TicketsService } from './tickets.service';
import { createTicketSchema } from './tickets.types';

export function createTicketsRouter(db: Knex): Router {
  const repository = new TicketsRepository(db);
  const service = new TicketsService(repository);
  const controller = new TicketsController(service);

  const router = Router();
  router.post('/', validateBody(createTicketSchema), controller.create);
  return router;
}
