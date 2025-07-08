import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('subscribes', (table) => {
        table.increments('id').primary();
        table.enum('action', [
            'ADD_MOVIE_TO_WATCHLIST', 'REMOVE_MOVIE_FROM_WATCHLIST',
            'ADD_MOVIE_TO_WATCHEDLIST', 'REMOVE_MOVIE_FROM_WATCHEDLIST'
        ]).notNullable();
        table
            .integer('target')
            .references('id')
            .inTable('users')
            .notNullable()
            .onDelete('CASCADE');
        table
            .integer('subscriber')
            .references('id')
            .inTable('users')
            .notNullable()
            .onDelete('CASCADE');
        table.timestamps({
            useCamelCase: true,
            useTimestamps: true,
            defaultToNow: true,
        });
       table.unique(['target', 'subscriber', 'action'], 'unique_subscribe_target_subscriber_movie');
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('subscribes');
}

