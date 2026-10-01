const router = require('express').Router();
const controller = require('../controllers/user.controller');
const validate = require('../middleware/validate.middleware');
const schema = require('../validators/user.validator');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { z } = require('zod');

router.patch('/me', authenticate, validate(schema.updateProfile), controller.updateMyProfile);
router.get('/:id', validate(schema.idParam), controller.getPublicProfile);

// Admin
router.get('/', authenticate, requireRole('ADMIN'), validate(schema.listUsers), controller.listUsers);
router.patch(
  '/:id/verification',
  authenticate,
  requireRole('ADMIN'),
  validate({ params: schema.idParam.params, body: z.object({ status: z.enum(['VERIFIED', 'REJECTED']) }) }),
  controller.setVerificationStatus
);
router.patch(
  '/:id/active',
  authenticate,
  requireRole('ADMIN'),
  validate({ params: schema.idParam.params, body: z.object({ isActive: z.boolean() }) }),
  controller.setActiveStatus
);

module.exports = router;