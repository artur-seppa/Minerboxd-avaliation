import { FastifyInstance } from 'fastify';
import { jwt } from '../hooks/jwt.js';
import { z } from "zod";
import Movie from '../../database/models/Movie.js';
import { MovieSerializer } from '../serializers/movieSerializer.js';
import { addMovieWatchList } from '../application/useCases/addMovieWatchList.js';

export function watchlistRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/watchlist',
    {
      onRequest: jwt,
    },
    async (request, reply) => {
      const watchlist = await request.user!.$relatedQuery<Movie>('watchlist');

      const serializedWatchlist = await Promise.all(
        watchlist.map((movie) =>
          MovieSerializer.serialize(movie, request.user),
        ),
      );

      return reply.send(serializedWatchlist);
    },
  );

  fastify.patch<{ Params: { movieId: string } }>(
    '/watchlist/:movieId',
    {
      onRequest: jwt,
    },
    async (request, reply) => {
      const parseResult = AddMovieToWatchListInput.safeParse(request.params);

      if (!parseResult.success) {
        return reply.status(400).send({
          error: "Invalid input",
          details: parseResult.error.issues
        });
      }

      const { movieId } = parseResult.data;
      const userId = request.user?.id;

      if (!userId) {
        return reply.status(400).send({ error: "Invalid user id" });
      }

      const result = await addMovieWatchList({ userId, movieId });

      if (!result.success) {
        if (result.error.code === "NOT_FOUND") {
          return reply.status(404).send({ error: result.error.message });
        }

        return reply.status(500).send({ error: result.error.message });
      }

      const movie = result.data;

      return reply.status(201).send({ success: result.success, message: "movie placed on watch list" });
    },
  );

  fastify.delete<{ Params: { movieId: string } }>(
    '/watchlist/:movieId',
    {
      onRequest: jwt,
    },
    async (request, reply) => {
      const movie = await Movie.query().findById(request.params.movieId);

      if (!movie) {
        return reply.status(404).send();
      }

      const { movieId } = request.params;
      await request
        .user!.$relatedQuery('watchlist')
        .unrelate()
        .where('movieId', movie.id);
      return reply.send();
    },
  );

  const AddMovieToWatchListInput = z.object({
    movieId: z.string()
      .regex(/^\d+$/, "Must contain only digits")
      .refine((val) => parseInt(val) > 0, "Must be a positive number")
  });
}
