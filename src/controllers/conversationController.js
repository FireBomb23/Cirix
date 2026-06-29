const { Op } = require('sequelize');
const { Conversation, MessageLine, User } = require('../models');

const PART = [
  { model: User, as: 'participante1', attributes: ['id', 'name', 'email', 'role'] },
  { model: User, as: 'participante2', attributes: ['id', 'name', 'email', 'role'] },
];
const SENDER = { model: User, as: 'sender', attributes: ['id', 'name', 'role'] };

// O utilizador autenticado tem de ser um dos participantes da conversa
const isParticipant = (convo, uid) =>
  Number(convo.client_id) === Number(uid) || Number(convo.staff_id) === Number(uid);

// GET /conversations  -> apenas as conversas do proprio utilizador
exports.conversation_list = async (req, res) => {
  try {
    const uid = req.user.id;
    const convos = await Conversation.findAll({
      where: { [Op.or]: [{ client_id: uid }, { staff_id: uid }] },
      include: PART,
      order: [['updated_at', 'DESC'], ['id', 'DESC']],
    });
    // Junta a ultima mensagem de cada conversa (para previews / nao lidas)
    const result = [];
    for (const c of convos) {
      const last = await MessageLine.findOne({ where: { conversation_id: c.id }, order: [['sent_at', 'DESC'], ['id', 'DESC']] });
      const j = c.toJSON();
      j.last_message_at = last ? last.sent_at : null;
      j.last_sender_id = last ? last.sender_id : null;
      result.push(j);
    }
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /conversations/:id  (com mensagens)
exports.conversation_detail = async (req, res) => {
  try {
    const convo = await Conversation.findByPk(req.params.id, {
      include: [...PART, { model: MessageLine, as: 'messages', include: [SENDER] }],
    });
    if (!convo) return res.status(404).json({ error: 'Conversa nao encontrada' });
    if (!isParticipant(convo, req.user.id)) return res.status(403).json({ error: 'Sem acesso a esta conversa.' });
    res.json(convo);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /conversations/create  { user_a, user_b, subject }
exports.conversation_create = async (req, res) => {
  try {
    const { user_a, user_b, subject } = req.body;
    if (Number(user_a) !== Number(req.user.id) && Number(user_b) !== Number(req.user.id)) {
      return res.status(403).json({ error: 'Só podes criar conversas onde participas.' });
    }
    const novo = await Conversation.create({ client_id: user_a, staff_id: user_b || null, subject: subject || null });
    const full = await Conversation.findByPk(novo.id, { include: PART });
    res.status(201).json(full);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// POST /conversations/ensure  { user_a, user_b } -> encontra (em qualquer ordem) ou cria
exports.conversation_ensure = async (req, res) => {
  try {
    const { user_a, user_b, subject } = req.body;
    if (!user_a || !user_b) return res.status(400).json({ error: 'user_a e user_b sao obrigatorios' });
    if (Number(user_a) !== Number(req.user.id) && Number(user_b) !== Number(req.user.id)) {
      return res.status(403).json({ error: 'Só podes abrir conversas onde participas.' });
    }
    let convo = await Conversation.findOne({
      where: {
        [Op.or]: [
          { client_id: user_a, staff_id: user_b },
          { client_id: user_b, staff_id: user_a },
        ],
      },
      order: [['id', 'ASC']],
    });
    if (!convo) convo = await Conversation.create({ client_id: user_a, staff_id: user_b, subject: subject || 'Conversa' });
    const full = await Conversation.findByPk(convo.id, { include: PART });
    res.json(full);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /conversations/delete/:id
exports.conversation_delete = async (req, res) => {
  try {
    const convo = await Conversation.findByPk(req.params.id);
    if (!convo) return res.status(404).json({ error: 'Conversa nao encontrada' });
    if (!isParticipant(convo, req.user.id) && req.user.role === 'client') {
      return res.status(403).json({ error: 'Sem acesso a esta conversa.' });
    }
    await convo.destroy();
    res.json({ status: 'success', message: 'Conversa eliminada' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /conversations/:id/messages
exports.message_list = async (req, res) => {
  try {
    const convo = await Conversation.findByPk(req.params.id);
    if (!convo) return res.status(404).json({ error: 'Conversa nao encontrada' });
    if (!isParticipant(convo, req.user.id)) return res.status(403).json({ error: 'Sem acesso a esta conversa.' });
    const msgs = await MessageLine.findAll({
      where: { conversation_id: req.params.id },
      include: [SENDER],
      order: [['sent_at', 'ASC'], ['id', 'ASC']],
    });
    res.json(msgs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /conversations/:id/messages  { content }
exports.message_create = async (req, res) => {
  try {
    const convo = await Conversation.findByPk(req.params.id);
    if (!convo) return res.status(404).json({ error: 'Conversa nao encontrada' });
    if (!isParticipant(convo, req.user.id)) return res.status(403).json({ error: 'Sem acesso a esta conversa.' });
    const { content } = req.body;
    // O remetente e sempre o utilizador autenticado (nao confia no body)
    const novo = await MessageLine.create({ conversation_id: req.params.id, sender_id: req.user.id, content });
    await convo.update({ unread_count: (convo.unread_count || 0) + 1 }); // bump updated_at
    const full = await MessageLine.findByPk(novo.id, { include: [SENDER] });
    res.status(201).json(full);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
