const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createCheckout, handleWebhook, getBalance, confirmCheckout } = require('../controllers/tipController');

router.post('/checkout', protect, createCheckout);
router.post('/webhook', handleWebhook);
router.post('/confirm', protect, confirmCheckout);
router.get('/balance', protect, getBalance);

module.exports = router;
