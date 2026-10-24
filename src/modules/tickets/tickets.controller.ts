import type { NextFunction, Request, Response } from 'express';
import { TicketsService } from './tickets.service';
import { CreateTicketInput } from './tickets.types';

export class TicketsController {
  constructor(private readonly service: TicketsService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await this.service.createTicket(req.body as CreateTicketInput);
      res.status(201).json({ data: ticket });
    } catch (err) {
      next(err);
    }
  };
}
