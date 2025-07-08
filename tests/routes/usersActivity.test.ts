import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RouteTest, setupRouteTest } from './_setupRouteTest.js';
import User from '../../src/database/models/User.js';
import Movie from '../../src/database/models/Movie.js';
import UserActivity from '../../src/database/models/UserActivity.js';
import { ActivityAction } from '../../src/database/models/UserActivity.js';
import { timeStamp } from 'console';

describe('User Activity Route', () => {
    let routeTest: RouteTest;
    let testUser: User;
    let testMovie: Movie;
    let testUserActivity: UserActivity[];

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

        testUserActivity = await UserActivity.query().insert([
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

    describe('GET /users/:userId/activity', () => {
        it('should return activity list for valid user', async () => {
            const response = await routeTest.server.inject({
                method: 'GET',
                url: `/users/${testUser.id}/activity`
            });

            expect(response.statusCode).toBe(200);
            const body = response.json();

            expect(body).toMatchObject([
                expect.objectContaining({
                    id: expect.any(Number),
                    action: ActivityAction.ADD_MOVIE_TO_WATCHLIST,
                    movieId: testMovie.id,
                    timestamp: expect.any(String)
                }),
                expect.objectContaining({
                    id: expect.any(Number),
                    action: ActivityAction.ADD_MOVIE_TO_WATCHEDLIST,
                    movieId: testMovie.id,
                    timestamp: expect.any(String)
                })
            ]);
        });

        it('should return 404 for non-existent user', async () => {
            const response = await routeTest.server.inject({
                method: 'GET',
                url: '/users/99999/activity'
            });

            expect(response.statusCode).toBe(404);
            const body = response.json();
            expect(body.error).toBeDefined();
        });

        it('should return 400 for invalid user ID', async () => {
            const response = await routeTest.server.inject({
                method: 'GET',
                url: '/users/invalid/activity'
            });

            expect(response.statusCode).toBe(400);
            const body = response.json();
            expect(body.error).toBe('Invalid input');
        });

        it('should handle empty activity list', async () => {
            await UserActivity.query().delete();

            const response = await routeTest.server.inject({
                method: 'GET',
                url: `/users/${testUser.id}/activity`
            });

            expect(response.statusCode).toBe(200);
            expect(response.json()).toEqual([]);
        });

        it('should respect pagination', async () => {
            for (let i = 0; i < 10; i++) {
                await UserActivity.query().insert({
                    userId: testUser.id,
                    movieId: testMovie.id,
                    action: ActivityAction.ADD_MOVIE_TO_WATCHLIST
                });
            }

            const response = await routeTest.server.inject({
                method: 'GET',
                url: `/users/${testUser.id}/activity?page=1&pageSize=5`
            });

            expect(response.statusCode).toBe(200);
            const body = response.json();

            expect(body.length).toBe(5);
            expect(body).toMatchObject([
                {
                    id: expect.any(Number),
                    action: ActivityAction.ADD_MOVIE_TO_WATCHLIST,
                    movieId: expect.any(Number),
                    timestamp: expect.any(String)
                },
                {
                    id: expect.any(Number),
                    action: ActivityAction.ADD_MOVIE_TO_WATCHLIST,
                    movieId: expect.any(Number),
                    timestamp: expect.any(String)
                },
                {
                    id: expect.any(Number),
                    action: ActivityAction.ADD_MOVIE_TO_WATCHLIST,
                    movieId: expect.any(Number),
                    timestamp: expect.any(String)
                },
                {
                    id: expect.any(Number),
                    action: ActivityAction.ADD_MOVIE_TO_WATCHLIST,
                    movieId: expect.any(Number),
                    timestamp: expect.any(String)
                },
                {
                    id: expect.any(Number),
                    action: ActivityAction.ADD_MOVIE_TO_WATCHLIST,
                    movieId: expect.any(Number),
                    timestamp: expect.any(String)
                }
            ])
        });
    });
});