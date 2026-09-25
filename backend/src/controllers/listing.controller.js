const { prisma } = require('../config/dbHandler');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { getPagination, buildMeta } = require('../utils/pagination');

const createListing = asyncHandler(async (req, res) => {
    const { images, farmId, ...rest } = req.body;

    if (farmId) {
        const farm = await prisma.farm.findUnique({ where: { id: farmId } });
        if (!farm || farm.ownerId !== req.user.id) {
            throw ApiError.badRequest('farmId does not belong to you');
        }
    }

    const category = await prisma.category.findUnique({ where: { id: rest.categoryId } });
    if (!category) throw ApiError.badRequest('Invalid categoryId');

    const listing = await prisma.listing.create({
        data: {
            ...rest,
            farmId,
            sellerId: req.user.id,
            ...(images?.length && { images: { create: images.map((url) => ({ url })) } })
        },
        include: { images: true, category: true }
    });

    sendSuccess(res, { statusCode: 201, message: 'Listing created', data: { listing } });
});

const getListing = asyncHandler(async (req, res) => {
    const listing = await prisma.listing.findUnique({
        where: { id: req.params.id },
        include: {
            images: true,
            category: true,
            farm: { select: { id: true, name: true, state: true, lga: true } },
            seller: {
                select: {
                    id: true,
                    verificationStatus: true,
                    profile: { select: { firstName: true, lastName: true, businessName: true, avatarUrl: true } }
                }
            }
        }
    });

    if (!listing) throw ApiError.notFound('Listing not found');
    sendSuccess(res, { message: 'Listing', data: { listing } });
});

const myListings = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const [listings, total] = await Promise.all([
        prisma.listing.findMany({
            where: { sellerId: req.user.id },
            include: { images: true, category: true },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.listing.count({ where: { sellerId: req.user.id } })
    ]);
    sendSuccess(res, { message: 'Your listings', data: listings, meta: buildMeta({ page, limit, total }) });
});

const updateListing = asyncHandler(async (req, res) => {
    const existing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!existing) throw ApiError.notFound('Listing not found');
    if (existing.sellerId !== req.user.id) throw ApiError.forbidden('You do not own this listing');

    const { images, farmId, ...rest } = req.body;
    if (farmId !== undefined) {
        const farm = await prisma.farm.findUnique({ where: { id: farmId } });
        if (!farm || farm.ownerId !== req.user.id) {
            throw ApiError.badRequest('farmId does not belong to you');
        }
    }
    const listing = await prisma.listing.update({
        where: { id: req.params.id },
        data: {
            ...rest,
            ...(farmId !== undefined && { farmId }),
            ...(images && {
                images: { deleteMany: {}, create: images.map((url) => ({ url })) },
            })
        },
        include: { images: true, category: true }
    });

    sendSuccess(res, { message: 'Listing updated', data: { listing } });
});

const deleteListing = asyncHandler(async (req, res) => {
    const existing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!existing) throw ApiError.notFound('Listing not found');
    if (existing.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
        throw ApiError.forbidden('You do not own this listing');
    }
    // Soft delete via status rather than hard delete which preserves history for any linked orders.
    await prisma.listing.update({ where: { id: req.params.id }, data: { status: 'INACTIVE' } });
    sendSuccess(res, { message: 'Listing deactivated' });
});

module.exports = { createListing, getListing, myListings, updateListing, deleteListing };