const { z } = require('zod');

const startConversation = {
  body: z.object({
    recipientId: z.string().uuid(),
    listingId: z.string().uuid().optional(),
    content: z.string().min(1).max(2000),
  }),
};

const sendMessage = {
  params: z.object({ conversationId: z.string().uuid() }),
  body: z.object({ content: z.string().min(1).max(2000) }),
};

const idParam = { params: z.object({ conversationId: z.string().uuid() }) };

module.exports = { startConversation, sendMessage, idParam };