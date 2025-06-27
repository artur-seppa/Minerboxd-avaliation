import { Result } from "../../../_lib/result.js";
import { ActivityAction } from '../../../database/models/Subscriber.js';
import { UserRepository } from '../../../database/repository/UserRepository.js';
import { SubscriberRepository } from '../../../database/repository/SubscriberRepository.js';

type AddSubscription = (input: {
    user_id: number,
    target: number,
    action: ActivityAction;
}) => Promise<Result>;

export const addSubscription: AddSubscription = async (input) => {
    const { user_id, target, action } = input;

    const findUserResult = await UserRepository.findById(target);
    if (!findUserResult.success) {
        return findUserResult;
    }

    const existingUser = findUserResult.data;

    if (!existingUser) {
        return Result.fail({ code: "NOT_FOUND", message: "User to subscribe not found" });
    }

    return await SubscriberRepository.addSubscriber(user_id, target, action);
};