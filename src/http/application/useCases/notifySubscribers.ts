import { Result } from "../../../_lib/result.js";
import { SubscriberRepository } from '../../../database/repository/SubscriberRepository.js';
import { ActivityAction } from '../../../database/models/UserActivity.js';
import { notifySubscribersJob } from '../../../bullmq/Jobs/notifySubscribers.js';
import Movie from "../../../database/models/Movie.js";
import { findUserById } from "./findUserById.js";

type NotifySubscribers = (input: {
    userId: number,
    movie: Movie;
    action: ActivityAction;
}) => Promise<Result>;

export const notifySubscribers: NotifySubscribers = async (input) => {
    const { userId, movie, action } = input;

    const subscribedResult = await findUserById({ userId });
    if (!subscribedResult.success) {
        return subscribedResult;
    }

    const subscribed = subscribedResult.data

    const findSubscribersResult = await SubscriberRepository.getSubscribers(userId, action);
    if (!findSubscribersResult.success) {
        return findSubscribersResult;
    }

    const subscribers = findSubscribersResult.data

    if (!subscribers || !Array.isArray(subscribers) || subscribers.length === 0) {
        return Result.fail({ code: "NOT_FOUND", message: "No subscribers found" });
    }

    await notifySubscribersJob({
        subscribed: subscribed,
        subscribers: subscribers,
        movie: movie,
        activityType: action,
    });

    return Result.succeed({
        message: "Subscribers notified successfully",
        data: subscribers
    });
};