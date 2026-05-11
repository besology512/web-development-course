const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { promisify } = require('util');

exports.protect = async (req, res, next) => {
    try {
        // 1) Getting token and check of it's there
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ status: 'error', message: 'You are not logged in! Please log in to get access.' });
        }

        // 2) Verification token
        if (!process.env.JWT_SECRET) {
            console.error('ERROR: JWT_SECRET is not defined in environment variables');
            return res.status(500).json({ status: 'error', message: 'Internal server configuration error' });
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET).catch(err => {
            console.error('JWT Verification Error:', err.message);
            throw err;
        });

        // 3) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({ status: 'error', message: 'The user belonging to this token does no longer exist.' });
        }

        // 4) Check if user is active (soft delete)
        if (!currentUser.active) {
            return res.status(401).json({ status: 'error', message: 'This account has been deactivated.' });
        }

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        // Ensure id is available as a string for middleware
        if (!req.user.id) req.user.id = currentUser._id.toString();
        
        next();
    } catch (error) {
        res.status(401).json({ status: 'error', message: 'Invalid token. Please log in again.' });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'user']. role='user'
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ status: 'error', message: 'You do not have permission to perform this action' });
        }
        next();
    };
};
