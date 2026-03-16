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

exports.getMe = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: req.user
        }
    });
};

exports.updateMe = async (req, res, next) => {
    try {
        const validatedData = updateMeSchema.parse(req.body);

        // Filter out fields that are not allowed to be updated here (like password, role)
        const updatedUser = await User.findByIdAndUpdate(req.user.id, validatedData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ status: 'error', message: error.errors });
        } else {
            next(error);
        }
    }
};

exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.active) {
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

exports.followUser = async (req, res, next) => {
    try {
        const followingId = req.params.id;
        const followerId = req.user.id;

        const follow = await Follower.create({
            followerId,
            followingId
        });

        res.status(201).json({
            status: 'success',
            data: {
                follow
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ status: 'error', message: 'You are already following this user' });
        }
        next(error);
    }
};

exports.unfollowUser = async (req, res, next) => {
    try {
        const followingId = req.params.id;
        const followerId = req.user.id;

        await Follower.findOneAndDelete({
            followerId,
            followingId
        });

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

exports.getFollowers = async (req, res, next) => {
    try {
        const followers = await Follower.find({ followingId: req.params.id }).populate('followerId', 'username avatarKey');
        res.status(200).json({
            status: 'success',
            results: followers.length,
            data: {
                followers
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getFollowing = async (req, res, next) => {
    try {
        const following = await Follower.find({ followerId: req.params.id }).populate('followingId', 'username avatarKey');
        res.status(200).json({
            status: 'success',
            results: following.length,
            data: {
                following
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.updatePreferences = async (req, res, next) => {
    try {
        const validatedData = updatePreferencesSchema.parse(req.body);

        // Nested update for notifications
        const currentNotifications = req.user.notifications;
        const newNotifications = {
            inApp: { ...currentNotifications.inApp, ...validatedData.inApp },
            email: { ...currentNotifications.email, ...validatedData.email }
        };

        const updatedUser = await User.findByIdAndUpdate(req.user.id, {
            notifications: newNotifications
        }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ status: 'error', message: error.errors });
        } else {
            next(error);
        }
    }
};
