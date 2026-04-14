require('dotenv').config();
const { Worker } = require('bullmq');
const emailService = require('./src/services/emailService');

const worker = new Worker('emailQueue', async (job) => {
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

console.log('Email worker started');
worker.on('failed', (job, err) => console.error(`Job ${job.id} failed:`, err.message));
worker.on('completed', (job) => console.log(`Job ${job.id} completed`));
