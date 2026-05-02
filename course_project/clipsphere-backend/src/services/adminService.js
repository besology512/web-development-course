const User = require('../models/User');
const Video = require('../models/Video');
const Review = require('../models/Review');
const Tip = require('../models/Tip');
const mongoose = require('mongoose');
const { z } = require('zod');

const updateUserStatusSchema = z.object({
    status: z.enum(['active', 'suspended', 'banned']),
    active: z.boolean().optional()
});

exports.getStats = async () => {
    // Aggregate total tips
    const tipAgg = await Tip.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalTips = tipAgg.length > 0 ? tipAgg[0].total : 0;

    const stats = await Promise.all([
        User.countDocuments(),
        Video.countDocuments(),
        Video.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: '$owner',
                    videoCount: { $sum: 1 }
                }
            },
            { $sort: { videoCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },
            {
                $project: {
                    username: '$userDetails.username',
                    videoCount: 1
                }
            }
        ])
    ]);

    return {
        totalUsers: stats[0],
        totalVideos: stats[1],
        totalTips,
        mostActiveUsers: stats[2]
    };
};

exports.updateUserStatus = async (userId, data) => {
    const validatedData = updateUserStatusSchema.parse(data);
    const user = await User.findByIdAndUpdate(userId, {
        accountStatus: validatedData.status,
        active: validatedData.active !== undefined ? validatedData.active : true
    }, {
        new: true,
        runValidators: true
    });

    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }
    return user;
};

exports.getModerationQueue = async () => {
    // Get video IDs with low average rating (<=2)
    const lowRatedVideoIds = await Review.aggregate([
        { $group: { _id: '$video', avgRating: { $avg: '$rating' } } },
        { $match: { avgRating: { $lte: 2 } } }
    ]);
    const lowRatedIds = lowRatedVideoIds.map(v => v._id);

    // Find videos that are flagged, reported, or have low average rating
    const videos = await Video.find({
        $or: [
            { status: 'flagged' },
            { status: 'reported' },
            { _id: { $in: lowRatedIds } }
        ]
    }).populate('owner', 'username');

    return videos;
};

exports.getAdminHealth = async () => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    return {
        uptime: `${Math.floor(uptime)} seconds`,
        memory: {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100} MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100} MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100} MB`
        },
        dbConnection: dbStatus
    };
};
