const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadVideo, getPresignedUrl } = require('../controllers/uploadController');

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Video upload and temporary streaming URLs
 */

/**
 * @swagger
 * /api/v1/videos/upload:
 *   post:
 *     summary: Upload an MP4 video file to MinIO
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Upload completed and metadata saved
 */
router.post('/upload', protect, upload.single('video'), uploadVideo);

/**
 * @swagger
 * /api/v1/videos/{id}/url:
 *   get:
 *     summary: Get a temporary presigned URL for a video object
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Temporary URL returned
 *       404:
 *         description: Video not found
 */
router.get('/:id/url', getPresignedUrl);

module.exports = router;
