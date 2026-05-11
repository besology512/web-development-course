const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/protect');
const { restrictTo } = require('../middleware/restrictTo');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.get('/me', protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
});

router.delete('/:id', protect, restrictTo('admin'), (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = router;
