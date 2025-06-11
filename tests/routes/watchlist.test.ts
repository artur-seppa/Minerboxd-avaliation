import {
  after,
  before,
  beforeEach,
  describe,
  it,
  TestContext,
} from 'node:test';
import { RouteTest, setupRouteTest } from './_setupRouteTest.js';
import User from '../../src/database/models/User.js';
import Movie from '../../src/database/models/Movie.js';

describe('Watchlist', () => {
  let routeTest: RouteTest;
  let user: User;
  const userData = {
    email: 'test@email.com',
    password: 'password',
  };

  before(async () => {
    routeTest = await setupRouteTest();
  });

  after(async () => {
    await routeTest.tearDown();
  });

  beforeEach(async () => {
    await Promise.all([User.query().delete(), Movie.query().delete()]);
  });

  describe('GET /watchlist', () => {
    describe('when the user is authenticated', () => {
      let token: string;

      beforeEach(async () => {
        user = await User.query().insert(userData);

        token = await routeTest.authenticate(userData);
      });

      describe('when the user has movies in the watchlist', () => {
        let movie: Movie;

        beforeEach(async () => {
          movie = await Movie.query().insert({
            title: 'The Matrix',
            year: '1999',
            description: 'A movie',
            imageUrl: 'https://example.com',
          });

          await user.$relatedQuery('watchlist').relate(movie.id);
        });

        it('returns the watchlist', async (t: TestContext) => {
          const response = await routeTest.server.inject({
            method: 'GET',
            url: '/watchlist',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const jsonResponse = response.json();

          t.assert.strictEqual(response.statusCode, 200);
          t.assert.deepStrictEqual(jsonResponse, [
            {
              id: movie.id,
              title: 'The Matrix',
              year: '1999',
              description: 'A movie',
              image_url: 'https://example.com',
              created_at: jsonResponse[0].created_at,
              updated_at: jsonResponse[0].updated_at,
              on_watchlist: true,
              on_watchedlist: false,
            },
          ]);
        });
      });

      describe('when the user does not have movies in the watchlist', () => {
        it('returns an empty array', async (t: TestContext) => {
          const response = await routeTest.server.inject({
            method: 'GET',
            url: '/watchlist',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          t.assert.strictEqual(response.statusCode, 200);
          t.assert.deepStrictEqual(response.json(), []);
        });
      });
    });

    describe('when the user is not authenticated', () => {
      it('returns unauthorized', async (t: TestContext) => {
        const response = await routeTest.server.inject({
          method: 'GET',
          url: '/watchlist',
        });

        t.assert.strictEqual(response.statusCode, 401);
      });
    });
  });

  describe('PATCH /watchlist/:movieId', () => {
    describe('when the user is authenticated', () => {
      let token: string;

      beforeEach(async () => {
        user = await User.query().insert(userData);
        token = await routeTest.authenticate(userData);
      });

      describe('when the movie exists', () => {
        let movie: Movie;

        beforeEach(async () => {
          movie = await Movie.query().insert({
            title: 'The Matrix',
            year: '1999',
            description: 'A movie',
            imageUrl: 'https://example.com',
          });
        });

        it('adds the movie to the watchlist', async (t: TestContext) => {
          const response = await routeTest.server.inject({
            method: 'PATCH',
            url: `/watchlist/${movie.id}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          t.assert.strictEqual(response.statusCode, 200);
          t.assert.deepEqual(
            await user.$relatedQuery('watchlist').findById(movie.id),
            movie,
          );
        });
      });

      describe('when the movie does not exist', () => {
        it('returns not found', async (t: TestContext) => {
          const response = await routeTest.server.inject({
            method: 'PATCH',
            url: '/watchlist/1',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          t.assert.strictEqual(response.statusCode, 404);
        });
      });
    });

    describe('when the user is not authenticated', () => {
      it('returns unauthorized', async (t: TestContext) => {
        const response = await routeTest.server.inject({
          method: 'PATCH',
          url: '/watchlist/1',
        });

        t.assert.strictEqual(response.statusCode, 401);
      });
    });
  });

  describe('DELETE /watchlist/:movieId', () => {
    describe('when the user is authenticated', () => {
      let token: string;

      beforeEach(async () => {
        user = await User.query().insert(userData);
        token = await routeTest.authenticate(userData);
      });

      describe('when the movie exists', () => {
        let movie: Movie;

        beforeEach(async () => {
          movie = await Movie.query().insert({
            title: 'The Matrix',
            year: '1999',
            description: 'A movie',
            imageUrl: 'https://example.com',
          });

          await user.$relatedQuery('watchlist').relate(movie.id);
        });

        it('removes the movie from the watchlist', async (t: TestContext) => {
          const response = await routeTest.server.inject({
            method: 'DELETE',
            url: `/watchlist/${movie.id}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          t.assert.strictEqual(response.statusCode, 200);
          t.assert.strictEqual(
            await user.$relatedQuery('watchlist').findById(movie.id),
            undefined,
          );
        });
      });

      describe('when the movie does not exist', () => {
        it('returns not found', async (t: TestContext) => {
          const response = await routeTest.server.inject({
            method: 'DELETE',
            url: '/watchlist/1',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          t.assert.strictEqual(response.statusCode, 404);
        });
      });
    });

    describe('when the user is not authenticated', () => {
      it('returns unauthorized', async (t: TestContext) => {
        const response = await routeTest.server.inject({
          method: 'DELETE',
          url: '/watchlist/1',
        });

        t.assert.strictEqual(response.statusCode, 401);
      });
    });
  });
});
