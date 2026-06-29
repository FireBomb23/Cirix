const express = require('express');
const router = express.Router();
const controller = require('../controllers/serviceController');
const { checkToken, checkRole } = require('../middlewares/middleware');

// Leitura publica (pagina de servicos)
router.get('/', controller.service_list);
router.get('/:id', controller.service_detail);

// Gestao: apenas admin
router.post('/create', checkToken, checkRole('admin'), controller.service_create);
router.put('/update/:id', checkToken, checkRole('admin'), controller.service_update);
router.delete('/delete/:id', checkToken, checkRole('admin'), controller.service_delete);

module.exports = router;
