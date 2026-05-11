const axios = require('axios');

const API_URL = 'https://localhost/api/v1';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function runBonusTest() {
    console.log('--- Bonus Phase: Scoring & Following Boost Test ---');
    
    try {
        // 1. Register User 1 and User 2
        const u1 = `u1_${Date.now()}`;
        const u2 = `u2_${Date.now()}`;
        
        console.log(`Registering User 1 (${u1})...`);
        const reg1 = await axios.post(`${API_URL}/auth/register`, {
            username: u1,
            email: `${u1}@example.com`,
            password: 'Password123!'
        });
        const token1 = reg1.data.token;
        const user1Id = reg1.data.data.user._id;

        console.log(`Registering User 2 (${u2})...`);
        const reg2 = await axios.post(`${API_URL}/auth/register`, {
            username: u2,
            email: `${u2}@example.com`,
            password: 'Password123!'
        });
        const token2 = reg2.data.token;
        const user2Id = reg2.data.data.user._id;

        // 2. User 1 follows User 2
        console.log('User 1 following User 2...');
        await axios.post(`${API_URL}/users/${user2Id}/follow`, {}, {
            headers: { Authorization: `Bearer ${token1}` }
        });

        // 3. User 2 uploads Video A (will have high score) and Video B
        console.log('User 2 uploading Video A...');
        const uploadA = await axios.post(`${API_URL}/videos`, {
            title: 'High Score Video',
            description: 'This will be liked',
            duration: 10,
            videoURL: 'videos/fake_a.mp4'
        }, {
            headers: { Authorization: `Bearer ${token2}` }
        });
        const videoAId = uploadA.data.data.video._id;

        console.log('User 2 uploading Video B...');
        const uploadB = await axios.post(`${API_URL}/videos`, {
            title: 'Low Score Video',
            description: 'This will not be liked',
            duration: 10,
            videoURL: 'videos/fake_b.mp4'
        }, {
            headers: { Authorization: `Bearer ${token2}` }
        });
        const videoBId = uploadB.data.data.video._id;

        // 4. User 1 likes Video A
        console.log('User 1 liking Video A...');
        await axios.post(`${API_URL}/videos/${videoAId}/like`, {}, {
            headers: { Authorization: `Bearer ${token1}` }
        });

        // 5. User 1 reviews Video A
        console.log('User 1 reviewing Video A with 5 stars...');
        await axios.post(`${API_URL}/videos/${videoAId}/reviews`, {
            rating: 5,
            comment: 'Excellent video!'
        }, {
            headers: { Authorization: `Bearer ${token1}` }
        });

        // 6. Verify Trending Score after Review
        console.log('Verifying Trending Score after Review...');
        const getAReview = await axios.get(`${API_URL}/videos/${videoAId}`, {
            headers: { Authorization: `Bearer ${token1}` }
        });
        console.log(`Video A Score after Review: ${getAReview.data.data.video.trendingScore}`);
        
        if (getAReview.data.data.video.trendingScore > 65) {
            console.log('[SUCCESS] Trending score updated correctly with review (10 like + 10 rating + ~50 freshness).');
        } else {
            console.log('[FAILURE] Trending score not updated with review.');
        }

        // 7. Verify "Following" Feed
        console.log('Checking Following Feed for User 1...');
        const followingFeed = await axios.get(`${API_URL}/videos?feed=following`, {
            headers: { Authorization: `Bearer ${token1}` }
        });
        
        const feedVideoIds = followingFeed.data.data.videos.map(v => v._id);
        if (feedVideoIds.includes(videoAId) && feedVideoIds.includes(videoBId)) {
            console.log('[SUCCESS] Followed user videos found in feed.');
        } else {
            console.log('[FAILURE] Followed user videos missing from feed.');
        }

        console.log('--- Bonus Test Completed Successfully ---');

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

runBonusTest();
