const { prisma } = require('../config/dbHandler');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// Deterministic ordering of participant pair so the unique constraint on
// (participantOneId, participantTwoId, listingId) prevents duplicate threads.
function orderPair(a, b) {
  return a < b ? [a, b] : [b, a];
}

const startConversation = asyncHandler(async (req, res) => {
  const { recipientId, listingId, content } = req.body;
  if (recipientId === req.user.id) throw ApiError.badRequest('You cannot message yourself');

  const [participantOneId, participantTwoId] = orderPair(req.user.id, recipientId);

  let conversation = await prisma.conversation.findFirst({
    where: { participantOneId, participantTwoId, listingId: listingId ?? null },
  });
  if (!conversation) {
    try {
      conversation = await prisma.conversation.create({
        data: { participantOneId, participantTwoId, listingId: listingId ?? null },
      });
    } catch (error) {
      if (error.code !== 'P2002') throw error;
      conversation = await prisma.conversation.findFirst({
        where: { participantOneId, participantTwoId, listingId: listingId ?? null },
      });
    }
  }

  const message = await prisma.message.create({
    data: { conversationId: conversation.id, senderId: req.user.id, content },
  });

  sendSuccess(res, { statusCode: 201, message: 'Message sent', data: { conversation, message } });
});

const sendMessage = asyncHandler(async (req, res) => {
  const conversation = await prisma.conversation.findUnique({ where: { id: req.params.conversationId } });
  if (!conversation) throw ApiError.notFound('Conversation not found');
  if (![conversation.participantOneId, conversation.participantTwoId].includes(req.user.id)) {
    throw ApiError.forbidden('You are not part of this conversation');
  }

  const message = await prisma.message.create({
    data: { conversationId: conversation.id, senderId: req.user.id, content: req.body.content },
  });
  sendSuccess(res, { statusCode: 201, message: 'Message sent', data: { message } });
});

const myConversations = asyncHandler(async (req, res) => {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ participantOneId: req.user.id }, { participantTwoId: req.user.id }] },
    include: {
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      participantOne: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } },
      participantTwo: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, { message: 'Conversations', data: conversations });
});

const getMessages = asyncHandler(async (req, res) => {
  const conversation = await prisma.conversation.findUnique({ where: { id: req.params.conversationId } });
  if (!conversation) throw ApiError.notFound('Conversation not found');
  if (![conversation.participantOneId, conversation.participantTwoId].includes(req.user.id)) {
    throw ApiError.forbidden('You are not part of this conversation');
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: req.params.conversationId },
    orderBy: { createdAt: 'asc' },
  });

  await prisma.message.updateMany({
    where: { conversationId: req.params.conversationId, senderId: { not: req.user.id }, readAt: null },
    data: { readAt: new Date() },
  });

  sendSuccess(res, { message: 'Messages', data: messages });
});

module.exports = { startConversation, sendMessage, myConversations, getMessages };
