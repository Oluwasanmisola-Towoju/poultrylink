const router = require('express').Router();
const controller = require('../controllers/review.controller');
const validate = require('../middleware/validate.middleware');
const schema = require('../validators/review.validator');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/orders/:orderId', authenticate, validate(schema.createReview), controller.createReview);

module.exports = router;