const mongoose = require('mongoose');
const User = require('./src/models/User');
const dotenv = require('dotenv');

dotenv.config();

const createUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete existing demo users if they exist
        await User.deleteMany({ email: { $in: ['admin@clipsphere.com', 'user_a@clipsphere.com', 'user_b@clipsphere.com'] } });

        // Create Admin
        await User.create({
            username: 'admin_demo',
            email: 'admin@clipsphere.com',
            password: 'adminpassword123',
            role: 'admin'
        });
        console.log('Admin created: admin@clipsphere.com / adminpassword123');

        // Create User A
        await User.create({
            username: 'user_a',
            email: 'user_a@clipsphere.com',
            password: 'userpassword123',
            role: 'user'
        });
        console.log('User A created: user_a@clipsphere.com / userpassword123');

        // Create User B (for ownership testing)
        await User.create({
            username: 'user_b',
            email: 'user_b@clipsphere.com',
            password: 'userpassword123',
            role: 'user'
        });
        console.log('User B created: user_b@clipsphere.com / userpassword123');

        process.exit(0);
    } catch (error) {
        console.error('Error creating users:', error);
        process.exit(1);
    }
};

createUsers();
