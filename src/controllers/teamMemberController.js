const { TeamMember } = require('../models');

// GET /team  (membros ativos, pela ordem definida)
exports.team_list = async (req, res) => {
  try {
    const equipa = await TeamMember.findAll({ order: [['sort_order', 'ASC'], ['id', 'ASC']] });
    res.json(equipa);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /team/:id
exports.team_detail = async (req, res) => {
  try {
    const membro = await TeamMember.findByPk(req.params.id);
    if (!membro) return res.status(404).json({ error: 'Membro nao encontrado' });
    res.json(membro);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /team/create
exports.team_create = async (req, res) => {
  try {
    const { name, role_label, initials, user_id, sort_order, active } = req.body;
    const novo = await TeamMember.create({ name, role_label, initials, user_id: user_id || null, sort_order, active });
    res.status(201).json(novo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// PUT /team/update/:id
exports.team_update = async (req, res) => {
  try {
    const membro = await TeamMember.findByPk(req.params.id);
    if (!membro) return res.status(404).json({ error: 'Membro nao encontrado' });
    const { name, role_label, initials, user_id, sort_order, active } = req.body;
    await membro.update({ name, role_label, initials, user_id: user_id || null, sort_order, active });
    res.json(membro);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /team/delete/:id
exports.team_delete = async (req, res) => {
  try {
    const membro = await TeamMember.findByPk(req.params.id);
    if (!membro) return res.status(404).json({ error: 'Membro nao encontrado' });
    await membro.destroy();
    res.json({ status: 'success', message: 'Membro eliminado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
