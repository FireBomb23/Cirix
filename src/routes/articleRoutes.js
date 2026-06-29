const express = require('express');
const router = express.Router();
const controller = require('../controllers/articleController');
const { checkToken, checkRole } = require('../middlewares/middleware');

// Leitura publica (paginas de noticias)
router.get('/', controller.article_list);
router.get('/:id', controller.article_detail);

// Gestao de conteudos: apenas admin
router.post('/create', checkToken, checkRole('admin'), controller.article_create);
router.put('/update/:id', checkToken, checkRole('admin'), controller.article_update);
router.delete('/delete/:id', checkToken, checkRole('admin'), controller.article_delete);

module.exports = router;
