const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const escrowService = require('../services/escrow.service');
const { getProvider } = require('../services/payment');
const mockProvider = require('../services/payment/mock.provider');
const env = require('../config/env');

/**
 * Paystack webhook. Mounted on raw body (see routes) so the signature can be
 * verified against the exact bytes Paystack sent.
 */
const paystackWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  const provider = getProvider('paystack');

  if (!provider.verifyWebhookSignature(req.body, signature)) {
    throw ApiError.unauthorized('Invalid webhook signature');
  }

  const event = JSON.parse(req.body.toString('utf8'));
  if (event.event === 'charge.success') {
    await escrowService.confirmPayment(event.data.reference, 'paystack');
  }

  res.status(200).json({ received: true });
});

// Client-side polling fallback / manual verification after redirect back from Paystack.
const verifyPayment = asyncHandler(async (req, res) => {
  const payment = await escrowService.confirmPayment(req.params.reference);
  sendSuccess(res, { message: 'Payment verified', data: { payment } });
});

// Dev/test-only: flips a mock transaction to success/failed, then runs it
// through the exact same confirmPayment path a real webhook would use.
const simulateMockOutcome = asyncHandler(async (req, res) => {
  if (env.PAYMENT_PROVIDER !== 'mock' && env.NODE_ENV === 'production') {
    throw ApiError.forbidden('Mock payment simulation is disabled in production');
  }
  const { reference, outcome } = req.body; // outcome: 'success' | 'failed'
  const flipped = mockProvider.simulateOutcome(reference, outcome);
  if (!flipped) throw ApiError.notFound('Unknown mock transaction reference');

  const payment = await escrowService.confirmPayment(reference, 'mock');
  sendSuccess(res, { message: `Mock payment marked ${outcome}`, data: { payment } });
});

module.exports = { paystackWebhook, verifyPayment, simulateMockOutcome };
