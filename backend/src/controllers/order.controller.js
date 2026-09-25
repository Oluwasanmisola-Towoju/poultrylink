const { prisma } = require('../config/dbHandler');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const orderService = require('../services/order.service');
const { getPagination, buildMeta } = require('../utils/pagination');

const create = asyncHandler(async (req, res) => {
    const order = await orderService.createOrder(req.user.id, req.body);
    sendSuccess(res, { statusCode: 201, message: 'Order placed', data: { order } });
});

const getOne = asyncHandler(async (req, res) => {
    const order = await orderService.getOrderOrThrow(req.params.id);
    orderService.assertParty(order, req.user.id, req.user.role === 'ADMIN' ? 'either' : 'either' );
    sendSuccess(res, { message: 'Order', data: { order } });
});

const myOrdersAsBuyer = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const where = { buyerId: req.user.id, ...(req.query.status && { status: req.query.status }) };
    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: {
                items: {
                    include: {
                        listing: {
                            select: {
                                productName: true
                            }
                        }
                    }
                },
                payment: true,
                escrow: true,
                delivery: true
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.order.count({ where })
    ]);
    sendSuccess(res, { message: 'Your orders', data: orders, meta: buildMeta({ page, limit, total }) }); 
});

const myOrdersAsSeller = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const where = {
        items: {
            some: {
                sellerId: req.user.id
            }
        },
        ...(req.query.status && { status: req.query.status })
    };
    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: {
                items: {
                    include: {
                        listing: {
                            select: {
                                productName: true
                            }
                        }
                    }
                },
                payment: true,
                delivery: true,
                buyer: {
                    select: {
                        profile: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.order.count({ where })
    ]);
    sendSuccess(res, { message: 'Orders on your listings', data: orders, meta: buildMeta({ page, limit, total }) });
});

const accept = asyncHandler(async (req, res) => {
    const order = await orderService.acceptOrder(req.params.id, req.user.id);
    sendSuccess(res, { message: 'Order accepted', data: { order } });
});

const reject = asyncHandler(async (req, res) => {
    const order = await orderService.rejectOrder(req.params.id, req.user.id);
    sendSuccess(res, { message: 'Order rejected', data: { order } });
});

const cancel = asyncHandler(async (req, res) => {
    const order = await orderService.cancelOrder(req.params.id, req.user.id, req.body.reason);
    sendSuccess(res, { message: 'Order cancelled', data: { order } });
});

const pay = asyncHandler(async (req, res) => {
    const result = await orderService.initiatePayment(req.params.id, req.user.id, req.user.email);
    sendSuccess(res, { message: 'Payment initialized', data: result });
});

const dispatch = asyncHandler(async (req, res) => {
    const order = await orderService.markOutForDelivery(req.params.id, req.user.id, req.body.transporterId);
    sendSuccess(res, { message: 'Order marked out for delivery', data: { order } });
});

const confirmDelivery = asyncHandler(async (req, res) => {
    const order = await orderService.confirmDelivery(req.params.id, req.user.id);
    sendSuccess(res, { message: 'Delivery confirmed, escrow released to seller', data: { order } });
});

const dispute = asyncHandler(async (req, res) => {
    const escrow = await orderService.disputeOrder(req.params.id, req.user.id, req.body.reason);
    sendSuccess(res, { message: 'Order disputed - an admin will review', data: { escrow } });
});

module.exports = { create, getOne, myOrdersAsBuyer, myOrdersAsSeller, accept, reject, cancel, pay, dispatch, confirmDelivery, dispute };