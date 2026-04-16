const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and profile endpoints
 */

/**
 * @swagger
 * /api/v1/users/{id}/profile:
 *   get:
 *     summary: Get public user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile retrieved
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
 *       404:
 *         description: User not found
 */
router.get('/:id/profile', userController.getUser);

/**
 * @swagger
 * /api/v1/users/{id}/followers:
 *   get:
 *     summary: Get a users followers (public)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of followers
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
 *                     followers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Follower'
 */
router.get('/:id/followers', userController.getFollowers);

/**
 * @swagger
 * /api/v1/users/{id}/following:
 *   get:
 *     summary: Get users that a user is following (public)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of following
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
 *                     following:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Follower'
 */
router.get('/:id/following', userController.getFollowing);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get a user by ID (public)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get('/:id([0-9a-fA-F]{24})', userController.getUser);

// Protected routes
router.use(protect);

/**
 * @swagger
 * /api/v1/users/me/activity:
 *   get:
 *     summary: Get recent activity related to the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recent activity list
 *       401:
 *         description: Not authenticated
 */
router.get('/me/activity', userController.getMyActivity);

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
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
 *       401:
 *         description: Not authenticated
 */
router.get('/me', userController.getMe);

/**
 * @swagger
 * /api/v1/users/updateMe:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               bio:
 *                 type: string
 *                 maxLength: 200
 *               avatarKey:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */
router.patch('/updateMe', userController.updateMe);

/**
 * @swagger
 * /api/v1/users/preferences:
 *   patch:
 *     summary: Update notification preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inApp:
 *                 type: object
 *                 properties:
 *                   followers:
 *                     type: boolean
 *                   comments:
 *                     type: boolean
 *                   likes:
 *                     type: boolean
 *                   tips:
 *                     type: boolean
 *               email:
 *                 type: object
 *                 properties:
 *                   followers:
 *                     type: boolean
 *                   comments:
 *                     type: boolean
 *                   likes:
 *                     type: boolean
 *                   tips:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */
router.patch('/preferences', userController.updatePreferences);

/**
 * @swagger
 * /api/v1/users/{id}/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to follow
 *     responses:
 *       201:
 *         description: Successfully followed user
 *       400:
 *         description: Already following or cannot follow yourself
 *       401:
 *         description: Not authenticated
 */
router.post('/:id/follow', userController.followUser);

/**
 * @swagger
 * /api/v1/users/{id}/unfollow:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to unfollow
 *     responses:
 *       204:
 *         description: Successfully unfollowed user
 *       401:
 *         description: Not authenticated
 */
router.delete('/:id/unfollow', userController.unfollowUser);

/**
 * @swagger
 * components:
 *   schemas:
 *     Follower:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         followerId:
 *           type: string
 *         followingId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

module.exports = router;
