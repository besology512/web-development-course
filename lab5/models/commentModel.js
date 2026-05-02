const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'A comment must have text'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A comment must belong to a user'],
  },
  video: {
    type: mongoose.Schema.ObjectId,
    ref: 'Video',
    required: [true, 'A comment must belong to a video'],
  },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
