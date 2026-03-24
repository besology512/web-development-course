const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only management endpoints
 */

// All admin routes are protected and restricted to admin
router.use(protect);
router.use(restrictTo('admin'));

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get platform statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform statistics
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
 *                     totalUsers:
 *                       type: integer
 *                     totalVideos:
 *                       type: integer
 *                     totalTips:
 *                       type: number
 *                     mostActiveUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                           videoCount:
 *                             type: integer
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */
router.get('/stats', adminController.getStats);

/**
 * @swagger
 * /api/v1/admin/users/{id}/status:
 *   patch:
 *     summary: Update a users account status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, suspended, banned]
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 *       404:
 *         description: User not found
 */
router.patch('/users/:id/status', adminController.updateUserStatus);

/**
 * @swagger
 * /api/v1/admin/moderation:
 *   get:
 *     summary: Get content moderation queue
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Moderation queue with flagged, reported, and low-rated videos
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
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */
router.get('/moderation', adminController.getModerationQueue);

/**
 * @swagger
 * /api/v1/admin/health:
 *   get:
 *     summary: Get detailed system health information
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health data
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
 *                     uptime:
 *                       type: string
 *                     memory:
 *                       type: object
 *                       properties:
 *                         rss:
 *                           type: string
 *                         heapTotal:
 *                           type: string
 *                         heapUsed:
 *                           type: string
 *                     dbConnection:
 *                       type: string
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */
router.get('/health', adminController.getAdminHealth);

/**
 * @swagger
 * components:
 *   schemas:
 *     Tip:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         amount:
 *           type: number
 *         from:
 *           type: string
 *         to:
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
