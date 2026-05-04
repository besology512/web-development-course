const User = require('../models/User');
const Follower = require('../models/Follower');
const Video = require('../models/Video');
const Review = require('../models/Review');
const Tip = require('../models/Tip');
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
    const targetUser = await User.findById(followingId).select('active notifications');
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

    return { follow, notificationPlan };
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

exports.getActivity = async (userId) => {
    const ownedVideos = await Video.find({ owner: userId }).select('_id title').lean();
    const ownedVideoIds = ownedVideos.map((video) => video._id);
    const titleById = new Map(ownedVideos.map((video) => [video._id.toString(), video.title]));

    const [newFollowers, receivedReviews, myReviews, sentTips, receivedTips] = await Promise.all([
        Follower.find({ followingId: userId })
            .populate('followerId', 'username')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),
        ownedVideoIds.length
            ? Review.find({ video: { $in: ownedVideoIds }, user: { $ne: userId } })
                .populate('user', 'username')
                .populate('video', 'title')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean()
            : Promise.resolve([]),
        Review.find({ user: userId })
            .populate('video', 'title')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),
        Tip.find({ from: userId })
            .populate('to', 'username')
            .populate('video', 'title')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),
        Tip.find({ to: userId })
            .populate('from', 'username')
            .populate('video', 'title')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
    ]);

    const activity = [
        ...newFollowers.map((follow) => ({
            type: 'follow',
            createdAt: follow.createdAt,
            message: `@${follow.followerId.username} followed you`
        })),
        ...receivedReviews.map((review) => ({
            type: 'review_received',
            createdAt: review.createdAt,
            message: `@${review.user.username} reviewed "${review.video?.title || titleById.get(review.video?.toString()) || 'your video'}"`
        })),
        ...myReviews.map((review) => ({
            type: 'review_sent',
            createdAt: review.createdAt,
            message: `You reviewed "${review.video?.title || 'a video'}"`
        })),
        ...sentTips.map((tip) => ({
            type: 'tip_sent',
            createdAt: tip.createdAt,
            message: `You tipped $${Number(tip.amount).toFixed(2)} to @${tip.to.username}${tip.video?.title ? ` for "${tip.video.title}"` : ''}`
        })),
        ...receivedTips.map((tip) => ({
            type: 'tip_received',
            createdAt: tip.createdAt,
            message: `@${tip.from.username} tipped you $${Number(tip.amount).toFixed(2)}${tip.video?.title ? ` for "${tip.video.title}"` : ''}`
        }))
    ]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 20);

    return activity;
};
