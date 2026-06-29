const { AnnualService, User } = require('../models');

const INCLUDE_USERS = [
  { model: User, as: 'cliente', attributes: ['id', 'name'] },
  { model: User, as: 'responsavel', attributes: ['id', 'name'] },
];

// GET /annual-services
exports.annualservice_list = async (req, res) => {
  try {
    const servicos = await AnnualService.findAll({ include: INCLUDE_USERS, order: [['id', 'ASC']] });
    res.json(servicos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /annual-services/:id
exports.annualservice_detail = async (req, res) => {
  try {
    const servico = await AnnualService.findByPk(req.params.id, { include: INCLUDE_USERS });
    if (!servico) return res.status(404).json({ error: 'Servico anual nao encontrado' });
    res.json(servico);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /annual-services/create
exports.annualservice_create = async (req, res) => {
  try {
    const { client_name, client_id, service_type, service_name, start_date, deadline, status, progress, assigned_to, notes } = req.body;
    if (!client_name || !service_type || !service_name || !start_date || !deadline) {
      return res.status(400).json({ error: 'Cliente, tipo, nome, data de início e prazo são obrigatórios.' });
    }
    const novo = await AnnualService.create({
      client_name, client_id: client_id || null, service_type, service_name,
      start_date, deadline, status, progress, assigned_to: assigned_to || null, notes,
    });
    res.status(201).json(novo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// PUT /annual-services/update/:id
exports.annualservice_update = async (req, res) => {
  try {
    const servico = await AnnualService.findByPk(req.params.id);
    if (!servico) return res.status(404).json({ error: 'Servico anual nao encontrado' });
    const { client_name, client_id, service_type, service_name, start_date, deadline, status, progress, assigned_to, notes } = req.body;
    await servico.update({
      client_name, client_id: client_id || null, service_type, service_name,
      start_date, deadline, status, progress, assigned_to: assigned_to || null, notes,
    });
    res.json(servico);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /annual-services/delete/:id
exports.annualservice_delete = async (req, res) => {
  try {
    const servico = await AnnualService.findByPk(req.params.id);
    if (!servico) return res.status(404).json({ error: 'Servico anual nao encontrado' });
    await servico.destroy();
    res.json({ status: 'success', message: 'Servico anual eliminado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
