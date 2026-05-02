const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../models/Transaction');
const Video = require('../models/Video');
const User = require('../models/User');
const { z } = require('zod');
const { emitTipNotification } = require('../services/socketService');

// Zod schema for tip checkout request
const tipCheckoutSchema = z.object({
    amount: z.number().min(1).max(10000),
    videoId: z.string().min(1),
    creatorId: z.string().min(1),
    message: z.string().max(500).optional().nullable()
});

/**
 * Create Stripe checkout session for tipping
 */
exports.createTipCheckout = async (req, res, next) => {
    try {
        const validatedData = tipCheckoutSchema.parse(req.body);
        const { amount, videoId, creatorId, message } = validatedData;
        
        // Verify video exists
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ status: 'error', message: 'Video not found' });
        }
        
        // Verify creator exists
        const creator = await User.findById(creatorId);
        if (!creator) {
            return res.status(404).json({ status: 'error', message: 'Creator not found' });
        }
        
        // Prevent self-tipping
        if (creatorId === req.user.id) {
            return res.status(400).json({ status: 'error', message: 'Cannot tip your own video' });
        }
        
        // Calculate Stripe platform fee (e.g., 5%)
        const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT) || 5;
        const platformFee = Math.round((amount * platformFeePercent) / 100);
        const creatorAmount = amount - platformFee;
        
        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/videos/${videoId}`,
            customer_email: req.user.email,
            client_reference_id: req.user.id,
            metadata: {
                videoId,
                creatorId,
                tipperUserId: req.user.id,
                message: message || 'No message',
                platformFee: platformFee.toString()
            },
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: amount * 100, // Stripe uses cents
                        product_data: {
                            name: `Tip for "${video.title}"`,
                            description: `Support ${creator.username}'s content`,
                            images: [process.env.APP_LOGO_URL || '']
                        }
                    },
                    quantity: 1
                }
            ]
        });
        
        // Store pending transaction
        const transaction = await Transaction.create({
            transactionId: `tip-${session.id}`,
            type: 'tip',
            status: 'pending',
            amount,
            currency: 'USD',
            from: req.user.id,
            to: creatorId,
            video: videoId,
            stripeCheckoutSessionId: session.id,
            fee: platformFee,
            netAmount: creatorAmount,
            description: message || 'Video tip'
        });
        
        res.status(200).json({
            status: 'success',
            data: {
                checkoutSessionId: session.id,
                checkoutUrl: session.url,
                transactionId: transaction._id
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ status: 'error', message: error.errors });
        }
        next(error);
    }
};

/**
 * Handle Stripe webhook for successful checkout
 */
exports.handleStripeWebhook = async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    
    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        
        // Handle checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            
            // Update transaction to completed
            const transaction = await Transaction.findOneAndUpdate(
                { stripeCheckoutSessionId: session.id },
                {
                    status: 'completed',
                    completedAt: new Date(),
                    stripePaymentIntentId: session.payment_intent
                },
                { new: true }
            );
            
            if (!transaction) {
                console.warn(`Transaction not found for session: ${session.id}`);
                return res.status(200).json({ received: true });
            }
            
            // Update creator's wallet
            const creator = await User.findById(transaction.to);
            if (creator) {
                creator.wallet.balance += transaction.netAmount;
                creator.wallet.totalEarnings += transaction.netAmount;
                await creator.save();
            }
            
            // Fetch full transaction details for Socket.io notification
            const populatedTransaction = await Transaction.findById(transaction._id)
                .populate('from', 'username')
                .populate('to', 'username')
                .populate('video', 'title');
            
            // Emit real-time tip notification
            const io = req.app.get('io');
            if (io && creator) {
                emitTipNotification(io, transaction.to.toString(), {
                    tiperUsername: populatedTransaction.from.username,
                    tipAmount: transaction.amount,
                    videoTitle: populatedTransaction.video.title,
                    videoId: transaction.video.toString()
                });
            }
            
            console.log(`✅ Tip processed: ${transaction.amount} from ${session.client_reference_id} to ${transaction.to}`);
        }
        
        // Handle payment_intent.payment_failed event
        if (event.type === 'charge.failed') {
            const charge = event.data.object;
            
            // Update transaction to failed
            await Transaction.updateMany(
                { stripePaymentIntentId: charge.payment_intent },
                { status: 'failed' }
            );
            
            console.log(`❌ Payment failed: ${charge.payment_intent}`);
        }
        
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook Error:', error.message);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
};

/**
 * Get creator's wallet balance and earnings
 */
exports.getCreatorBalance = async (req, res, next) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId).select('wallet username email');
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                userId: user._id,
                username: user.username,
                wallet: user.wallet
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get transaction history for a user
 */
exports.getTransactionHistory = async (req, res, next) => {
    try {
        const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
        const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);
        const type = req.query.type || 'all'; // 'tip', 'withdrawal', 'all'
        
        const query = {
            $or: [
                { from: req.user.id },
                { to: req.user.id }
            ]
        };
        
        if (type !== 'all') {
            query.type = type;
        }
        
        const transactions = await Transaction.find(query)
            .populate('from', 'username')
            .populate('to', 'username')
            .populate('video', 'title')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await Transaction.countDocuments(query);
        
        res.status(200).json({
            status: 'success',
            data: {
                transactions,
                total,
                skip,
                limit
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify payment and get transaction details
 */
exports.verifyPayment = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        
        // Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        // Find corresponding transaction
        const transaction = await Transaction.findOne({
            stripeCheckoutSessionId: sessionId
        }).populate('from', 'username').populate('to', 'username').populate('video', 'title');
        
        if (!transaction) {
            return res.status(404).json({ status: 'error', message: 'Transaction not found' });
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                transactionId: transaction._id,
                sessionId: sessionId,
                amount: transaction.amount,
                status: transaction.status,
                from: transaction.from.username,
                to: transaction.to.username,
                video: transaction.video.title,
                stripeStatus: session.payment_status
            }
        });
    } catch (error) {
        next(error);
    }
};
