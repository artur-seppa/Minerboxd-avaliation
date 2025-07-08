import { ModelOptions, Pojo } from 'objection';
import bcrypt from 'bcrypt';
import Movie from './Movie.js';
import BaseModel from './BaseModel.js';
import UserActivity from './UserActivity.js';
import { subscribe } from 'diagnostics_channel';

export default class User extends BaseModel {
  static tableName = 'users';

  id!: number;
  email!: string;
  password!: string;
  encryptedPassword!: string;

  static get relationMappings() {
    return {
      watchlist: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Movie,
        join: {
          from: 'users.id',
          through: {
            from: 'watchlist.userId',
            to: 'watchlist.movieId',
          },
          to: 'movies.id',
        },
      },
      watchedlist: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Movie,
        join: {
          from: 'users.id',
          through: {
            from: 'watchedlist.userId',
            to: 'watchedlist.movieId',
          },
          to: 'movies.id',
        },
      },
      activity: {
        relation: BaseModel.HasManyRelation,
        modelClass: UserActivity,
        join: {
          from: 'users.id',
          to: 'user_activities.userId'
        }
      },
      subscribe_target: {
        relation: BaseModel.HasManyRelation,
        modelClass: UserActivity,
        join: {
          from: 'users.id',
          to: 'subscribes.target'
        }
      },
      subscribe_subscriber: {
        relation: BaseModel.HasManyRelation,
        modelClass: UserActivity,
        join: {
          from: 'users.id',
          to: 'subscribes.subscriber'
        }
      }
    }
  }

  static async authenticate({
    email,
    password,
  }: AuthParams): Promise<User | null> {
    return this.query()
      .findOne({ email })
      .then(async (user) => {
        const passwordIsCorrect = Boolean(await user?.passwordIs(password));

        if (!user || !passwordIsCorrect) {
          return null;
        }

        return user;
      });
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string' },
      },
    };
  }

  $parseJson(json: Pojo, options?: ModelOptions | undefined): Pojo {
    const { password, ...actualJson } = json;

    const parsedJson = {
      ...super.$parseJson(actualJson, options),
      encryptedPassword: password
        ? bcrypt.hashSync(password, bcrypt.genSaltSync(10))
        : null,
    };

    return parsedJson;
  }

  private passwordIs(password: string) {
    return bcrypt.compare(password, this.encryptedPassword);
  }
}

type AuthParams = {
  email: string;
  password: string;
};
