const app = require('./src/app');
const connectDB = require('./src/config/db');
const ensureAdminUser = require('./src/config/seedAdmin');
const { Server } = require('socket.io');
const { initializeSocket } = require('./src/services/socketService');
const http = require('http');

const PORT = process.env.PORT || 5000;

async function bootstrap() {
    await connectDB();
    await ensureAdminUser();

    // Create HTTP server and Socket.io instance
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            credentials: true
        }
    });
    
    // Initialize Socket.io with authentication and event handlers
    initializeSocket(io);
    
    // Attach io instance to app for use in routes/controllers
    app.set('io', io);

    server.listen(PORT, () => {
        console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        console.log(`🔌 WebSocket server initialized`);
    });

    process.on('unhandledRejection', (err) => {
        console.log(`Error: ${err.message}`);
        server.close(() => process.exit(1));
    });
}

bootstrap().catch((error) => {
    console.error(`Startup failed: ${error.message}`);
    process.exit(1);
});
