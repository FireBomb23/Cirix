const express = require('express');
const router = express.Router();
const controller = require('../controllers/documentController');
const { checkToken, checkRole } = require('../middlewares/middleware');

router.get('/', checkToken, controller.document_list);
router.get('/:id', checkToken, controller.document_detail);
router.post('/create', checkToken, controller.document_create); // cliente pode submeter os seus documentos
router.put('/update/:id', checkToken, checkRole('admin', 'manager'), controller.document_update);
router.delete('/delete/:id', checkToken, checkRole('admin', 'manager'), controller.document_delete);

module.exports = router;
