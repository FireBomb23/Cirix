const express = require('express');
const router = express.Router();
const controller = require('../controllers/serviceRequestController');

router.get('/', controller.servicerequest_list);
router.get('/:id', controller.servicerequest_detail);
router.post('/create', controller.servicerequest_create);
router.put('/update/:id', controller.servicerequest_update);
router.delete('/delete/:id', controller.servicerequest_delete);

module.exports = router;
