const express = require('express');
const stripeController = require('../controllers/stripeController');

const router = express.Router();

router.post('/create-checkout-session', stripeController.createCheckoutSession);

module.exports = router;
