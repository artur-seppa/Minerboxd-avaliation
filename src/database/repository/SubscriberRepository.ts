import { Result } from "../../_lib/result.js";
import Subscriber, { ActivityAction } from '../models/Subscriber.js';

export const SubscriberRepository = {
    async addSubscriber(user_id: number, target: number, action: ActivityAction) {
        try {
            const subscriber = await Subscriber.query().insertAndFetch({
                subscriber: user_id,
                target: target,
                action: action
            }).withGraphFetched('targetUser');

            return Result.succeed(subscriber);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Database error";

            return Result.fail<Subscriber>({ code: "DATABASE_ERROR", message });
        }
    },

    async getSubscribers(target: number, action: ActivityAction) {
        try {
            const subscribers = await Subscriber.query()
                .where({
                    target: target,
                    action: action
                })
                .withGraphFetched('subscriberUser');

                console.log("Subscribers found:", subscribers);

            return Result.succeed(subscribers);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Database error";

            return Result.fail<Subscriber>({ code: "DATABASE_ERROR", message });
        }
    }
};
