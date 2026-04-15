const Video = require('../models/Video');
const Review = require('../models/Review');
const Follower = require('../models/Follower');
const { z } = require('zod');
const uploadService = require('./uploadService');

let redis;
try { redis = require('../config/redisClient'); } catch (e) { redis = null; }

async function invalidateTrendingCache() {
    if (!redis) return;
    try {
        const keys = await redis.keys('clipsphere:trending:*');
        if (keys.length) await redis.del(...keys);
    } catch (e) {}
}
exports.invalidateTrendingCache = invalidateTrendingCache;

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

async function getReviewStats(videoIds) {
    if (!videoIds.length) return new Map();

    const stats = await Review.aggregate([
        { $match: { video: { $in: videoIds } } },
        {
            $group: {
                _id: '$video',
                avgRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 }
            }
        }
    ]);

    return new Map(stats.map((item) => [item._id.toString(), item]));
}

function normalizeOwner(video) {
    const owner = video.ownerData || video.owner;
    if (!owner) return null;

    return {
        _id: owner._id?.toString() || owner.toString(),
        username: owner.username,
        avatarKey: owner.avatarKey
    };
}

function serializeReview(review) {
    return {
        _id: review._id.toString(),
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        user: review.user && typeof review.user === 'object'
            ? {
                _id: review.user._id.toString(),
                username: review.user.username,
                avatarKey: review.user.avatarKey
            }
            : review.user?.toString()
    };
}

async function serializeVideo(video, reviewStatsById, userId) {
    const id = video._id.toString();
    const stats = reviewStatsById.get(id);
    const likes = Array.isArray(video.likes) ? video.likes : [];
    const userLiked = Boolean(
        userId && likes.some((entry) => {
            const likeUser = entry.user || entry;
            return likeUser.toString() === userId.toString();
        })
    );
    let playbackUrl = null;

    try {
        playbackUrl = await uploadService.getPresignedUrl(video.videoURL);
    } catch (error) {}

    const computedAvgRating = typeof video.avgRating === 'number' && !Number.isNaN(video.avgRating)
        ? Number(video.avgRating.toFixed(1))
        : stats ? Number(stats.avgRating.toFixed(1)) : 0;
    const computedReviewCount = Number.isInteger(video.reviewCount)
        ? video.reviewCount
        : stats ? stats.reviewCount : 0;

    return {
        _id: id,
        title: video.title,
        description: video.description || '',
        duration: video.duration,
        viewsCount: video.viewsCount || 0,
        likesCount: video.likesCount || 0,
        status: video.status,
        createdAt: video.createdAt,
        avgRating: computedAvgRating,
        reviewCount: computedReviewCount,
        userLiked,
        playbackUrl,
        owner: normalizeOwner(video)
    };
}

exports.createVideo = async (data, ownerId) => {
    const validatedData = videoSchema.parse(data);
    const video = await Video.create({ ...validatedData, owner: ownerId });
    await invalidateTrendingCache();
    return video;
};

