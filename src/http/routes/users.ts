import { FastifyInstance } from 'fastify';
import { z } from "zod";
import { findUserActivities } from '../application/queries/findUserActivities.js';
import { UserActivitySerializer } from '../serializers/userActivitySerializer.js';
import { UserActivityRssSerializer } from '../serializers/userActivityRssSerializer.js';
import { findUserById } from '../application/useCases/findUserById.js';
import { ActivityAction } from '../../database/models/Subscriber.js';
import { addSubscription } from '../application/useCases/addSubscription.js';
import { jwt } from '../hooks/jwt.js';
import { notifySubscribers } from '../application/useCases/notifySubscribers.js';

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

    fastify.post<{ Params: { target: string } }>(
        '/users/:target/subscribe',
        {
            onRequest: jwt,
        },
        async (request, reply) => {
            try {
                const parseResult = SubscribeInput.safeParse(request.body);
                if (!parseResult.success) {
                    return reply.status(400).send({
                        error: "Invalid input",
                        details: parseResult.error.issues
                    });
                }

                const { action } = parseResult.data;
                const { target } = request.params;
                const user_id = request.user?.id;

                const validUserId = z.coerce.number()
                    .int()
                    .positive("Must be a positive number")
                    .parse(target);

                const resultSubscriber = await addSubscription({ user_id: user_id!, target: validUserId, action });
                
                if (!resultSubscriber.success) {
                    if (resultSubscriber.error.code === "NOT_FOUND") {
                        return reply.status(404).send({ error: resultSubscriber.error.message });
                    }
                    return reply.status(500).send({ error: resultSubscriber.error.message });
                }

                return reply.status(200).send({ success: resultSubscriber.success, message: `Você está inscrito nas atividades de ${action} do usuário ${resultSubscriber.data.targetUser.email}` });
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

const SubscribeInput = z.object({
    action: z.nativeEnum(ActivityAction),
});