const Video = require('../models/Video');
const Review = require('../models/Review');
const { z } = require('zod');
const Minio = require('minio');
const redis = require('redis');

let redisClient;
try {
    redisClient = redis.createClient({
        url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
    });
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    redisClient.connect().catch(() => {});
} catch(e) {}

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

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

exports.uploadToMinio = async (fileBuffer, filename, mimetype) => {
    const bucket = process.env.MINIO_BUCKET || 'clipsphere-videos';
    const filePath = `videos/${Date.now()}_${filename}`;
    
    await minioClient.putObject(bucket, filePath, fileBuffer, {
        'Content-Type': mimetype
    });
    
    return filePath;
};

exports.getPresignedUrl = async (objectPath) => {
    const bucket = process.env.MINIO_BUCKET || 'clipsphere-videos';
    // Expire in 24 hours
    return await minioClient.presignedGetObject(bucket, objectPath, 24 * 60 * 60);
};

exports.getAllVideos = async (query = {}, userId = null) => {
    let videos = [];
    
    if (query.feed === 'trending' && redisClient && redisClient.isOpen) {
        const cached = await redisClient.get('trending_videos');
        if (cached) {
            return JSON.parse(cached);
        }
    }

    if (query.feed === 'following' && userId) {
        // Mock following logic, fetch recent
        videos = await Video.find({ status: 'public' }).populate('owner', 'username avatarKey').sort('-createdAt');
    } else if (query.feed === 'trending') {
        // Trending based on views
        videos = await Video.find({ status: 'public' }).populate('owner', 'username avatarKey').sort('-views -createdAt').limit(20);
    } else {
        videos = await Video.find({ status: 'public' }).populate('owner', 'username avatarKey').sort('-createdAt');
    }
    
    // Supplement with presigned URLs
    const videosWithUrls = await Promise.all(videos.map(async (v) => {
        const videoObj = v.toObject ? v.toObject() : v;
        if (videoObj.videoURL && !videoObj.videoURL.startsWith('http')) {
            videoObj.playURL = await exports.getPresignedUrl(videoObj.videoURL);
        } else {
            videoObj.playURL = videoObj.videoURL;
        }
        return videoObj;
    }));

    if (query.feed === 'trending' && redisClient && redisClient.isOpen) {
        await redisClient.setEx('trending_videos', 3600, JSON.stringify(videosWithUrls));
    }
    
    return videosWithUrls;
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

exports.getVideoById = async (id, userId = null) => {
    const video = await Video.findById(id).populate('owner', 'username avatarKey bio');
    if (!video) return null;
    
    const videoObj = video.toObject();
    if (videoObj.videoURL && !videoObj.videoURL.startsWith('http')) {
        videoObj.playURL = await exports.getPresignedUrl(videoObj.videoURL);
    } else {
        videoObj.playURL = videoObj.videoURL;
    }
    
    if (userId) {
        videoObj.userLiked = video.likes.some(l => l.user.toString() === userId.toString());
    }
    
    return videoObj;
};

exports.updateReview = async (reviewId, userId, data) => {
    const validatedData = reviewSchema.parse(data);
    const review = await Review.findOneAndUpdate(
        { _id: reviewId, user: userId },
        validatedData,
        { new: true, runValidators: true }
    );
    if (!review) {
        const err = new Error('Review not found or unauthorized');
        err.statusCode = 404;
        throw err;
    }
    return review;
};

exports.incrementViews = async (id) => {
    const video = await Video.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } }, { new: true });
    if (!video) {
        const err = new Error('Video not found');
        err.statusCode = 404;
        throw err;
    }
    return video;
};

exports.toggleLike = async (id, userId) => {
    const video = await Video.findById(id);
    if (!video) {
        const err = new Error('Video not found');
        err.statusCode = 404;
        throw err;
    }
    
    const index = video.likes.findIndex(l => l.user.toString() === userId.toString());
    let userLiked = false;
    
    if (index === -1) {
        video.likes.push({ user: userId });
        video.likesCount = (video.likesCount || 0) + 1;
        userLiked = true;
    } else {
        video.likes.splice(index, 1);
        video.likesCount = Math.max(0, (video.likesCount || 0) - 1);
        userLiked = false;
    }
    
    await video.save();
    return { likesCount: video.likesCount, userLiked };
};
