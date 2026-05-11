const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const https = require('https');

const API_URL = 'http://localhost:5001/api/v1';
const axiosInstance = axios.create();
let token = '';

async function audit() {
    console.log('--- STARTING SYSTEM AUDIT ---');

    try {
        // 1. Authenticate
        console.log('[1/4] Authenticating...');
        const authRes = await axiosInstance.post(`${API_URL}/auth/login`, {
            email: 'admin@clipsphere.com',
            password: 'Admin1234!'
        });
        token = authRes.data.token;
        console.log('Successfully authenticated as admin.');

        // 2. Multi-video upload simulation
        console.log('[2/4] Simulating multi-video uploads...');
        const videoPath = path.join(__dirname, '../../dummy_video.mp4');
        const uploadPromises = [];

        for (let i = 1; i <= 3; i++) {
            const form = new FormData();
            form.append('video', fs.createReadStream(videoPath));
            form.append('title', `Audit Video ${i}`);
            form.append('description', `Testing parallel upload ${i}`);

            uploadPromises.push(axiosInstance.post(`${API_URL}/videos/upload`, form, {
                headers: {
                    ...form.getHeaders(),
                    'Authorization': `Bearer ${token}`
                }
            }));
        }

        const uploadResults = await Promise.all(uploadPromises);
        console.log(`Successfully initiated ${uploadResults.length} parallel uploads.`);
        uploadResults.forEach((res, i) => {
            console.log(`  - Video ${i+1} ID: ${res.data.data.video._id} (Status: ${res.data.data.video.status})`);
        });

        // 3. Verify Background Email Queue (via User Registration)
        console.log('[3/4] Verifying background email queue...');
        const newUser = {
            username: `audit_user_${Date.now()}`,
            email: `audit_${Date.now()}@ethereal.email`,
            password: 'password123'
        };
        const regRes = await axiosInstance.post(`${API_URL}/auth/register`, newUser);
        console.log(`Registered new user: ${newUser.username}. Welcome email job should be in BullMQ.`);

        // 4. Verify System Stats (Admin endpoint)
        console.log('[4/4] Verifying platform statistics...');
        const statsRes = await axiosInstance.get(`${API_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Platform Statistics:');
        console.log(`  - Total Users: ${statsRes.data.data.totalUsers}`);
        console.log(`  - Total Videos: ${statsRes.data.data.totalVideos}`);

        console.log('--- SYSTEM AUDIT COMPLETED SUCCESSFULLY ---');
    } catch (error) {
        console.error('--- AUDIT FAILED ---');
        if (error.response) {
            console.error('Response Error:', error.response.status, error.response.data);
        } else {
            console.error('Error Details:', error);
        }
        process.exit(1);
    }
}

audit();
