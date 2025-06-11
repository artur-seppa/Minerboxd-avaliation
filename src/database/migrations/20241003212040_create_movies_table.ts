import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('movies', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.string('year').notNullable();
    table.text('description').notNullable();
    table.string('imageUrl').notNullable();
    table.timestamps({
      useCamelCase: true,
      useTimestamps: true,
      defaultToNow: true,
    });
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('movies');
}
