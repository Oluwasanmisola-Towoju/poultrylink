const router = require('express').Router();
const controller = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { z } = require('zod');

// NOTE: the Paystack webhook (/webhook/paystack) is NOT mounted here — it needs
// the raw request body for signature verification, so it's wired directly in
// app.js with express.raw() *before* the global express.json() middleware runs.

router.get('/verify/:reference', authenticate, controller.verifyPayment);

// Dev/test only — see controller guard.
router.post(
  '/mock/simulate',
  authenticate,
  validate({ body: z.object({ reference: z.string(), outcome: z.enum(['success', 'failed']) }) }),
  controller.simulateMockOutcome
);

module.exports = router;
