const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const subscriber = createClient({ url: redisUrl });

subscriber.on('error', err => console.log('Redis Subscriber Error', err));

(async () => {
    try {
        await subscriber.connect();
        console.log('Subscriber connected to Redis');

        const channel = 'lab9_channel';
        await subscriber.subscribe(channel, (message) => {
            console.log(`[Listener ${process.pid}] Received message on channel ${channel}: ${message}`);
        });
        
        console.log(`Listening for messages on channel: ${channel}`);
    } catch (err) {
        console.error('Failed to connect to Redis subscriber', err);
    }
})();
