/**
 * apiService.js — camada de acesso ao backend real (Express, porta 3000).
 * Todas as funcoes falam com a API. NAO existe qualquer fallback para dados fictícios.
 * Cada funcao lanca o erro se a API falhar, para que o componente o possa mostrar.
 */
import api from './api.js';

// ── USERS ────────────────────────────────────────────────────────────────────

export async function apiGetUsers() {
  const { data } = await api.get('/users');
  return data; // array de utilizadores (sem password_hash)
}

export async function apiCreateUser({ name, email, password, role, company }) {
  const { data } = await api.post('/users/create', {
    name,
    email,
    password_hash: password,
    role,
    company: company || '',
    active: true,
  });
  return data;
}

export async function apiUpdateUser(id, fields) {
  const { data } = await api.put(`/users/update/${id}`, fields);
  return data;
}

// O proprio utilizador altera o seu nome/password (qualquer perfil)
export async function apiUpdateMe({ name, password }) {
  const { data } = await api.put('/users/me', { name, password });
  return data;
}

export async function apiToggleUserActive(id, active) {
  const { data } = await api.put(`/users/update/${id}`, { active });
  return data;
}

export async function apiDeleteUser(id) {
  const { data } = await api.delete(`/users/delete/${id}`);
  return data;
}

// ── TICKETS ──────────────────────────────────────────────────────────────────

export async function apiGetTickets() {
  const { data } = await api.get('/tickets');
  return data.map(normalizeTicket);
}

export async function apiCreateTicket({ title, description, category, priority, clientId, assignedTo }) {
  const { data } = await api.post('/tickets/create', {
    title,
    description,
    category,
    priority: priority || 'medium',
    status: 'open',
    client_id: Number(clientId),
    assigned_to: assignedTo ? Number(assignedTo) : null,
  });
  return normalizeTicket(data);
}

export async function apiUpdateTicketStatus(id, status) {
  const { data } = await api.put(`/tickets/update/${id}`, { status });
  return normalizeTicket(data);
}

export async function apiGetTicketComments(ticketId) {
  const { data } = await api.get(`/tickets/${ticketId}/comments`);
  return data.map(normalizeComment);
}

export async function apiCreateTicketComment(ticketId, userId, content) {
  const { data } = await api.post(`/tickets/${ticketId}/comments`, {
    user_id: Number(userId),
    content,
  });
  return normalizeComment(data);
}

function normalizeComment(c) {
  return {
    id: String(c.id),
    author: c.autor?.name || 'Utilizador',
    isAdmin: !!(c.autor?.role && c.autor.role !== 'client'),
    text: c.content,
    date: c.created_at || new Date().toISOString(),
  };
}

function normalizeTicket(t) {
  return {
    id: String(t.id),
    title: t.title,
    description: t.description || '',
    category: t.category,
    priority: t.priority || 'medium',
    status: t.status || 'open',
    clientId: String(t.client_id ?? t.clientId ?? ''),
    clientName: t.cliente?.name || t.clientName || '',
    assignedTo: t.responsavel?.name || 'Equipa Ciryx',
    comments: Array.isArray(t.comments) ? t.comments.map(normalizeComment) : [],
    created_at: t.created_at || new Date().toISOString(),
  };
}

// ── DOCUMENTS ────────────────────────────────────────────────────────────────

export async function apiGetDocuments() {
  const { data } = await api.get('/documents');
  return data.map(normalizeDocument);
}

export async function apiCreateDocument(fields) {
  const { data } = await api.post('/documents/create', fields);
  return normalizeDocument(data);
}

// Vai buscar um documento com o conteudo (file_data) para download
export async function apiGetDocument(id) {
  const { data } = await api.get(`/documents/${id}`);
  return normalizeDocument(data);
}

function normalizeDocument(d) {
  return {
    id: String(d.id),
    name: d.name,
    type: d.file_type || d.type || 'PDF',
    size: d.file_size || d.size || '—',
    uploadDate: d.upload_date
      ? new Date(d.upload_date).toISOString().split('T')[0]
      : (d.uploadDate || '—'),
    category: d.category || '—',
    clientId: d.client_id ? String(d.client_id) : null,
    clientName: d.cliente?.name || null,
    fileData: d.file_data || null,
  };
}

// ── SERVICE REQUESTS ─────────────────────────────────────────────────────────

export async function apiGetServiceRequests() {
  const { data } = await api.get('/service-requests');
  return data.map(normalizeRequest);
}

export async function apiCreateServiceRequest({ title, description, clientId }) {
  const { data } = await api.post('/service-requests/create', {
    title,
    description,
    status: 'pending',
    client_id: Number(clientId),
    request_date: new Date().toISOString().split('T')[0],
  });
  return normalizeRequest(data);
}

function normalizeRequest(r) {
  return {
    id: String(r.id),
    title: r.title,
    description: r.description || '',
    status: r.status || 'pending',
    clientId: String(r.client_id ?? r.clientId ?? ''),
    clientName: r.cliente?.name || '',
    date: r.request_date || r.date || new Date().toISOString().split('T')[0],
  };
}

// ── ARTICLES (noticias) ──────────────────────────────────────────────────────

