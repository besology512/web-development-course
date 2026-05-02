const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { z } = require('zod');
let emailQueue;
try { emailQueue = require('../queues/emailQueue'); } catch(e) {}

const registerSchema = z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(8)
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

exports.register = async (data) => {
    const validatedData = registerSchema.parse(data);

    const newUser = await User.create({
        username: validatedData.username,
        email: validatedData.email,
        password: validatedData.password
    });

    const token = signToken(newUser._id);
    newUser.password = undefined;

    if (emailQueue) {
        emailQueue.add('sendWelcome', { to: newUser.email, username: newUser.username }).catch(() => {});
    }

    return { user: newUser, token };
};

exports.login = async (data) => {
    const validatedData = loginSchema.parse(data);
    const { email, password } = validatedData;

    if (!email || !password) {
        const err = new Error('Please provide email and password');
        err.statusCode = 400;
        throw err;
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password, user.password))) {
        const err = new Error('Incorrect email or password');
        err.statusCode = 401;
        throw err;
    }

    const token = signToken(user._id);
    user.password = undefined;

    return { user, token };
};
