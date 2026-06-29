const { ContactSubmission } = require('../models');

// POST /contact  (submissao publica do formulario de contacto)
exports.contact_create = async (req, res) => {
  try {
    const { name, email, company, phone, message } = req.body;
    const nova = await ContactSubmission.create({
      name, email, company: company || null, phone: phone || null, message,
    });
    res.status(201).json({ status: 'success', submission: nova });
  } catch (e) {
    res.status(400).json({ status: 'error', error: e.message });
  }
};

// GET /contact  (caixa de entrada - area de gestao)
exports.contact_list = async (req, res) => {
  try {
    const mensagens = await ContactSubmission.findAll({ order: [['submitted_at', 'DESC'], ['id', 'DESC']] });
    res.json(mensagens);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /contact/:id
exports.contact_detail = async (req, res) => {
  try {
    const msg = await ContactSubmission.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Mensagem nao encontrada' });
    res.json(msg);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// PUT /contact/update/:id  (marcar como lida / nao lida)
exports.contact_update = async (req, res) => {
  try {
    const msg = await ContactSubmission.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Mensagem nao encontrada' });
    const { read, reply } = req.body;
    const dados = {};
    if (reply !== undefined && reply !== null) {
      dados.reply = reply;
      dados.replied_at = new Date();
      dados.read = true; // responder marca tambem como lida
    } else if (read !== undefined) {
      dados.read = read;
    } else {
      dados.read = true;
    }
    await msg.update(dados);
    res.json(msg);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /contact/delete/:id
exports.contact_delete = async (req, res) => {
  try {
    const msg = await ContactSubmission.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Mensagem nao encontrada' });
    await msg.destroy();
    res.json({ status: 'success', message: 'Mensagem eliminada' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
