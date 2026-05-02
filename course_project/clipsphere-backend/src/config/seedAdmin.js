const User = require('../models/User');

async function ensureAdminUser() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const username = process.env.ADMIN_USERNAME || 'clipsphereadmin';

    if (!email || !password) return null;

    let adminUser = await User.findOne({ email }).select('+password');

    if (!adminUser) {
        adminUser = await User.create({
            username,
            email,
            password,
            role: 'admin',
            active: true,
            accountStatus: 'active'
        });
        return adminUser;
    }

    let requiresSave = false;

    if (adminUser.username !== username) {
        adminUser.username = username;
        requiresSave = true;
    }

    if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        requiresSave = true;
    }

    if (!adminUser.active) {
        adminUser.active = true;
        requiresSave = true;
    }

    if (adminUser.accountStatus !== 'active') {
        adminUser.accountStatus = 'active';
        requiresSave = true;
    }

    const passwordMatches = await adminUser.comparePassword(password, adminUser.password);
    if (!passwordMatches) {
        adminUser.password = password;
        requiresSave = true;
    }

    if (requiresSave) {
        await adminUser.save();
    }

    return adminUser;
}

module.exports = ensureAdminUser;