exports.getAllVideos = async (query, userId) => {
    const limit = Math.max(parseInt(query.limit, 10) || 10, 1);
    const skip = Math.max(parseInt(query.skip, 10) || 0, 0);
    const feed = query.feed || 'trending';
    const ownerId = query.owner;

    if (feed === 'trending' && !ownerId && !userId && redis) {
        const cacheKey = `clipsphere:trending:${skip}:${limit}`;
        try {
            const cached = await redis.get(cacheKey);
            if (cached) return JSON.parse(cached);
        } catch (e) {}
    }

    let videos = [];

    if (ownerId) {
        videos = await Video.find({ status: 'public', owner: ownerId })
            .populate('owner', 'username avatarKey')
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
    } else if (feed === 'following') {
        if (!userId) return [];

        const follows = await Follower.find({ followerId: userId }).select('followingId').lean();
        const followingIds = follows.map((follow) => follow.followingId);
        if (!followingIds.length) return [];

        videos = await Video.find({ status: 'public', owner: { $in: followingIds } })
            .populate('owner', 'username avatarKey')
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
    } else {
        videos = await Video.aggregate([
            { $match: { status: 'public' } },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'video',
                    as: 'reviews'
                }
            },
            {
                $addFields: {
                    avgRating: { $avg: '$reviews.rating' },
                    reviewCount: { $size: '$reviews' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner',
                    foreignField: '_id',
                    as: 'ownerData'
                }
            },
            { $unwind: '$ownerData' },
            { $sort: { avgRating: -1, likesCount: -1, viewsCount: -1, createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    title: 1,
                    description: 1,
                    videoURL: 1,
                    duration: 1,
                    viewsCount: 1,
                    likesCount: 1,
                    likes: 1,
                    status: 1,
                    createdAt: 1,
                    avgRating: 1,
                    reviewCount: 1,
                    'ownerData._id': 1,
                    'ownerData.username': 1,
                    'ownerData.avatarKey': 1
                }
            }
        ]);
    }

    const reviewStatsById = await getReviewStats(videos.map((video) => video._id));
    const serialized = await Promise.all(
        videos.map((video) => serializeVideo(video, reviewStatsById, userId))
    );

    if (feed === 'trending' && !ownerId && !userId && redis) {
        const cacheKey = `clipsphere:trending:${skip}:${limit}`;
        try {
            await redis.setex(cacheKey, 60, JSON.stringify(serialized));
        } catch (e) {}
    }

    return serialized;
};

exports.getVideoById = async (id, userId) => {
    const video = await Video.findById(id)
        .populate('owner', 'username avatarKey')
        .lean();

    if (!video) return null;

    const [reviewStatsById, reviews, myReview] = await Promise.all([
        getReviewStats([video._id]),
        Review.find({ video: id })
            .populate('user', 'username avatarKey')
            .sort({ createdAt: -1 })
            .lean(),
        userId ? Review.findOne({ video: id, user: userId }).lean() : Promise.resolve(null)
    ]);

    return {
        ...(await serializeVideo(video, reviewStatsById, userId)),
        reviews: reviews.map(serializeReview),
        myReview: myReview ? serializeReview(myReview) : null
    };
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
            await uploadService.deleteFromMinio(video.videoURL);
        } catch (e) {}
    }

    await Video.findByIdAndDelete(id);
    await Review.deleteMany({ video: id });
    await invalidateTrendingCache();
};

exports.addReview = async (videoId, userId, data) => {
    const validatedData = reviewSchema.parse(data);
    const review = await Review.create({ ...validatedData, video: videoId, user: userId });
    await invalidateTrendingCache();
    return review;
};

exports.updateReview = async (videoId, userId, data) => {
    const validatedData = reviewSchema.parse(data);
    const review = await Review.findOneAndUpdate(
        { video: videoId, user: userId },
        validatedData,
        { returnDocument: 'after', runValidators: true }
    );

    if (!review) {
        const err = new Error('Review not found');
        err.statusCode = 404;
        throw err;
    }

    await invalidateTrendingCache();
    return review;
};

exports.incrementViews = async (videoId) => {
    const video = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { viewsCount: 1 } },
        { new: true }
    ).lean();

    if (!video) {
        const err = new Error('Video not found');
        err.statusCode = 404;
        throw err;
    }

    await invalidateTrendingCache();
    return { viewsCount: video.viewsCount };
};

exports.toggleLike = async (videoId, userId) => {
    const existing = await Video.findById(videoId).lean();
    if (!existing) {
        const err = new Error('Video not found');
        err.statusCode = 404;
        throw err;
    }

    const likes = Array.isArray(existing.likes) ? existing.likes : [];
    const alreadyLiked = likes.some((entry) => {
        const likeUser = entry.user || entry;
        return likeUser.toString() === userId.toString();
    });

    const update = alreadyLiked
        ? {
            $pull: { likes: { user: userId } },
            $inc: { likesCount: -1 }
        }
        : {
            $push: { likes: { user: userId, createdAt: new Date() } },
            $inc: { likesCount: 1 }
        };

    const video = await Video.findByIdAndUpdate(videoId, update, { new: true }).lean();
    await invalidateTrendingCache();

    return {
        likesCount: video.likesCount,
        userLiked: !alreadyLiked
    };
};
