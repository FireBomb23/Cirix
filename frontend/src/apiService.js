/**
 * apiService.js — chama o backend real (porta 3000).
 * Se a API falhar (rede em baixo, BD desligada, etc.), as funções lançam o erro
 * e o componente decide se usa mock como fallback.
 */
import api from './api.js';

// ── USERS ────────────────────────────────────────────────────────────────────

export async function apiGetUsers() {
  const { data } = await api.get('/users');
  return data; // array de utilizadores (sem password_hash)
}

export async function apiCreateUser({ name, email, password, role, company, phone }) {
  const { data } = await api.post('/users/create', {
    name,
    email,
    password_hash: password,   // backend guarda em plain text por enquanto
    role,
    company: company || '',
    active: true,
  });
  return data;
}

export async function apiToggleUserActive(id, active) {
  const { data } = await api.put(`/users/update/${id}`, { active });
  return data;
}

// ── TICKETS ──────────────────────────────────────────────────────────────────

export async function apiGetTickets() {
  const { data } = await api.get('/tickets');
  // Normalizar para o formato que os componentes esperam
  return data.map(normalizeTicket);
}

export async function apiCreateTicket({ title, description, category, priority, clientId }) {
  const { data } = await api.post('/tickets/create', {
    title,
    description,
    category,
    priority: priority || 'medium',
    status: 'open',
    client_id: Number(clientId),
  });
  return normalizeTicket(data);
}

export async function apiUpdateTicketStatus(id, status) {
  const { data } = await api.put(`/tickets/update/${id}`, { status });
  return normalizeTicket(data);
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
    assignedTo: t.responsavel?.name || t.assignedTo || 'Equipa Ciryx',
    comments: t.comments || [],   // tickets na BD não têm comentários ainda
    created_at: t.created_at || t.createdAt || new Date().toISOString(),
  };
}

// ── DOCUMENTS ────────────────────────────────────────────────────────────────

export async function apiGetDocuments() {
  const { data } = await api.get('/documents');
  return data.map(normalizeDocument);
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
    date: r.request_date || r.date || new Date().toISOString().split('T')[0],
  };
}
