const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const env = require('./src/config/env');
const routes = require('./src/routes');
const logger = require('./src/utils/logger');
const { connectDB, disconnectDB } = require('./src/config/dbHandler');
const { apiLimiter } = require('./src/middleware/rateLimit.middleware');
const { notFoundHandler, errorHandler } = require('./src/middleware/error.middleware');

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
    origin: [
        'http://localhost:3000',
        env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
}));
app.use(compression());

app.use('/api/v1/payments/webhook/paystack', express.raw({ type: '*/*' }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(hpp());
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.get('/api/check', (req, res) => res.json({
    status: 'ok',
    uptime: process.uptime()
}));
app.use('/api/v1', apiLimiter, routes);
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = env.PORT;
let server;

async function startServer() {
    await connectDB();
    server = app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

startServer().catch((err) => {
    console.error('Server startup failed:', err);
    process.exit(1);
});

// Handle unhandled promise rejections (e.g, distance connection errors)
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    const closeServer = server ? (callback) => server.close(callback) : (callback) => callback();
    closeServer(async () => {
        await disconnectDB();
        process.exit(1);
    });
});

// Handle uncaught exceptions (e.g, syntax errors)
process.on('uncaughtException', async (err) => {
    console.error('Uncaught Exception:', err);
    await disconnectDB();
    process.exit(1);
});

// Graceful shutdown on SIGTERM or SIGINT (e.g, when the process is killed or interrupted)  
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Shutting down gracefully...');
    const closeServer = server ? (callback) => server.close(callback) : (callback) => callback();
    closeServer(async () => {
        await disconnectDB();
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('Received SIGINT. Shutting down gracefully...');
    const closeServer = server ? (callback) => server.close(callback) : (callback) => callback();
    closeServer(async () => {
        await disconnectDB();
        process.exit(0);
    });
});