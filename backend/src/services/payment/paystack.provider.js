const crypto = require('crypto');
const PaymentProviderInterface = require('./payment.interface');
const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

class PaystackProvider extends PaymentProviderInterface {
  constructor() {
    super();
    this.baseUrl = env.PAYSTACK_BASE_URL;
    this.secretKey = env.PAYSTACK_SECRET_KEY;
  }

  async #request(path, options = {}) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const json = await res.json();
    if (!res.ok || json.status === false) {
      logger.error(`Paystack error on ${path}: ${json.message}`);
      throw ApiError.badRequest(`Payment provider error: ${json.message || 'unknown error'}`);
    }
    return json;
  }

  // Paystack expects amount in kobo (smallest currency unit).
  async initializePayment({ email, amount, reference, metadata }) {
    const json = await this.#request('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100),
        reference,
        metadata,
        callback_url: `${env.CLIENT_URL}/payments/callback`,
      }),
    });
    return {
      authorizationUrl: json.data.authorization_url,
      accessCode: json.data.access_code,
      reference: json.data.reference,
    };
  }

  async verifyPayment(reference) {
    const json = await this.#request(`/transaction/verify/${encodeURIComponent(reference)}`);
    const data = json.data;
    return {
      status: data.status === 'success' ? 'success' : data.status === 'abandoned' ? 'failed' : 'pending',
      amount: data.amount / 100,
      reference: data.reference,
      raw: data,
    };
  }

  verifyWebhookSignature(rawBody, signatureHeader) {
    const hash = crypto.createHmac('sha512', this.secretKey).update(rawBody).digest('hex');
    return hash === signatureHeader;
  }
}

module.exports = PaystackProvider;