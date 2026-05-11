require('dotenv').config();
const { Worker } = require('bullmq');
const emailService = require('./src/services/emailService');
const mongoose = require('mongoose');
const Video = require('./src/models/Video');
const videoService = require('./src/services/videoService');
const ffmpeg = require('fluent-ffmpeg');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clipsphere')
    .then(() => console.log('Worker connected to MongoDB'))
    .catch(err => console.error('Worker MongoDB connection error:', err));

const emailWorker = new Worker('emailQueue', async (job) => {
    if (job.name === 'sendWelcome') {
        await emailService.sendWelcomeEmail(job.data.to, job.data.username);
        console.log(`Welcome email sent to ${job.data.to}`);
    }
    if (job.name === 'sendEngagement') {
        await emailService.sendEngagementEmail(job.data.to, job.data.message);
        console.log(`Engagement email sent to ${job.data.to}`);
    }
}, {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379
    }
});

const videoWorker = new Worker('videoQueue', async (job) => {
    if (job.name === 'processDuration') {
        const { videoId, objectPath } = job.data;
        try {
            const playURL = await videoService.getPresignedUrl(objectPath);
            
            const duration = await new Promise((resolve, reject) => {
                ffmpeg.ffprobe(playURL, (err, metadata) => {
                    if (err) return reject(err);
                    resolve(metadata.format.duration);
                });
            });

            console.log(`Extracted duration ${duration}s for video ${videoId}`);

            if (duration > 300) {
                await Video.findByIdAndUpdate(videoId, { status: 'rejected', duration: Math.floor(duration) });
                console.log(`Video ${videoId} rejected: duration exceeds 5 minutes`);
            } else {
                await Video.findByIdAndUpdate(videoId, { duration: Math.floor(duration) });
                console.log(`Video ${videoId} duration updated successfully`);
            }
        } catch (error) {
            console.error(`Error processing video duration for ${videoId}:`, error.message);
            throw error;
        }
    }
}, {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379
    }
});

console.log('Workers started: Email and Video processing');
emailWorker.on('failed', (job, err) => console.error(`Email Job ${job.id} failed:`, err.message));
emailWorker.on('completed', (job) => console.log(`Email Job ${job.id} completed`));
videoWorker.on('failed', (job, err) => console.error(`Video Job ${job.id} failed:`, err.message));
videoWorker.on('completed', (job) => console.log(`Video Job ${job.id} completed`));
