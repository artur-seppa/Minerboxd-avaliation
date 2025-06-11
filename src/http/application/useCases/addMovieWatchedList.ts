import { Result } from "../../../_lib/result.js";
import Movie from '../../../database/models/Movie.js';
import { MovieRepository } from '../../../database/repository/MovieRepository.js';
import { WatchedListRepository } from '../../../database/repository/watchedListRepository.js';
import { UserRepository } from '../../../database/repository/UserRepository.js';

type AddMovieWatchedList = (input: {
    userId: number,
    movieId: string;
}) => Promise<Result<Movie>>;

export const addMovieWatchedList: AddMovieWatchedList = async (input) => {
    const { userId, movieId } = input;

    const findMovieResult = await MovieRepository.findById(movieId);
    if (!findMovieResult.success) {
        return findMovieResult;
    }

    const existingMovie = findMovieResult.data;

    if (!existingMovie) {
        return Result.fail({ code: "NOT_FOUND", message: "Movie not found" });
    }

    const findUserResult = await UserRepository.findById(userId);
    if (!findUserResult.success) {
        return findUserResult;
    }

    const existingUser = findUserResult.data;

    if (!existingUser) {
        return Result.fail({ code: "NOT_FOUND", message: "User not found" });
    }

    return await WatchedListRepository.addMovie(existingUser, existingMovie);
};