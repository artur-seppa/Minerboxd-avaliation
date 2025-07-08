// tests/setup.ts
import { beforeAll, afterAll } from 'vitest';
// import { knex } from '../../Minerboxd-2025-01/src/database/database.js';

beforeAll(async () => {
  // Configurações globais antes de todos os testes
  process.env.NODE_ENV = 'test';
});

// afterAll(async () => {
//   // Limpar conexões depois de todos os testes
//   await knex.destroy();
// });