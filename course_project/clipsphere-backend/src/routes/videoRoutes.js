const express = require('express');
const videoController = require('../controllers/videoController');
const { protect, attachUserIfPresent } = require('../middleware/authMiddleware');
const { videoOwnership, videoDeletePermission } = require('../middleware/ownershipMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: Video discovery, review, and engagement endpoints
 */

/**
 * @swagger
 * /api/v1/videos:
 *   get:
 *     summary: Get public videos for the trending or following feeds
 *     tags: [Videos]
 *     parameters:
 *       - in: query
 *         name: feed
 *         schema:
 *           type: string
 *           enum: [trending, following]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *       - in: query
 *         name: owner
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video list returned
 */
router.get('/', attachUserIfPresent, videoController.getAllVideos);

/**
 * @swagger
 * /api/v1/videos/{id}:
 *   get:
 *     summary: Get a single public video with reviews
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video returned
 *       404:
 *         description: Video not found
 */
router.get('/:id', attachUserIfPresent, videoController.getVideoById);

/**
 * @swagger
 * /api/v1/videos/{id}/view:
 *   post:
 *     summary: Increment video view count
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: View count updated
 */
router.post('/:id/view', videoController.incrementViews);

router.use(protect);

/**
 * @swagger
 * /api/v1/videos:
 *   post:
 *     summary: Create video metadata
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Video created
 */
router.post('/', videoController.createVideoMetadata);

/**
 * @swagger
 * /api/v1/videos/{id}:
 *   patch:
 *     summary: Update a video owned by the authenticated user
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video updated
 */
router.patch('/:id', videoOwnership, videoController.updateVideo);

/**
 * @swagger
 * /api/v1/videos/{id}:
 *   delete:
 *     summary: Delete a video owned by the user or by an admin
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Video deleted
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
 *     responses:
 *       201:
 *         description: Review created
 */
router.post('/:id/reviews', videoController.addReview);

/**
 * @swagger
 * /api/v1/videos/{id}/reviews/me:
 *   patch:
 *     summary: Update the authenticated user's review for a video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review updated
 */
router.patch('/:id/reviews/me', videoController.updateReview);

/**
 * @swagger
 * /api/v1/videos/{id}/like:
 *   post:
 *     summary: Toggle like on a video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like state updated
 */
router.post('/:id/like', videoController.likeVideo);

module.exports = router;
