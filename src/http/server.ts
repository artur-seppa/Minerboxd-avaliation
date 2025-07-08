import Fastify from 'fastify';
import FastifyJWT from '@fastify/jwt';
import { movieRoutes } from './routes/movies.js';
import { userRoutes } from './routes/users.js';
import { authenticationRoutes } from './routes/authentication.js';
import { watchlistRoutes } from './routes/watchlist.js';
import { watchedlistRoutes } from './routes/watchedlist.js';
import { config } from '../config.js';

import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { FastifyAdapter } from '@bull-board/fastify';
import { userSubscribesQueue } from '../bullmq/queue.js';

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

  const serverAdapter = new FastifyAdapter();
  createBullBoard({
    queues: [new BullMQAdapter(userSubscribesQueue)],
    serverAdapter,
  });
  server.register(serverAdapter.registerPlugin(), { prefix: '/admin/queues' });

  return server;
};
