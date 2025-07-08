import { userSubscribesQueue } from '../queue.js';
import {ActivityAction} from '../../database/models/Subscriber.js';
import Movie from '../../database/models/Movie.js';
import User from '../../database/models/User.js';

export async function notifySubscribersJob({
    subscribed,
    subscribers,
    movie,
    activityType
}: {
    subscribed: User;
    subscribers: any[];
    movie: Movie;
    activityType: ActivityAction;
}) {
    for (const subscriber of subscribers) {
        await userSubscribesQueue.add('sendActivityNotification', {
            subscribed,
            to: subscriber.subscriberUser.email,
            movie: movie,
            activityType,
        });
    }
}