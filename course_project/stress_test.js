const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { execSync } = require('child_process');

const API_URL = 'https://localhost/api/v1';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function runTest() {
    console.log('--- Stress Test: Bulk Video Uploads ---');

    // 1. Create a dummy video if it doesn't exist
    if (!fs.existsSync('dummy_video.mp4')) {
        console.log('Creating a dummy video using ffmpeg...');
        try {
            // Generates a 1-second black video
            execSync('ffmpeg -f lavfi -i color=c=black:s=1280x720:d=1 -vcodec libx264 dummy_video.mp4');
            console.log('Dummy video created.');
        } catch (e) {
            console.log('Failed to create dummy video. Please ensure ffmpeg is installed locally.');
            process.exit(1);
        }
    }

    // 2. Register a temporary user to get an auth token
    const randomSuffix = Math.floor(Math.random() * 100000);
    const user = {
        username: `testuser_${randomSuffix}`,
        email: `test${randomSuffix}@example.com`,
        password: 'Password123!',
        passwordConfirm: 'Password123!'
    };

    let token;
    try {
        console.log(`Registering user ${user.username}...`);
        const res = await axios.post(`${API_URL}/auth/register`, user);
        token = res.data.token;
        console.log('User registered and authenticated.');
    } catch (e) {
        console.error('Registration failed:', e.response?.data || e.message);
        return;
    }

    // 3. Perform bulk uploads
    const UPLOAD_COUNT = 5; // Reduced for quick testing
    console.log(`Starting ${UPLOAD_COUNT} concurrent video uploads...`);

    const uploadPromises = [];
    for (let i = 1; i <= UPLOAD_COUNT; i++) {
        const form = new FormData();
        form.append('title', `Stress Test Video ${i}`);
        form.append('description', 'This is a concurrent upload test.');
        form.append('video', fs.createReadStream('dummy_video.mp4'));

        const uploadPromise = axios.post(`${API_URL}/videos/upload`, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        }).then(res => {
            console.log(`[SUCCESS] Upload ${i} completed. Video ID: ${res.data.data.video._id}`);
            return res.data.data.video;
        }).catch(err => {
            console.error(`[ERROR] Upload ${i} failed:`, err.response?.data || err.message);
        });

        uploadPromises.push(uploadPromise);
    }

    await Promise.all(uploadPromises);
    console.log('--- Stress Test Completed ---');
}

runTest();
