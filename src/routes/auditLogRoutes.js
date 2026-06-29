const express = require('express');
const router = express.Router();
const controller = require('../controllers/auditLogController');
const { checkToken, checkRole } = require('../middlewares/middleware');

// Log de auditoria: apenas equipa interna (admin/gestor)
router.get('/', checkToken, checkRole('admin', 'manager'), controller.auditlog_list);
router.get('/:id', checkToken, checkRole('admin', 'manager'), controller.auditlog_detail);
router.post('/create', checkToken, checkRole('admin', 'manager'), controller.auditlog_create);
router.delete('/delete/:id', checkToken, checkRole('admin'), controller.auditlog_delete);

module.exports = router;
