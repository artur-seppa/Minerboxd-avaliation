import 'dotenv/config';
import type { Knex } from 'knex';
import { Env, EnvType } from './_lib/env.js';
import { pino } from 'pino';

const env = Env.string('NODE_ENV', 'development') as EnvType;

const loggerConfig = {
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
};

const http = {
  port: Env.number('PORT', 3000),
  logger: {
    development: loggerConfig,
    production: true,
    test: false,
  },
};

const dbLogger = pino({ ...loggerConfig, level: 'debug' });

const db = {
  development: {
    client: 'postgresql',
    debug: true,
    log: {
      warn: (message) => dbLogger.warn(message, 'Knex'),
      error: (message) => dbLogger.error(message, 'Knex'),
      debug: (message) => dbLogger.debug(message, 'Knex'),
      inspectionDepth: Infinity,
      enableColors: true,
    },
    connection: {
      database: Env.string('DATABASE_DB', 'minerboxd_development'),
      port: Env.number('DATABASE_PORT', 5432),
      user: Env.string('DATABASE_USER', 'postgres'),
      password: Env.string('DATABASE_PASSWORD', 'postgres'),
      host: Env.string('DATABASE_HOST', '127.0.0.1'),
    },
  } satisfies Knex.Config,

  test: {
    client: 'postgresql',
    debug: false,
    connection: {
      database: Env.string('TEST_DATABASE_DB', 'minerboxd_test'),
      port: Env.number('TEST_DATABASE_PORT', 5432),
      user: Env.string('TEST_DATABASE_USER', 'postgres'),
      password: Env.string('TEST_DATABASE_PASSWORD', 'postgres'),
      host: Env.string('TEST_DATABASE_HOST', '127.0.0.1'),
    },
  } satisfies Knex.Config,
} as const;

const secret = {
  jwtSecret: Env.string('JWT_SECRET', 'sekretsekretsekretsekretsekretsekret'),
};

const config = { env, http, db, secret };

type Config = typeof config;

export { config };
export type { Config };
