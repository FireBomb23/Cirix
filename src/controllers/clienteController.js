const { Cliente } = require('../models');

// GET /clientes -> lista todos os clientes
exports.cliente_list = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({ order: [['id', 'ASC']] });
    res.json(clientes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /clientes/:id -> dados de um cliente
exports.cliente_detail = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente nao encontrado' });
    res.json(cliente);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /clientes/create -> insere um novo cliente
exports.cliente_create = async (req, res) => {
  try {
    const { nome, estado_nis2 } = req.body;
    const novo = await Cliente.create({ nome, estado_nis2 });
    res.status(201).json(novo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// PUT /clientes/update/:id -> atualiza um cliente
exports.cliente_update = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente nao encontrado' });
    const { nome, estado_nis2 } = req.body;
    await cliente.update({ nome, estado_nis2 });
    res.json(cliente);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /clientes/delete/:id -> elimina um cliente
exports.cliente_delete = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente nao encontrado' });
    await cliente.destroy();
    res.json({ status: 'success', message: 'Cliente eliminado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
