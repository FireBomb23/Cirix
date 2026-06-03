const { User } = require('../models');

// Nao expor o password_hash nas listagens
const SEM_PASSWORD = { exclude: ['password_hash'] };

// GET /users
exports.user_list = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: SEM_PASSWORD, order: [['id', 'ASC']] });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /users/:id
exports.user_detail = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: SEM_PASSWORD });
    if (!user) return res.status(404).json({ error: 'Utilizador nao encontrado' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /users/create
exports.user_create = async (req, res) => {
  try {
    const { name, email, password_hash, role, company, active } = req.body;
    const novo = await User.create({ name, email, password_hash, role, company, active });
    const { password_hash: _omit, ...semPass } = novo.toJSON();
    res.status(201).json(semPass);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// PUT /users/update/:id
exports.user_update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilizador nao encontrado' });
    const { name, email, password_hash, role, company, active } = req.body;
    const dados = { name, email, role, company, active };
    // So altera a password se vier preenchida
    if (password_hash) dados.password_hash = password_hash;
    await user.update(dados);
    const { password_hash: _omit, ...semPass } = user.toJSON();
    res.json(semPass);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /users/delete/:id
exports.user_delete = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilizador nao encontrado' });
    await user.destroy();
    res.json({ status: 'success', message: 'Utilizador eliminado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
