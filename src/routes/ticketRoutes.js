const express = require('express');
const router = express.Router();
const controller = require('../controllers/ticketController');

router.get('/', controller.ticket_list);
router.get('/:id', controller.ticket_detail);
router.post('/create', controller.ticket_create);
router.put('/update/:id', controller.ticket_update);
router.delete('/delete/:id', controller.ticket_delete);

module.exports = router;
