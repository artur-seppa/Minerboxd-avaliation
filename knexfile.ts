import type { Knex } from 'knex';
import { fileURLToPath } from 'url';
import * as path from 'path';

import { config } from './src/config.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const commonConfig = {
  migrations: {
    directory: path.join(__dirname, 'src/database/migrations'),
  },
  seeds: {
    directory: path.join(__dirname, 'src/database/seeds'),
  },
};

type KnexConfig = {
  string?: Knex.Config;
};

const dbConfig = Object.entries(config.db).reduce<KnexConfig>(
  (knexConfig, [envName, envConfig]) => ({
    ...knexConfig,
    [envName]: {
      ...envConfig,
      ...commonConfig,
    },
  }),
  {},
);

export default dbConfig;
