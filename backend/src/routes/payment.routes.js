const router = require('express').Router();
const controller = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { z } = require('zod');

// The server mounts express.raw() for this path before global express.json()
// so Paystack signatures can be verified against the original request bytes.

router.get('/verify/:reference', authenticate, controller.verifyPayment);
router.post('/webhook/paystack', controller.paystackWebhook);

// Dev/test only — see controller guard.
router.post(
  '/mock/simulate',
  authenticate,
  validate({ body: z.object({ reference: z.string(), outcome: z.enum(['success', 'failed']) }) }),
  controller.simulateMockOutcome
);

module.exports = router;
