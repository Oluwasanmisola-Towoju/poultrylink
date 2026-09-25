const { z } = require('zod');

const createOrder = {
  body: z.object({
    items: z
      .array(
        z.object({
          listingId: z.string().uuid(),
          quantity: z.number().positive(),
        })
      )
      .min(1),
    deliveryAddress: z.string().min(5).max(300),
    deliveryState: z.string().max(80).optional(),
    deliveryLga: z.string().max(80).optional(),
    notes: z.string().max(500).optional(),
  }),
};

const idParam = { params: z.object({ id: z.string().uuid() }) };

const cancelOrder = {
  params: idParam.params,
  body: z.object({ reason: z.string().max(300).optional() }),
};

const disputeOrder = {
  params: idParam.params,
  body: z.object({ reason: z.string().min(3).max(500) }),
};

module.exports = { createOrder, idParam, cancelOrder, disputeOrder };