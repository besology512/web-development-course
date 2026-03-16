const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All admin routes are protected and restricted to admin
router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', adminController.getStats);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.get('/moderation', adminController.getModerationQueue);
router.get('/health', adminController.getAdminHealth);

module.exports = router;
