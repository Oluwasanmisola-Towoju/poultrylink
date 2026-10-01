const { prisma } = require('../config/dbHandler');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');

const listMarketPrices = asyncHandler(async (req, res) => {
    const { categoryId, state } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    const where = { ...(categoryId && { categoryId }), ...(state && { state: { equals: state, mode: 'insensitive' } }) };

    const [prices, total] = await Promise.all([
    prisma.marketPrice.findMany({
      where,
      include: { category: true },
      skip,
      take: limit,
      orderBy: { recordedAt: 'desc' },
    }),
    prisma.marketPrice.count({ where }),
  ]);

  sendSuccess(res, { message: 'Market prices', data: prices, meta: buildMeta({ page, limit, total }) });
});

// Admin (or an ingestion job later) records a new price point.
const recordMarketPrice = asyncHandler(async (req, res) => {
  const price = await prisma.marketPrice.create({ data: req.body });
  sendSuccess(res, { statusCode: 201, message: 'Market price recorded', data: { price } });
});

module.exports = { listMarketPrices, recordMarketPrice };