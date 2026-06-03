const { Utilizador } = require('../models');

// GET /utilizadores -> lista todos os utilizadores
exports.utilizador_list = async (req, res) => {
  try {
    const utilizadores = await Utilizador.findAll({ order: [['id', 'ASC']] });
    res.json(utilizadores);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /utilizadores/:id -> dados de um utilizador
exports.utilizador_detail = async (req, res) => {
  try {
    const utilizador = await Utilizador.findByPk(req.params.id);
    if (!utilizador) return res.status(404).json({ error: 'Utilizador nao encontrado' });
    res.json(utilizador);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /utilizadores/create -> insere um novo utilizador
exports.utilizador_create = async (req, res) => {
  try {
    const { nome, email, password, perfil } = req.body;
    const novo = await Utilizador.create({ nome, email, password, perfil });
    res.status(201).json(novo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// PUT /utilizadores/update/:id -> atualiza um utilizador
exports.utilizador_update = async (req, res) => {
  try {
    const utilizador = await Utilizador.findByPk(req.params.id);
    if (!utilizador) return res.status(404).json({ error: 'Utilizador nao encontrado' });
    const { nome, email, password, perfil } = req.body;
    await utilizador.update({ nome, email, password, perfil });
    res.json(utilizador);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /utilizadores/delete/:id -> elimina um utilizador
exports.utilizador_delete = async (req, res) => {
  try {
    const utilizador = await Utilizador.findByPk(req.params.id);
    if (!utilizador) return res.status(404).json({ error: 'Utilizador nao encontrado' });
    await utilizador.destroy();
    res.json({ status: 'success', message: 'Utilizador eliminado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
