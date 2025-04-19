import redisClient from '../config/redis.js';

/**
 * Cache middleware for GET requests
 * Implements read-through caching pattern
 * @param {number} duration - Cache TTL in seconds
 * @returns {Function} Express middleware
 */
export const cacheMiddleware = (duration = 3600) => {
  return async (req, res, next) => {
    // Skip caching if Redis client is not connected
    if (!redisClient.isReady) {
      console.log('⚠️ Redis not connected, skipping cache');
      return next();
    }

    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create a unique cache key based on the request URL
    const key = `api:${req.originalUrl}`;
    
    try {
      // Check if key exists in Redis
      const cachedData = await redisClient.get(key);
      
      if (cachedData) {
        console.log('🔄 Cache hit for:', key);
        // Return cached data
        return res.json(JSON.parse(cachedData));
      }
      
      console.log('🆕 Cache miss for:', key);
      
      // Store original send function
      const originalSend = res.send;
      
      // Override send function to cache response before sending
      res.send = function(body) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            // Ensure the body is a string
            const stringBody = typeof body === 'string' ? body : JSON.stringify(body);
            
            // Set cache with expiration
            redisClient.setEx(key, duration, stringBody)
              .catch(err => console.error('❌ Redis caching error:', err));
              
            console.log(`💾 Cached ${key} for ${duration} seconds`);
          } catch (error) {
            console.error('❌ Error stringifying response for cache:', error);
          }
        }
        
        // Call original send function
        return originalSend.call(this, body);
      };
      
      next();
    } catch (error) {
      console.error('❌ Caching middleware error:', error);
      next(); // Continue without caching on error
    }
  };
};

/**
 * Helper function to invalidate cache based on a pattern
 * @param {string} pattern - Cache key pattern to invalidate
 * @returns {Promise<void>}
 */
export const invalidateCache = async (pattern) => {
  try {
    // Skip if Redis client is not connected
    if (!redisClient.isReady) {
      console.log('⚠️ Redis not connected, skipping cache invalidation');
      return;
    }
    
    // Find all keys matching the pattern
    const keys = await redisClient.keys(pattern);
    
    if (keys.length) {
      console.log(`🗑️ Invalidating cache for pattern: ${pattern}`);
      
      // Delete all matching keys
      await Promise.all(keys.map(key => redisClient.del(key)));
      
      console.log(`✅ Invalidated ${keys.length} cache entries`);
    }
  } catch (error) {
    console.error('❌ Cache invalidation error:', error);
  }
};