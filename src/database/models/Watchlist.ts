import BaseModel from './BaseModel.js';

export default class Watchlist extends BaseModel {
  static tableName = 'watchlist';

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
}
