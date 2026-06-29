const express = require('express');
const router = express.Router();
const controller = require('../controllers/ticketController');
const { checkToken, checkRole } = require('../middlewares/middleware');

router.get('/', checkToken, controller.ticket_list);
router.get('/:id', checkToken, controller.ticket_detail);
router.post('/create', checkToken, controller.ticket_create);
router.put('/update/:id', checkToken, checkRole('admin', 'manager'), controller.ticket_update);
router.delete('/delete/:id', checkToken, checkRole('admin', 'manager'), controller.ticket_delete);

// Comentarios / conversa de um ticket
router.get('/:id/comments', checkToken, controller.ticket_comments_list);
router.post('/:id/comments', checkToken, controller.ticket_comment_create);

module.exports = router;
