import User from './User.js';
import BaseModel from './BaseModel.js';
import UserActivity from './UserActivity.js';

export default class Movie extends BaseModel {
  static tableName = 'movies';

  id!: number;
  title!: string;
  year!: string;
  description!: string;
  imageUrl!: string;

  isOnWatchlistOf(user?: User) {
    if (!user) {
      return false;
    }

    return user.$relatedQuery('watchlist').findById(this.id).then(Boolean);
  }

  isOnWatchedlistOf(user?: User) {
    if (!user) {
      return false;
    }

    return user.$relatedQuery('watchedlist').findById(this.id).then(Boolean);
  }
  
  static get relationMappings() {
    return {
      activity: {
        relation: BaseModel.HasManyRelation,
        modelClass: UserActivity,
        join: {
          from: 'movie.id',
          to: 'user_activities.movieId'
        }
      },
      watchedList: {
        relation: BaseModel.HasManyRelation,
        modelClass: Movie,
        join: {
          from: 'movie.id',
          to: 'watchedlist.movieId'
        }
      }
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['title', 'year', 'description', 'imageUrl'],
      properties: {
        id: { type: 'integer' },
        title: { type: 'string' },
        year: { type: 'string' },
        description: { type: 'string' },
        imageUrl: { type: 'string' },
      },
    };
  }
}
