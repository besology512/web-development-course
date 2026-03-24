const Video = require('../models/Video');
const Review = require('../models/Review');
const { z } = require('zod');

const videoSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    duration: z.number().max(300),
    videoURL: z.string()
});

const videoUpdateSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional()
});

const reviewSchema = z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().min(1).max(500)
});

exports.createVideo = async (data, ownerId) => {
    const validatedData = videoSchema.parse(data);
    const video = await Video.create({
        ...validatedData,
        owner: ownerId
    });
    return video;
};

exports.getAllVideos = async () => {
    const videos = await Video.find({ status: 'public' }).populate('owner', 'username avatarKey');
    return videos;
};

exports.updateVideo = async (id, data) => {
    const validatedData = videoUpdateSchema.parse(data);
    const video = await Video.findByIdAndUpdate(id, validatedData, {
        new: true,
        runValidators: true
    });
    return video;
};

exports.deleteVideo = async (id) => {
    await Video.findByIdAndDelete(id);
};

exports.addReview = async (videoId, userId, data) => {
    const validatedData = reviewSchema.parse(data);
    const review = await Review.create({
        ...validatedData,
        video: videoId,
        user: userId
    });
    return review;
};
