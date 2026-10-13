const { z } = require('zod');

const ROLES_OPEN_AT_REGISTRATION = [
    'FARMER',
    'BUYER',
    'SUPPLIER',
    'TRANSPORTER',
    'VET',
    'COOPERATIVE',
    'FINANCIER',
]; // ADMIN is intentionally excluded since admins are provisioned, not self-registered.

const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number');

const register = {
    body: z.object({
        email: z.string().email().toLowerCase(),
        phone: z
            .string()
            .regex(/^\+?[0-9]{10,15}$/, 'Enter a valid phone number')
            .optional(),
        password: passwordSchema,
        role: z.enum(ROLES_OPEN_AT_REGISTRATION),
        firstName: z.string().min(1).max(80),
        lastName: z.string().min(1).max(80),
        businessName: z.string().max(120).optional(),
    }),
};

const login = {
    body: z.object({
        email: z.string().email().toLowerCase(),
        password: z.string().min(1, 'Password is required'),
    }),
};

const verifyOtp = {
    body: z.object({
        userId: z.string().uuid(),
        code: z.string().length(6),
        purpose: z.enum(['REGISTRATION', 'LOGIN', 'PASSWORD_RESET', 'PHONE_VERIFICATION']),
    }),
};

const resendOtp = {
    body: z.object({
        userId: z.string().uuid(),
        purpose: z.literal('REGISTRATION'),
    }),
};

const refreshToken = {
    body: z.object({
        refreshToken: z.string().min(10),
    }),
};

const forgotPassword = {
    body: z.object({
        email: z.string().email().toLowerCase(),
    }),
};

const resetPassword = {
    body: z.object({
        email: z.string().email().toLowerCase(),
        code: z.string().length(6),
        newPassword: passwordSchema,
    }),
};

module.exports = { register, login, verifyOtp, resendOtp, refreshToken, forgotPassword, resetPassword };