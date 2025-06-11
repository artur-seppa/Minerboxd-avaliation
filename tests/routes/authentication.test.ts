import {
  it,
  describe,
  beforeEach,
  TestContext,
  before,
  after,
} from 'node:test';
import { RouteTest, setupRouteTest } from './_setupRouteTest.js';
import User from '../../src/database/models/User.js';

describe('Authentication', () => {
  let routeTest: RouteTest;

  before(async () => {
    routeTest = await setupRouteTest();
  });

  after(async () => {
    await routeTest.tearDown();
  });

  beforeEach(async () => {
    await User.query().delete();
  });

  describe('POST /login', () => {
    describe('when the email or password is valid', () => {
      beforeEach(async () => {
        await User.query().insert({
          email: 'test@mail.com',
          password: 'password',
        });
      });

      it('should return a token', async (t: TestContext) => {
        const response = await routeTest.server.inject({
          method: 'POST',
          url: '/login',
          body: {
            email: 'test@mail.com',
            password: 'password',
          },
        });

        t.assert.strictEqual(response.statusCode, 200);
      });
    });

    describe('when the email does not exist', () => {
      it('returns unauthorized', async (t: TestContext) => {
        const response = await routeTest.server.inject({
          method: 'POST',
          url: '/login',
          body: {
            email: 'test@mail.com',
            password: 'password',
          },
        });

        t.assert.strictEqual(response.statusCode, 401);
      });
    });

    describe('when the password is wrong', () => {
      beforeEach(async () => {
        await User.query().insert({
          email: 'test@mail.com',
          password: 'password',
        });
      });

      it('returns unauthorized', async (t: TestContext) => {
        const response = await routeTest.server.inject({
          method: 'POST',
          url: '/login',
          body: {
            email: 'test@mail.com',
            password: 'wrongpassword',
          },
        });

        t.assert.strictEqual(response.statusCode, 401);
      });
    });
  });
});
