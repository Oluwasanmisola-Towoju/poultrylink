const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/farms', require('./farm.routes'));
router.use('/listings', require('./listing.routes'));
router.use('/market-prices', require('./marketPrice.routes'));
router.use('/orders', require('./order.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/deliveries', require('./delivery.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/messages', require('./message.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/admin', require('./admin.routes'));

router.get('/health', (req, res) => res.json({ success: true, message: 'PoultryLink API is healthy' }));

module.exports = router;