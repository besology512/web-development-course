const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadVideo, getPresignedUrl } = require('../controllers/uploadController');

router.post('/upload', protect, upload.single('video'), uploadVideo);
router.get('/:id/url', getPresignedUrl);

module.exports = router;
