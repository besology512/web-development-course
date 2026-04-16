const app = require('./src/app');
const connectDB = require('./src/config/db');
const ensureAdminUser = require('./src/config/seedAdmin');

const PORT = process.env.PORT || 5000;

async function bootstrap() {
    await connectDB();
    await ensureAdminUser();

    const server = app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    process.on('unhandledRejection', (err) => {
        console.log(`Error: ${err.message}`);
        server.close(() => process.exit(1));
    });
}

bootstrap().catch((error) => {
    console.error(`Startup failed: ${error.message}`);
    process.exit(1);
});
