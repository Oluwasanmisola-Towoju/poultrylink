const router = require('express').Router();
const controller = require('../controllers/admin.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { z } = require('zod');

router.use(authenticate, requireRole('ADMIN'));

router.get('/dashboard', controller.dashboard);
router.get('/disputes', controller.listDisputes);
router.post(
    'disputes/:orderId/resolve',
    validate({
        params: z.object({
            orderId: z.string().uuid() 
        }),
        body: z.object({
            resolution: z.enum([
                'RELEASE_TO_SELLER',
                'REFUND_BUYER'
            ])
        })
    }),
    controller.resolveDispute
);
router.get('/audit-logs', controller.auditLogs);

module.exports = router;