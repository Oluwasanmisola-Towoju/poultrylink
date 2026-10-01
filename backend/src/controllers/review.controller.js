const { prisma } = require('../config/dbHandler');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// Either party can review after the order is COMPLETED — reviewee is
// whichever party the requester is not.
const createReview = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.orderId }, include: { items: true } });
  if (!order) throw ApiError.notFound('Order not found');
  if (order.status !== 'COMPLETED') throw ApiError.badRequest('You can only review a completed order');

  const isBuyer = order.buyerId === req.user.id;
  const sellerId = order.items[0].sellerId;
  const isSeller = sellerId === req.user.id;
  if (!isBuyer && !isSeller) throw ApiError.forbidden('You are not a party to this order');

  const revieweeId = isBuyer ? sellerId : order.buyerId;

  const review = await prisma.review.create({
    data: { orderId: order.id, reviewerId: req.user.id, revieweeId, rating: req.body.rating, comment: req.body.comment },
  });

  sendSuccess(res, { statusCode: 201, message: 'Review submitted', data: { review } });
});

module.exports = { createReview };