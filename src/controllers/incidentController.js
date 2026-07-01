const { SecurityIncident, User } = require('../models');
const { recordAudit } = require('../utils/audit');

const INCLUDE = [{ model: User, as: 'cliente', attributes: ['id', 'name', 'email'] }];
const isClient = (req) => req.user && req.user.role === 'client';

// GET /incidents
exports.incident_list = async (req, res) => {
  try {
    const where = isClient(req)
      ? { client_id: req.user.id }
      : (req.query.client_id ? { client_id: req.query.client_id } : {});
    const rows = await SecurityIncident.findAll({ where, include: INCLUDE, order: [['id', 'DESC']] });
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /incidents/create  (report de incidente - campos base CNCS)
exports.incident_create = async (req, res) => {
  try {
    let { client_id, title, incident_date, category, severity, description, impact, actions, status } = req.body;
    if (isClient(req)) client_id = req.user.id;
    if (!title || !client_id) return res.status(400).json({ error: 'Titulo e cliente sao obrigatorios.' });
    const n = await SecurityIncident.create({
      client_id, title, incident_date: incident_date || null, category,
      severity: severity || 'media', description, impact, actions, status: status || 'aberto',
    });
    recordAudit(req, { action: `Incidente reportado: ${title}`, category: 'security', severity: 'warning' });
    res.status(201).json(n);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

// PUT /incidents/update/:id  (staff altera estado/campos)
exports.incident_update = async (req, res) => {
  try {
    const inc = await SecurityIncident.findByPk(req.params.id);
    if (!inc) return res.status(404).json({ error: 'Incidente nao encontrado' });
    const { title, incident_date, category, severity, description, impact, actions, status } = req.body;
    await inc.update({ title, incident_date, category, severity, description, impact, actions, status });
    res.json(inc);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

// DELETE /incidents/delete/:id
exports.incident_delete = async (req, res) => {
  try {
    const inc = await SecurityIncident.findByPk(req.params.id);
    if (!inc) return res.status(404).json({ error: 'Incidente nao encontrado' });
    if (isClient(req) && inc.client_id !== req.user.id) return res.status(403).json({ error: 'Sem acesso.' });
    await inc.destroy();
    res.json({ status: 'success' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
