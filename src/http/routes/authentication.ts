import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import User from '../../database/models/User.js';

export async function authenticationRoutes(fastify: FastifyInstance) {
  fastify.post<{
    Body: {
      email: string;
      password: string;
    };
  }>('/login', async (request, reply) => {
    const { email, password } = request.body;

    const user = await User.authenticate({ email, password });

    if (!user) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const token = fastify.jwt.sign({ userId: user.id }, { algorithm: 'HS256' });

    return reply.send({ token });
  });
}
