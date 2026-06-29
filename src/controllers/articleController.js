const { Article } = require('../models');
const { recordAudit } = require('../utils/audit');

// GET /articles  (mais recentes primeiro)
exports.article_list = async (req, res) => {
  try {
    const artigos = await Article.findAll({ order: [['published_at', 'DESC'], ['id', 'DESC']] });
    res.json(artigos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /articles/:id
exports.article_detail = async (req, res) => {
  try {
    const artigo = await Article.findByPk(req.params.id);
    if (!artigo) return res.status(404).json({ error: 'Artigo nao encontrado' });
    res.json(artigo);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /articles/create
exports.article_create = async (req, res) => {
  try {
    const { title, excerpt, content, author, category, published, published_at, created_by } = req.body;
    if (!title || !author) {
      return res.status(400).json({ error: 'Título e autor são obrigatórios.' });
    }
    const novo = await Article.create({
      title, excerpt, content, author, category,
      published: published !== undefined ? published : true,
      published_at: published_at || new Date().toISOString().split('T')[0],
      created_by: created_by || null,
    });
    recordAudit(req, { action: `Artigo publicado: ${title}`, category: 'content', severity: 'info' });
    res.status(201).json(novo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// PUT /articles/update/:id
exports.article_update = async (req, res) => {
  try {
    const artigo = await Article.findByPk(req.params.id);
    if (!artigo) return res.status(404).json({ error: 'Artigo nao encontrado' });
    const { title, excerpt, content, author, category, published, published_at } = req.body;
    await artigo.update({ title, excerpt, content, author, category, published, published_at });
    res.json(artigo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /articles/delete/:id
exports.article_delete = async (req, res) => {
  try {
    const artigo = await Article.findByPk(req.params.id);
    if (!artigo) return res.status(404).json({ error: 'Artigo nao encontrado' });
    await artigo.destroy();
    res.json({ status: 'success', message: 'Artigo eliminado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
