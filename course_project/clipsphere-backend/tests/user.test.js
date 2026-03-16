const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Follower = require('../src/models/Follower');

describe('User Endpoints', () => {
    let token;
    let user;
    let otherUser;

    beforeAll(async () => {
        const url = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/clipsphere_user_test';
        await mongoose.connect(url);
        await User.deleteMany();
        await Follower.deleteMany();

        // Create a test user
        user = await User.create({
            username: 'testme',
            email: 'me@example.com',
            password: 'password123'
        });

        otherUser = await User.create({
            username: 'otheruser',
            email: 'other@example.com',
            password: 'password123'
        });

        // Login to get token
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'me@example.com',
                password: 'password123'
            });
        token = res.body.token;
    });

    afterAll(async () => {
        await User.deleteMany();
        await Follower.deleteMany();
        await mongoose.connection.close();
    });

    it('should get current user profile', async () => {
        const res = await request(app)
            .get('/api/v1/users/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.user.username).toEqual('testme');
    });

    it('should update current user profile', async () => {
        const res = await request(app)
            .patch('/api/v1/users/updateMe')
            .set('Authorization', `Bearer ${token}`)
            .send({
                bio: 'New bio content'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.user.bio).toEqual('New bio content');
    });

    it('should follow another user', async () => {
        const res = await request(app)
            .post(`/api/v1/users/${otherUser._id}/follow`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(201);
        expect(res.body.status).toEqual('success');
    });

    it('should list following', async () => {
        const res = await request(app)
            .get(`/api/v1/users/${user._id}/following`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.results).toBeGreaterThan(0);
    });

    it('should unfollow a user', async () => {
        const res = await request(app)
            .delete(`/api/v1/users/${otherUser._id}/unfollow`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(204);
    });
});
