const { ServiceRequest, User } = require('../models');

const INCLUDE_USERS = [
  { model: User, as: 'cliente', attributes: ['id', 'name', 'email'] },
  { model: User, as: 'responsavel', attributes: ['id', 'name'] },
];

const isClient = (req) => req.user && req.user.role === 'client';

// GET /service-requests
exports.servicerequest_list = async (req, res) => {
  try {
    const where = isClient(req) ? { client_id: req.user.id } : {};
    const pedidos = await ServiceRequest.findAll({ where, include: INCLUDE_USERS, order: [['id', 'ASC']] });
    res.json(pedidos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /service-requests/:id
exports.servicerequest_detail = async (req, res) => {
  try {
    const pedido = await ServiceRequest.findByPk(req.params.id, { include: INCLUDE_USERS });
    if (!pedido) return res.status(404).json({ error: 'Pedido nao encontrado' });
    if (isClient(req) && pedido.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem acesso a este pedido.' });
    }
    res.json(pedido);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /service-requests/create
exports.servicerequest_create = async (req, res) => {
  try {
    let { title, description, status, client_id, assigned_to, request_date } = req.body;
    if (isClient(req)) client_id = req.user.id; // cliente so cria pedidos para si proprio
    if (!title || !client_id) {
      return res.status(400).json({ error: 'Título e cliente são obrigatórios.' });
    }
    const novo = await ServiceRequest.create({
      title, description, status, client_id,
      assigned_to: assigned_to || null,
      request_date: request_date || undefined, // deixa o DEFAULT CURRENT_DATE se vazio
    });
    res.status(201).json(novo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// PUT /service-requests/update/:id
exports.servicerequest_update = async (req, res) => {
  try {
    const pedido = await ServiceRequest.findByPk(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido nao encontrado' });
    const { title, description, status, client_id, assigned_to, request_date } = req.body;
    await pedido.update({
      title, description, status, client_id,
      assigned_to: assigned_to || null,
      request_date: request_date || null,
    });
    res.json(pedido);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /service-requests/delete/:id
exports.servicerequest_delete = async (req, res) => {
  try {
    const pedido = await ServiceRequest.findByPk(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido nao encontrado' });
    await pedido.destroy();
    res.json({ status: 'success', message: 'Pedido eliminado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
