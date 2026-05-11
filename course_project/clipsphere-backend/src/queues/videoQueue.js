const { Queue } = require('bullmq');

let videoQueue = null;

try {
    videoQueue = new Queue('videoQueue', {
        connection: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
            lazyConnect: true,
            maxRetriesPerRequest: null,
            enableOfflineQueue: false,
            connectTimeout: 2000,
            retryStrategy: () => null
        }
    });
    videoQueue.on('error', () => {});
} catch (e) {
    videoQueue = null;
}

module.exports = videoQueue;
