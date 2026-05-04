const tipService = require('../services/tipService');

exports.createCheckout = async (req, res, next) => {
    try {
        const { toUserId, videoId, amountCents } = req.body;
        if (!toUserId || !videoId) {
            return res.status(400).json({ status: 'error', message: 'toUserId and videoId are required' });
        }
        const session = await tipService.createCheckoutSession(req.user.id, toUserId, videoId, amountCents || 500);
        res.status(200).json({ status: 'success', data: { url: session.url } });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: 'error', message: err.message });
        }
        next(err);
    }
};

exports.handleWebhook = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const result = await tipService.handleWebhook(req.body, sig);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.getBalance = async (req, res, next) => {
    try {
        const balance = await tipService.getBalance(req.user._id);
        res.status(200).json({ status: 'success', data: { balance } });
    } catch (err) {
        next(err);
    }
};

exports.confirmCheckout = async (req, res, next) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ status: 'error', message: 'sessionId is required' });
        }

        const result = await tipService.confirmCheckoutSession(sessionId);
        res.status(200).json({ status: 'success', data: result });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: 'error', message: err.message });
        }
        next(err);
    }
};
