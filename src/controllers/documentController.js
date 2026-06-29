const { Op } = require('sequelize');
const { Document, User } = require('../models');
const { recordAudit } = require('../utils/audit');

const INCLUDE_USERS = [
  { model: User, as: 'cliente', attributes: ['id', 'name', 'email'] },
  { model: User, as: 'autor', attributes: ['id', 'name'] },
];

const isClient = (req) => req.user && req.user.role === 'client';
// Um cliente ve os seus documentos + os globais (visibility 'global' ou sem cliente)
const clientWhere = (req) => ({
  [Op.or]: [{ client_id: req.user.id }, { client_id: null }, { visibility: 'global' }],
});

// GET /documents
exports.document_list = async (req, res) => {
  try {
    const where = isClient(req) ? clientWhere(req) : {};
    const docs = await Document.findAll({ where, attributes: { exclude: ['file_data'] }, include: INCLUDE_USERS, order: [['id', 'ASC']] });
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /documents/:id
exports.document_detail = async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id, { include: INCLUDE_USERS });
    if (!doc) return res.status(404).json({ error: 'Documento nao encontrado' });
    if (isClient(req) && doc.client_id !== req.user.id && doc.client_id !== null && doc.visibility !== 'global') {
      return res.status(403).json({ error: 'Sem acesso a este documento.' });
    }
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /documents/create
exports.document_create = async (req, res) => {
  try {
    const { name, file_type, file_size, file_path, file_data, category, visibility, client_id, uploaded_by } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome do documento obrigatorio.' });
    // Um cliente so pode submeter documentos para si proprio (e nunca globais)
    const ehCliente = req.user && req.user.role === 'client';
    const dono = ehCliente ? req.user.id : (client_id || null);
    const vis = ehCliente ? 'client' : (visibility || 'client');
    const novo = await Document.create({
      name, file_type, file_size, file_path, file_data, category, visibility: vis,
      client_id: dono,
      uploaded_by: req.user ? req.user.id : (uploaded_by || null),
    });
    recordAudit(req, { action: `Documento adicionado: ${name}`, category: 'documents', severity: 'info' });
    res.status(201).json(novo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// PUT /documents/update/:id
exports.document_update = async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Documento nao encontrado' });
    const { name, file_type, file_size, file_path, category, visibility, client_id, uploaded_by } = req.body;
    await doc.update({
      name, file_type, file_size, file_path, category, visibility,
      client_id: client_id || null,
      uploaded_by: uploaded_by || null,
    });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /documents/delete/:id
exports.document_delete = async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Documento nao encontrado' });
    await doc.destroy();
    res.json({ status: 'success', message: 'Documento eliminado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
