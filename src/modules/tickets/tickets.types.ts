import { z } from 'zod';

export const createTicketSchema = z.object({
  ticket_number: z.number().int('ticket_number must be an integer'),
  subject: z.string().trim().min(1, 'subject must not be empty'),
  description: z.string().trim().min(1, 'description must not be empty'),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export interface Ticket {
  ticket_number: number;
  subject: string;
  description: string;
}

interface TicketRow {
  ticket_number: number;
  subject: string;
  description: string;
}

export function toTicket(row: TicketRow): Ticket {
  return {
    ticket_number: row.ticket_number,
    subject: row.subject,
    description: row.description,
  };
}
