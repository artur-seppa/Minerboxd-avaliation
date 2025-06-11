import Fastify from 'fastify';
import FastifyJWT from '@fastify/jwt';
import { movieRoutes } from './routes/movies.js';
import { userRoutes } from './routes/users.js';
import { authenticationRoutes } from './routes/authentication.js';
import { watchlistRoutes } from './routes/watchlist.js';
import { watchedlistRoutes } from './routes/watchedlist.js';
import { config } from '../config.js';

export const makeServer = async () => {
  const server = Fastify({ logger: config.http.logger[config.env] });

  await server.register(FastifyJWT, {
    secret: config.secret.jwtSecret,
  });

  server.register(authenticationRoutes);
  server.register(movieRoutes);
  server.register(userRoutes);
  server.register(watchlistRoutes);
  server.register(watchedlistRoutes);

  return server;
};
