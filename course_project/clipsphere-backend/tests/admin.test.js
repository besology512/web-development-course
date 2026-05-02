const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Admin Endpoints', () => {
    let adminToken;
    let userToken;
    let testUser;

    beforeAll(async () => {
        const url = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/clipsphere_admin_test';
        await mongoose.connect(url);
        await User.deleteMany();

        // Create an admin user
        const admin = await User.create({
            username: 'adminuser',
            email: 'admin@example.com',
            password: 'adminpassword',
            role: 'admin'
        });

        // Create a regular user
        testUser = await User.create({
            username: 'regularuser',
            email: 'regular@example.com',
            password: 'userpassword',
            role: 'user'
        });

        // Login as admin
        const adminRes = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'adminpassword'
            });
        adminToken = adminRes.body.token;

        // Login as regular user
        const userRes = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'regular@example.com',
                password: 'userpassword'
            });
        userToken = userRes.body.token;
    });

    afterAll(async () => {
        await User.deleteMany();
        await mongoose.connection.close();
    });

    it('should allow admin to get stats', async () => {
        const res = await request(app)
            .get('/api/v1/admin/stats')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.totalUsers).toBeDefined();
    });

    it('should forbid regular user from getting stats', async () => {
        const res = await request(app)
            .get('/api/v1/admin/stats')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(403);
    });

    it('should allow admin to get health info', async () => {
        const res = await request(app)
            .get('/api/v1/admin/health')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.uptime).toBeDefined();
    });

    it('should allow admin to update user status', async () => {
        const res = await request(app)
            .patch(`/api/v1/admin/users/${testUser._id}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                status: 'suspended',
                active: false
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.user.accountStatus).toEqual('suspended');
    });

    it('should allow admin to view moderation queue', async () => {
        const res = await request(app)
            .get('/api/v1/admin/moderation')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('success');
    });
});
