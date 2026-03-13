const express = require('express');
const morgan = require('morgan');

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

module.exports = app;

