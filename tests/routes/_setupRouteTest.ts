import { makeDatabase } from '../../src/database/database.js';
import User from '../../src/database/models/User.js';
import { makeServer } from '../../src/http/server.js';

export const setupRouteTest = async () => {
  const server = await makeServer();
  const database = makeDatabase();

  await database.connect({ log: false });

  return {
    server,
    tearDown: () => database.disconnect({ log: false }),
    authenticate: async (authData: { email: string; password: string }) => {
      const response = await server.inject({
        method: 'POST',
        url: '/login',
        body: authData,
      });

      return String(response.json().token);
    },
  };
};

export type RouteTest = Awaited<ReturnType<typeof setupRouteTest>>;
