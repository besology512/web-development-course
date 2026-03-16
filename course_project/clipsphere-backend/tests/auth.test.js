const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Auth Endpoints', () => {
    beforeAll(async () => {
        // Connect to a test database
        const url = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/clipsphere_user_test';
        await mongoose.connect(url);
        await User.deleteMany();
    });

    afterAll(async () => {
        // Clean up database and close connection
        await User.deleteMany();
        await mongoose.connection.close();
    });

    let token;

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.status).toEqual('success');
        expect(res.body.token).toBeDefined();
        token = res.body.token;
    });

    it('should login the user', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.token).toBeDefined();
    });

    it('should access protected profile route', async () => {
        const res = await request(app)
            .get('/api/v1/users/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.user.username).toEqual('testuser');
    });

    it('should fail registration with short password', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'small',
                email: 'small@example.com',
                password: 'short'
            });

        expect(res.statusCode).toEqual(400);
    });
});
