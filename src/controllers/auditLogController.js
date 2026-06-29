const { AuditLog, User } = require('../models');

const INCLUDE_USER = [{ model: User, as: 'utilizador', attributes: ['id', 'name', 'email'] }];

// GET /audit-log  (eventos mais recentes primeiro)
exports.auditlog_list = async (req, res) => {
  try {
    const eventos = await AuditLog.findAll({ include: INCLUDE_USER, order: [['created_at', 'DESC'], ['id', 'DESC']] });
    res.json(eventos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /audit-log/:id
exports.auditlog_detail = async (req, res) => {
  try {
    const evento = await AuditLog.findByPk(req.params.id, { include: INCLUDE_USER });
    if (!evento) return res.status(404).json({ error: 'Evento nao encontrado' });
    res.json(evento);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /audit-log/create
exports.auditlog_create = async (req, res) => {
  try {
    const { action, category, severity, user_id, user_email, ip_address } = req.body;
    const novo = await AuditLog.create({
      action, category, severity, user_id: user_id || null, user_email, ip_address,
    });
    res.status(201).json(novo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /audit-log/delete/:id
exports.auditlog_delete = async (req, res) => {
  try {
    const evento = await AuditLog.findByPk(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Evento nao encontrado' });
    await evento.destroy();
    res.json({ status: 'success', message: 'Evento eliminado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
