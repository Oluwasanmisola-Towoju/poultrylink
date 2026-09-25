const router = require('express').Router();
const controller = require('../controllers/delivery.controller');
const validate = require('../middleware/validate.middleware');
const schema = require('../validators/delivery.validator');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(authenticate, requireRole('TRANSPORTER', 'ADMIN'));
router.get('/mine', controller.myDeliveries);
router.patch('/:orderId/status', validate(schema.updateDeliveryStatus), controller.updateStatus);

module.exports = router;
