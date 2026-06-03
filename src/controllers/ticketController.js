const { Ticket, User } = require('../models');

const INCLUDE_USERS = [
  { model: User, as: 'cliente', attributes: ['id', 'name', 'email'] },
  { model: User, as: 'responsavel', attributes: ['id', 'name'] },
];

// GET /tickets
exports.ticket_list = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({ include: INCLUDE_USERS, order: [['id', 'ASC']] });
    res.json(tickets);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /tickets/:id
exports.ticket_detail = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, { include: INCLUDE_USERS });
    if (!ticket) return res.status(404).json({ error: 'Ticket nao encontrado' });
    res.json(ticket);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /tickets/create
exports.ticket_create = async (req, res) => {
  try {
    const { title, description, category, priority, status, client_id, assigned_to } = req.body;
    const novo = await Ticket.create({
      title, description, category, priority, status, client_id,
      assigned_to: assigned_to || null,
    });
    res.status(201).json(novo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// PUT /tickets/update/:id
exports.ticket_update = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket nao encontrado' });
    const { title, description, category, priority, status, client_id, assigned_to } = req.body;
    await ticket.update({
      title, description, category, priority, status, client_id,
      assigned_to: assigned_to || null,
    });
    res.json(ticket);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /tickets/delete/:id
exports.ticket_delete = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket nao encontrado' });
    await ticket.destroy();
    res.json({ status: 'success', message: 'Ticket eliminado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
