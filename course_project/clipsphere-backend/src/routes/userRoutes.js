const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes
router.use(protect);

router.get('/me', userController.getMe);
router.patch('/updateMe', userController.updateMe);
router.patch('/preferences', userController.updatePreferences);

// Public routes (ID based)
router.get('/:id', userController.getUser);
router.get('/:id/followers', userController.getFollowers);
router.get('/:id/following', userController.getFollowing);

router.post('/:id/follow', userController.followUser);
router.delete('/:id/unfollow', userController.unfollowUser);

module.exports = router;
