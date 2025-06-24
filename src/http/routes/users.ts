import { FastifyInstance } from 'fastify';
import { z } from "zod";
import { findUserActivities } from '../application/queries/findUserActivities.js';
import { UserActivitySerializer } from '../serializers/userActivitySerializer.js';
import { UserActivityRssSerializer } from '../serializers/userActivityRssSerializer.js';
import { UserRepository } from '../../database/repository/UserRepository.js';
import { findUserById } from '../application/useCases/findUserById.js';

export async function userRoutes(fastify: FastifyInstance) {
    fastify.get<{ Params: { userId: string } }>(
        '/users/:userId/activity',
        async (request, reply) => {
            try {
                const parseResult = FindPagesInput.safeParse(request.query);
                if (!parseResult.success) {
                    return reply.status(400).send({
                        error: "Invalid input",
                        details: parseResult.error.issues
                    });
                }

                const { page, pageSize } = parseResult.data;
                const { userId } = request.params;

                const validUserId = z.string()
                    .regex(/^\d+$/, "Must contain only digits")
                    .refine((val) => parseInt(val) > 0, "Must be a positive number")
                    .transform((val) => parseInt(val))
                    .parse(userId);

                const resultFindUser = await findUserById({ userId: validUserId });
                if (!resultFindUser.success) {
                    if (resultFindUser.error.code === "NOT_FOUND") {
                        return reply.status(404).send({ error: resultFindUser.error.message });
                    }
                    return reply.status(500).send({ error: resultFindUser.error.message });
                }

                const result = await findUserActivities({
                    user_id: validUserId,
                    pagination: { page: Number(page), pageSize: Number(pageSize) }
                });

                if (!result.success) {
                    if (result.error.code === "NOT_FOUND") {
                        return reply.status(404).send({ error: result.error.message });
                    }
                    return reply.status(500).send({ error: result.error.message });
                }

                const userActivities = result.data;
                const serializedList = UserActivitySerializer.serializeList(userActivities.results);

                return reply.status(200).send(serializedList);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return reply.status(400).send({
                        error: "Invalid input",
                        details: error.issues
                    });
                }
                return reply.status(500).send({ error: "Internal server error" });
            }
        }
    );

    fastify.get<{ Params: { userId: string } }>(
        '/users/:userId/activity/rss',
        async (request, reply) => {
            try {
                const parseResult = FindPagesInput.safeParse(request.query);
                if (!parseResult.success) {
                    return reply.status(400).send({
                        error: "Invalid input",
                        details: parseResult.error.issues
                    });
                }

                const { page, pageSize } = parseResult.data;
                const { userId } = request.params;

                const validUserId = z.coerce.number()
                    .int()
                    .positive("Must be a positive number")
                    .parse(userId);

                const resultFindUser = await findUserById({ userId: validUserId });
                if (!resultFindUser.success) {
                    if (resultFindUser.error.code === "NOT_FOUND") {
                        return reply.status(404).send({ error: resultFindUser.error.message });
                    }
                    return reply.status(500).send({ error: resultFindUser.error.message });
                }

                const result = await findUserActivities({
                    user_id: validUserId,
                    pagination: { page: Number(page), pageSize: Number(pageSize) }
                });

                if (!result.success) {
                    return reply.status(500).send({ error: result.error.message });
                }

                const rssContent = UserActivityRssSerializer.serializeToRSS(
                    result.data.results,
                    validUserId
                );

                reply.header('Content-Type', 'application/rss+xml; charset=utf-8');
                return reply.send(rssContent);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return reply.status(400).send({
                        error: "Invalid input",
                        details: error.issues
                    });
                }
                return reply.status(500).send({ error: "Internal server error" });
            }
        }
    );
}

const FindPagesInput = z.object({
    page: z.string()
        .regex(/^\d+$/, "Must contain only digits")
        .refine((val) => parseInt(val) > 0, "Must be a positive number")
        .transform((val) => parseInt(val))
        .default("1"),
    pageSize: z.string()
        .regex(/^\d+$/, "Must contain only digits")
        .refine((val) => parseInt(val) > 0, "Must be a positive number")
        .transform((val) => parseInt(val))
        .default("100"),
});