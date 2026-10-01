const router = require('express').Router();
const controller = require('../controllers/marketPrice.controller');
const validate = require('../middleware/validate.middleware');
const schema = require('../validators/marketPrice.validator');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.get('/', validate(schema.listMarketPrices), controller.listMarketPrices);
router.post('/', authenticate, requireRole('ADMIN'), validate(schema.createMarketPrice), controller.recordMarketPrice);

module.exports = router;