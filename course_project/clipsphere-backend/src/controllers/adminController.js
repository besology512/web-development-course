const adminService = require('../services/adminService');
const { z } = require('zod');

exports.getStats = async (req, res, next) => {
    try {
        const stats = await adminService.getStats();

        res.status(200).json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

exports.updateUserStatus = async (req, res, next) => {
    try {
        const user = await adminService.updateUserStatus(req.params.id, req.body);

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ status: 'error', message: error.errors });
        } else if (error.statusCode) {
            res.status(error.statusCode).json({ status: 'error', message: error.message });
        } else {
            next(error);
        }
    }
};

exports.getModerationQueue = async (req, res, next) => {
    try {
        const videos = await adminService.getModerationQueue();

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
        const healthData = await adminService.getAdminHealth();

        res.status(200).json({
            status: 'success',
            data: healthData
        });
    } catch (error) {
        next(error);
    }
};
