const { Incidente, Cliente } = require('../models');

// GET /incidentes -> lista todos os incidentes (com o nome do cliente)
exports.incidente_list = async (req, res) => {
  try {
    const incidentes = await Incidente.findAll({
      order: [['id', 'ASC']],
      include: [{ model: Cliente, as: 'cliente', attributes: ['id', 'nome'] }],
    });
    res.json(incidentes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /incidentes/:id -> dados de um incidente
exports.incidente_detail = async (req, res) => {
  try {
    const incidente = await Incidente.findByPk(req.params.id, {
      include: [{ model: Cliente, as: 'cliente', attributes: ['id', 'nome'] }],
    });
    if (!incidente) return res.status(404).json({ error: 'Incidente nao encontrado' });
    res.json(incidente);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /incidentes/create -> insere um novo incidente
exports.incidente_create = async (req, res) => {
  try {
    const { cliente_id, descricao, severidade, estado, data_ocorrencia } = req.body;
    const novo = await Incidente.create({ cliente_id, descricao, severidade, estado, data_ocorrencia });
    res.status(201).json(novo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// PUT /incidentes/update/:id -> atualiza um incidente
exports.incidente_update = async (req, res) => {
  try {
    const incidente = await Incidente.findByPk(req.params.id);
    if (!incidente) return res.status(404).json({ error: 'Incidente nao encontrado' });
    const { cliente_id, descricao, severidade, estado, data_ocorrencia } = req.body;
    await incidente.update({ cliente_id, descricao, severidade, estado, data_ocorrencia });
    res.json(incidente);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /incidentes/delete/:id -> elimina um incidente
exports.incidente_delete = async (req, res) => {
  try {
    const incidente = await Incidente.findByPk(req.params.id);
    if (!incidente) return res.status(404).json({ error: 'Incidente nao encontrado' });
    await incidente.destroy();
    res.json({ status: 'success', message: 'Incidente eliminado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
