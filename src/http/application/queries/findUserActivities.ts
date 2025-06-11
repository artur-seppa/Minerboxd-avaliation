import type { Page } from "objection";
import { Result } from "../../../_lib/result.js";
import UserActivity from "../../../database/models/UserActivity.js";

type FindUserActivities = (input: {
    pagination: {
        page: number;
        pageSize: number
    },
    user_id: number;
}) => Promise<Result<{ results: UserActivity[]; total: number }>>;

export const findUserActivities: FindUserActivities = async (input) => {
    const {
        pagination: { page, pageSize },
        user_id
    } = input;

    try {
        const userActivities = await UserActivity.query()
                .where('userId', user_id)
                .orderBy('createdAt', 'desc')
                .page(page - 1, pageSize);

        return Result.succeed(userActivities);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Database error";

        return Result.fail<Page<UserActivity>>({ code: "DATABASE_ERROR", message });
    }
}