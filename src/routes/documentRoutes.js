const express = require('express');
const router = express.Router();
const controller = require('../controllers/documentController');

router.get('/', controller.document_list);
router.get('/:id', controller.document_detail);
router.post('/create', controller.document_create);
router.put('/update/:id', controller.document_update);
router.delete('/delete/:id', controller.document_delete);

module.exports = router;
