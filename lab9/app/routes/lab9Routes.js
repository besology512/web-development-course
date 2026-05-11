const express = require('express');
const router = express.Router();
const redisClient = require('../redisClient');

// Part 1 & 2: Slow Route & App Caching (Redis)
router.get('/data', async (req, res) => {
    try {
        const cacheKey = 'lab9_data';
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            console.log('Cache HIT');
            return res.json({ source: 'cache', data: JSON.parse(cachedData) });
        }

        console.log('Cache MISS. Simulating delay...');
        // Simulate a slow database query (2 seconds)
        setTimeout(async () => {
            const data = { message: 'This is some slow data', timestamp: new Date().toISOString() };
            // Store in cache for 60 seconds
            await redisClient.setEx(cacheKey, 60, JSON.stringify(data));
            res.json({ source: 'database', data });
        }, 2000);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Part 8: Cache Invalidation
router.delete('/data/cache', async (req, res) => {
    try {
        const cacheKey = 'lab9_data';
        await redisClient.del(cacheKey);
        res.json({ message: 'Cache invalidated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Part 6: Redis Pub/Sub - Publish endpoint
router.post('/publish', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        await redisClient.publish('lab9_channel', message);
        res.json({ message: 'Message published to lab9_channel' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Part 7: Redis Hashes
router.post('/user/hash', async (req, res) => {
    try {
        const { id, name, age, role } = req.body;
        if (!id) return res.status(400).json({ error: 'User ID is required' });

        const hashKey = `user:${id}`;
        // Store user object
        await redisClient.hSet(hashKey, {
            name: name || 'Unknown',
            age: age ? age.toString() : '0',
            role: role || 'user'
        });

        res.json({ message: 'User stored in hash successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.patch('/user/hash/:field', async (req, res) => {
    try {
        const { id, value } = req.body;
        const { field } = req.params;
        if (!id || !value) return res.status(400).json({ error: 'User ID and value are required' });

        const hashKey = `user:${id}`;
        await redisClient.hSet(hashKey, field, value.toString());

        res.json({ message: `Field ${field} updated successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/user/hash/:id/:field', async (req, res) => {
    try {
        const { id, field } = req.params;
        const hashKey = `user:${id}`;
        const value = await redisClient.hGet(hashKey, field);

        if (value === null) {
            return res.status(404).json({ error: 'Field or user not found' });
        }

        res.json({ [field]: value });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
