import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RouteTest, setupRouteTest } from './_setupRouteTest.js';
import User from '../../src/database/models/User.js';
import Movie from '../../src/database/models/Movie.js';
import UserActivity from '../../src/database/models/UserActivity.js';
import { ActivityAction } from '../../src/database/models/UserActivity.js';

describe('Subscribe Route', () => {
    let routeTest: RouteTest;
    let token: string;
    let testSubscriber: User;
    let testTarget: User;
    let testMovie: Movie;

    beforeEach(async () => {
        routeTest = await setupRouteTest();

        const userData = {
            email: 'test@email.com',
            password: 'password',
        };
        testSubscriber = await User.query().insert(userData);
        token = await routeTest.authenticate(userData);

        testTarget = await User.query().insert({
            email: 'test2@example.com',
            password: 'password1234'
        });

        testMovie = await Movie.query().insert({
            title: 'Test Movie 1',
            year: '2025',
            description: 'Test Description',
            imageUrl: 'https://example.com',
        });
    });

    afterEach(async () => {
        await Movie.query().delete();
        await User.query().delete();
    });

    describe('GET /users/:target/subscribe', () => {
        it('should return a positive mensage of subscribing in the activities target', async () => {
            const response = await routeTest.server.inject({
                method: 'POST',
                url: `/users/${testTarget.id}/subscribe`,
                payload: {
                    action: ActivityAction.ADD_MOVIE_TO_WATCHLIST,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            expect(response.statusCode).toBe(200);
            const body = response.json();

            expect(body).toMatchObject(
                expect.objectContaining({
                    success: true,
                    message: `Você está inscrito nas atividades de ${ActivityAction.ADD_MOVIE_TO_WATCHLIST} do usuário ${testTarget.email}`
                })
            );
        });

        it('should return 404 for non-existent user', async () => {
            const response = await routeTest.server.inject({
                method: 'GET',
                url: '/users/99999/subscribe',
                payload: {
                    action: ActivityAction.ADD_MOVIE_TO_WATCHLIST,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            expect(response.statusCode).toBe(404);
            const body = response.json();
            expect(body.error).toBeDefined();
        });

        it('should return 400 for invalid payload', async () => {
            await UserActivity.query().delete();

            const response = await routeTest.server.inject({
                method: 'GET',
                url: `/users/${testTarget.id}/subscribe`,
                payload: {
                    action: "teste",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            expect(response.statusCode).toBe(404);
            const body = response.json();
            expect(body.error).toBeDefined();
        });
    });
});