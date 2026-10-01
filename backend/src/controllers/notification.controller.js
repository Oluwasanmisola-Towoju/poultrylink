const { prisma } = require('../config/dbHandler');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');

const myNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = { userId: req.user.id };
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.notification.count({ where }),
  ]);
  sendSuccess(res, { message: 'Notifications', data: notifications, meta: buildMeta({ page, limit, total }) });
});

const markRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data: { isRead: true },
  });
  sendSuccess(res, { message: 'Notification marked as read' });
});

const markAllRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } });
  sendSuccess(res, { message: 'All notifications marked as read' });
});

module.exports = { myNotifications, markRead, markAllRead };