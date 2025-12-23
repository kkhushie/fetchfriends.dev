import { createClient } from 'redis';
import { logger } from '../utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.warn('Redis: Max reconnection attempts reached. Redis operations will be disabled.');
        return false; // Stop trying to reconnect
      }
      return Math.min(retries * 100, 3000); // Exponential backoff, max 3s
    },
  },
});

let isConnected = false;
let connectionAttempted = false;

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
  isConnected = false;
});

redisClient.on('connect', () => {
  logger.info('✅ Redis connecting...');
});

redisClient.on('ready', () => {
  logger.info('✅ Redis connected and ready');
  isConnected = true;
});

redisClient.on('end', () => {
  logger.warn('Redis connection ended');
  isConnected = false;
});

redisClient.on('reconnecting', () => {
  logger.info('Redis reconnecting...');
});

/**
 * Check if Redis is connected
 */
export function isRedisConnected(): boolean {
  return isConnected && redisClient.isReady;
}

/**
 * Test Redis connection with PING
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    if (!redisClient.isOpen) {
      return false;
    }
    const result = await redisClient.ping();
    return result === 'PONG';
  } catch (error) {
    return false;
  }
}

/**
 * Safely execute Redis operations with fallback
 */
export async function safeRedisOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName: string = 'Redis operation'
): Promise<T> {
  if (!isRedisConnected()) {
    logger.warn(`Redis not connected, skipping ${operationName}. Using fallback.`);
    return fallback;
  }

  try {
    return await operation();
  } catch (error: any) {
    logger.error(`Redis ${operationName} failed:`, error);
    return fallback;
  }
}

export async function connectRedis() {
  if (connectionAttempted && isConnected) {
    return; // Already connected
  }

  connectionAttempted = true;

  try {
    logger.info(`🔌 Attempting to connect to Redis at ${REDIS_URL}`);
    
    if (!redisClient.isOpen) {
      await redisClient.connect();
      
      // Test the connection with a PING
      const pong = await redisClient.ping();
      if (pong === 'PONG') {
        isConnected = true;
        logger.info('✅ Redis connected successfully and responding to PING');
      } else {
        logger.warn('⚠️  Redis connected but PING test failed');
        isConnected = false;
      }
    } else {
      // Test existing connection
      const pong = await redisClient.ping();
      if (pong === 'PONG') {
        isConnected = true;
        logger.info('✅ Redis already connected and responding to PING');
      } else {
        logger.warn('⚠️  Redis connection exists but PING test failed');
        isConnected = false;
      }
    }
  } catch (error: any) {
    isConnected = false;
    logger.error('❌ Redis connection error:', error.message);
    logger.error('   Connection URL:', REDIS_URL);
    logger.warn('⚠️  Server will continue without Redis. Some features may be limited.');
    logger.info('💡 Make sure Redis is running: docker ps (should show redis container)');
    // Don't throw - allow server to start without Redis
  }
}

export async function disconnectRedis() {
  try {
    if (redisClient.isOpen) {
      await redisClient.disconnect();
      isConnected = false;
      logger.info('Redis disconnected');
    }
  } catch (error) {
    logger.error('Error disconnecting Redis:', error);
  }
}

