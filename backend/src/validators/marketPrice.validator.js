const { z } = require('zod');

const createMarketPrice = {
  body: z.object({
    categoryId: z.string().uuid(),
    productName: z.string().min(1).max(150),
    state: z.string().min(1).max(80),
    avgPrice: z.number().positive(),
    unit: z.string().min(1).max(30),
  }),
};

const listMarketPrices = {
  query: z.object({
    categoryId: z.string().uuid().optional(),
    state: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
};

module.exports = { createMarketPrice, listMarketPrices };