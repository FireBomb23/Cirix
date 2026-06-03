const express = require('express');
const router = express.Router();
const controller = require('../controllers/utilizadorController');

router.get('/', controller.utilizador_list);
router.get('/:id', controller.utilizador_detail);
router.post('/create', controller.utilizador_create);
router.put('/update/:id', controller.utilizador_update);
router.delete('/delete/:id', controller.utilizador_delete);

module.exports = router;
