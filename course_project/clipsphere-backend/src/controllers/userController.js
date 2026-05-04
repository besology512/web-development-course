const userService = require('../services/userService');
const { z } = require('zod');
let emailQueue;
try { emailQueue = require('../queues/emailQueue'); } catch (e) {}

exports.getMe = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: req.user
        }
    });
};

exports.getMyActivity = async (req, res, next) => {
    try {
        const activity = await userService.getMyActivity(req.user.id, req.query.limit);
        res.status(200).json({
            status: 'success',
            results: activity.length,
            data: {
                activity
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateMe = async (req, res, next) => {
    try {
        const updatedUser = await userService.updateMe(req.user.id, req.body);

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
        const user = await userService.getUser(req.params.id);

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ status: 'error', message: error.message });
        }
        next(error);
    }
};

exports.followUser = async (req, res, next) => {
    try {
        const result = await userService.followUser(req.user.id, req.params.id);

        if (result.notificationPlan?.queueEmail && result.targetUserEmail && emailQueue) {
            emailQueue.add('sendEngagement', {
                to: result.targetUserEmail,
                message: `@${req.user.username} followed you on ClipSphere.`
            }).catch(() => {});
        }

        res.status(201).json({
            status: 'success',
            data: {
                follow: result.follow,
                notificationPlan: result.notificationPlan
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ status: 'error', message: 'You are already following this user' });
        }
        if (error.statusCode) {
            return res.status(error.statusCode).json({ status: 'error', message: error.message });
        }
        next(error);
    }
};

exports.unfollowUser = async (req, res, next) => {
    try {
        await userService.unfollowUser(req.user.id, req.params.id);

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
        const followers = await userService.getFollowers(req.params.id);
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
        const following = await userService.getFollowing(req.params.id);
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
        const updatedUser = await userService.updatePreferences(req.user, req.body);

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

exports.getActivity = async (req, res, next) => {
    try {
        const activity = await userService.getActivity(req.user.id);
        res.status(200).json({
            status: 'success',
            results: activity.length,
            data: { activity }
        });
    } catch (error) {
        next(error);
    }
};
