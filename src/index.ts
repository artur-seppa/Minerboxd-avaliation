import { makeDatabase } from './database/database.js';
import { config } from './config.js';
import { makeServer } from './http/server.js';

const database = makeDatabase();

database
  .connect()
  .then(async () => {
    const server = await makeServer();

    const address = await server.listen({ port: config.http.port });

    console.log(`Webserver listening at: ${address}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
