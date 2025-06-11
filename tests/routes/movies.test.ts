import {
  it,
  describe,
  beforeEach,
  TestContext,
  before,
  after,
} from 'node:test';
import { RouteTest, setupRouteTest } from './_setupRouteTest.js';
import Movie from '../../src/database/models/Movie.js';

describe('Movies', () => {
  let routeTest: RouteTest;

  before(async () => {
    routeTest = await setupRouteTest();
  });

  after(async () => {
    await routeTest.tearDown();
  });

  beforeEach(async () => {
    await Movie.query().delete();
  });

  describe('GET /movies', () => {
    describe('when there are movies', () => {
      beforeEach(async () => {
        await Movie.query().insert([
          {
            title: 'The Matrix',
            year: '1999',
            description: 'A movie',
            imageUrl: 'https://example.com',
          },
          {
            title: 'The Matrix Reloaded',
            year: '2003',
            description: 'A sequel',
            imageUrl: 'https://example.com',
          },
        ]);
      });

      it('returns the movies', async (t: TestContext) => {
        const response = await routeTest.server.inject({
          method: 'GET',
          url: '/movies',
        });

        const jsonResponse = response.json();

        t.assert.strictEqual(response.statusCode, 200);
        t.assert.deepStrictEqual(jsonResponse, [
          {
            id: jsonResponse[0].id,
            title: 'The Matrix',
            year: '1999',
            description: 'A movie',
            image_url: 'https://example.com',
            created_at: jsonResponse[0].created_at,
            updated_at: jsonResponse[0].updated_at,
            on_watchlist: false,
            on_watchedlist: false,
          },
          {
            id: jsonResponse[1].id,
            title: 'The Matrix Reloaded',
            year: '2003',
            description: 'A sequel',
            image_url: 'https://example.com',
            created_at: jsonResponse[1].created_at,
            updated_at: jsonResponse[1].updated_at,
            on_watchlist: false,
            on_watchedlist: false,
          },
        ]);
      });
    });

    describe('when there are no movies', () => {
      it('returns an empty array', async (t: TestContext) => {
        const response = await routeTest.server.inject({
          method: 'GET',
          url: '/movies',
        });

        t.assert.strictEqual(response.statusCode, 200);
        t.assert.deepStrictEqual(response.json(), []);
      });
    });
  });

  describe('GET /movies/:id', () => {
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

      it('returns the movie', async (t: TestContext) => {
        const response = await routeTest.server.inject({
          method: 'GET',
          url: `/movies/${movie.id}`,
        });

        const jsonResponse = response.json();

        t.assert.strictEqual(response.statusCode, 200);
        t.assert.deepStrictEqual(jsonResponse, {
          id: movie.id,
          title: 'The Matrix',
          year: '1999',
          description: 'A movie',
          image_url: 'https://example.com',
          created_at: jsonResponse.created_at,
          updated_at: jsonResponse.updated_at,
          on_watchlist: false,
          on_watchedlist: false,
        });
      });
    });

    describe('when the movie does not exist', () => {
      it('returns not found', async (t: TestContext) => {
        const response = await routeTest.server.inject({
          method: 'GET',
          url: '/movies/1',
        });

        t.assert.strictEqual(response.statusCode, 404);
      });
    });
  });
});
