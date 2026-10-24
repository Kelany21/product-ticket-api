import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tickets', (table) => {
    table.increments('id').primary();
    table.integer('ticket_number').notNullable().unique();
    table.string('subject').notNullable();
    table.text('description').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tickets');
}
