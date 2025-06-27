import BaseModel from './BaseModel.js';
import User from './User.js';

export enum ActivityAction {
    ADD_MOVIE_TO_WATCHLIST = 'ADD_MOVIE_TO_WATCHLIST',
    REMOVE_MOVIE_FROM_WATCHLIST = 'REMOVE_MOVIE_FROM_WATCHLIST',
    ADD_MOVIE_TO_WATCHEDLIST = 'ADD_MOVIE_TO_WATCHEDLIST',
    REMOVE_MOVIE_FROM_WATCHEDLIST = 'REMOVE_MOVIE_FROM_WATCHEDLIST'
}

export default class Subscriber extends BaseModel {
    static tableName = 'subscribes';

    id!: number;
    target!: number;
    subscriber!: number;
    action!: ActivityAction;

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['target', 'subscriber', 'action'],
            properties: {
                id: { type: 'integer' },
                action: {
                    type: 'string',
                    enum: Object.values(ActivityAction)
                },
                target: { type: 'integer' },
                subscriber: { type: 'integer' }
            },
        };
    }

    static get relationMappings() {
        return {
            targetUser: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'subscribes.target',
                    to: 'users.id'
                }
            },
            subscriberUser: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'subscribes.subscriber',
                    to: 'users.id'
                }
            }
        };
    }
}