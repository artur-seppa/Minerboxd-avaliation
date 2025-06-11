import { Result } from "../../_lib/result.js";
import User from "../../database/models/User.js";
import UserActivity, { ActivityAction } from "../../database/models/UserActivity.js";

export const UserRepository = {
  async findById(id: number) {
    try {
      const user = await User.query().findById(id);

      return Result.succeed(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";

      return Result.fail<User>({ code: "DATABASE_ERROR", message });
    }
  },

  async findUserActivities(
    userId: number,
    pagination: {
      page: number;
      pageSize: number
    }) {
    try {
      // const userActivities = await UserActivity.query()
      //   .where('userId', userId)
      //   .orderBy('createdAt', 'desc')
      //   .page(pagination.page - 1, pagination.pageSize);

      const userActivities = await UserActivity.query()
        .where('userId', userId)
        .orderBy('createdAt', 'desc')
        .page(pagination.page - 1, pagination.pageSize)
        .withGraphFetched('[user, movie]');

      return Result.succeed(userActivities);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";

      return Result.fail<UserActivity[]>({ code: "DATABASE_ERROR", message });
    }
  }
};
