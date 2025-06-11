import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('watchedlist', (table) => {
    table.increments('id').primary();
    table
      .integer('userId')
      .references('id')
      .inTable('users')
      .notNullable()
      .onDelete('CASCADE');
    table
      .integer('movieId')
      .references('id')
      .inTable('movies')
      .notNullable()
      .onDelete('CASCADE');
    table.timestamps({
      useCamelCase: true,
      useTimestamps: true,
      defaultToNow: true,
    });
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('watchedlist');
}
