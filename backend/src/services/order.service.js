const { prisma } = require('../config/dbHandler');
const ApiError = require('../utils/ApiError');
const escrowService = require('./escrow.service');

/**
 * Orders are single-seller (matches the doc's BUYER -> SELLER acceptance flow).
 * A cart spanning multiple sellers should be split into separate orders on
 * the client before calling this, we validate that here rather than silently
 * splitting, so the buyer sees one total per seller up front.
 */
async function createOrder(buyerId, { items, deliveryAddress, deliveryState, deliveryLga, notes }) {
  const listingIds = items.map((i) => i.listingId);
  const listings = await prisma.listing.findMany({ where: { id: { in: listingIds } } });

  if (listings.length !== listingIds.length) throw ApiError.badRequest('One or more listings do not exist');

  const sellerIds = new Set(listings.map((l) => l.sellerId));
  if (sellerIds.size > 1) {
    throw ApiError.badRequest('All items in one order must be from the same seller — place separate orders per seller');
  }
  const sellerId = [...sellerIds][0];
  if (sellerId === buyerId) throw ApiError.badRequest('You cannot order your own listing');

  const orderItemsData = items.map(({ listingId, quantity }) => {
    const listing = listings.find((l) => l.id === listingId);
    if (listing.status !== 'ACTIVE') throw ApiError.badRequest(`Listing "${listing.productName}" is not available`);
    if (quantity < Number(listing.minOrderQuantity)) {
      throw ApiError.badRequest(`Minimum order quantity for "${listing.productName}" is ${listing.minOrderQuantity}`);
    }
    if (quantity > Number(listing.quantity)) {
      throw ApiError.badRequest(`Only ${listing.quantity} ${listing.unit} available for "${listing.productName}"`);
    }
    const subtotal = quantity * Number(listing.price);
    return { listingId, sellerId: listing.sellerId, quantity, unitPrice: listing.price, subtotal };
  });

  const totalAmount = orderItemsData.reduce((sum, i) => sum + i.subtotal, 0);

  const order = await prisma.order.create({
    data: {
      buyerId,
      totalAmount,
      deliveryAddress,
      deliveryState,
      deliveryLga,
      notes,
      items: { create: orderItemsData },
    },
    include: { items: { include: { listing: true } } },
  });

  await prisma.notification.create({
    data: {
      userId: sellerId,
      type: 'ORDER',
      title: 'New order received',
      body: `You have a new order (#${order.id.slice(0, 8)}) awaiting your response.`,
    },
  });

  return order;
}

async function getOrderOrThrow(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { listing: true } }, payment: true, escrow: true, delivery: true, buyer: { select: { id: true, email: true } } },
  });
  if (!order) throw ApiError.notFound('Order not found');
  return order;
}

function assertParty(order, userId, role) {
  const isBuyer = order.buyerId === userId;
  const isSeller = order.items.some((i) => i.sellerId === userId);
  if (role === 'buyer' && !isBuyer) throw ApiError.forbidden('Only the buyer can perform this action');
  if (role === 'seller' && !isSeller) throw ApiError.forbidden('Only the seller can perform this action');
  if (role === 'either' && !isBuyer && !isSeller) throw ApiError.forbidden('You are not a party to this order');
}

async function acceptOrder(orderId, sellerId) {
  const order = await getOrderOrThrow(orderId);
  assertParty(order, sellerId, 'seller');
  if (order.status !== 'PENDING_ACCEPTANCE') throw ApiError.badRequest(`Order cannot be accepted from status ${order.status}`);

  await prisma.$transaction(async (tx) => {
    const claimedOrder = await tx.order.updateMany({
      where: { id: orderId, status: 'PENDING_ACCEPTANCE' },
      data: { status: 'ACCEPTED' },
    });
    if (claimedOrder.count !== 1) throw ApiError.conflict('Order acceptance was already processed');

    for (const item of order.items) {
      const claimedStock = await tx.listing.updateMany({
        where: { id: item.listingId, quantity: { gte: item.quantity } },
        data: { quantity: { decrement: item.quantity } },
      });
      if (claimedStock.count !== 1) {
        throw ApiError.conflict(`Insufficient stock for listing ${item.listingId}`);
      }
    }
  });

  return getOrderOrThrow(orderId);
}

