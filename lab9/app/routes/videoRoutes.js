const express = require('express');
const videoController = require('../controllers/videoController');
const { protect } = require('../middleware/protect');

const router = express.Router();

router
  .route('/')
  .get(videoController.getAllVideos)
  .post(protect, videoController.createVideo);

router
  .route('/:videoId/comments')
  .get(videoController.getVideoComments)
  .post(protect, videoController.createComment);

router.delete('/:id', protect, videoController.deleteVideo);

module.exports = router;
