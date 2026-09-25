const { prisma } = require('../config/dbHandler');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const updateStatus = asyncHandler(async (req, res) => {
    const delivery = await prisma.delivery.findUnique({ where: { orderId: req.params.orderId } });
    if (!delivery) throw ApiError.notFound('Delivery not found for this order');
    if (delivery.transporterId && delivery.transporterId !== req.user.id && req.user.role !== 'ADMIN') {
        throw ApiError.forbidden('You are not assigned to this delivery');
    }

    const updated = await prisma.delivery.update({
        where: { orderId: req.params.orderId },
        data: { status: req.body.status, ...(req.body.status === 'DELIVERED' && { confirmedAt: null }) }
    });

    if (req.body.status === 'DELIVERED') {
        await prisma.order.update({ where: { id: req.params.orderId }, data: { status: 'DELIVERED' } });
    }

    sendSuccess(res, { message: 'Delivery status updated', data: { delivery: updated } });
});

const myDeliveries = asyncHandler(async (req, res) => {
    const deliveries = await prisma.delivery.findMany({
        where: { transporterId: req.user.id },
        include: { order: { select: { id: true, status: true, deliveryAddress: true } } },
        orderBy: { createdAt: 'desc' }
    });
    sendSuccess(res, { message: 'Your deliveries', data: deliveries });
});

module.exports = { updateStatus, myDeliveries };