import { Result } from "../../../_lib/result.js";
import UserActivity from '../../../database/models/UserActivity.js';
import { UserRepository } from '../../../database/repository/UserRepository.js';

type FindActivityUserById = (input: {
    userId: string,
    pagination: {
        page: number;
        pageSize: number
    };
}) => Promise<Result<UserActivity>>;

export const findActivityUserById: FindActivityUserById = async (input) => {
    const { userId, pagination: { page, pageSize }, } = input;
    const parsedUserId = parseInt(userId, 10);
    const pagination = { page, pageSize };

    const findUserResult = await UserRepository.findById(parsedUserId);
    if (!findUserResult.success) {
        return findUserResult;
    }

    const existingUser = findUserResult.data;

    if (!existingUser) {
        return Result.fail({ code: "NOT_FOUND", message: "User not found" });
    }

    return await UserRepository.findUserActivities(existingUser.id, pagination);
};