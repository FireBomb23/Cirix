const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/auth');
const { recordAudit } = require('../utils/audit');

// Nao expor a password nem as palavras de seguranca (2FA) nas listagens
const SEM_PASSWORD = { exclude: ['password_hash', 'twofa_word1', 'twofa_word2', 'twofa_word3'] };

// Deteta se um valor ja e um hash bcrypt (compatibilidade com dados antigos em texto simples)
const isHashed = (s) => typeof s === 'string' && /^\$2[aby]\$/.test(s);

// Devolve os dados do utilizador sem campos sensiveis (password e palavras 2FA)
function publicUser(user) {
  const u = user.toJSON ? user.toJSON() : user;
  const { password_hash, twofa_word1, twofa_word2, twofa_word3, ...rest } = u;
  return rest;
}

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

const wordsOf = (user) => [user.twofa_word1, user.twofa_word2, user.twofa_word3]
  .filter(Boolean)
  .map((w) => String(w).toLowerCase());

// Regra de password (tamanho minimo)
const MIN_PW = 6;
const passwordCurta = (p) => !p || String(p).length < MIN_PW;

// Protecao simples contra forca-bruta no login (sem dependencias, em memoria)
const LOGIN_MAX = 5;
const LOGIN_WINDOW = 15 * 60 * 1000; // 15 minutos
const loginFails = new Map(); // email -> { count, first }
function loginBloqueado(email) {
  const r = loginFails.get(email);
  if (!r) return false;
  if (Date.now() - r.first > LOGIN_WINDOW) { loginFails.delete(email); return false; }
  return r.count >= LOGIN_MAX;
}
function registaFalha(email) {
  const r = loginFails.get(email);
  if (!r || Date.now() - r.first > LOGIN_WINDOW) loginFails.set(email, { count: 1, first: Date.now() });
  else r.count += 1;
}
function limpaFalhas(email) { loginFails.delete(email); }

// POST /users/login  -> 1o passo: valida email+password
exports.user_login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (loginBloqueado(email)) {
      recordAudit(req, { action: `Login bloqueado (muitas tentativas): ${email}`, category: 'security', severity: 'critical', user_id: null, user_email: email });
      return res.status(429).json({ status: 'error', message: 'Demasiadas tentativas falhadas. Tente novamente daqui a alguns minutos.' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      registaFalha(email);
      recordAudit(req, { action: `Tentativa de login falhada: ${email}`, category: 'security', severity: 'warning', user_id: null, user_email: email });
      return res.status(401).json({ status: 'error', message: 'Credenciais inválidas.' });
    }
    if (!user.active) return res.status(403).json({ status: 'error', message: 'Conta desativada.' });

    let ok;
    if (isHashed(user.password_hash)) {
      ok = bcrypt.compareSync(password, user.password_hash);
    } else {
      ok = user.password_hash === password;
      if (ok) {
        user.password_hash = await bcrypt.hash(password, 10);
        await user.save({ hooks: false });
      }
    }
    if (!ok) {
      registaFalha(email);
      recordAudit(req, { action: `Tentativa de login falhada: ${email}`, category: 'security', severity: 'warning', user_id: user.id, user_email: user.email });
      return res.status(401).json({ status: 'error', message: 'Credenciais inválidas.' });
    }
    limpaFalhas(email); // password correta -> limpa o contador de tentativas

    // Se tiver palavras de seguranca, exige 2o passo (2FA) - sem revelar as palavras
    if (wordsOf(user).length > 0) {
      return res.json({ status: '2fa_required', userId: user.id, name: user.name });
    }

    recordAudit(req, { action: 'Login realizado', category: 'authentication', severity: 'info', user_id: user.id, user_email: user.email });
    res.json({ status: 'success', token: signToken(user), user: publicUser(user) });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
};

// POST /users/verify-2fa  -> 2o passo: valida a palavra de seguranca (no servidor)
exports.user_verify_2fa = async (req, res) => {
  try {
    const { userId, word } = req.body;
    const user = await User.findByPk(userId);
    if (!user || !user.active) return res.status(401).json({ status: 'error', message: 'Sessão inválida.' });
    const typed = String(word || '').trim().toLowerCase();
    if (!typed || !wordsOf(user).includes(typed)) {
      recordAudit(req, { action: `2FA falhado: ${user.email}`, category: 'security', severity: 'warning', user_id: user.id, user_email: user.email });
      return res.status(401).json({ status: 'error', message: 'Palavra de segurança incorreta.' });
    }
    recordAudit(req, { action: 'Login realizado (2FA)', category: 'authentication', severity: 'info', user_id: user.id, user_email: user.email });
    res.json({ status: 'success', token: signToken(user), user: publicUser(user) });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
};

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

// PUT /users/me  -> o proprio utilizador altera o seu nome/password
exports.user_update_me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilizador nao encontrado' });
    const { name, password } = req.body;
    if (password && passwordCurta(password)) {
      return res.status(400).json({ error: 'A password deve ter pelo menos 6 caracteres.' });
    }
    const dados = {};
    if (name) dados.name = name;
    if (password) dados.password_hash = password; // o hook do model faz o hash
    await user.update(dados);
    recordAudit(req, { action: 'Conta atualizada (perfil/password)', category: 'users', severity: 'info', user_id: user.id, user_email: user.email });
    res.json(publicUser(user));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// POST /users/create  (o hash da password e feito pelo model - hook beforeCreate)
exports.user_create = async (req, res) => {
  try {
    const { name, email, password_hash, role, company, active } = req.body;
    if (!name || !email || !password_hash) {
      return res.status(400).json({ error: 'Nome, email e password sao obrigatorios.' });
    }
    if (passwordCurta(password_hash)) {
      return res.status(400).json({ error: 'A password deve ter pelo menos 6 caracteres.' });
    }
    const novo = await User.create({ name, email, password_hash, role, company, active });
    recordAudit(req, { action: `Utilizador criado: ${email} (${role})`, category: 'users', severity: 'info' });
    res.status(201).json(publicUser(novo));
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email já registado.' });
    }
    res.status(400).json({ error: e.message });
  }
};

// PUT /users/update/:id  (o hash da nova password e feito pelo model - hook beforeUpdate)
exports.user_update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilizador nao encontrado' });
    const { name, email, password_hash, role, company, active } = req.body;
    if (password_hash && passwordCurta(password_hash)) {
      return res.status(400).json({ error: 'A password deve ter pelo menos 6 caracteres.' });
    }
    const eraAtivo = user.active;
    const dados = { name, email, role, company, active };
    if (password_hash) dados.password_hash = password_hash;
    await user.update(dados);
    if (active !== undefined && active !== eraAtivo) {
      recordAudit(req, { action: `Permissões ${active ? 'restauradas' : 'revogadas'}: ${user.email}`, category: 'users', severity: 'warning' });
    } else {
      recordAudit(req, { action: `Utilizador atualizado: ${user.email}`, category: 'users', severity: 'info' });
    }
    res.json(publicUser(user));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /users/delete/:id
exports.user_delete = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilizador nao encontrado' });
    const email = user.email;
    await user.destroy();
    recordAudit(req, { action: `Utilizador eliminado: ${email}`, category: 'users', severity: 'warning' });
    res.json({ status: 'success', message: 'Utilizador eliminado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
