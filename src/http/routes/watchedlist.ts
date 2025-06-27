import { FastifyInstance } from 'fastify';
import Watchedlist from '../../database/models/Watchedlist.js';
import { jwt } from '../hooks/jwt.js';
import { z } from "zod";
import Movie from '../../database/models/Movie.js';
import { ActivityAction } from '../../database/models/UserActivity.js';
import { MovieSerializer } from '../serializers/movieSerializer.js';
import { addMovieWatchedList } from '../application/useCases/addMovieWatchedList.js';
import { notifySubscribers } from '../application/useCases/notifySubscribers.js';

export async function watchedlistRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/watchedlist',
    {
      onRequest: jwt,
    },
    async (request, reply) => {
      const watchedlist =
        await request.user!.$relatedQuery<Movie>('watchedlist');

      const serializedWatchedlist = await Promise.all(
        watchedlist.map((movie) =>
          MovieSerializer.serialize(movie, request.user),
        ),
      );

      return reply.send(serializedWatchedlist);
    },
  );

  fastify.patch<{ Params: { movieId: string } }>(
    '/watchedlist/:movieId',
    {
      onRequest: jwt,
    },
    async (request, reply) => {
      const parseResult = AddMovieToWatchedListInput.safeParse(request.params);

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

      const result = await addMovieWatchedList({ userId, movieId });

      if (!result.success) {
        if (result.error.code === "NOT_FOUND") {
          return reply.status(404).send({ error: result.error.message });
        }

        return reply.status(500).send({ error: result.error.message });
      }

      const movie = result.data as Movie;

      notifySubscribers({ userId, movie, action: ActivityAction.ADD_MOVIE_TO_WATCHEDLIST });
      return reply.status(200).send({ success: result.success, message: "movie placed on watched list" });
    },
  );

  fastify.delete<{ Params: { movieId: string } }>(
    '/watchedlist/:movieId',
    {
      onRequest: jwt,
    },
    async (request, reply) => {
      const movie = await Movie.query().findById(request.params.movieId);

      if (!movie) {
        return reply.status(404).send();
      }

      await request
        .user!.$relatedQuery('watchedlist')
        .unrelate()
        .where('movieId', movie.id);

      const userId = request.user?.id;
      if (!userId) {
        return reply.status(400).send({ error: "Invalid user id" });
      }

      notifySubscribers({ userId, movie, action: ActivityAction.REMOVE_MOVIE_FROM_WATCHEDLIST });
      
      return reply.send();
    },
  );

  const AddMovieToWatchedListInput = z.object({
    movieId: z.string()
      .regex(/^\d+$/, "Must contain only digits")
      .refine((val) => parseInt(val) > 0, "Must be a positive number")
  });
}
