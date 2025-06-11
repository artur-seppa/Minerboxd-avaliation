import BaseModel from './BaseModel.js';
import Movie from './Movie.js';
import User from './User.js';

export enum ActivityAction {
  ADD_MOVIE_TO_WATCHLIST = 'ADD_MOVIE_TO_WATCHLIST',
  REMOVE_MOVIE_FROM_WATCHLIST = 'REMOVE_MOVIE_FROM_WATCHLIST',
  ADD_MOVIE_TO_WATCHEDLIST = 'ADD_MOVIE_TO_WATCHEDLIST',
  REMOVE_MOVIE_FROM_WATCHEDLIST = 'REMOVE_MOVIE_FROM_WATCHEDLIST'
}

export default class UserActivity extends BaseModel {
  static tableName = 'user_activities';

  id!: number;
  action!: ActivityAction;
  userId!: number;
  movieId!: number;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['userId', 'movieId', 'action'],
      properties: {
        id: { type: 'integer' },
        action: {
          type: 'string',
          enum: Object.values(ActivityAction)
        },
        userId: { type: 'integer' },
        movieId: { type: 'integer' }
      },
    };
  }

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'user_activities.userId',
          to: 'users.id'
        }
      },
      movie: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Movie,
        join: {
          from: 'user_activities.movieId',
          to: 'movies.id'
        }
      }
    };
  }
}