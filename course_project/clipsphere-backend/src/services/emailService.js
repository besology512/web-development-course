const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT) || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

exports.sendWelcomeEmail = async (to, username) => {
    await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@clipsphere.local',
        to,
        subject: 'Welcome to ClipSphere!',
        html: `<h1>Welcome, ${username}!</h1><p>Your ClipSphere account is ready. Start uploading short videos and connecting with creators today.</p>`
    });
};

exports.sendEngagementEmail = async (to, message) => {
    await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@clipsphere.local',
        to,
        subject: 'New activity on ClipSphere',
        html: `<p>${message}</p><p>Visit <a href="${process.env.CLIENT_URL}">ClipSphere</a> to see what's happening.</p>`
    });
};
