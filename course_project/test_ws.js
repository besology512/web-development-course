const io = require('socket.io-client');

const socket = io('https://localhost', {
    rejectUnauthorized: false,
    path: '/socket.io/'
});

console.log('Connecting to WebSocket...');

socket.on('connect', () => {
    console.log('[SUCCESS] WebSocket connected to https://localhost');
    socket.disconnect();
    process.exit(0);
});

socket.on('connect_error', (err) => {
    console.error('[FAILURE] WebSocket connection error:', err.message);
    process.exit(1);
});

setTimeout(() => {
    console.error('[TIMEOUT] WebSocket connection timed out');
    process.exit(1);
}, 5000);
