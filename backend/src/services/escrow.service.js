const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../config/dbHandler');
const ApiError = require('../utils/ApiError');
const { getProvider } = require('./payment');
const env = require('../config/env');

/**
 * Starts payment for an order: creates the Payment + EscrowTransaction rows
 * (both PENDING/AWAITING_FUNDS) and asks the provider for a checkout URL.
 */
async function initiateOrderPayment(order, buyerEmail) {
  if (order.status !== 'ACCEPTED') {
    throw ApiError.badRequest('Order must be accepted by the seller before payment');
  }

  const reference = `plk_${order.id}_${uuidv4().slice(0, 8)}`;
  const provider = getProvider();

  const { authorizationUrl, reference: providerReference } = await provider.initializePayment({
    email: buyerEmail,
    amount: Number(order.totalAmount),
    reference,
    metadata: { orderId: order.id, buyerId: order.buyerId },
  });

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        orderId: order.id,
        buyerId: order.buyerId,
        amount: order.totalAmount,
        provider: env.PAYMENT_PROVIDER,
        providerReference,
        status: 'PENDING',
      },
    }),
    prisma.escrowTransaction.upsert({
      where: { orderId: order.id },
      update: { amount: order.totalAmount, status: 'AWAITING_FUNDS' },
      create: { orderId: order.id, amount: order.totalAmount, status: 'AWAITING_FUNDS' },
    }),
    prisma.order.update({ where: { id: order.id }, data: { status: 'AWAITING_PAYMENT' } }),
  ]);

  return { authorizationUrl, reference: providerReference };
}

/**
 * Called from the webhook (or a verify-payment polling endpoint). Confirms
 * the payment with the provider and, on success, moves funds into escrow.
 */
async function confirmPayment(reference, providerName = env.PAYMENT_PROVIDER) {
  const provider = getProvider(providerName);
  const result = await provider.verifyPayment(reference);

  const payment = await prisma.payment.findUnique({ where: { providerReference: reference } });
  if (!payment) throw ApiError.notFound('Payment record not found for this reference');
  if (payment.status === 'SUCCESS') return payment; // idempotent — webhook may fire more than once

  if (result.status !== 'success') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED', rawResponse: result.raw },
    });
    return payment;
  }

  const [updatedPayment] = await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'SUCCESS', paidAt: new Date(), rawResponse: result.raw },
    }),
    prisma.escrowTransaction.update({
      where: { orderId: payment.orderId },
      data: { status: 'HELD', heldAt: new Date() },
    }),
    prisma.order.update({ where: { id: payment.orderId }, data: { status: 'PAID' } }),
  ]);

  return updatedPayment;
}

/**
 * Releases escrowed funds to the seller. Triggered once the buyer confirms
 * delivery (see delivery.service). In a real payout integration this is
 * where a Paystack Transfer to the seller's subaccount would fire.
 */
async function releaseEscrow(orderId) {
  const escrow = await prisma.escrowTransaction.findUnique({ where: { orderId } });
  if (!escrow) throw ApiError.notFound('Escrow transaction not found');
  if (escrow.status !== 'HELD') throw ApiError.badRequest(`Cannot release escrow in status ${escrow.status}`);

  return prisma.escrowTransaction.update({
    where: { orderId },
    data: { status: 'RELEASED', releasedAt: new Date() },
  });
}

/**
 * Refunds escrow to the buyer — used on cancellation before delivery, or
 * dispute resolution in the buyer's favor.
 */
async function refundEscrow(orderId, reason) {
  const escrow = await prisma.escrowTransaction.findUnique({ where: { orderId } });
  if (!escrow) throw ApiError.notFound('Escrow transaction not found');
  if (!['HELD', 'DISPUTED'].includes(escrow.status)) {
    throw ApiError.badRequest(`Cannot refund escrow in status ${escrow.status}`);
  }

  return prisma.escrowTransaction.update({
    where: { orderId },
    data: { status: 'REFUNDED', refundedAt: new Date(), disputeReason: reason },
  });
}

async function markDisputed(orderId, reason) {
  return prisma.escrowTransaction.update({
    where: { orderId },
    data: { status: 'DISPUTED', disputeReason: reason },
  });
}

module.exports = { initiateOrderPayment, confirmPayment, releaseEscrow, refundEscrow, markDisputed };