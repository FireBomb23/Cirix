const express = require('express');
const router = express.Router();
const controller = require('../controllers/teamMemberController');
const { checkToken, checkRole } = require('../middlewares/middleware');

// Leitura publica (pagina "Sobre Nos")
router.get('/', controller.team_list);
router.get('/:id', controller.team_detail);

// Gestao: apenas admin
router.post('/create', checkToken, checkRole('admin'), controller.team_create);
router.put('/update/:id', checkToken, checkRole('admin'), controller.team_update);
router.delete('/delete/:id', checkToken, checkRole('admin'), controller.team_delete);

module.exports = router;
