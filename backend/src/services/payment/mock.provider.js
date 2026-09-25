const PaymentProviderInterface = require('./payment.interface');
const env = require('../../config/env');

// Process-level store is enough for local dev / integration tests — this
// provider is never used in production (see the PAYMENT_PROVIDER guard in env.js
// usage, and the provider factory below).
const mockTransactions = new Map();

class MockProvider extends PaymentProviderInterface {
  async initializePayment({ amount, reference, metadata }) {
    mockTransactions.set(reference, { status: 'pending', amount, metadata });
    return {
      authorizationUrl: `${env.CLIENT_URL}/mock-checkout/${reference}`,
      accessCode: `mock_${reference}`,
      reference,
    };
  }

  async verifyPayment(reference) {
    const tx = mockTransactions.get(reference);
    if (!tx) return { status: 'failed', amount: 0, reference, raw: null };
    return { status: tx.status, amount: tx.amount, reference, raw: tx };
  }

  async refundPayment(reference, amount) {
    const tx = mockTransactions.get(reference);
    if (!tx || tx.status !== 'success' || tx.amount !== amount) {
      return { status: 'failed', raw: tx || null };
    }
    tx.status = 'refunded';
    mockTransactions.set(reference, tx);
    return { status: 'success', raw: tx };
  }

  // Test helper — flips a mock transaction to success/failed so the escrow
  // flow can be exercised end-to-end without a real payment gateway.
  simulateOutcome(reference, outcome) {
    const tx = mockTransactions.get(reference);
    if (!tx) return false;
    tx.status = outcome; // 'success' | 'failed'
    mockTransactions.set(reference, tx);
    return true;
  }

  verifyWebhookSignature() {
    // Mock provider has no real webhook signing — always "valid" so the
    // simulate-outcome test route can drive the same code path as a webhook.
    return true;
  }
}

module.exports = new MockProvider();