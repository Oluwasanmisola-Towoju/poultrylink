const env = require('../../config/env');
const PaystackProvider = require('./paystack.provider');
const mockProvider = require('./mock.provider');

let paystackInstance = null;

function getProvider(name = env.PAYMENT_PROVIDER) {
    if (name === 'mock') return mockProvider;
    if (name === 'paystack') {
        if (!paystackInstance) paystackInstance = new PaystackProvider();
        return paystackInstance;
    }
    throw new Error(`Unknown payment provider: ${name}`);
}

module.exports = { getProvider };