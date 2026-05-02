const mongoose = require('mongoose');

const tipSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: [true, 'Tip must have an amount'],
        min: [0.01, 'Tip amount must be at least 0.01']
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Tip must have a sender']
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Tip must have a receiver']
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: [true, 'Tip must be associated with a video']
    }
}, {
    timestamps: true
});

const Tip = mongoose.model('Tip', tipSchema);
module.exports = Tip;
