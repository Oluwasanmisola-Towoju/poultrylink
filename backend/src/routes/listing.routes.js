const router = require('express').Router();
const controller = require('../controllers/listing.controller');
const searchController = require('../controllers/search.controller');
const validate = require('../middleware/validate.middleware');
const schema = require('../validators/listing.validator');
const { authenticate, attachUserIfPresent } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// sellers who can list produce in FARMER is Phase 1; SUPPLIER/COOPERATIVE plug in the same
// way once their Phase 2 marketplace flows are enabled.
const SELLER_ROLES = ['FARMER'];

router.get('/search', validate(schema.searchListings), searchController.searchListings);
router.get('/categories', searchController.listCategories);

router.post('/', authenticate, requireRole(...SELLER_ROLES), validate(schema.createListing), controller.createListing);
router.get('/mine', authenticate, requireRole(...SELLER_ROLES), controller.myListings);
router.get('/:id', attachUserIfPresent, validate(schema.idParam), controller.getListing);
router.patch('/:id', authenticate, requireRole(...SELLER_ROLES), validate(schema.updateListing), controller.updateListing);
router.delete('/:id', authenticate, validate(schema.idParam), controller.deleteListing);

module.exports = router;