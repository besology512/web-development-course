const authService = require('../services/authService');
const { z } = require('zod');

exports.register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);

        res.status(201).json({
            status: 'success',
            token: result.token,
            data: {
                user: result.user
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

exports.login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);

        res.status(200).json({
            status: 'success',
            token: result.token,
            data: {
                user: result.user
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
