const jwt = require('jsonwebtoken');

module.exports = (io) => {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error'));
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (e) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        socket.join(socket.userId);
        console.log(`Socket connected: ${socket.userId}`);
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.userId}`);
        });
    });
};
