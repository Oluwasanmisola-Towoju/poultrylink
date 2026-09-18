const router = require('express').Router();
const controller = require('../controllers/farm.controller');
const validate = require('../middleware/validate.middleware');
const schema = require('../validators/listing.validator');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.post('/', authenticate, requireRole('FARMER'), validate(schema.createFarm), controller.createFarm);
router.get('/mine', authenticate, requireRole('FARMER'), controller.myFarms);
router.patch(
  '/:id',
  authenticate,
  requireRole('FARMER'),
  validate({ params: schema.idParam.params, body: schema.createFarm.body.partial() }),
  controller.updateFarm
);

module.exports = router;