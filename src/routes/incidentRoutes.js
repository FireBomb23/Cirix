const express = require('express');
const router = express.Router();
const c = require('../controllers/incidentController');
const { checkToken, checkRole } = require('../middlewares/middleware');

router.get('/', checkToken, c.incident_list);
router.post('/create', checkToken, c.incident_create);
router.put('/update/:id', checkToken, checkRole('admin', 'manager'), c.incident_update);
router.delete('/delete/:id', checkToken, c.incident_delete);

module.exports = router;
