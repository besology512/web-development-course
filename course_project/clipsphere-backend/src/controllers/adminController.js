const User = require('../models/User');
const Video = require('../models/Video');
const Review = require('../models/Review');
const mongoose = require('mongoose');

exports.getStats = async (req, res, next) => {
    try {
        const stats = await Promise.all([
            User.countDocuments(),
            Video.countDocuments(),
            // Most active users of the week (based on video uploads)
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

        res.status(200).json({
            status: 'success',
            data: {
                totalUsers: stats[0],
                totalVideos: stats[1],
                totalTips: 0, // Placeholder for Phase 3
                mostActiveUsers: stats[2]
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateUserStatus = async (req, res, next) => {
    try {
        const { status, active } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { 
            accountStatus: status, 
            active: active !== undefined ? active : true 
        }, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getModerationQueue = async (req, res, next) => {
    try {
        // Find videos flagged or with low average rating
        const videos = await Video.find({ status: 'flagged' }).populate('owner', 'username');
        
        // This is a simplified moderation queue
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

exports.getAdminHealth = async (req, res, next) => {
    try {
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

        res.status(200).json({
            status: 'success',
            data: {
                uptime: `${Math.floor(uptime)} seconds`,
                memory: {
                    rss: `${Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100} MB`,
                    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100} MB`,
                    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100} MB`
                },
                dbConnection: dbStatus
            }
        });
    } catch (error) {
        next(error);
    }
};
