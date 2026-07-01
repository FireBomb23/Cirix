const { TechAsset, User } = require('../models');
const { recordAudit } = require('../utils/audit');

const INCLUDE = [{ model: User, as: 'cliente', attributes: ['id', 'name', 'email'] }];
const isClient = (req) => req.user && req.user.role === 'client';

// GET /tech-assets  (cliente: os seus; staff: todos ou ?client_id=)
exports.asset_list = async (req, res) => {
  try {
    const where = isClient(req)
      ? { client_id: req.user.id }
      : (req.query.client_id ? { client_id: req.query.client_id } : {});
    const rows = await TechAsset.findAll({ where, include: INCLUDE, order: [['id', 'DESC']] });
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /tech-assets/create
exports.asset_create = async (req, res) => {
  try {
    let { client_id, name, asset_type, quantity, location, criticality, notes } = req.body;
    if (isClient(req)) client_id = req.user.id;
    if (!name || !client_id) return res.status(400).json({ error: 'Nome e cliente sao obrigatorios.' });
    const n = await TechAsset.create({ client_id, name, asset_type, quantity: quantity || 1, location, criticality, notes });
    recordAudit(req, { action: `Ativo tecnologico registado: ${name}`, category: 'documents', severity: 'info' });
    res.status(201).json(n);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

// POST /tech-assets/bulk  { client_id?, items:[...] }  -> importacao de Excel (bonus)
exports.asset_bulk = async (req, res) => {
  try {
    const cid = isClient(req) ? req.user.id : req.body.client_id;
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (!cid || items.length === 0) return res.status(400).json({ error: 'Sem dados para importar.' });
    const toInsert = items
      .filter((i) => i && i.name)
      .map((i) => ({
        client_id: cid,
        name: String(i.name),
        asset_type: i.asset_type || i.tipo || null,
        quantity: Number(i.quantity || i.quantidade) || 1,
        location: i.location || i.localizacao || null,
        criticality: (i.criticality || i.criticidade || 'media'),
        notes: i.notes || i.notas || null,
      }));
    const rows = await TechAsset.bulkCreate(toInsert);
    recordAudit(req, { action: `Importados ${rows.length} ativos tecnologicos (Excel)`, category: 'documents', severity: 'info' });
    res.status(201).json({ status: 'success', inserted: rows.length });
  } catch (e) { res.status(400).json({ error: e.message }); }
};

// DELETE /tech-assets/delete/:id
exports.asset_delete = async (req, res) => {
  try {
    const a = await TechAsset.findByPk(req.params.id);
    if (!a) return res.status(404).json({ error: 'Ativo nao encontrado' });
    if (isClient(req) && a.client_id !== req.user.id) return res.status(403).json({ error: 'Sem acesso.' });
    await a.destroy();
    res.json({ status: 'success' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
