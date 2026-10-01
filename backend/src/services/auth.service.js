const bcrypt = require('bcryptjs');
const { prisma } = require('../config/dbHandler');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { hashToken } = require('../utils/hash');
const otpService = require('./otp.service');

async function registerUser({ email, phone, password, role, firstName, lastName, businessName }) {
    const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] }
    });
    if (existing) throw ApiError.conflict('An account with this email or phone already exists');

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

    const user = await prisma.user.create({
        data: {
            email,
            phone,
            passwordHash,
            role,
            profile: { create: { firstName, lastName, businessName } }
        },
        include: { profile: true }
    });

    const { expiresAt } = await otpService.createAndSendOtp(user.id, 'REGISTRATION');

    const safeUser = { ...user };
    delete safeUser.passwordHash;
    return { user: safeUser, otpExpiresAt: expiresAt };
}

async function verifyRegistrationOtp(userId, code) {
    const result = await otpService.verifyOtp(userId, code, 'REGISTRATION');
    if (!result.valid) throw ApiError.badRequest(result.reason);

    const user = await prisma.user.update({
        where: { id: userId },
        data: { isEmailVerified: true, verificationStatus: 'PENDING' },
        include: { profile: true }
    });

    return issueTokenPair(user);
}

async function loginUser({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
    if (!user) throw ApiError.unauthorized('Invalid email or password');

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) throw ApiError.unauthorized('Invalid email or password');

    if (!user.isActive) throw ApiError.forbidden('This account has been deactivated');
    if (!user.isEmailVerified) throw ApiError.forbidden('Please verify your account before logging in');

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return issueTokenPair(user);
}

async function issueTokenPair(user) {
    const payload = { sub: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: hashToken(refreshToken),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    });

    const safeUser = { ...user };
    delete safeUser.passwordHash;
    return { user: safeUser, accessToken, refreshToken }
}

async function rotateRefreshToken(oldRefreshToken) {
    let payload;
    try {
        payload = verifyRefreshToken(oldRefreshToken);
    }
    catch (err) {
        throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const tokenHash = hashToken(oldRefreshToken);
    const stored = await prisma.refreshToken.findFirst({
        where: { userId: payload.sub, tokenHash, revokedAt: null }
    });
    if (!stored || stored.expiresAt < new Date()) {
        throw ApiError.unauthorized('Refresh token is no longer valid');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { profile: true } });
    if (!user || !user.isActive) throw ApiError.unauthorized('User no longer active');

    // revoke the used token and issue a fresh pair
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    return issueTokenPair(user);
}

async function logout(refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() }
    });
}

async function requestPasswordReset(email) {
    const user = await prisma.user.findUnique({ where: { email } });

    // deliberately set to not reveal whether the email exists or not
    if (!user) return;
    await otpService.createAndSendOtp(user.id, 'PASSWORD_RESET');
}

async function resetPassword({ userId, code, newPassword }) {
    const result = await otpService.verifyOtp(userId, code, 'PASSWORD_RESET');
    if (!result.valid) throw ApiError.badRequest(result.reason);

    const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    // revoke all existing refresh tokens on resetting password
    await prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } })
}

module.exports = {
    registerUser,
    verifyRegistrationOtp,
    loginUser,
    rotateRefreshToken,
    logout,
    requestPasswordReset,
    resetPassword,
}