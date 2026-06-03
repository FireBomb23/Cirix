const express = require('express');
const router = express.Router();
const controller = require('../controllers/incidenteController');

router.get('/', controller.incidente_list);
router.get('/:id', controller.incidente_detail);
router.post('/create', controller.incidente_create);
router.put('/update/:id', controller.incidente_update);
router.delete('/delete/:id', controller.incidente_delete);

module.exports = router;
