const express = require('express');
const router = express.Router();
const controller = require('../controllers/conversationController');
const { checkToken } = require('../middlewares/middleware');

// Todo o chat requer sessao iniciada
router.get('/', checkToken, controller.conversation_list);
router.post('/create', checkToken, controller.conversation_create);
router.post('/ensure', checkToken, controller.conversation_ensure);
router.get('/:id', checkToken, controller.conversation_detail);
router.delete('/delete/:id', checkToken, controller.conversation_delete);

// Mensagens de uma conversa
router.get('/:id/messages', checkToken, controller.message_list);
router.post('/:id/messages', checkToken, controller.message_create);

module.exports = router;
