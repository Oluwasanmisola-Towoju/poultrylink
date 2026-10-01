class PaymentProviderInterface {
  async initializePayment(_params) {
    throw new Error('initializePayment() not implemented');
  }
  async verifyPayment(_reference) {
    throw new Error('verifyPayment() not implemented');
  }
  async refundPayment(_reference, _amount) {
    throw new Error('refundPayment() not implemented');
  }
  verifyWebhookSignature(_rawBody, _signatureHeader) {
    throw new Error('verifyWebhookSignature() not implemented');
  }
}

module.exports = PaymentProviderInterface;