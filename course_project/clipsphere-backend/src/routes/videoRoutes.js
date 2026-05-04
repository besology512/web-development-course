const express = require('express');
const videoController = require('../controllers/videoController');
const { protect, attachUserIfPresent } = require('../middleware/authMiddleware');
const { videoOwnership, videoDeletePermission } = require('../middleware/ownershipMiddleware');

const router = express.Router();

router.get('/', attachUserIfPresent, videoController.getAllVideos);
router.get('/:id', attachUserIfPresent, videoController.getVideoById);
router.post('/:id/view', videoController.incrementViews);

router.post('/', protect, videoController.createVideoMetadata);
router.patch('/:id', protect, videoOwnership, videoController.updateVideo);
router.delete('/:id', protect, videoDeletePermission, videoController.deleteVideo);
router.post('/:id/reviews', protect, videoController.addReview);
router.patch('/:id/reviews/me', protect, videoController.updateReview);
router.post('/:id/like', protect, videoController.likeVideo);

module.exports = router;
