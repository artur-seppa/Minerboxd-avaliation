import { Result } from "../../../_lib/result.js";
import { UserRepository } from '../../../database/repository/UserRepository.js';
import User from "../../../database/models/User.js";

type FindUserById = (input: {
    userId: number
}) => Promise<Result>;

export const findUserById: FindUserById = async (input) => {
    const { userId } = input;

    const findUserResult = await UserRepository.findById(userId);
    if (!findUserResult.success) {
        return findUserResult;
    }

    const existingUser = findUserResult.data;

    if (!existingUser) {
        return Result.fail({ code: "NOT_FOUND", message: "User not found" });
    }

    return findUserResult;
};