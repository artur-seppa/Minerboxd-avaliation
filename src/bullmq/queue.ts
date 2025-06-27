import { Queue } from 'bullmq';
import { redisConfig } from './redisConfig.js';

export const userSubscribesQueue = new Queue('userSubscribes', redisConfig);