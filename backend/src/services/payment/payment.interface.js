class PaymentProviderInterface {
  async initializePayment(_params) {
    throw new Error('initializePayment() not implemented');
  }
  async verifyPayment(_reference) {
    throw new Error('verifyPayment() not implemented');
  }
  verifyWebhookSignature(_rawBody, _signatureHeader) {
    throw new Error('verifyWebhookSignature() not implemented');
  }
}

module.exports = PaymentProviderInterface;