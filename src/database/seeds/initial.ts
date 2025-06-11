import { Knex } from 'knex';
import User from '../models/User.js';
import movies from './movies.json' with { type: 'json' };
import Movie from '../models/Movie.js';
import BaseModel from '../models/BaseModel.js';

export async function seed(knex: Knex): Promise<void> {
  BaseModel.knex(knex);

  await User.query().insert({
    email: 'leonard@mail.com',
    password: '123',
  });

  await User.query().insert({
    email: 'sheldon@mail.com',
    password: '456',
  });

  await User.query().insert({
    email: 'penny@mail.com',
    password: '789',
  });

  await Movie.query().insert(
    movies.map((movie) => ({
      title: movie.title,
      year: String(movie.year),
      description: movie.extract,
      imageUrl: movie.thumbnail,
    })),
  );
}
