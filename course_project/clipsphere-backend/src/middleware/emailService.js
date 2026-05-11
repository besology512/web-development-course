const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async (options) => {
    const mailOptions = {
        from: `ClipSphere <${process.env.SMTP_FROM}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
};

const sendWelcomeEmail = async (user) => {
    const message = `Welcome to ClipSphere, ${user.username}! We're excited to have you on board.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h1 style="color: #f59e0b;">Welcome to ClipSphere!</h1>
            <p>Hi <strong>${user.username}</strong>,</p>
            <p>We're thrilled to have you join our premium video community. Start uploading and sharing your cinematic moments today!</p>
            <div style="margin: 30px 0;">
                <a href="${process.env.CLIENT_URL}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Explore Dashboard</a>
            </div>
            <p style="color: #64748b; font-size: 0.8em;">If you didn't create this account, please ignore this email.</p>
        </div>
    `;

    return sendEmail({
        email: user.email,
        subject: 'Welcome to ClipSphere! 🎥',
        message,
        html
    });
};

module.exports = {
    sendEmail,
    sendWelcomeEmail
};
