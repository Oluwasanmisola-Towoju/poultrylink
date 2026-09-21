const { prisma } = require('../config/dbHandler');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const createFarm = asyncHandler(async (req, res) => {
    const farm = await prisma.farm.create({ data: { ...req.body, ownerId: req.user.id } });
    sendSuccess(res, { statusCode: 201, message: 'Farm Created', data: { farm } });
});

const myFarms = asyncHandler(async (req, res) => {
    const farms = await prisma.farm.findMany({
        where: { ownerId: req.user.id },
        include: { _count: { select: { listings: true } } },
        orderBy: { createdAt: 'desc' }
    });
    sendSuccess(res, { message: 'Your farms', data: farms });
});

const updateFarm = asyncHandler(async (req, res) => {
    const farm = await prisma.farm.findUnique({ where: { id: req.params.id } });
    if (!farm) throw ApiError.notFound('Farm not found');
    if (farm.ownerId !== req.user.id) throw ApiError.forbidden('You do not own this farm');

    const updated = await prisma.farm.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, { message: 'Farm updated', data: { farm: updated } });
});

module.exports = { createFarm, myFarms, updateFarm };