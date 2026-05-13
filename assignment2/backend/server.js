require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const redis = require('redis');
const cors = require('cors');
const admin = require('firebase-admin');
const twilio = require('twilio');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Firebase Admin Setup
try {
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('[FIREBASE]: Admin SDK Initialized');
} catch (error) {
    console.error('[FIREBASE]: Error initializing Admin SDK. Check service account JSON path.');
}

// MongoDB Setup
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ghost_messenger')
    .then(() => console.log('[MONGODB]: Connected'))
    .catch(err => console.error('[MONGODB]: Connection error', err));

// Redis Setup
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('[REDIS]: Client Error', err));
redisClient.connect().then(() => console.log('[REDIS]: Connected'));

// Twilio Setup
const twilioClient = process.env.MOCK_TWILIO === 'true' ? null : 
    twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Redis Key Expiry Listener (for Pulse Log)
const subscriber = redisClient.duplicate();
subscriber.connect();
subscriber.subscribe('__keyevent@0__:expired', (key) => {
    if (key.startsWith('chat:')) {
        console.log(`[REDIS]: Key ${key} expired. Memory purged.`);
        io.emit('system_pulse', {
            type: 'REDIS',
            message: `Key ${key} reached 0 TTL. Ghost memory purged.`,
            timestamp: new Date().toISOString()
        });
        io.emit('ghost_wipe', { room: key.split(':').slice(1).join(':') });
    }
});

// User Schema
const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    displayName: String,
    email: String,
    photoURL: String,
    lastSeen: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Auth Middleware
const verifyToken = async (req, res, next) => {
    if (process.env.MOCK_AUTH === 'true') {
        req.user = { 
            uid: 'mock_uid_123', 
            name: 'Mock User', 
            email: 'mock@example.com', 
            picture: 'https://via.placeholder.com/150' 
        };
        return next();
    }

    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).send('Unauthorized');
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401).send('Invalid Token');
    }
};

// Routes
app.post('/auth/login', verifyToken, async (req, res) => {
    const { uid, name, email, picture } = req.user;
    let user = await User.findOne({ uid });
    if (!user) {
        user = new User({ uid, displayName: name, email, photoURL: picture });
        await user.save();
        console.log(`[AUTH]: Silent Registration for ${name} (${uid})`);
    }

    // MFA Challenge Trigger
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const phone = process.env.MFA_PHONE_NUMBER || '+20XXXXXXXXX';
    
    // Store OTP in Redis (5 min expiry)
    await redisClient.setEx(`mfa:${uid}`, 300, otp);
    
    if (process.env.MOCK_TWILIO === 'true') {
        console.log(`[TWILIO]: MOCK MFA Challenge for ${uid}: ${otp}`);
    } else {
        try {
            await twilioClient.messages.create({
                body: `Your Ghost Messenger verification code is: ${otp}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            });
            console.log(`[TWILIO]: MFA Challenge dispatched to ${phone}`);
        } catch (err) {
            console.error('[TWILIO]: Error sending SMS', err);
        }
    }

    res.json({ status: 'PENDING_MFA', uid });
    
    // Pulse Monitor Logs
    io.emit('system_pulse', {
        type: 'TWILIO',
        message: `MFA Challenge dispatched to ${phone}`,
        timestamp: new Date().toISOString()
    });
    io.emit('system_pulse', {
        type: 'AUTH',
        message: `Awaiting SMS code verification.`,
        timestamp: new Date().toISOString()
    });
});

app.post('/auth/verify-mfa', async (req, res) => {
    const { uid, code } = req.body;
    const savedOtp = await redisClient.get(`mfa:${uid}`);

    if (savedOtp && savedOtp === code) {
        await redisClient.del(`mfa:${uid}`);
        const user = await User.findOne({ uid });
        
        io.emit('system_pulse', {
            type: 'TWILIO',
            message: `SMS Code Verified. Session promoted to SECURE.`,
            timestamp: new Date().toISOString()
        });

        res.json({ status: 'SECURE', user });
    } else {
        res.status(401).json({ error: 'Invalid or expired OTP' });
    }
});

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('[SOCKET]: User connected', socket.id);

    socket.on('authenticate', async ({ uid, name }) => {
        socket.uid = uid;
        socket.name = name;
        
        // Presence Tracking
        await redisClient.hSet('presence', uid, 'online');
        console.log(`[SOCKET]: User ${name} (${uid}) is online`);
        
        socket.emit('system_pulse', {
            type: 'AUTH',
            message: `Identity verified for ${uid}. Session secure.`,
            timestamp: new Date().toISOString()
        });

        // Broadcast presence update
        const onlineUsers = await redisClient.hGetAll('presence');
        io.emit('presence_update', onlineUsers);
    });

    socket.on('join_room', async ({ targetUid }) => {
        if (!socket.uid) return;
        
        // Deterministic room ID for 1-on-1 chat or global
        const room = targetUid === 'global' ? 'global' : [socket.uid, targetUid].sort().join('_');
        socket.join(room);
        
        console.log(`[SOCKET]: User joined private room ${room}`);
        socket.emit('system_pulse', {
            type: 'SOCKET',
            message: `Joined private room with ${targetUid}. ID: ${room}`,
            timestamp: new Date().toISOString()
        });

        // Atomic Read-Once: Fetch and wipe history
        const redisKey = `chat:${room}`;
        const multi = redisClient.multi();
        multi.lRange(redisKey, 0, -1);
        multi.del(redisKey);
        
        const [history] = await multi.exec();
        
        if (history && history.length > 0) {
            const parsedHistory = history.map(m => JSON.parse(m));
            socket.emit('history_wipe', { room, history: parsedHistory });
            console.log(`[REDIS]: Atomic Read-Once triggered for ${redisKey}. History purged.`);
        }
    });

    socket.on('send_message', async (data) => {
        const { targetUid, text } = data;
        if (!socket.uid) return;

        const room = targetUid === 'global' ? 'global' : [socket.uid, targetUid].sort().join('_');
        const msg = { sender: socket.name, text, timestamp: new Date().toISOString() };
        
        const redisKey = `chat:${room}`;
        
        // Write to Redis List
        await redisClient.rPush(redisKey, JSON.stringify(msg));
        // Set TTL
        await redisClient.expire(redisKey, parseInt(process.env.GHOST_TTL || 120));
        
        const ttl = await redisClient.ttl(redisKey);
        
        io.to(room).emit('receive_message', { ...msg, room });
        
        io.emit('system_pulse', {
            type: 'REDIS',
            message: `Message saved to '${redisKey}' (TTL: ${ttl}s)`,
            timestamp: new Date().toISOString()
        });
    });

    socket.on('disconnect', async () => {
        if (socket.uid) {
            // Burn-on-Disconnect: Remove presence
            await redisClient.hDel('presence', socket.uid);
            console.log(`[SOCKET]: User ${socket.name} disconnected. Presence burned.`);
            
            const onlineUsers = await redisClient.hGetAll('presence');
            io.emit('presence_update', onlineUsers);
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`[SERVER]: Running on port ${PORT}`);
});
