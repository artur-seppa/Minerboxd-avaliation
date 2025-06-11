import { preHandlerAsyncHookHandler } from 'fastify';
import '@fastify/jwt';
import User from '../../database/models/User.js';

type Payload = { userId: number };

export const jwt: preHandlerAsyncHookHandler = async (request, reply) => {
  try {
    const { userId } = await request.jwtVerify<Payload>();
    const user = await User.query().findOne({ id: userId });

    if (!user) {
      return reply.send('Invalid user');
    }

    request.user = user;
  } catch (err) {
    reply.send(err);
  }
};

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: Payload;
    user: User | undefined;
  }
}
