const { prisma } = require('../config/dbHandler');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { getPagination, buildMeta } = require('../utils/pagination');

const updateMyProfile = asyncHandler(async (req, res) => {
    const profile = await prisma.profile.update({
        where: { userId: req.user.id },
        data: req.body
    });
    sendSuccess(res, { message: 'Profile Updated', data: { profile } });
});

const getPublicProfile = asyncHandler( async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
            id: true,
            role: true,
            verificationStatus: true,
            createdAt: true,
            profile: {
                select: {
                    firstName: true,
                    lastName: true,
                    businessName: true,
                    avatarUrl: true,
                    bio: true,
                    state: true,
                    lga: true
                }
            },
            reviewsReceived: {
                select: {
                    rating: true,
                    comment: true,
                    createdAt: true,
                    reviewer: {
                        select: {
                            profile: {
                                select: {
                                    firstName: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 10
            }
        }
    });
    if (!user) throw ApiError.notFound('User Not Found');

    const ratingAgg = await prisma.review.aggregate({
        where: { revieweeId: req.params.id },
        _avg: { rating: true },
        _count: true
    });

    sendSuccess(res, {
        message: 'Public Profile',
        data: { user, averageRating: ratingAgg._avg.rating || 0, reviewCount: ratingAgg._count }
    });
});

// Admin: list/search users
const listUsers = asyncHandler(async (req, res) => {
    const { role, verificationStatus } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    const where = {
        ...(role && { role }),
        ...(verificationStatus && { verificationStatus })
    };

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                phone: true,
                role: true,
                verificationStatus: true,
                isActive: true,
                createdAt: true,
                profile: { select: { firstName: true, lastName: true, businessName: true } }
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' } 
        }),
        prisma.user.count({ where })
    ]);

    sendSuccess(res, {message: 'Users', data: users, meta: buildMeta({ page, limit, total }) });
});

// Admin: verify/rejecy user's KYC
const setVerificationStatus = asyncHandler(async (req, res) => {
    const { status } = req.body; // VERIFIED || REJECTED
    const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { verificationStatus: status }
    });
    await prisma.notification.create({
        data: {
            userId: user.id,
            type: 'VERIFICATION',
            title: 'Verification Update',
            body: `Your account verification status is now ${status}`
        }
    });
    sendSuccess(res, { message: 'Verfication status updated', data: { user } });
});

// Admin: deactivate/activate an account
const setActiveStatus = asyncHandler(async (req, res) => {
    const { isActive } = req.body;
    const user = await prisma.user.update({
        where: { id: req.param.id },
        data: { isActive }
    });
    sendSuccess(res, { message: `User ${isActive ? 'activated' : 'deactivated'}`, data: { user } });
});

module.exports = { updateMyProfile, getPublicProfile, listUsers, setVerificationStatus, setActiveStatus };