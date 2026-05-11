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
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing and tipping endpoints
 */
 
/**
 * @swagger
 * /api/v1/payments/checkout:
 *   post:
 *     summary: Create Stripe checkout session for tipping
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - videoId
 *               - creatorId
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.5
 *               videoId:
 *                 type: string
 *               creatorId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Checkout session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 sessionUrl:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */
router.post('/checkout', protect, checkoutLimiter, paymentController.createTipCheckout);

/**
 * @swagger
 * /api/v1/payments/webhook:
 *   post:
 *     summary: Handle Stripe webhook events
 *     tags: [Payments]
 *     description: This endpoint is called by Stripe to notify the server about payment success or failure.
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post('/webhook', paymentController.handleStripeWebhook);

/**
 * @swagger
 * /api/v1/payments/balance/{userId}:
 *   get:
 *     summary: Get creator's wallet balance
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Current balance returned
 *       401:
 *         description: Not authenticated
 */
router.get('/balance/:userId', protect, paymentController.getCreatorBalance);

/**
 * @swagger
 * /api/v1/payments/history:
 *   get:
 *     summary: Get transaction history for the authenticated user
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Not authenticated
 */
router.get('/history', protect, paymentController.getTransactionHistory);

/**
 * @swagger
 * /api/v1/payments/verify/{sessionId}:
 *   get:
 *     summary: Verify payment and get transaction details
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment verified
 *       404:
 *         description: Session not found or payment failed
 */
router.get('/verify/:sessionId', protect, paymentController.verifyPayment);

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         transactionId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [tip, withdrawal, refund, bonus]
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *         amount:
 *           type: number
 *         currency:
 *           type: string
 *         from:
 *           type: string
 *         to:
 *           type: string
 *         video:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

module.exports = router;
