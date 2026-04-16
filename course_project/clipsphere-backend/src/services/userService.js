const mongoose = require('mongoose');
const User = require('../models/User');
const Follower = require('../models/Follower');
const Review = require('../models/Review');
const Tip = require('../models/Tip');
const Video = require('../models/Video');
const { z } = require('zod');

const updateMeSchema = z.object({
    username: z.string().min(3).max(30).optional(),
    bio: z.string().max(200).optional(),
    avatarKey: z.string().optional()
});

const updatePreferencesSchema = z.object({
    inApp: z.object({
        followers: z.boolean().optional(),
        comments: z.boolean().optional(),
        likes: z.boolean().optional(),
        tips: z.boolean().optional()
    }).optional(),
    email: z.object({
        followers: z.boolean().optional(),
        comments: z.boolean().optional(),
        likes: z.boolean().optional(),
        tips: z.boolean().optional()
    }).optional()
});

exports.getUser = async (id) => {
    const user = await User.findById(id);
    if (!user || !user.active) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }
    return user;
};

exports.updateMe = async (userId, data) => {
    const validatedData = updateMeSchema.parse(data);
    const updatedUser = await User.findByIdAndUpdate(userId, validatedData, {
        new: true,
        runValidators: true
    });
    return updatedUser;
};

exports.updatePreferences = async (user, data) => {
    const validatedData = updatePreferencesSchema.parse(data);
    const currentNotifications = user.notifications;
    const newNotifications = {
        inApp: { ...currentNotifications.inApp, ...validatedData.inApp },
        email: { ...currentNotifications.email, ...validatedData.email }
    };

    const updatedUser = await User.findByIdAndUpdate(user.id, {
        notifications: newNotifications
    }, {
        new: true,
        runValidators: true
    });
    return updatedUser;
};

exports.followUser = async (followerId, followingId) => {
    const targetUser = await User.findById(followingId).select('active notifications email username');
    if (!targetUser || !targetUser.active) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    const follow = await Follower.create({ followerId, followingId });

    // Determine notification actions based on follower preferences.
    const notificationPlan = {
        createInApp: Boolean(targetUser.notifications?.inApp?.followers),
        queueEmail: Boolean(targetUser.notifications?.email?.followers)
    };

    return {
        follow,
        notificationPlan,
        targetUserEmail: targetUser.email,
        targetUsername: targetUser.username
    };
};

exports.unfollowUser = async (followerId, followingId) => {
    await Follower.findOneAndDelete({ followerId, followingId });
};

exports.getFollowers = async (userId) => {
    const followers = await Follower.find({ followingId: userId }).populate('followerId', 'username avatarKey');
    return followers;
};

exports.getFollowing = async (userId) => {
    const following = await Follower.find({ followerId: userId }).populate('followingId', 'username avatarKey');
    return following;
};

