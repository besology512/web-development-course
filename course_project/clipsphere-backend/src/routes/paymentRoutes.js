const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiter for checkout endpoints (1 per second per user)
const checkoutLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: { status: 'error', message: 'Too many checkout requests, please try again later.' }
});

/**
 * @route POST /api/v1/payments/checkout
 * @desc Create Stripe checkout session for tipping
 * @access Private
 * @body { amount, videoId, creatorId, message }
 */
router.post('/checkout', protect, checkoutLimiter, paymentController.createTipCheckout);

/**
 * @route POST /api/v1/payments/webhook
 * @desc Handle Stripe webhook events
 * @access Public (Webhook signature verification)
 */
router.post('/webhook', paymentController.handleStripeWebhook);

/**
 * @route GET /api/v1/payments/balance/:userId
 * @desc Get creator's wallet balance
 * @access Private
 */
router.get('/balance/:userId', protect, paymentController.getCreatorBalance);

/**
 * @route GET /api/v1/payments/history
 * @desc Get transaction history
 * @access Private
 */
router.get('/history', protect, paymentController.getTransactionHistory);

/**
 * @route GET /api/v1/payments/verify/:sessionId
 * @desc Verify payment and get transaction details
 * @access Private
 */
router.get('/verify/:sessionId', protect, paymentController.verifyPayment);

module.exports = router;
