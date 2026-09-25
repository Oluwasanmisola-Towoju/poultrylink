const { z } = require('zod');

const createReview = {
  params: z.object({ orderId: z.string().uuid() }),
  body: z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(500).optional(),
  }),
};

module.exports = { createReview };