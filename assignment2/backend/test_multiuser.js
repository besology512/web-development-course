const { io } = require('socket.io-client');

async function runTest() {
    console.log('--- STARTING ASSIGNMENT 2 MULTI-USER TEST ---');

    const user1 = io('http://localhost:5000');
    const user2 = io('http://localhost:5000');

    const connectUser = (socket, uid, name) => {
        return new Promise((resolve) => {
            socket.on('connect', () => {
                console.log(`[TEST]: ${name} connected`);
                socket.emit('authenticate', { uid, name });
                resolve();
            });
        });
    };

    await Promise.all([
        connectUser(user1, 'uid_alice', 'Alice'),
        connectUser(user2, 'uid_bob', 'Bob')
    ]);

    // Alice joins room with Bob
    user1.emit('join_room', { targetUid: 'uid_bob' });
    user2.emit('join_room', { targetUid: 'uid_alice' });

    user1.on('presence_update', (users) => {
        console.log(`[PRESENCE]: Online users: ${Object.keys(users).join(', ')}`);
    });

    user1.on('receive_message', (msg) => {
        console.log(`[ALICE_RECV]: [${msg.sender}]: ${msg.text} (Room: ${msg.room})`);
    });

    user2.on('receive_message', (msg) => {
        console.log(`[BOB_RECV]: [${msg.sender}]: ${msg.text} (Room: ${msg.room})`);
    });

    user1.on('ghost_wipe', ({ room }) => {
        console.log(`[TEST]: SUCCESS - Ghost Wipe received for room ${room}!`);
        user1.disconnect();
        user2.disconnect();
        process.exit(0);
    });

    // Simulate chat
    setTimeout(() => {
        console.log('[TEST]: Alice sending private message to Bob...');
        user1.emit('send_message', {
            targetUid: 'uid_bob',
            text: 'Hello Bob! This is a secret.'
        });
    }, 2000);

    setTimeout(() => {
        console.log('[TEST]: Bob replying to Alice...');
        user2.emit('send_message', {
            targetUid: 'uid_alice',
            text: 'Hi Alice! I see it.'
        });
    }, 4000);

    // Timeout after 30 seconds
    setTimeout(() => {
        console.error('[TEST]: FAILED - Timeout waiting for ghost wipe.');
        process.exit(1);
    }, 30000);
}

runTest();
