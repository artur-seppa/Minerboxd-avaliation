import Movie from '../../database/models/Movie.js';
import User from '../../database/models/User.js';

export const MovieSerializer = {
  serialize: async (movie: Movie, currentUser?: User) => ({
    id: movie.id,
    title: movie.title,
    year: movie.year,
    description: movie.description,
    image_url: movie.imageUrl,
    created_at: movie.createdAt,
    updated_at: movie.updatedAt,
    on_watchlist: await movie.isOnWatchlistOf(currentUser),
    on_watchedlist: await movie.isOnWatchedlistOf(currentUser),
  }),
};
