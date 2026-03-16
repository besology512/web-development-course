const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: {
        type: String,
        required: [true, 'Please provide a comment'],
        trim: true,
        maxlength: 500
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Review must have an owner']
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: [true, 'Review must belong to a video']
    }
}, {
    timestamps: true
});

// Compound index to prevent multiple reviews from same user on same video
reviewSchema.index({ user: 1, video: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
