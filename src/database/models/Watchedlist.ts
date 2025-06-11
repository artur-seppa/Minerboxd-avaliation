import BaseModel from './BaseModel.js';
import Movie from './Movie.js';
import User from './User.js';

export default class Watchedlist extends BaseModel {
  static tableName = 'watchedlist';

  id!: number;
  userId!: number;
  movieId!: number;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['userId', 'movieId'],
      properties: {
        id: { type: 'integer' },
        userId: { type: 'integer' },
        movieId: { type: 'integer' },
      },
    };
  }

  static get relationMappings() {
    return {
      movie: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Movie,
        join: {
          from: 'watchedlist.movieId',
          to: 'movies.id'
        }
      },
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'watchedlist.userId',
          to: 'users.id'
        }
      }
    };
  }
}
