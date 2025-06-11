import { FastifyInstance } from 'fastify';
import Movie from '../../database/models/Movie.js';
import { MovieSerializer } from '../serializers/movieSerializer.js';

export async function movieRoutes(fastify: FastifyInstance) {
  fastify.get('/movies', async (_request, reply) => {
    const movies = await Movie.query();
    const serializedMovies = await Promise.all(
      movies.map((movie) => MovieSerializer.serialize(movie)),
    );
    return reply.send(serializedMovies);
  });

  fastify.get<{ Params: { id: string } }>(
    '/movies/:id',
    async (request, reply) => {
      const { id } = request.params;
      const movie = await Movie.query().findById(Number(id));

      if (!movie) {
        return reply.status(404).send({ error: 'Movie not found' });
      }

      return reply.send(await MovieSerializer.serialize(movie));
    },
  );
}
