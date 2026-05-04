const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const errorMiddleware = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const videoRoutes = require('./routes/videoRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tipRoutes = require('./routes/tipRoutes');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
app.set('trust proxy', 1);

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Raw body for Stripe webhook (must be before express.json)
app.use('/api/v1/tips/webhook', express.raw({ type: 'application/json' }));

app.use(express.json()); // Body parser
app.use(mongoSanitize()); // Data sanitization against NoSQL query injection

// Rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { status: 'error', message: 'Too many requests, please try again later.' } });
const uploadLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: { status: 'error', message: 'Upload limit reached, please try again later.' } });
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1/videos/upload', uploadLimiter);

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // Logging
}

// Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ClipSphere API',
            version: '1.0.0',
            description: 'API for ClipSphere short-video social platform',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/videos', uploadRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/tips', tipRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Server is running' });
});

// Basic route
app.get('/', (req, res) => {
    res.send('ClipSphere API is running...');
});

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
