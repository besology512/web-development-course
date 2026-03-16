const Video = require('../models/Video');
const Review = require('../models/Review');
const { z } = require('zod');

const videoSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    duration: z.number().max(300),
    videoURL: z.string() // Key for object storage
});

const reviewSchema = z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().min(1).max(500)
});

exports.createVideoMetadata = async (req, res, next) => {
    try {
        const validatedData = videoSchema.parse(req.body);

        const video = await Video.create({
            ...validatedData,
            owner: req.user.id
        });

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
        const videos = await Video.find({ status: 'public' }).populate('owner', 'username avatarKey');

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
        const { title, description } = req.body;

        const video = await Video.findByIdAndUpdate(req.params.id, { title, description }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                video
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteVideo = async (req, res, next) => {
    try {
        await Video.findByIdAndDelete(req.params.id);

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
        const validatedData = reviewSchema.parse(req.body);
        const videoId = req.params.id;
        const userId = req.user.id;

        const review = await Review.create({
            ...validatedData,
            video: videoId,
            user: userId
        });

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
