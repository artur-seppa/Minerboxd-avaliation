// tests/routes/users.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RouteTest, setupRouteTest } from './_setupRouteTest.js';
import User from '../../src/database/models/User.js';
import Movie from '../../src/database/models/Movie.js';
import UserActivity from '../../src/database/models/UserActivity.js';
import { ActivityAction } from '../../src/database/models/UserActivity.js';

describe('User Activity Rss Route', () => {
    let routeTest: RouteTest;
    let testUser: User;
    let testMovie: Movie;

    beforeEach(async () => {
        routeTest = await setupRouteTest();

        testUser = await User.query().insert({
            email: 'test@example.com',
            password: 'password123'
        });

        testMovie = await Movie.query().insert({
            title: 'Test Movie 1',
            year: '2025',
            description: 'Test Description',
            imageUrl: 'https://example.com',
        });

        await UserActivity.query().insert([
            {
                userId: testUser.id,
                movieId: testMovie.id,
                action: ActivityAction.ADD_MOVIE_TO_WATCHLIST
            },
            {
                userId: testUser.id,
                movieId: testMovie.id,
                action: ActivityAction.ADD_MOVIE_TO_WATCHEDLIST
            }
        ]);
    });

    afterEach(async () => {
        await UserActivity.query().delete();
        await Movie.query().delete();
        await User.query().delete();
    });

    describe('GET /users/:userId/activity/rss', () => {
        it('should return RSS feed for valid user', async () => {
            const response = await routeTest.server.inject({
                method: 'GET',
                url: `/users/${testUser.id}/activity/rss`
            });

            expect(response.statusCode).toBe(200);
            expect(response.headers['content-type']).toBe('application/rss+xml; charset=utf-8');

            const rssContent = response.body;

            expect(rssContent).toContain('<?xml version="1.0" encoding="UTF-8" ?>');
            expect(rssContent).toContain('<rss version="2.0"');
            expect(rssContent).toContain('<channel>');

            expect(rssContent).toContain('<title>Minerboxd User Activity Feed</title>');
            expect(rssContent).toContain(`<link>http://localhost:3000/users/${testUser.id}/rss</link>`);
            expect(rssContent).toContain('<item>');
            expect(rssContent).toContain('Added Movie to Watchlist');
            expect(rssContent).toContain('Added Movie to Watched List');
        });

        it('should return 404 for non-existent user', async () => {
            const response = await routeTest.server.inject({
                method: 'GET',
                url: '/users/99999/activity/rss'
            });

            expect(response.statusCode).toBe(404);
            expect(response.json()).toMatchObject({
                error: "User not found"
            })

            const body = JSON.parse(response.body);
            expect(body.error).toBeDefined();
        });

        it('should return 400 for invalid user ID', async () => {
            const response = await routeTest.server.inject({
                method: 'GET',
                url: '/users/invalid/activity/rss'
            });

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Invalid input');
        });

        it('should handle empty activity list', async () => {
            await UserActivity.query().delete();

            const response = await routeTest.server.inject({
                method: 'GET',
                url: `/users/${testUser.id}/activity/rss`
            });

            expect(response.statusCode).toBe(200);
            expect(response.headers['content-type']).toBe('application/rss+xml; charset=utf-8');

            const rssContent = response.body;
            expect(rssContent).toContain('<channel>');
            expect(rssContent).not.toContain('<item>');
        });

        it('should order activities by most recent first', async () => {
            await UserActivity.query().delete();

            const activities = [
                {
                    userId: testUser.id,
                    movieId: testMovie.id,
                    action: ActivityAction.ADD_MOVIE_TO_WATCHLIST,
                    createdAt: new Date('2025-01-01')
                },
                {
                    userId: testUser.id,
                    movieId: testMovie.id,
                    action: ActivityAction.ADD_MOVIE_TO_WATCHEDLIST,
                    createdAt: new Date('2025-01-02')
                }
            ];

            for (const activity of activities) {
                await UserActivity.query().insert(activity);
            }

            const response = await routeTest.server.inject({
                method: 'GET',
                url: `/users/${testUser.id}/activity/rss`
            });

            expect(response.statusCode).toBe(200);
            const rssContent = response.body;

            // Check if the more recent activity appears first in the RSS feed
            const watchedListIndex = rssContent.indexOf('Added Movie to Watched List');
            const watchlistIndex = rssContent.indexOf('Added Movie to Watchlist');
            expect(watchedListIndex).toBeLessThan(watchlistIndex);
        });
    });
});