async function rejectOrder(orderId, sellerId) {
  const order = await getOrderOrThrow(orderId);
  assertParty(order, sellerId, 'seller');
  if (order.status !== 'PENDING_ACCEPTANCE') throw ApiError.badRequest(`Order cannot be rejected from status ${order.status}`);
  return prisma.order.update({ where: { id: orderId }, data: { status: 'REJECTED' } });
}

async function cancelOrder(orderId, userId, reason) {
  const order = await getOrderOrThrow(orderId);
  assertParty(order, userId, 'buyer');

  if (['PENDING_ACCEPTANCE', 'ACCEPTED', 'AWAITING_PAYMENT'].includes(order.status)) {
    return prisma.$transaction(async (tx) => {
      if (['ACCEPTED', 'AWAITING_PAYMENT'].includes(order.status)) {
        for (const item of order.items) {
          await tx.listing.update({
            where: { id: item.listingId },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }
      return tx.order.update({ where: { id: orderId }, data: { status: 'CANCELLED', notes: reason } });
    });
  }
  if (order.status === 'PAID') {
    // Funds already in escrow so refund before cancelling.
    await escrowService.refundEscrow(orderId, reason || 'Buyer cancelled after payment');
    return prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.listing.update({
          where: { id: item.listingId },
          data: { quantity: { increment: item.quantity } },
        });
      }
      return tx.order.update({ where: { id: orderId }, data: { status: 'CANCELLED', notes: reason } });
    });
  }
  throw ApiError.badRequest(`Order cannot be cancelled from status ${order.status}`);
}

async function initiatePayment(orderId, buyerId, buyerEmail) {
  const order = await getOrderOrThrow(orderId);
  assertParty(order, buyerId, 'buyer');
  return escrowService.initiateOrderPayment(order, buyerEmail);
}

async function markOutForDelivery(orderId, sellerId, transporterId) {
  const order = await getOrderOrThrow(orderId);
  assertParty(order, sellerId, 'seller');
  if (order.status !== 'PAID') throw ApiError.badRequest('Order must be paid before dispatch');

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: 'OUT_FOR_DELIVERY' } }),
    prisma.delivery.upsert({
      where: { orderId },
      update: { status: 'IN_TRANSIT', transporterId },
      create: { orderId, status: 'IN_TRANSIT', transporterId, deliveryAddress: order.deliveryAddress },
    }),
  ]);

  return getOrderOrThrow(orderId);
}

/**
 * Buyer confirms physical delivery — this is the trigger that releases
 * escrowed funds to the seller (last step in the doc's order-workflow diagram).
 */
async function confirmDelivery(orderId, buyerId) {
  const order = await getOrderOrThrow(orderId);
  assertParty(order, buyerId, 'buyer');
  if (!['OUT_FOR_DELIVERY', 'DELIVERED', 'CONFIRMED'].includes(order.status)) {
    throw ApiError.badRequest(`Order cannot be confirmed from status ${order.status}`);
  }
  if (!order.delivery || !['DELIVERED', 'CONFIRMED'].includes(order.delivery.status)) {
    throw ApiError.badRequest('The delivery must be marked delivered before confirmation');
  }

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: 'CONFIRMED' } }),
    prisma.delivery.update({ where: { orderId }, data: { status: 'CONFIRMED', confirmedAt: new Date() } }),
  ]);

  await escrowService.releaseEscrow(orderId);
  const completed = await prisma.order.update({ where: { id: orderId }, data: { status: 'COMPLETED' } });

  const sellerId = order.items[0].sellerId;
  await prisma.notification.createMany({
    data: [
      { userId: sellerId, type: 'ESCROW', title: 'Funds released', body: `Escrow for order #${orderId.slice(0, 8)} has been released to you.` },
    ],
  });

  return completed;
}

async function disputeOrder(orderId, userId, reason) {
  const order = await getOrderOrThrow(orderId);
  assertParty(order, userId, 'either');
  if (!['PAID', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
    throw ApiError.badRequest(`Order cannot be disputed from status ${order.status}`);
  }
  await prisma.order.update({ where: { id: orderId }, data: { status: 'DISPUTED' } });
  return escrowService.markDisputed(orderId, reason);
}

module.exports = {
  createOrder,
  getOrderOrThrow,
  acceptOrder,
  rejectOrder,
  cancelOrder,
  initiatePayment,
  markOutForDelivery,
  confirmDelivery,
  disputeOrder,
  assertParty,
};