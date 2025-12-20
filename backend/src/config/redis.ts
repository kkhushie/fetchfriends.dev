import { createClient } from 'redis';
import { logger } from '../utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('✅ Redis connected');
});

export async function connectRedis() {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('❌ Redis connection error:', error);
    throw error;
  }
}

export async function disconnectRedis() {
  await redisClient.disconnect();
  logger.info('Redis disconnected');
}

