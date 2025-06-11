import { Result } from "../../_lib/result.js";
import Movie from '../../database/models/Movie.js';

export const MovieRepository = {
    async findById(movieId: string) {
        try {
            const movie = await Movie.query().findById(movieId);

            return Result.succeed(movie);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Database error";

            return Result.fail<Movie>({ code: "DATABASE_ERROR", message });
        }
    }
};
