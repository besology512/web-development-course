const jwt = require('jsonwebtoken');

// Store active users by socket ID
const activeUsers = new Map();

/**
 * Initialize Socket.io with authentication
 * @param {Server} io - Socket.io server instance
 */
const initializeSocket = (io) => {
    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication error'));
        }
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.username = decoded.username;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });
    
    // Connection handler
    io.on('connection', (socket) => {
        console.log(`✅ User ${socket.userId} connected:`, socket.id);
        
        // Join user into their private room
        socket.join(`user:${socket.userId}`);
        
        // Track active user
        activeUsers.set(socket.id, {
            userId: socket.userId,
            username: socket.username,
            socketId: socket.id,
            connectedAt: new Date()
        });
        
        // Emit user online status to their room
        io.to(`user:${socket.userId}`).emit('user:connected', {
            userId: socket.userId,
            username: socket.username
        });
        
        // Handle new like notification
        socket.on('like:notify', (data) => {
            const { videoOwnerId, likerUsername, videoTitle, videoId } = data;
            
            // Send notification to video owner's private room
            io.to(`user:${videoOwnerId}`).emit('notification:new-like', {
                type: 'like',
                likerUsername,
                videoTitle,
                videoId,
                timestamp: new Date(),
                id: `like-${Date.now()}`
            });
        });
        
        // Handle new tip notification
        socket.on('tip:notify', (data) => {
            const { videoOwnerId, tiperUsername, tipAmount, videoTitle, videoId } = data;
            
            // Send notification to video owner's private room
            io.to(`user:${videoOwnerId}`).emit('notification:new-tip', {
                type: 'tip',
                tiperUsername,
                tipAmount,
                videoTitle,
                videoId,
                timestamp: new Date(),
                id: `tip-${Date.now()}`
            });
        });
        
        // Mark notification as read
        socket.on('notification:read', (notificationId) => {
            // Emit read status to user's room
            io.to(`user:${socket.userId}`).emit('notification:marked-read', {
                notificationId
            });
        });
        
        // Broadcast user typing indicator (for future chat feature)
        socket.on('user:typing', (data) => {
            socket.broadcast.emit('user:typing', {
                userId: socket.userId,
                username: socket.username
            });
        });
        
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`❌ User ${socket.userId} disconnected:`, socket.id);
            activeUsers.delete(socket.id);
            
            // Emit user offline status
            io.to(`user:${socket.userId}`).emit('user:disconnected', {
                userId: socket.userId
            });
        });
        
        // Handle errors
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });
};

/**
 * Emit a like notification to a specific user
 * @param {Server} io - Socket.io server instance
 * @param {string} videoOwnerId - ID of video owner
 * @param {Object} likeData - Like notification data
 */
const emitLikeNotification = (io, videoOwnerId, likeData) => {
    io.to(`user:${videoOwnerId}`).emit('notification:new-like', {
        type: 'like',
        ...likeData,
        timestamp: new Date(),
        id: `like-${Date.now()}`
    });
};

/**
 * Emit a tip notification to a specific user
 * @param {Server} io - Socket.io server instance
 * @param {string} videoOwnerId - ID of video owner
 * @param {Object} tipData - Tip notification data
 */
const emitTipNotification = (io, videoOwnerId, tipData) => {
    io.to(`user:${videoOwnerId}`).emit('notification:new-tip', {
        type: 'tip',
        ...tipData,
        timestamp: new Date(),
        id: `tip-${Date.now()}`
    });
};

/**
 * Get count of active users
 */
const getActiveUserCount = () => activeUsers.size;

/**
 * Get active user info
 */
const getActiveUsers = () => Array.from(activeUsers.values());

module.exports = {
    initializeSocket,
    emitLikeNotification,
    emitTipNotification,
    getActiveUserCount,
    getActiveUsers,
    activeUsers
};
