const Redis = require('ioredis');

let redis;

try {
    redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        lazyConnect: true,
        connectTimeout: 2000,
        maxRetriesPerRequest: null,
        retryStrategy: (times) => {
            if (times > 2) return null;
            return Math.min(times * 100, 500);
        }
    });
    redis.on('error', () => {});
} catch (e) {
    redis = { get: async () => null, setex: async () => null, on: () => {} };
}

module.exports = redis;
