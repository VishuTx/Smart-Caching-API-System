import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL
});

// Error event handler
redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
  console.log('Continuing without Redis cache functionality');
});

// Connection event handler
redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

// Reconnection event handler
redisClient.on('reconnecting', () => {
  console.log('🔄 Reconnecting to Redis...');
});

/**
 * Initialize Redis connection
 * @returns {Promise<boolean>} Connection success status
 */
export const initRedis = async () => {
  try {
    await redisClient.connect();
    return true;
  } catch (error) {
    console.error('❌ Redis connection error:', error);
    console.log('🔶 Application will run without caching functionality');
    return false;
  }
};

// Create a mock Redis client for when connection fails
const mockRedisClient = {
  get: async () => null,
  set: async () => true,
  del: async () => true,
  flushAll: async () => true,
  // Add any other Redis methods your application uses
};

// Export the appropriate client
export default redisClient;

// Export a function that returns either the real client or mock client
export const getRedisClient = () => {
  return redisClient.isReady ? redisClient : mockRedisClient;
};