exports.getMyActivity = async (userId, limit = 10) => {
    const cappedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 20);
    const ownerObjectId = new mongoose.Types.ObjectId(userId);

    const ownedVideos = await Video.find({ owner: userId })
        .select('_id title createdAt')
        .sort({ createdAt: -1 })
        .lean();

    const ownedVideoIds = ownedVideos.map((video) => video._id);

    const [receivedFollowEvents, sentFollowEvents, receivedReviewEvents, sentReviewEvents, likeEvents, sentTipEvents, receivedTipEvents] = await Promise.all([
        Follower.find({ followingId: userId })
            .populate('followerId', 'username avatarKey')
            .sort({ createdAt: -1 })
            .limit(cappedLimit)
            .lean(),
        Follower.find({ followerId: userId })
            .populate('followingId', 'username avatarKey')
            .sort({ createdAt: -1 })
            .limit(cappedLimit)
            .lean(),
        ownedVideoIds.length
            ? Review.find({ video: { $in: ownedVideoIds }, user: { $ne: userId } })
                .populate('user', 'username avatarKey')
                .populate('video', 'title')
                .sort({ createdAt: -1 })
                .limit(cappedLimit)
                .lean()
            : Promise.resolve([]),
        Review.find({ user: userId })
            .populate('video', 'title')
            .sort({ createdAt: -1 })
            .limit(cappedLimit)
            .lean(),
        ownedVideoIds.length
            ? Video.aggregate([
                { $match: { _id: { $in: ownedVideoIds } } },
                { $unwind: '$likes' },
                { $match: { 'likes.user': { $ne: ownerObjectId } } },
                { $sort: { 'likes.createdAt': -1 } },
                { $limit: cappedLimit },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'likes.user',
                        foreignField: '_id',
                        as: 'actor'
                    }
                },
                { $unwind: '$actor' },
                {
                    $project: {
                        _id: 0,
                        type: { $literal: 'like' },
                        createdAt: '$likes.createdAt',
                        actor: {
                            _id: '$actor._id',
                            username: '$actor.username',
                            avatarKey: '$actor.avatarKey'
                        },
                        video: {
                            _id: '$_id',
                            title: '$title'
                        }
                    }
                }
            ])
            : Promise.resolve([]),
        Tip.find({ from: userId })
            .populate('to', 'username avatarKey')
            .populate('video', 'title')
            .sort({ createdAt: -1 })
            .limit(cappedLimit)
            .lean(),
        Tip.find({ to: userId })
            .populate('from', 'username avatarKey')
            .populate('video', 'title')
            .sort({ createdAt: -1 })
            .limit(cappedLimit)
            .lean()
    ]);

    const uploadEvents = ownedVideos.slice(0, cappedLimit).map((video) => ({
        type: 'upload',
        createdAt: video.createdAt,
        message: `You uploaded "${video.title}".`,
        video: {
            _id: video._id.toString(),
            title: video.title
        }
    }));

    const activities = [
        ...receivedFollowEvents.map((entry) => ({
            type: 'follow_received',
            createdAt: entry.createdAt,
            message: `@${entry.followerId.username} followed you.`,
            actor: {
                _id: entry.followerId._id.toString(),
                username: entry.followerId.username,
                avatarKey: entry.followerId.avatarKey
            }
        })),
        ...sentFollowEvents.map((entry) => ({
            type: 'follow_sent',
            createdAt: entry.createdAt,
            message: `You followed @${entry.followingId.username}.`,
            actor: {
                _id: entry.followingId._id.toString(),
                username: entry.followingId.username,
                avatarKey: entry.followingId.avatarKey
            }
        })),
        ...receivedReviewEvents.map((entry) => ({
            type: 'review_received',
            createdAt: entry.createdAt,
            message: `@${entry.user.username} reviewed "${entry.video.title}".`,
            actor: {
                _id: entry.user._id.toString(),
                username: entry.user.username,
                avatarKey: entry.user.avatarKey
            },
            video: {
                _id: entry.video._id.toString(),
                title: entry.video.title
            }
        })),
        ...sentReviewEvents.map((entry) => ({
            type: 'review_sent',
            createdAt: entry.createdAt,
            message: `You reviewed "${entry.video?.title || 'a video'}".`,
            video: entry.video ? {
                _id: entry.video._id.toString(),
                title: entry.video.title
            } : undefined
        })),
        ...likeEvents.map((entry) => ({
            type: 'like_received',
            createdAt: entry.createdAt,
            message: `@${entry.actor.username} liked "${entry.video.title}".`,
            actor: {
                _id: entry.actor._id.toString(),
                username: entry.actor.username,
                avatarKey: entry.actor.avatarKey
            },
            video: {
                _id: entry.video._id.toString(),
                title: entry.video.title
            }
        })),
        ...sentTipEvents.map((entry) => ({
            type: 'tip_sent',
            createdAt: entry.createdAt,
            message: `You tipped $${Number(entry.amount).toFixed(2)} to @${entry.to.username}${entry.video?.title ? ` for "${entry.video.title}"` : ''}.`,
            actor: {
                _id: entry.to._id.toString(),
                username: entry.to.username,
                avatarKey: entry.to.avatarKey
            },
            video: entry.video ? {
                _id: entry.video._id.toString(),
                title: entry.video.title
            } : undefined
        })),
        ...receivedTipEvents.map((entry) => ({
            type: 'tip_received',
            createdAt: entry.createdAt,
            message: `@${entry.from.username} tipped you $${Number(entry.amount).toFixed(2)}${entry.video?.title ? ` for "${entry.video.title}"` : ''}.`,
            actor: {
                _id: entry.from._id.toString(),
                username: entry.from.username,
                avatarKey: entry.from.avatarKey
            },
            video: entry.video ? {
                _id: entry.video._id.toString(),
                title: entry.video.title
            } : undefined
        })),
        ...uploadEvents
    ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, cappedLimit);

    return activities;
};
