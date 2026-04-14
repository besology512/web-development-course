const Video = require('../models/Video');
const Review = require('../models/Review');
const Follower = require('../models/Follower');
const { z } = require('zod');
let redis;
try { redis = require('../config/redisClient'); } catch(e) { redis = null; }

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
    const video = await Video.create({ ...validatedData, owner: ownerId });
    return video;
};

exports.getAllVideos = async (query, userId) => {
    const limit = parseInt(query.limit) || 10;
    const skip = parseInt(query.skip) || 0;
    const feed = query.feed || 'trending';

    if (feed === 'trending') {
        const cacheKey = `clipsphere:trending:${skip}:${limit}`;
        if (redis) {
            try {
                const cached = await redis.get(cacheKey);
                if (cached) return JSON.parse(cached);
            } catch(e) {}
        }

        const videos = await Video.aggregate([
            { $match: { status: 'public' } },
            { $lookup: { from: 'reviews', localField: '_id', foreignField: 'video', as: 'reviews' } },
            { $addFields: { avgRating: { $avg: '$reviews.rating' }, reviewCount: { $size: '$reviews' } } },
            { $sort: { avgRating: -1, viewsCount: -1, createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $lookup: { from: 'users', localField: 'owner', foreignField: '_id', as: 'ownerData' } },
            { $unwind: '$ownerData' },
            { $project: { title: 1, description: 1, videoURL: 1, duration: 1, viewsCount: 1, status: 1, createdAt: 1, avgRating: 1, reviewCount: 1, 'ownerData._id': 1, 'ownerData.username': 1, 'ownerData.avatarKey': 1 } }
        ]);

        if (redis) {
            try { await redis.setex(cacheKey, 60, JSON.stringify(videos)); } catch(e) {}
        }
        return videos;
    }

    if (feed === 'following' && userId) {
        const follows = await Follower.find({ follower: userId }).select('following');
        const followingIds = follows.map(f => f.following);
        const videos = await Video.find({ status: 'public', owner: { $in: followingIds } })
            .populate('owner', 'username avatarKey')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        return videos;
    }

    return Video.find({ status: 'public' })
        .populate('owner', 'username avatarKey')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

exports.updateVideo = async (id, data) => {
    const validatedData = videoUpdateSchema.parse(data);
    const video = await Video.findByIdAndUpdate(id, validatedData, { new: true, runValidators: true });
    return video;
};

exports.deleteVideo = async (id) => {
    const video = await Video.findById(id);
    if (video && video.videoURL) {
        try {
            const uploadService = require('./uploadService');
            await uploadService.deleteFromMinio(video.videoURL);
        } catch(e) {}
    }
    await Video.findByIdAndDelete(id);
};

exports.addReview = async (videoId, userId, data) => {
    const validatedData = reviewSchema.parse(data);
    const review = await Review.create({ ...validatedData, video: videoId, user: userId });
    return review;
};

exports.likeVideo = async (videoId, userId, io) => {
    const video = await Video.findByIdAndUpdate(videoId, { $inc: { viewsCount: 1 } }, { new: true }).populate('owner', 'username');
    if (!video) throw new Error('Video not found');
    const User = require('../models/User');
    const liker = await User.findById(userId).select('username');
    if (io && liker && video.owner._id.toString() !== userId.toString()) {
        io.to(video.owner._id.toString()).emit('new-like', {
            likerUsername: liker.username,
            videoTitle: video.title
        });
    }
    return video;
};
