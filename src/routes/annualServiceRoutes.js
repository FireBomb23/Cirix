const express = require('express');
const router = express.Router();
const controller = require('../controllers/annualServiceController');
const { checkToken, checkRole } = require('../middlewares/middleware');

router.get('/', checkToken, controller.annualservice_list);
router.get('/:id', checkToken, controller.annualservice_detail);
router.post('/create', checkToken, checkRole('admin', 'manager'), controller.annualservice_create);
router.put('/update/:id', checkToken, checkRole('admin', 'manager'), controller.annualservice_update);
router.delete('/delete/:id', checkToken, checkRole('admin', 'manager'), controller.annualservice_delete);

module.exports = router;
