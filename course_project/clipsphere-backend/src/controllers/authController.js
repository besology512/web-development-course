const authService = require('../services/authService');
const emailService = require('../services/emailService');
const { z } = require('zod');

exports.register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);

        // Send Welcome Email (async, don't block response)
        emailService.sendWelcomeEmail(result.user).catch(err => {
            console.error('Error sending welcome email:', err.message);
        });

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
