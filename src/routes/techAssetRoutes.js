const express = require('express');
const router = express.Router();
const c = require('../controllers/techAssetController');
const { checkToken } = require('../middlewares/middleware');

router.get('/', checkToken, c.asset_list);
router.post('/create', checkToken, c.asset_create);
router.post('/bulk', checkToken, c.asset_bulk); // importacao de Excel (bonus)
router.delete('/delete/:id', checkToken, c.asset_delete);

module.exports = router;
