const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    bio: {
        type: String,
        maxlength: 200
    },
    avatarKey: {
        type: String,
        default: 'default-avatar.png'
    },
    active: {
        type: Boolean,
        default: true
    },
    accountStatus: {
        type: String,
        enum: ['active', 'suspended', 'banned'],
        default: 'active'
    },
    notifications: {
        inApp: {
            followers: { type: Boolean, default: true },
            comments: { type: Boolean, default: true },
            likes: { type: Boolean, default: true },
            tips: { type: Boolean, default: true }
        },
        email: {
            followers: { type: Boolean, default: true },
            comments: { type: Boolean, default: true },
            likes: { type: Boolean, default: true },
            tips: { type: Boolean, default: true }
        }
    },
    // Monetization fields
    wallet: {
        balance: {
            type: Number,
            default: 0,
            min: 0
        },
        pendingBalance: {
            type: Number,
            default: 0,
            min: 0
        },
        totalEarnings: {
            type: Number,
            default: 0,
            min: 0
        },
        currency: {
            type: String,
            default: 'USD'
        },
        stripeAccountId: {
            type: String,
            default: null
        },
        lastPayout: {
            type: Date,
            default: null
        }
    }
}, {
    timestamps: true,
    minimize: false
});

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Add transaction to wallet
userSchema.methods.addEarnings = async function(amount) {
    this.wallet.balance += amount;
    this.wallet.totalEarnings += amount;
    await this.save();
    return this.wallet;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
