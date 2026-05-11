const Video = require('../models/videoModel');
const Comment = require('../models/commentModel');

exports.getAllVideos = async (req, res, next) => {
  try {
    // 1) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering (e.g., gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Video.find(JSON.parse(queryStr));

    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 3) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Execute query
    const videos = await query.populate('user', 'name');

    res.status(200).json({
      status: 'success',
      results: videos.length,
      data: {
        videos,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.createComment = async (req, res, next) => {
  try {
    if (!req.body.video) req.body.video = req.params.videoId;
    if (!req.body.user) req.body.user = req.user.id;

    const newComment = await Comment.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        comment: newComment,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getVideoComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ video: req.params.videoId }).populate(
      'user',
      'name'
    );

    res.status(200).json({
      status: 'success',
      results: comments.length,
      data: {
        comments,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};


exports.createVideo = async (req, res, next) => {
  try {
    // Attach current user ID to the video
    if (!req.body.user) req.body.user = req.user.id;

    const newVideo = await Video.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        video: newVideo,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        status: 'fail',
        message: 'No video found with that ID',
      });
    }

    // Check if user is owner or admin
    if (video.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to delete this video',
      });
    }

    await Video.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
