import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('user_activities', (table) => {
    table.increments('id').primary();
    table.enum('action', [
        'ADD_MOVIE_TO_WATCHLIST', 'REMOVE_MOVIE_FROM_WATCHLIST',
        'ADD_MOVIE_TO_WATCHEDLIST', 'REMOVE_MOVIE_FROM_WATCHEDLIST'
    ]).notNullable();
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
  await knex.schema.dropTableIfExists('user_activities');
}

