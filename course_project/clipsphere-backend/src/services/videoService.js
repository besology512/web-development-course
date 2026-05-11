const Video = require('../models/Video');
const Review = require('../models/Review');
const { z } = require('zod');
const Minio = require('minio');

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

exports.getAllVideos = async () => {
    const videos = await Video.find({ status: 'public' }).populate('owner', 'username avatarKey');
    
    // Supplement with presigned URLs
    const videosWithUrls = await Promise.all(videos.map(async (v) => {
        const videoObj = v.toObject();
        if (v.videoURL && !v.videoURL.startsWith('http')) {
            videoObj.playURL = await exports.getPresignedUrl(v.videoURL);
        } else {
            videoObj.playURL = v.videoURL;
        }
        return videoObj;
    }));
    
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
