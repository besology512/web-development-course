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
// Mongoose 9+: pre-save hooks no longer receive next(), use throw instead
followerSchema.pre('save', function() {
    if (this.followerId.toString() === this.followingId.toString()) {
        const err = new Error('A user cannot follow themselves');
        err.statusCode = 400;
        throw err;
    }
});

const Follower = mongoose.model('Follower', followerSchema);
module.exports = Follower;
