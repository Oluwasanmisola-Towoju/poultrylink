const router = require('express').Router();
const controller = require('../controllers/message.controller');
const validate = require('../middleware/validate.middleware');
const schema = require('../validators/message.validator');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.post('/', validate(schema.startConversation), controller.startConversation);
router.get('/', controller.myConversations);
router.get('/:conversationId', validate(schema.idParam), controller.getMessages);
router.post('/:conversationId', validate(schema.sendMessage), controller.sendMessage);

module.exports = router;