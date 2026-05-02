const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    // Transaction details
    transactionId: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['tip', 'withdrawal', 'refund', 'bonus'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    
    // Parties involved
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Related video (for tips)
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        default: null
    },
    
    // Stripe integration
    stripePaymentIntentId: {
        type: String,
        default: null
    },
    stripeCheckoutSessionId: {
        type: String,
        default: null
    },
    
    // Metadata
    description: {
        type: String,
        default: null
    },
    fee: {
        type: Number,
        default: 0,
        min: 0
    },
    netAmount: {
        type: Number,
        required: true
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        index: { expires: 2592000 } // Auto-delete old records after 30 days (optional)
    }
}, {
    timestamps: true
});

// Index for efficient queries
transactionSchema.index({ from: 1, createdAt: -1 });
transactionSchema.index({ to: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ stripePaymentIntentId: 1 });

// Update updatedAt on any change
transactionSchema.pre('save', function() {
    this.updatedAt = new Date();
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
