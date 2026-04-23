const express = require('express');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const swaggerDocument = yaml.load('./swagger.yaml');

const userRouter = require('./routes/userRoutes');
const videoRouter = require('./routes/videoRoutes');
const stripeRouter = require('./routes/stripeRoutes');
const stripeController = require('./controllers/stripeController');

const app = express();

const path = require('path');

// MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ROUTES
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/users', userRouter);
app.use('/api/videos', videoRouter);
app.use('/api/payments', stripeRouter);

// SWAGGER UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;

