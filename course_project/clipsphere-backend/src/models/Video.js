const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        maxlength: 500
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Video must have an owner']
    },
    videoURL: {
        type: String,
        required: [true, 'Video must have a URL or key']
    },
    duration: {
        type: Number,
        required: [true, 'Video must have a duration'],
        max: [300, 'Video duration cannot exceed 300 seconds']
    },
    viewsCount: {
        type: Number,
        default: 0
    },
    likesCount: {
        type: Number,
        default: 0
    },
    likes: [{
        _id: false,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['public', 'private', 'flagged', 'reported'],
        default: 'public'
    }
}, {
    timestamps: true
});

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;
