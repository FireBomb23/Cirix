const { Ticket, User, TicketComment } = require('../models');
const { recordAudit } = require('../utils/audit');

const INCLUDE_USERS = [
  { model: User, as: 'cliente', attributes: ['id', 'name', 'email'] },
  { model: User, as: 'responsavel', attributes: ['id', 'name'] },
];

const INCLUDE_COMMENTS = {
  model: TicketComment, as: 'comments',
  include: [{ model: User, as: 'autor', attributes: ['id', 'name', 'role'] }],
};

// Um cliente so pode ver/usar os seus proprios tickets
const isClient = (req) => req.user && req.user.role === 'client';

// GET /tickets
exports.ticket_list = async (req, res) => {
  try {
    const where = isClient(req) ? { client_id: req.user.id } : {};
    const tickets = await Ticket.findAll({ where, include: INCLUDE_USERS, order: [['id', 'ASC']] });
    res.json(tickets);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /tickets/:id
exports.ticket_detail = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, { include: [...INCLUDE_USERS, INCLUDE_COMMENTS] });
    if (!ticket) return res.status(404).json({ error: 'Ticket nao encontrado' });
    if (isClient(req) && ticket.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem acesso a este ticket.' });
    }
    res.json(ticket);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /tickets/create
exports.ticket_create = async (req, res) => {
  try {
    let { title, description, category, priority, status, client_id, assigned_to } = req.body;
    if (isClient(req)) client_id = req.user.id; // cliente so cria tickets para si proprio
    if (!title || !category || !client_id) {
      return res.status(400).json({ error: 'Título, categoria e cliente são obrigatórios.' });
    }
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
    const eraResolvido = ticket.status === 'resolved';
    await ticket.update({
      title, description, category, priority, status, client_id,
      assigned_to: assigned_to || null,
    });
    if (status === 'resolved' && !eraResolvido) {
      recordAudit(req, { action: `Ticket resolvido: ${ticket.title}`, category: 'system', severity: 'info' });
    }
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

// GET /tickets/:id/comments
exports.ticket_comments_list = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket nao encontrado' });
    if (isClient(req) && ticket.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem acesso a este ticket.' });
    }
    const comentarios = await TicketComment.findAll({
      where: { ticket_id: req.params.id },
      include: [{ model: User, as: 'autor', attributes: ['id', 'name', 'role'] }],
      order: [['created_at', 'ASC'], ['id', 'ASC']],
    });
    res.json(comentarios);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /tickets/:id/comments
exports.ticket_comment_create = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket nao encontrado' });
    if (isClient(req) && ticket.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem acesso a este ticket.' });
    }
    const { content } = req.body;
    // O autor do comentario e sempre quem esta autenticado (nao confia no body)
    const novo = await TicketComment.create({ ticket_id: req.params.id, user_id: req.user.id, content });
    const completo = await TicketComment.findByPk(novo.id, {
      include: [{ model: User, as: 'autor', attributes: ['id', 'name', 'role'] }],
    });
    res.status(201).json(completo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