export async function apiGetArticles() {
  const { data } = await api.get('/articles');
  return data.map(normalizeArticle);
}

export async function apiCreateArticle({ title, excerpt, author, category }) {
  const { data } = await api.post('/articles/create', { title, excerpt, author, category });
  return normalizeArticle(data);
}

export async function apiUpdateArticle(id, { title, excerpt, author, category }) {
  const { data } = await api.put(`/articles/update/${id}`, { title, excerpt, author, category });
  return normalizeArticle(data);
}

export async function apiDeleteArticle(id) {
  const { data } = await api.delete(`/articles/delete/${id}`);
  return data;
}

function normalizeArticle(a) {
  return {
    id: String(a.id),
    title: a.title,
    excerpt: a.excerpt || '',
    content: a.content || '',
    author: a.author,
    category: a.category || 'Geral',
    date: a.published_at
      ? String(a.published_at).slice(0, 10)
      : (a.created_at ? String(a.created_at).slice(0, 10) : ''),
  };
}

// ── SERVICES (com features) ──────────────────────────────────────────────────

export async function apiGetServices() {
  const { data } = await api.get('/services');
  return data.map(normalizeService);
}

function normalizeService(s) {
  return {
    id: String(s.id),
    title: s.title,
    description: s.description || '',
    icon: s.icon || 'shield',
    features: Array.isArray(s.features) ? s.features.map((f) => f.feature) : [],
  };
}

// ── TEAM (Sobre Nos) ─────────────────────────────────────────────────────────

export async function apiGetTeam() {
  const { data } = await api.get('/team');
  return data.map((t) => ({
    id: String(t.id),
    name: t.name,
    role: t.role_label,
    initials: t.initials,
  }));
}

// ── ANNUAL SERVICES ──────────────────────────────────────────────────────────

export async function apiGetAnnualServices() {
  const { data } = await api.get('/annual-services');
  return data.map(normalizeAnnual);
}

function normalizeAnnual(s) {
  return {
    id: String(s.id),
    clientName: s.client_name,
    serviceType: s.service_type,
    serviceName: s.service_name,
    status: s.status || 'pending',
    progress: s.progress ?? 0,
    assignedTo: s.responsavel?.name || '—',
    notes: s.notes || '',
  };
}

// ── AUDIT LOG ────────────────────────────────────────────────────────────────

export async function apiGetAuditLog() {
  const { data } = await api.get('/audit-log');
  return data.map(normalizeAudit);
}

function normalizeAudit(e) {
  return {
    id: String(e.id),
    action: e.action,
    category: e.category,
    severity: e.severity || 'info',
    user: e.user_email || e.utilizador?.name || '—',
    ip: e.ip_address || '—',
    timestamp: e.created_at || new Date().toISOString(),
  };
}

// ── MENSAGENS (contact_submissions) ──────────────────────────────────────────

export async function apiGetMessages() {
  const { data } = await api.get('/contact');
  return data.map(normalizeMessage);
}

export async function apiMarkMessageRead(id, read = true) {
  const { data } = await api.put(`/contact/update/${id}`, { read });
  return normalizeMessage(data);
}

export async function apiReplyMessage(id, reply) {
  const { data } = await api.put(`/contact/update/${id}`, { reply });
  return normalizeMessage(data);
}

function normalizeMessage(m) {
  return {
    id: String(m.id),
    name: m.name,
    email: m.email,
    company: m.company || '',
    phone: m.phone || '',
    message: m.message,
    read: !!m.read,
    reply: m.reply || '',
    repliedAt: m.replied_at ? String(m.replied_at).slice(0, 16).replace('T', ' ') : '',
    date: m.submitted_at ? String(m.submitted_at).slice(0, 10) : '',
  };
}

// ── CHAT DIRETO (conversations / message_lines) entre quaisquer utilizadores ──

export async function apiGetConversations(userId) {
  const { data } = await api.get('/conversations', { params: userId ? { user_id: userId } : {} });
  return data.map(normalizeConversation);
}

export async function apiEnsureConversation(userA, userB) {
  const { data } = await api.post('/conversations/ensure', { user_a: Number(userA), user_b: Number(userB) });
  return normalizeConversation(data);
}

export async function apiGetConversationMessages(convId) {
  const { data } = await api.get(`/conversations/${convId}/messages`);
  return data.map(normalizeMessageLine);
}

export async function apiSendConversationMessage(convId, senderId, content) {
  const { data } = await api.post(`/conversations/${convId}/messages`, { sender_id: Number(senderId), content });
  return normalizeMessageLine(data);
}

function normalizeConversation(c) {
  const part = (u) => (u ? { id: String(u.id), name: u.name, role: u.role } : null);
  return {
    id: String(c.id),
    subject: c.subject || '',
    participant1: part(c.participante1),
    participant2: part(c.participante2),
    lastMessageAt: c.last_message_at || null,
    lastSenderId: c.last_sender_id != null ? String(c.last_sender_id) : null,
  };
}

function normalizeMessageLine(m) {
  return {
    id: String(m.id),
    senderId: String(m.sender_id),
    senderName: m.sender?.name || 'Utilizador',
    role: m.sender?.role || '',
    text: m.content,
    date: m.sent_at || new Date().toISOString(),
  };
}
