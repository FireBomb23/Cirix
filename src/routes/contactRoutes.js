const express = require('express');
const router = express.Router();
const controller = require('../controllers/contactController');
const { checkToken, checkRole } = require('../middlewares/middleware');

// Submissao publica do formulario de contacto
router.post('/', controller.contact_create);

// Caixa de entrada: apenas equipa interna (admin/gestor)
router.get('/', checkToken, checkRole('admin', 'manager'), controller.contact_list);
router.get('/:id', checkToken, checkRole('admin', 'manager'), controller.contact_detail);
router.put('/update/:id', checkToken, checkRole('admin', 'manager'), controller.contact_update);
router.delete('/delete/:id', checkToken, checkRole('admin', 'manager'), controller.contact_delete);

module.exports = router;
