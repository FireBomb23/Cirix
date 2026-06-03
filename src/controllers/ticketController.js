const { Ticket } = require('../models');

// GET /tickets -> lista todos os tickets
exports.ticket_list = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({ order: [['id', 'ASC']] });
    res.json(tickets);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /tickets/:id -> dados de um ticket
exports.ticket_detail = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket nao encontrado' });
    res.json(ticket);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /tickets/create -> insere um novo ticket
exports.ticket_create = async (req, res) => {
  try {
    const { assunto, estado, data_criacao, data_resolucao } = req.body;
    const novo = await Ticket.create({ assunto, estado, data_criacao, data_resolucao });
    res.status(201).json(novo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// PUT /tickets/update/:id -> atualiza um ticket
exports.ticket_update = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket nao encontrado' });
    const { assunto, estado, data_criacao, data_resolucao } = req.body;
    await ticket.update({ assunto, estado, data_criacao, data_resolucao });
    res.json(ticket);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /tickets/delete/:id -> elimina um ticket
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
