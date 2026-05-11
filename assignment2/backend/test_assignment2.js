const { io } = require('socket.io-client');

const socket = io('http://localhost:5000');

console.log('--- STARTING ASSIGNMENT 2 TEST ---');

socket.on('connect', () => {
    console.log('[TEST]: Connected to server');
    
    // Join room
    socket.emit('join_room', { room: 'global' });
});

socket.on('system_pulse', (event) => {
    console.log(`[PULSE]: ${event.type} - ${event.message}`);
});

socket.on('receive_message', (msg) => {
    console.log(`[CHAT]: [${msg.sender}]: ${msg.text}`);
});

socket.on('ghost_wipe', () => {
    console.log('[TEST]: SUCCESS - Ghost Wipe received! Data purged from Redis.');
    process.exit(0);
});

// Send a test message after 2 seconds
setTimeout(() => {
    console.log('[TEST]: Sending volatile message...');
    socket.emit('send_message', {
        room: 'global',
        sender: 'TestBot',
        text: 'This message will self-destruct in 10 seconds.'
    });
}, 2000);

// Timeout after 30 seconds if no wipe
setTimeout(() => {
    console.error('[TEST]: FAILED - Timeout waiting for ghost wipe.');
    process.exit(1);
}, 30000);
