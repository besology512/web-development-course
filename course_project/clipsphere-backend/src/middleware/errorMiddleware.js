const errorMiddleware = (err, req, res, next) => {
    console.error('ERROR 💥:', err);

    let error = { ...err };
    error.message = err.message;

    // Handle Mongoose duplicate key error
    if (err.code === 11000) {
        error.statusCode = 400;
        error.message = 'Duplicate field value entered';
    }

    const statusCode = error.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
    
    res.status(statusCode).json({
        status: 'error',
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorMiddleware;
