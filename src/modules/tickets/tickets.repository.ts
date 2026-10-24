import type { Knex } from 'knex';
import { CreateTicketInput, Ticket, toTicket } from './tickets.types';

export class TicketsRepository {
  constructor(private readonly db: Knex) {}

  async create(input: CreateTicketInput): Promise<Ticket> {
    const [row] = await this.db('tickets')
      .insert({
        ticket_number: input.ticket_number,
        subject: input.subject,
        description: input.description,
      })
      .returning(['ticket_number', 'subject', 'description']);

    return toTicket(row);
  }
}
