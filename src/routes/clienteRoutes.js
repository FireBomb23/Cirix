const express = require('express');
const router = express.Router();
const controller = require('../controllers/clienteController');

router.get('/', controller.cliente_list);
router.get('/:id', controller.cliente_detail);
router.post('/create', controller.cliente_create);
router.put('/update/:id', controller.cliente_update);
router.delete('/delete/:id', controller.cliente_delete);

module.exports = router;
