const Video = require('../models/Video');

// Factory function for ownership check
exports.isOwner = (Model) => {
    return async (req, res, next) => {
        try {
            const resource = await Model.findById(req.params.id);
            
            if (!resource) {
                return res.status(404).json({ status: 'error', message: 'Resource not found' });
            }

            // Check if user is owner
            // In most models it's 'owner' or 'user', or in User model itself it's '_id'
            const ownerId = resource.owner || resource.user || resource._id;

            if (ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ 
                    status: 'error', 
                    message: 'You do not have permission to perform this action' 
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Specifically for videos as per requirements
exports.videoOwnership = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ status: 'error', message: 'Video not found' });
        }

        // Ownership logic comparison
        if (video.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ 
                status: 'error', 
                message: 'Ownership verification failed: You do not own this video.' 
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

// Admin can delete any video, but only owner can edit
exports.videoDeletePermission = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ status: 'error', message: 'Video not found' });
        }

        // Admin bypass for delete
        if (video.owner.toString() === req.user.id || req.user.role === 'admin') {
            return next();
        }

        res.status(403).json({ 
            status: 'error', 
            message: 'You do not have permission to delete this video' 
        });
    } catch (error) {
        next(error);
    }
};
