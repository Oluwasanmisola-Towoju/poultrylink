const { prisma } = require('../config/dbHandler');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');

const SORT_MAP = {
  newest: { createdAt: 'desc' },
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
};

const searchListings = asyncHandler(async (req, res) => {
  const { q, categoryId, state, lga, minPrice, maxPrice, minQuantity, sellerId, sort } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const where = {
    status: 'ACTIVE',
    ...(categoryId && { categoryId }),
    ...(state && { state: { equals: state, mode: 'insensitive' } }),
    ...(lga && { lga: { equals: lga, mode: 'insensitive' } }),
    ...(sellerId && { sellerId }),
    ...(q && {
      OR: [
        { productName: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: Number(minPrice) }),
        ...(maxPrice !== undefined && { lte: Number(maxPrice) }),
      },
    }),
    ...(minQuantity && { quantity: { gte: Number(minQuantity) } }),
  };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        images: { take: 1 },
        category: true,
        seller: { select: { id: true, verificationStatus: true, profile: { select: { businessName: true, firstName: true, lastName: true } } } },
      },
      skip,
      take: limit,
      orderBy: SORT_MAP[sort] || SORT_MAP.newest,
    }),
    prisma.listing.count({ where }),
  ]);

  sendSuccess(res, { message: 'Search results', data: listings, meta: buildMeta({ page, limit, total }) });
});

const listCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  sendSuccess(res, { message: 'Categories', data: categories });
});

module.exports = { searchListings, listCategories };