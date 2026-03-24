const express = require('express');
const videoController = require('../controllers/videoController');
const { protect } = require('../middleware/authMiddleware');
const { videoOwnership, videoDeletePermission } = require('../middleware/ownershipMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: Video management endpoints
 */

/**
 * @swagger
 * /api/v1/videos:
 *   get:
 *     summary: Get all public videos
 *     tags: [Videos]
 *     responses:
 *       200:
 *         description: List of public videos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     videos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Video'
 */
router.get('/', videoController.getAllVideos);

// Protected routes
router.use(protect);

/**
 * @swagger
 * /api/v1/videos:
 *   post:
 *     summary: Create video metadata
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - duration
 *               - videoURL
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               duration:
 *                 type: number
 *                 maximum: 300
 *               videoURL:
 *                 type: string
 *     responses:
 *       201:
 *         description: Video created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     video:
 *                       $ref: '#/components/schemas/Video'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */
router.post('/', videoController.createVideoMetadata);

/**
 * @swagger
 * /api/v1/videos/{id}:
 *   patch:
 *     summary: Update video metadata (owner only)
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Video updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not the owner
 *       404:
 *         description: Video not found
 */
router.patch('/:id', videoOwnership, videoController.updateVideo);

/**
 * @swagger
 * /api/v1/videos/{id}:
 *   delete:
 *     summary: Delete a video (owner or admin)
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       204:
 *         description: Video deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Video not found
 */
router.delete('/:id', videoDeletePermission, videoController.deleteVideo);

/**
 * @swagger
 * /api/v1/videos/{id}/reviews:
 *   post:
 *     summary: Add a review to a video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Review added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     review:
 *                       $ref: '#/components/schemas/Review'
 *       400:
 *         description: Validation error or already reviewed
 *       401:
 *         description: Not authenticated
 */
router.post('/:id/reviews', videoController.addReview);

/**
 * @swagger
 * components:
 *   schemas:
 *     Video:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         owner:
 *           type: string
 *         videoURL:
 *           type: string
 *         duration:
 *           type: number
 *         viewsCount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [public, private, flagged, reported]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         rating:
 *           type: number
 *         comment:
 *           type: string
 *         user:
 *           type: string
 *         video:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

module.exports = router;
