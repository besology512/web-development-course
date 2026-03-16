const express = require('express');
const videoController = require('../controllers/videoController');
const { protect } = require('../middleware/authMiddleware');
const { videoOwnership, videoDeletePermission } = require('../middleware/ownershipMiddleware');

const router = express.Router();

router.get('/', videoController.getAllVideos);

// Protected routes
router.use(protect);

router.post('/', videoController.createVideoMetadata);
router.patch('/:id', videoOwnership, videoController.updateVideo);
router.delete('/:id', videoDeletePermission, videoController.deleteVideo);
router.post('/:id/reviews', videoController.addReview);

module.exports = router;
