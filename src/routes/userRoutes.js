const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const { checkToken, checkRole } = require('../middlewares/middleware');

// Publico (autenticacao)
router.post('/login', controller.user_login);
router.post('/verify-2fa', controller.user_verify_2fa);

// Requer sessao iniciada
router.put('/me', checkToken, controller.user_update_me); // o proprio altera nome/password
router.get('/', checkToken, controller.user_list);
router.get('/:id', checkToken, controller.user_detail);

// Apenas administradores
router.post('/create', checkToken, checkRole('admin'), controller.user_create);
router.put('/update/:id', checkToken, checkRole('admin'), controller.user_update);
router.delete('/delete/:id', checkToken, checkRole('admin'), controller.user_delete);

module.exports = router;
