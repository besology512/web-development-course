const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Video = require('../src/models/Video');
const Review = require('../src/models/Review');

describe('Video Endpoints', () => {
    let token;
    let user;
    let video;

    beforeAll(async () => {
        const url = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/clipsphere_video_test';
        await mongoose.connect(url);
        await User.deleteMany();
        await Video.deleteMany();
        await Review.deleteMany();

        user = await User.create({
            username: 'videomaker',
            email: 'video@example.com',
            password: 'password123'
        });

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'video@example.com',
                password: 'password123'
            });
        token = res.body.token;
    });

    afterAll(async () => {
        await User.deleteMany();
        await Video.deleteMany();
        await Review.deleteMany();
        await mongoose.connection.close();
    });

    it('should create a new video metadata', async () => {
        const res = await request(app)
            .post('/api/v1/videos')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'My Cool Video',
                description: 'This is a description',
                duration: 120,
                videoURL: 'videos/cool-video.mp4'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.data.video.title).toEqual('My Cool Video');
        video = res.body.data.video;
    });

    it('should get all public videos', async () => {
        const res = await request(app)
            .get('/api/v1/videos');

        expect(res.statusCode).toEqual(200);
        expect(res.body.results).toBeGreaterThan(0);
    });

    it('should update video metadata', async () => {
        const res = await request(app)
            .patch(`/api/v1/videos/${video._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Updated Video Title'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.video.title).toEqual('Updated Video Title');
    });

    it('should add a review to a video', async () => {
        const res = await request(app)
            .post(`/api/v1/videos/${video._id}/reviews`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                rating: 5,
                comment: 'Great video!'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.data.review.comment).toEqual('Great video!');
    });

    it('should delete a video', async () => {
        const res = await request(app)
            .delete(`/api/v1/videos/${video._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(204);
    });
});
