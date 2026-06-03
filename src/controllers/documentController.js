const { Document, User } = require('../models');

const INCLUDE_USERS = [
  { model: User, as: 'cliente', attributes: ['id', 'name', 'email'] },
  { model: User, as: 'autor', attributes: ['id', 'name'] },
];

// GET /documents
exports.document_list = async (req, res) => {
  try {
    const docs = await Document.findAll({ include: INCLUDE_USERS, order: [['id', 'ASC']] });
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
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /documents/create
exports.document_create = async (req, res) => {
  try {
    const { name, file_type, file_size, file_path, category, visibility, client_id, uploaded_by } = req.body;
    const novo = await Document.create({
      name, file_type, file_size, file_path, category, visibility,
      client_id: client_id || null,
      uploaded_by: uploaded_by || null,
    });
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
