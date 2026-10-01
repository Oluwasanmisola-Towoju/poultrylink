const { z } = require('zod');

const updateDeliveryStatus = {
    params: z.object({ orderId: z.string().uuid() }),
    body: z.object({ status: z.enum(['IN_TRANSIT', 'DELIVERED', 'FAILED', 'CONFIRMED']) })
};

module.exports = { updateDeliveryStatus };