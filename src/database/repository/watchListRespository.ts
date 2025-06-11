import { Result } from "../../_lib/result.js";
import Movie from '../../database/models/Movie.js';
import User from '../../database/models/User.js';
import UserActivity, { ActivityAction } from '../../database/models/UserActivity.js';

export const WatchListRepository = {
    async addMovie(user: User, movie: Movie) {
        try {
            const result = await Movie.transaction(async (trx) => {
                const movieResult = await user.$relatedQuery('watchlist', trx).relate(movie.id);

                await UserActivity.query(trx).insert({
                    userId: user.id,
                    movieId: movie.id,
                    action: ActivityAction.ADD_MOVIE_TO_WATCHLIST
                });

                return movieResult;
            });

            return Result.succeed(result);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Database error";
            return Result.fail<Movie>({ code: "DATABASE_ERROR", message });
        }
    }
};
