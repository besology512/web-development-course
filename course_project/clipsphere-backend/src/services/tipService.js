const stripe = require('../config/stripe');
const Transaction = require('../models/Transaction');
const Tip = require('../models/Tip');
const Video = require('../models/Video');

async function applyPaidSession(session) {
    const metadata = session.metadata || {};
    const amountCents = Number(session.amount_total || 0);
    const amount = amountCents / 100;

    const existing = await Transaction.findOne({ stripeSessionId: session.id }).lean();
    const alreadyCompleted = existing?.status === 'completed';

    await Transaction.findOneAndUpdate(
        { stripeSessionId: session.id },
        {
            from: metadata.fromUserId,
            to: metadata.toUserId,
            video: metadata.videoId || undefined,
            amount: amountCents,
            stripeSessionId: session.id,
            paymentIntentId: session.payment_intent || undefined,
            customerId: session.customer || undefined,
            customerEmail: session.customer_email || undefined,
            currency: session.currency || 'usd',
            paymentStatus: session.payment_status || 'unpaid',
            metadata,
            status: session.payment_status === 'paid' ? 'completed' : 'failed'
        },
        {
            upsert: true,
            returnDocument: 'after',
            setDefaultsOnInsert: true
        }
    );

    if (!alreadyCompleted && session.payment_status === 'paid' && metadata.videoId) {
        await Promise.all([
            Tip.create({
                amount,
                from: metadata.fromUserId,
                to: metadata.toUserId,
                video: metadata.videoId
            }),
            Video.findByIdAndUpdate(metadata.videoId, { $inc: { tippedAmount: amount } })
        ]);

        try {
            const videoService = require('./videoService');
            await videoService.invalidateTrendingCache();
        } catch (error) {}
    }
}

exports.createCheckoutSession = async (fromUserId, toUserId, videoId, amountCents) => {
    const video = await Video.findById(videoId).select('owner title');
    if (!video) {
        const err = new Error('Video not found');
        err.statusCode = 404;
        throw err;
    }

    if (video.owner.toString() !== toUserId.toString()) {
        const err = new Error('Tip target does not match the video owner');
        err.statusCode = 400;
        throw err;
    }

    if (fromUserId.toString() === toUserId.toString()) {
        const err = new Error('You cannot tip yourself');
        err.statusCode = 400;
        throw err;
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'usd',
                product_data: { name: `Tip for ${video.title}` },
                unit_amount: amountCents
            },
            quantity: 1
        }],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/feed?tip=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/feed?tip=cancelled`,
        metadata: {
            fromUserId: fromUserId.toString(),
            toUserId: toUserId.toString(),
            videoId: videoId.toString()
        }
    });

    return session;
};

exports.handleWebhook = async (payload, sig) => {
    const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'checkout.session.completed') {
        await applyPaidSession(event.data.object);
    }

    return { received: true };
};

exports.confirmCheckoutSession = async (sessionId) => {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
        const err = new Error('Checkout session not found');
        err.statusCode = 404;
        throw err;
    }

    if (session.payment_status === 'paid') {
        await applyPaidSession(session);
    }

    return {
        sessionId: session.id,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency
    };
};

exports.getBalance = async (userId) => {
    const result = await Tip.aggregate([
        { $match: { to: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    return result[0] ? result[0].total : 0;
};
