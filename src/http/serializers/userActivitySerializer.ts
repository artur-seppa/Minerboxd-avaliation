import UserActivity from '../../database/models/UserActivity.js';

export class UserActivitySerializer {
    static serialize(activity: UserActivity) {
        return {
            id: activity.id,
            action: activity.action,
            movieId: activity.movieId,
            timestamp: activity.createdAt
        };
    }

    static serializeList(activities: UserActivity[]) {
        return activities.map(this.serialize);
    }
}
