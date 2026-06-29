const express = require('express');
const router = express.Router();
const controller = require('../controllers/serviceRequestController');
const { checkToken, checkRole } = require('../middlewares/middleware');

router.get('/', checkToken, controller.servicerequest_list);
router.get('/:id', checkToken, controller.servicerequest_detail);
router.post('/create', checkToken, controller.servicerequest_create);
router.put('/update/:id', checkToken, checkRole('admin', 'manager'), controller.servicerequest_update);
router.delete('/delete/:id', checkToken, checkRole('admin', 'manager'), controller.servicerequest_delete);

module.exports = router;
