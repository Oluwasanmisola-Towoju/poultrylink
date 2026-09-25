const { prisma } = require('../config/dbHandler');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

// dashboard summary on admin portal
const dashboard = asyncHandler(async (req, res) => {
    const [userCount, listingCount, orderCount, disputedOrders, escrowHeld, totalGmv] = await Promise.all([
        prisma.user.count(),
        prisma.listing.count({ where: { status: 'ACTIVE' } }),
        prisma.order.count(),
        prisma.order.count({ where: { status: 'DISPUTED' } }),
        prisma.escrowTransaction.aggregate({ where: { status: 'HELD' }, _sum: { amount: true } }),
        prisma.order.aggregate({ where: { status: 'COMPLETED' }, _sum: { totalAmount: true } })
    ]);

    sendSuccess(res, {
        message: 'Dashboard Summary',
        data: {
            userCount,
            activeListingCount: listingCount,
            orderCount,
            disputedOrders,
            escrowCurrentlyHeld: escrowHeld._sum.amount || 0,
            completedGmv: totalGmv._sum.totalAmount || 0
        }
    });
});

const listDisputes = asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
        where: { status: 'DISPUTED' },
        include: {
            escrow: true,
            items: {
                include: {
                    listing: {
                        select: {
                            productName: true
                        }
                    }
                }
            },
            buyer: {
                select: {
                    email: true
                }
            }
        },
        orderBy: { updatedAt: 'desc' }
    });
    sendSuccess(res, { message: 'Disputed Orders', data: orders });
});

const resolveDispute = asyncHandler(async (req, res) => {
    const { resolution } = req.body; // "RELEASE_TO_SELLER" || "REFUND_BUYER"
    const escrowService = require('../services/escrow.service');

    if (resolution === 'RELEASE_TO_SELLER') {
        const escrow = await escrowService.releaseEscrow(req.params.orderId);
        await prisma.order.update({ where: { id: req.params.orderId }, data: { status: 'COMPLETED' } });
        return sendSuccess(res, { message: 'Dispute Resolved: The funds have been released to Seller', data: { escrow } });
    }
    const escrow = await escrowService.refundEscrow(req.params.orderId, 'Admin resolved dispute in favor of buyer');
    await prisma.order.update({ where: { id: req.params.orderId }, data: { status: 'CANCELLED' } });
    sendSuccess(res, { message: 'Dispute resolved: The funds have been refunded to the buyer', data: { escrow } });
});

const auditLogs = asyncHandler(async (req, res) => {
    const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    sendSuccess(res, { message: 'Audit logs', data: logs });
});

module.exports = { dashboard, listDisputes, resolveDispute, auditLogs };