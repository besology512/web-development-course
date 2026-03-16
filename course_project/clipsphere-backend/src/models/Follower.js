const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema({
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Follower ID is required']
    },
    followingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Following ID is required']
    }
}, {
    timestamps: true
});

// Compound unique index to prevent duplicate follows
followerSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Pre-save hook to prevent following oneself
followerSchema.pre('save', function(next) {
    if (this.followerId.toString() === this.followingId.toString()) {
        const err = new Error('A user cannot follow themselves');
        err.statusCode = 400;
        return next(err);
    }
    next();
});

const Follower = mongoose.model('Follower', followerSchema);
module.exports = Follower;
