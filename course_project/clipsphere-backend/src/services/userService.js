const User = require('../models/User');
const Follower = require('../models/Follower');
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
