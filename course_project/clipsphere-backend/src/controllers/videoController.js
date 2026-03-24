const videoService = require('../services/videoService');
const { z } = require('zod');

exports.createVideoMetadata = async (req, res, next) => {
    try {
        const video = await videoService.createVideo(req.body, req.user.id);

        res.status(201).json({
            status: 'success',
            data: {
                video
            }
        });
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
        const videos = await videoService.getAllVideos();

        res.status(200).json({
            status: 'success',
            results: videos.length,
            data: {
                videos
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateVideo = async (req, res, next) => {
    try {
        const video = await videoService.updateVideo(req.params.id, req.body);

        res.status(200).json({
            status: 'success',
            data: {
                video
            }
        });
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

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

exports.addReview = async (req, res, next) => {
    try {
        const review = await videoService.addReview(req.params.id, req.user.id, req.body);

        res.status(201).json({
            status: 'success',
            data: {
                review
            }
        });
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
