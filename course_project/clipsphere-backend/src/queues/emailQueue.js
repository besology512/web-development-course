const { Queue } = require('bullmq');

let emailQueue = null;

try {
    emailQueue = new Queue('emailQueue', {
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
    emailQueue.on('error', () => {});
} catch (e) {
    emailQueue = null;
}

module.exports = emailQueue;
