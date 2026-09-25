const { verifyAccessToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { prisma } = require('../config/dbHandler');

// attaches authenticated user to req.user for downstream handlers
const authenticate = asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        throw ApiError.unauthorized('Authentication token missing');
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) throw ApiError.unauthorized('Authentication token missing');
    let payload;
    try {
        payload = verifyAccessToken(token);
    }
    catch (err) {
        throw ApiError.unauthorized(
            err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token'
        );
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
        throw ApiError.unauthorized('User no longer exists or is deactivated');
    }

    const safeUser = { ...user };
    delete safeUser.passwordHash;
    req.user = safeUser;
    next();
});

// optional auth for endpoints that list details that behave slightly different for loggedin vs anonymous users
const attachUserIfPresent = asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return next();

    try {
        const payload = verifyAccessToken(header.split(' ')[1]);
        const user = await prisma.user.findUnique({ where: { id: payload.sub } });
        if (user && user.isActive) {
            const safeUser = { ...user };
            delete safeUser.passwordHash;
            req.user = safeUser;
        }
    } catch (err) {
        // Silently ignore so this middleware never blocks the request.
    }
    next();
});

module.exports = { authenticate, attachUserIfPresent };