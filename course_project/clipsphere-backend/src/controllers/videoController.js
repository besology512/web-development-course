const videoService = require('../services/videoService');
const { z } = require('zod');
const Video = require('../models/Video');
let emailQueue;
try { emailQueue = require('../queues/emailQueue'); } catch (e) {}

exports.createVideoMetadata = async (req, res, next) => {
    try {
        const video = await videoService.createVideo(req.body, req.user.id);
        res.status(201).json({ status: 'success', data: { video } });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ status: 'error', message: error.errors });
        } else {
            next(error);
        }
    }
};

exports.getAllVideos = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.id : null;
        const videos = await videoService.getAllVideos(req.query, userId);
        res.status(200).json({ status: 'success', results: videos.length, data: { videos } });
    } catch (error) {
        next(error);
    }
};

exports.getVideoById = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.id : null;
        const video = await videoService.getVideoById(req.params.id, userId);
        if (!video) return res.status(404).json({ status: 'error', message: 'Video not found' });
        res.status(200).json({ status: 'success', data: { video } });
    } catch (error) {
        next(error);
    }
};

exports.updateVideo = async (req, res, next) => {
    try {
        const video = await videoService.updateVideo(req.params.id, req.body);
        res.status(200).json({ status: 'success', data: { video } });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ status: 'error', message: error.errors });
        } else {
            next(error);
        }
    }
};

exports.deleteVideo = async (req, res, next) => {
    try {
        await videoService.deleteVideo(req.params.id);
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        next(error);
    }
};

exports.addReview = async (req, res, next) => {
    try {
        const review = await videoService.addReview(req.params.id, req.user.id, req.body);

        const targetVideo = await Video.findById(req.params.id)
            .populate('owner', 'email notifications')
            .select('title owner');

        if (
            emailQueue &&
            targetVideo?.owner &&
            targetVideo.owner._id.toString() !== req.user.id &&
            targetVideo.owner.notifications?.email?.comments
        ) {
            emailQueue.add('sendEngagement', {
                to: targetVideo.owner.email,
                message: `@${req.user.username} reviewed your video "${targetVideo.title}".`
            }).catch(() => {});
        }

        res.status(201).json({ status: 'success', data: { review } });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ status: 'error', message: 'You have already reviewed this video' });
        }
        if (error instanceof z.ZodError) {
            res.status(400).json({ status: 'error', message: error.errors });
        } else {
            next(error);
        }
    }
};

exports.updateReview = async (req, res, next) => {
    try {
        const review = await videoService.updateReview(req.params.id, req.user.id, req.body);
        res.status(200).json({ status: 'success', data: { review } });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ status: 'error', message: error.errors });
        } else if (error.statusCode) {
            res.status(error.statusCode).json({ status: 'error', message: error.message });
        } else {
            next(error);
        }
    }
};

exports.incrementViews = async (req, res, next) => {
    try {
        const result = await videoService.incrementViews(req.params.id);
        res.status(200).json({ status: 'success', data: result });
    } catch (error) {
        if (error.statusCode) {
            res.status(error.statusCode).json({ status: 'error', message: error.message });
        } else {
            next(error);
        }
    }
};

exports.likeVideo = async (req, res, next) => {
    try {
        const result = await videoService.toggleLike(req.params.id, req.user.id);
        res.status(200).json({ status: 'success', data: result });
    } catch (error) {
        if (error.statusCode) {
            res.status(error.statusCode).json({ status: 'error', message: error.message });
        } else {
            next(error);
        }
    }
};
