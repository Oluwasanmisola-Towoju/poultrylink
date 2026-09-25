const router = require('express').Router();
const controller = require('../controllers/order.controller');
const validate = require('../middleware/validate.middleware');
const schema = require('../validators/order.validator');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { z } = require('zod');

router.use(authenticate);

router.post('/', requireRole('BUYER'), validate(schema.createOrder), controller.create);
router.get('/mine/buying', controller.myOrdersAsBuyer);
router.get('/mine/selling', requireRole('FARMER'), controller.myOrdersAsSeller);
router.get('/:id', validate(schema.idParam), controller.getOne);

router.post('/:id/accept', requireRole('FARMER'), validate(schema.idParam), controller.accept);
router.post('/:id/reject', requireRole('FARMER'), validate(schema.idParam), controller.reject);
router.post('/:id/cancel', requireRole('BUYER'), validate(schema.cancelOrder), controller.cancel);
router.post('/:id/pay', requireRole('BUYER'), validate(schema.idParam), controller.pay);
router.post(
  '/:id/dispatch',
  requireRole('FARMER'),
  validate({ params: schema.idParam.params, body: z.object({ transporterId: z.string().uuid().optional() }) }),
  controller.dispatch
);
router.post('/:id/confirm-delivery', requireRole('BUYER'), validate(schema.idParam), controller.confirmDelivery);
router.post('/:id/dispute', validate(schema.disputeOrder), controller.dispute);

module.exports = router;