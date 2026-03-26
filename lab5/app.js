const express = require('express');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const swaggerDocument = yaml.load('./swagger.yaml');

const userRouter = require('./routes/userRoutes');
const videoRouter = require('./routes/videoRoutes');

const app = express();

const path = require('path');

// MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES
app.use('/api/users', userRouter);
app.use('/api/videos', videoRouter);

// SWAGGER UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;

