import { ApiError } from '../../lib/errors';
import { TicketsRepository } from './tickets.repository';
import { CreateTicketInput, Ticket } from './tickets.types';

const POSTGRES_UNIQUE_VIOLATION = '23505';

interface PostgresError extends Error {
  code?: string;
  constraint?: string;
}

function isPostgresError(err: unknown): err is PostgresError {
  return err instanceof Error && 'code' in err;
}

export class TicketsService {
  constructor(private readonly repository: TicketsRepository) {}

  async createTicket(input: CreateTicketInput): Promise<Ticket> {
    try {
      return await this.repository.create(input);
    } catch (err) {
      if (isPostgresError(err) && err.code === POSTGRES_UNIQUE_VIOLATION) {
        throw ApiError.conflict(
          `A ticket with ticket_number ${input.ticket_number} already exists`,
        );
      }
      throw err;
    }
  }
}
