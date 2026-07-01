import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  apiGetUsers, apiCreateUser, apiToggleUserActive,
  apiGetTickets, apiUpdateTicketStatus, apiGetTicketComments, apiCreateTicketComment,
  apiGetArticles, apiCreateArticle, apiUpdateArticle, apiDeleteArticle,
  apiGetDocuments, apiCreateDocument, apiGetDocument, apiDeleteDocument, apiGetAnnualServices, apiGetAuditLog,
  apiGetMessages, apiMarkMessageRead, apiReplyMessage,
  apiGetConversations, apiEnsureConversation, apiGetConversationMessages, apiSendConversationMessage,
  apiUpdateMe,
  apiGetTechAssets, apiGetIncidents, apiGetPentests,
} from '../apiService.js';

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28" style={{ color: 'var(--yellow)' }}>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
);

// Mensagens, utilizadores, artigos, etc. sao carregados da API (ver useEffect).

const BLANK_USER_FORM = {
  role: 'client', name: '', email: '', phone: '', password: '',
  word1: '', word2: '', word3: '',
  securityName: '', securityEmail: '', securityPhone: '',
  contactName: '', contactEmail: '', contactPhone: '',
};

function statusBadge(s) {
  const map = {
    'in-progress': ['badge-yellow', 'Em Progresso'], 'completed': ['badge-green', 'Concluído'],
    'open': ['badge-blue', 'Aberto'], 'resolved': ['badge-gray', 'Resolvido'],
    'pending': ['badge-gray', 'Pendente'], 'overdue': ['badge-red', 'Atrasado'],
    'resolvido': ['badge-gray', 'Resolvido'], 'em-progresso': ['badge-yellow', 'Em Progresso'],
  };
  const [cls, label] = map[s] || ['badge-gray', s];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function priorityBadge(p) {
  const m = { urgent: 'badge-red', high: 'badge-orange', medium: 'badge-yellow', low: 'badge-gray', critical: 'badge-red' };
  const l = { urgent: 'Urgente', high: 'Alta', medium: 'Média', low: 'Baixa', critical: 'Crítico' };
  return <span className={`badge ${m[p] || 'badge-gray'}`}>{l[p] || p}</span>;
}

function severityDot(s) { return <span className={`audit-dot ${s}`} />; }

function RiskGauge({ score }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
  const level = score >= 80 ? 'Baixo' : score >= 60 ? 'Médio' : 'Alto';
  return (
    <div style={{ textAlign: 'center', padding: '1.5rem' }}>
      <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 1rem' }}>
        <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '140px', height: '140px' }}>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--slate-100)" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color }}>{score}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>/100</span>
        </div>
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color }}>Risco {level}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, showToast, applyUser } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accName, setAccName] = useState(user?.name || '');
  const [accPassword, setAccPassword] = useState('');

  const [articles, setArticles] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [annualServices, setAnnualServices] = useState([]);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [auditLog, setAuditLog] = useState([]);

  // Chat direto (estilo WhatsApp) com qualquer utilizador
  const [chatPeer, setChatPeer] = useState(null);
  const [chatConv, setChatConv] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [unreadPeers, setUnreadPeers] = useState(() => new Set());

  const [activeMsg, setActiveMsg] = useState(null);
  const [contactReply, setContactReply] = useState('');
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editArticle, setEditArticle] = useState(null);
  const [articleForm, setArticleForm] = useState({ title: '', excerpt: '', author: '', category: 'Técnico' });
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState(BLANK_USER_FORM);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientTab, setClientTab] = useState('risco');

  const isAdmin = user?.role === 'admin';

  // Carregar todos os dados reais da API
  useEffect(() => {
    apiGetUsers()
      .then(apiUsers => {
        const norm = apiUsers.map(u => ({
          id: String(u.id), name: u.name, email: u.email,
          role: u.role, company: u.company || '', phone: u.phone || '', active: u.active,
          so_name: u.so_name, so_email: u.so_email, so_phone: u.so_phone,
          pc_name: u.pc_name, pc_email: u.pc_email, pc_phone: u.pc_phone,
        }));
        setUsers(norm);
        setClients(norm.filter(u => u.role === 'client').map(u => ({
          ...u, sector: '', createdAt: '',
          securityContact: { name: u.so_name, email: u.so_email, phone: u.so_phone },
          permanentContact: { name: u.pc_name, email: u.pc_email, phone: u.pc_phone },
        })));
      })
      .catch((e) => { if (e.response?.status !== 401) showToast('Não foi possível carregar alguns dados.', 'error'); });

    apiGetTickets().then(setTickets).catch(() => {});
    apiGetArticles().then(setArticles).catch(() => {});
    apiGetAnnualServices().then(setAnnualServices).catch(() => {});
    apiGetDocuments().then(setDocuments).catch(() => {});
    apiGetAuditLog().then(setAuditLog).catch(() => {});
    apiGetMessages().then(setMessages).catch(() => {});
  }, []);

  const navSections = [
    { label: 'GERAL', items: [{ id: 'dashboard', label: 'Dashboard', icon: '📊' }, { id: 'mensagens', label: 'Mensagens', icon: '💬' }, { id: 'contactos', label: 'Contactos', icon: '📬' }, { id: 'conta', label: 'A Minha Conta', icon: '👤' }] },
    {
      label: 'GESTÃO', items: [
        { id: 'clientes', label: 'Clientes', icon: '🏢' },
        { id: 'utilizadores', label: 'Utilizadores', icon: '👥' },
        ...(isAdmin ? [{ id: 'conteudos', label: 'Conteúdos', icon: '📰' }] : []),
        { id: 'documentos', label: 'Documentos', icon: '📄' },
        { id: 'tickets', label: 'Tickets', icon: '🎫' },
      ],
    },
    {
      label: 'OPERAÇÕES', items: [
        { id: 'servicos-anuais', label: 'Serviços Anuais', icon: '🔄' },
        ...(isAdmin ? [{ id: 'auditoria', label: 'Log de Auditoria', icon: '🔍' }] : []),
      ],
    },
  ];

  const go = (p) => { setPage(p); setSidebarOpen(false); setSelectedClient(null); };

  const ticketReply = async () => {
    if (!replyText.trim() || !activeTicket) return;
    try {
      const comment = await apiCreateTicketComment(activeTicket.id, user.id, replyText);
      setTickets(prev => prev.map(t => t.id === activeTicket.id ? { ...t, comments: [...(t.comments || []), comment] } : t));
      setActiveTicket(prev => ({ ...prev, comments: [...(prev.comments || []), comment] }));
      setReplyText('');
    } catch {
      showToast('Erro ao enviar resposta.', 'error');
    }
  };

  // Abrir conversa de um ticket e carregar os comentarios reais da API
  const openTicket = async (t) => {
    setActiveTicket(t);
    setReplyText('');
    try {
      const comments = await apiGetTicketComments(t.id);
      setActiveTicket(prev => (prev && prev.id === t.id ? { ...prev, comments } : prev));
      setTickets(prev => prev.map(x => x.id === t.id ? { ...x, comments } : x));
    } catch { /* ignore */ }
  };

  // ─── CHAT (mensagens diretas) ───────────────────────────────────────────────
  const openChat = async (peer) => {
    setChatPeer(peer);
    setChatConv(null);
    setChatMessages([]);
    setChatInput('');
    try {
      const conv = await apiEnsureConversation(user.id, peer.id);
      setChatConv(conv);
      const msgs = await apiGetConversationMessages(conv.id);
      setChatMessages(msgs);
      localStorage.setItem('cyrix_seen_' + conv.id, new Date().toISOString());
      setUnreadPeers(prev => { const n = new Set(prev); n.delete(String(peer.id)); return n; });
    } catch {
      showToast('Erro ao abrir conversa.', 'error');
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !chatConv) return;
    try {
      const msg = await apiSendConversationMessage(chatConv.id, user.id, chatInput);
      setChatMessages(prev => [...prev, msg]);
      setChatInput('');
    } catch {
      showToast('Erro ao enviar mensagem.', 'error');
    }
  };

  const reloadChat = async () => {
    if (!chatConv) return;
    try { setChatMessages(await apiGetConversationMessages(chatConv.id)); } catch { /* ignore */ }
  };

  // Deteta conversas com mensagens novas do outro lado (badge de nao lidas)
  const refreshUnread = async () => {
    if (!user) return;
    try {
      const convs = await apiGetConversations(user.id);
      const s = new Set();
      convs.forEach(c => {
        const other = (c.participant1 && c.participant1.id !== String(user.id)) ? c.participant1 : c.participant2;
        if (!other || !c.lastMessageAt || !c.lastSenderId || c.lastSenderId === String(user.id)) return;
        const seen = localStorage.getItem('cyrix_seen_' + c.id);
        if (!seen || new Date(c.lastMessageAt) > new Date(seen)) s.add(other.id);
      });
      setUnreadPeers(s);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    refreshUnread();
    const t = setInterval(refreshUnread, 8000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!chatConv) return;
    const t = setInterval(async () => {
      try { setChatMessages(await apiGetConversationMessages(chatConv.id)); } catch { /* ignore */ }
    }, 5000);
    return () => clearInterval(t);
  }, [chatConv]);

  // ─── CONTACTOS (Caixa de Entrada do formulario publico) ─────────────────────
  const openContact = (m) => {
    setActiveMsg(m);
    setContactReply(m.reply || '');
    setMessages(prev => prev.map(x => x.id === m.id ? { ...x, read: true } : x));
    apiMarkMessageRead(m.id).catch(() => {});
  };

  const sendContactReply = async () => {
    if (!contactReply.trim() || !activeMsg) return;
    try {
      const updated = await apiReplyMessage(activeMsg.id, contactReply);
      setMessages(prev => prev.map(x => x.id === activeMsg.id ? updated : x));
      setActiveMsg(updated);
      showToast('Resposta guardada.');
    } catch {
      showToast('Erro ao guardar resposta.', 'error');
    }
  };

  const saveAccount = async (e) => {
    e.preventDefault();
    try {
      const updated = await apiUpdateMe({ name: accName, password: accPassword || undefined });
      applyUser(updated);
      setAccPassword('');
      showToast('Conta atualizada com sucesso!');
    } catch (err) {
      showToast('Erro ao atualizar conta: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  // ─── Documentos: download e upload reais (base64) ───────────────────────────
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file);
  });

  const downloadDoc = async (d) => {
    try {
      const full = d.fileData ? d : await apiGetDocument(d.id);
      if (!full.fileData) { showToast('Este documento não tem ficheiro guardado.', 'error'); return; }
      const blob = await (await fetch(full.fileData)).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = full.name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch { showToast('Erro ao transferir o documento.', 'error'); }
  };

  const deleteDoc = async (d) => {
    if (!window.confirm(`Remover o documento "${d.name}"?`)) return;
    try {
      await apiDeleteDocument(d.id);
      setDocuments(await apiGetDocuments());
      showToast('Documento removido.');
    } catch (err) {
      showToast('Erro ao remover: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const uploadClientDoc = async (cid, file, category = 'Documentação') => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { showToast('Ficheiro demasiado grande (máx. 8MB).', 'error'); return; }
    try {
      const file_data = await fileToBase64(file);
      await apiCreateDocument({
        name: file.name,
        file_type: (file.name.split('.').pop() || 'FILE').toUpperCase(),
        file_size: `${(file.size / 1024).toFixed(0)} KB`,
        file_data, category, visibility: 'client', client_id: cid,
      });
      setDocuments(await apiGetDocuments());
      showToast('Documento carregado.');
    } catch (err) {
      showToast('Erro ao carregar documento: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const resolveTicket = async (id) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
    if (activeTicket?.id === id) setActiveTicket(prev => ({ ...prev, status: 'resolved' }));
    showToast('Ticket marcado como resolvido.');
    try { await apiUpdateTicketStatus(id, 'resolved'); } catch {}
  };

  const openArticleModal = (article = null) => {
    setEditArticle(article);
    setArticleForm(article ? { title: article.title, excerpt: article.excerpt, author: article.author, category: article.category } : { title: '', excerpt: '', author: '', category: 'Técnico' });
    setShowArticleModal(true);
  };

  const saveArticle = async (e) => {
    e.preventDefault();
    try {
      if (editArticle) {
        const upd = await apiUpdateArticle(editArticle.id, articleForm);
        setArticles(prev => prev.map(a => a.id === editArticle.id ? upd : a));
        showToast('Artigo atualizado.');
      } else {
        const created = await apiCreateArticle(articleForm);
        setArticles(prev => [created, ...prev]);
        showToast('Artigo criado.');
      }
      setShowArticleModal(false);
    } catch (err) {
      showToast('Erro ao guardar artigo: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const deleteArticle = async (id) => {
    try { await apiDeleteArticle(id); setArticles(prev => prev.filter(a => a.id !== id)); showToast('Artigo removido.'); }
    catch { showToast('Erro ao remover artigo.', 'error'); }
  };

  const toggleUserActive = async (id) => {
    const u = users.find(x => x.id === id);
    const newActive = !u?.active;
    setUsers(prev => prev.map(x => x.id === id ? { ...x, active: newActive } : x));
    showToast(newActive ? 'Permissões restauradas.' : 'Permissões revogadas.');
    try { await apiToggleUserActive(id, newActive); }
    catch { setUsers(prev => prev.map(x => x.id === id ? { ...x, active: !newActive } : x)); showToast('Erro ao atualizar.', 'error'); }
  };

  const toggleClientActive = async (id) => {
    const c = clients.find(x => x.id === id);
    const newActive = !c?.active;
    setClients(prev => prev.map(x => x.id === id ? { ...x, active: newActive } : x));
    showToast(newActive ? 'Acesso restaurado.' : 'Acesso revogado.');
    try { await apiToggleUserActive(id, newActive); }
    catch { setClients(prev => prev.map(x => x.id === id ? { ...x, active: !newActive } : x)); }
  };

  const openUserModal = () => { setUserForm(BLANK_USER_FORM); setShowUserModal(true); };

  const saveUser = async (e) => {
    e.preventDefault();
    try {
      const created = await apiCreateUser({
        name: userForm.name, email: userForm.email, password: userForm.password, role: userForm.role,
        company: userForm.role === 'client' ? '' : 'Cyrix',
        phone: userForm.phone,
        so_name: userForm.securityName, so_email: userForm.securityEmail, so_phone: userForm.securityPhone,
        pc_name: userForm.contactName, pc_email: userForm.contactEmail, pc_phone: userForm.contactPhone,
        word1: userForm.word1, word2: userForm.word2, word3: userForm.word3,
      });
      const nu = { id: String(created.id), name: created.name, email: created.email, phone: '', role: created.role, company: created.company || '', active: created.active };
      setUsers(prev => [...prev, nu]);
      if (created.role === 'client') {
        setClients(prev => [...prev, {
          ...nu, sector: '', createdAt: new Date().toISOString().split('T')[0],
          securityContact: { name: userForm.securityName, email: userForm.securityEmail, phone: userForm.securityPhone },
          permanentContact: { name: userForm.contactName, email: userForm.contactEmail, phone: userForm.contactPhone },
        }]);
      }
      setShowUserModal(false);
      showToast(`${created.role === 'client' ? 'Cliente' : 'Gestor'} criado com sucesso!`);
    } catch (err) {
      showToast('Erro ao criar utilizador: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const totalPageTitle = navSections.flatMap(s => s.items).find(i => i.id === page)?.label || 'Dashboard';

  // ─── CLIENT DETAIL ────────────────────────────────────────────────────────
  const ClientDetail = ({ client }) => {
    const risco = null; // avaliacao de risco: sem fonte estruturada ainda
    const [ativos, setAtivos] = useState([]);
    const [incidentes, setIncidentes] = useState([]);
    const [penTests, setPenTests] = useState([]);
    useEffect(() => {
      apiGetTechAssets(client.id).then(setAtivos).catch(() => {});
      apiGetIncidents(client.id).then(setIncidentes).catch(() => {});
      apiGetPentests(client.id).then(setPenTests).catch(() => {});
    }, [client.id]);
    const docs = documents.filter(d => d.clientId === client.id);

    const TABS = [
      { id: 'risco', label: 'Avaliação de Risco' }, { id: 'ativos', label: 'Ativos Tecnológicos' },
      { id: 'incidentes', label: 'Incidentes' }, { id: 'documentacao', label: 'Documentação' },
      { id: 'pentests', label: 'Pen Tests' }, { id: 'outros', label: 'Outros' },
    ];

    const critBadge = (c) => { const m = { 'crítico': 'badge-red', 'alto': 'badge-orange', 'médio': 'badge-yellow', 'baixo': 'badge-gray' }; return <span className={`badge ${m[c] || 'badge-gray'}`}>{c}</span>; };
    const sevBadge = (s) => { const m = { critical: 'badge-red', high: 'badge-orange', medium: 'badge-yellow', low: 'badge-gray' }; const l = { critical: 'Crítico', high: 'Alto', medium: 'Médio', low: 'Baixo' }; return <span className={`badge ${m[s] || 'badge-gray'}`}>{l[s] || s}</span>; };
    const critBadgePt = (c) => { const m = { critica: 'badge-red', alta: 'badge-orange', media: 'badge-yellow', baixa: 'badge-gray' }; const l = { critica: 'Crítica', alta: 'Alta', media: 'Média', baixa: 'Baixa' }; return <span className={`badge ${m[c] || 'badge-gray'}`}>{l[c] || c}</span>; };
    const statusPt = (s) => { const l = { aberto: 'Aberto', 'em-analise': 'Em análise', resolvido: 'Resolvido', fechado: 'Fechado' }; return <span className="badge badge-gray">{l[s] || s}</span>; };

    return (
      <div>
        <button className="btn btn-outline-dark btn-sm" style={{ marginBottom: '1.5rem' }} onClick={() => setSelectedClient(null)}>← Voltar</button>
        <div className="table-wrap" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{client.name}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginBottom: '1rem' }}>{client.company} • {client.sector}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.875rem' }}>
                <span>📧 {client.email}</span><span>📞 {client.phone}</span>
              </div>
            </div>
            {client.securityContact?.name && (
              <div style={{ flex: 1, minWidth: '200px', borderLeft: '1px solid var(--slate-200)', paddingLeft: '2rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Responsável de Segurança</div>
                <div style={{ fontSize: '0.875rem' }}>{client.securityContact.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{client.securityContact.email}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{client.securityContact.phone}</div>
              </div>
            )}
            {client.permanentContact?.name && (
              <div style={{ flex: 1, minWidth: '200px', borderLeft: '1px solid var(--slate-200)', paddingLeft: '2rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contacto Permanente</div>
                <div style={{ fontSize: '0.875rem' }}>{client.permanentContact.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{client.permanentContact.email}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{client.permanentContact.phone}</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '2px' }}>
          {TABS.map(t => <button key={t.id} className={`btn btn-sm ${clientTab === t.id ? 'btn-primary' : 'btn-outline-dark'}`} style={{ whiteSpace: 'nowrap' }} onClick={() => setClientTab(t.id)}>{t.label}</button>)}
        </div>

        {clientTab === 'risco' && (risco ? (
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem' }}>
            <div className="table-wrap" style={{ padding: '0' }}>
              <RiskGauge score={risco.score} />
              <div style={{ padding: '0 1.25rem 1.25rem', fontSize: '0.8rem', color: 'var(--slate-500)', textAlign: 'center' }}>Última avaliação: {risco.lastUpdated}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="table-wrap">
                <div className="table-header"><h3>Controlos de Segurança</h3></div>
                <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {risco.controls.map(c => (
                    <div key={c.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.375rem' }}><span>{c.name}</span><span style={{ fontWeight: 600 }}>{c.score}%</span></div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${c.score}%`, background: c.score >= 80 ? '#22c55e' : c.score >= 60 ? '#eab308' : '#ef4444' }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="table-wrap">
                <div className="table-header"><h3>Não Conformidades</h3></div>
                <div className="table-scroll">
                  <table>
                    <thead><tr><th>Categoria</th><th>Descrição</th><th>Severidade</th><th>Estado</th></tr></thead>
                    <tbody>{risco.findings.map(f => <tr key={f.id}><td style={{ fontWeight: 500 }}>{f.category}</td><td style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>{f.description}</td><td>{sevBadge(f.severity)}</td><td>{statusBadge(f.status)}</td></tr>)}</tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : <div className="table-wrap" style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-400)' }}>Avaliação de risco ainda não disponível.</div>)}

        {clientTab === 'ativos' && (
          <div className="table-wrap">
            <div className="table-header"><h3>Ativos Tecnológicos ({ativos.length})</h3></div>
            {ativos.length > 0 ? (
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Nome</th><th>Tipo</th><th>Qtd.</th><th>Localização</th><th>Criticidade</th><th>Data</th></tr></thead>
                  <tbody>{ativos.map(a => <tr key={a.id}><td style={{ fontWeight: 500 }}>{a.name}</td><td><span className="badge badge-blue">{a.assetType}</span></td><td>{a.quantity}</td><td style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>{a.location}</td><td>{critBadgePt(a.criticality)}</td><td style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>{a.date}</td></tr>)}</tbody>
                </table>
              </div>
            ) : <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)' }}>Nenhum ativo registado.</div>}
          </div>
        )}

        {clientTab === 'incidentes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {incidentes.length > 0 ? incidentes.map(i => (
              <div key={i.id} className="table-wrap" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{i.title}</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}><span className="badge badge-blue">{i.category}</span>{critBadgePt(i.severity)}{statusPt(i.status)}</div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>{i.date}</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '0.5rem' }}>{i.description}</div>
                {i.actions && <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}><strong>Ações:</strong> {i.actions}</div>}
              </div>
            )) : <div className="table-wrap" style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)' }}>Nenhum incidente registado.</div>}
          </div>
        )}

        {clientTab === 'documentacao' && (
          <div className="table-wrap">
            <div className="table-header"><h3>Documentação ({docs.length})</h3></div>
            {docs.length > 0 ? (
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Nome</th><th>Tipo</th><th>Tamanho</th><th>Data</th><th>Categoria</th><th>Ação</th></tr></thead>
                  <tbody>{docs.map(d => <tr key={d.id}><td style={{ fontWeight: 500 }}>{d.name}</td><td><span className="badge badge-blue">{d.type}</span></td><td style={{ color: 'var(--slate-500)' }}>{d.size}</td><td style={{ color: 'var(--slate-500)' }}>{d.uploadDate}</td><td><span className="badge badge-gray">{d.category}</span></td><td><div style={{ display: 'flex', gap: '0.4rem' }}><button className="btn btn-sm btn-outline-dark" onClick={() => downloadDoc(d)}>⬇</button><button className="btn btn-sm btn-danger" onClick={() => deleteDoc(d)}>🗑</button></div></td></tr>)}</tbody>
                </table>
              </div>
            ) : <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)' }}>Nenhum documento.</div>}
          </div>
        )}

        {clientTab === 'pentests' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {penTests.length > 0 ? penTests.map(p => (
              <div key={p.id} className="table-wrap" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{p.title}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--slate-500)' }}><span className="badge badge-blue">{p.scope}</span><span>{p.date}</span></div>
                  </div>
                </div>
                {p.summary && <div style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '1rem' }}>{p.summary}</div>}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {[['Crítico', p.critico, '#ef4444', '#fef2f2'], ['Alto', p.alto, '#f97316', '#fff7ed'], ['Médio', p.medio, '#eab308', '#fefce8'], ['Baixo', p.baixo, 'var(--slate-500)', 'var(--slate-50)']].map(([label, count, color, bg]) => (
                    <div key={label} style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', background: bg, textAlign: 'center', minWidth: '90px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{count}</div>
                      <div style={{ fontSize: '0.75rem', color }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )) : <div className="table-wrap" style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)' }}>Nenhum pen test registado.</div>}
          </div>
        )}

        {clientTab === 'outros' && (
          <div className="table-wrap" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📎</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Outras Evidências</div>
            <div style={{ color: 'var(--slate-400)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Carregue um documento de evidência para este cliente.</div>
            <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
              + Carregar Evidência
              <input type="file" style={{ display: 'none' }} onChange={e => { uploadClientDoc(client.id, e.target.files[0], 'Outros'); e.target.value = ''; }} />
            </label>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dash-layout">
      <div className={`sidebar-overlay${sidebarOpen ? ' show' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-logo" onClick={() => navigate('/')}><ShieldIcon /><div><div className="sidebar-logo-text">Cyrix</div><div className="sidebar-logo-sub">{isAdmin ? 'Administração' : 'Gestão'}</div></div></div>
        <div className="sidebar-user"><div className="sidebar-user-name">{user?.name}</div><div className="sidebar-user-role">{isAdmin ? 'Administrador' : 'Gestor'}</div></div>
        <nav className="sidebar-nav">
          {navSections.map((section, i) => (
            <div key={i}>
              <div className="sidebar-section">{section.label}</div>
              {section.items.map(item => <button key={item.id} className={`sidebar-link${page === item.id ? ' active' : ''}`} onClick={() => go(item.id)}><span>{item.icon}</span> {item.label}</button>)}
            </div>
          ))}
          {isAdmin && (
            <div>
              <div className="sidebar-section">BASE DE DADOS (API)</div>
              {[['users', '👥', 'Utilizadores'], ['tickets', '🎫', 'Tickets'], ['documents', '📄', 'Documentos'], ['service-requests', '📋', 'Pedidos']].map(([ent, icon, label]) => (
                <button key={ent} className="sidebar-link" onClick={() => navigate(`/crud/${ent}`)}><span>{icon}</span> {label}</button>
              ))}
            </div>
          )}
        </nav>
        <div className="sidebar-footer"><button className="btn btn-outline btn-sm w-full" onClick={() => { logout(); navigate('/'); }}>Terminar Sessão</button></div>
      </aside>

      <div className="dash-main">
        <header className="dash-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="dash-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="dash-topbar-title">{selectedClient ? selectedClient.name : totalPageTitle}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>{user?.name}</span>
            <button className="btn btn-outline-dark btn-sm" onClick={() => { logout(); navigate('/'); }}>Sair</button>
          </div>
        </header>

        <div className="dash-content page-anim">

          {page === 'dashboard' && (
            <>
              <div className="stat-cards">
                <div className="stat-card"><div className="stat-card-label">Total Clientes</div><div className="stat-card-value">{clients.filter(c => c.active).length}</div><div className="stat-card-change">↑ +2 este mês</div></div>
                <div className="stat-card"><div className="stat-card-label">Mensagens Novas</div><div className="stat-card-value">{messages.filter(m => !m.read).length}</div></div>
                <div className="stat-card"><div className="stat-card-label">Tickets Abertos</div><div className="stat-card-value">{tickets.filter(t => t.status !== 'resolved').length}</div></div>
                <div className="stat-card"><div className="stat-card-label">Serviços Ativos</div><div className="stat-card-value">{annualServices.filter(s => s.status === 'in-progress').length}</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="table-wrap">
                  <div className="table-header"><h3>Tickets Recentes</h3><button className="btn btn-outline-dark btn-sm" onClick={() => go('tickets')}>Ver todos</button></div>
                  {tickets.slice(0, 3).map(t => (
                    <div key={t.id} style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{t.title}</div><div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{t.clientName}</div></div>
                      {statusBadge(t.status)}
                    </div>
                  ))}
                </div>
                <div className="table-wrap">
                  <div className="table-header"><h3>Serviços Anuais</h3><button className="btn btn-outline-dark btn-sm" onClick={() => go('servicos-anuais')}>Ver todos</button></div>
                  {annualServices.slice(0, 3).map(s => (
                    <div key={s.id} style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--slate-100)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}><span style={{ fontSize: '0.875rem' }}>{s.clientName}</span>{statusBadge(s.status)}</div>
                      <div className="progress-bar"><div className={`progress-fill ${s.status === 'completed' ? 'green-fill' : s.status === 'overdue' ? 'red-fill' : ''}`} style={{ width: `${s.progress}%` }} /></div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>{s.progress}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {page === 'conta' && (
            <div className="table-wrap" style={{ maxWidth: '520px', padding: '1.5rem' }}>
              <div className="table-header" style={{ padding: 0, border: 'none', marginBottom: '1rem' }}><h3>A Minha Conta</h3></div>
              <form onSubmit={saveAccount}>
                <div className="form-group"><label className="label">Nome</label><input className="input" value={accName} onChange={e => setAccName(e.target.value)} required /></div>
                <div className="form-group"><label className="label">Email</label><input className="input" value={user?.email || ''} disabled /></div>
                <div className="form-group"><label className="label">Perfil</label><input className="input" value={user?.role || ''} disabled /></div>
                <div className="form-group"><label className="label">Nova password</label><input className="input" type="password" value={accPassword} onChange={e => setAccPassword(e.target.value)} placeholder="Deixa vazio para manter a atual" /></div>
                <button className="btn btn-primary" type="submit">Guardar alterações</button>
              </form>
            </div>
          )}

          {page === 'mensagens' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', height: '600px' }}>
              <div className="table-wrap" style={{ overflow: 'auto' }}>
                <div className="table-header"><h3>Utilizadores</h3></div>
                {users.filter(u => String(u.id) !== String(user.id)).map(u => (
                  <div key={u.id} onClick={() => openChat(u)} style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--slate-100)', cursor: 'pointer', background: chatPeer?.id === u.id ? 'var(--slate-50)' : 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{unreadPeers.has(String(u.id)) && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#ef4444', marginRight: 6 }} />}{u.name}</span>
                      <span className={`badge ${u.role === 'admin' ? 'badge-red' : u.role === 'manager' ? 'badge-blue' : 'badge-yellow'}`} style={{ fontSize: '0.65rem' }}>{u.role === 'admin' ? 'Admin' : u.role === 'manager' ? 'Gestor' : 'Cliente'}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{u.email}</div>
                  </div>
                ))}
                {users.filter(u => String(u.id) !== String(user.id)).length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)' }}>Sem outros utilizadores.</div>}
              </div>
              <div className="table-wrap" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {chatPeer ? (
                  <>
                    <div className="table-header"><h3>{chatPeer.name}</h3><button className="btn btn-outline-dark btn-sm" onClick={reloadChat}>↻ Atualizar</button></div>
                    <div className="ticket-messages" style={{ flex: 1, overflow: 'auto' }}>
                      {chatMessages.length === 0 && <div style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '2rem' }}>Sem mensagens ainda. Escreva a primeira!</div>}
                      {chatMessages.map(mm => {
                        const mine = mm.senderId === String(user.id);
                        return (
                          <div key={mm.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                            <div className={`msg-bubble ${mine ? 'admin-msg' : 'client-msg'}`}>{mm.text}</div>
                            <div className="msg-meta" style={{ textAlign: mine ? 'right' : 'left' }}>{mm.senderName} • {new Date(mm.date).toLocaleString('pt')}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="ticket-reply">
                      <input className="input" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Escrever mensagem..." style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && sendChatMessage()} />
                      <button className="btn btn-primary" onClick={sendChatMessage}>Enviar</button>
                    </div>
                  </>
                ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--slate-400)' }}>Selecione um utilizador para conversar</div>}
              </div>
            </div>
          )}

          {page === 'contactos' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', height: '600px' }}>
              <div className="table-wrap" style={{ overflow: 'auto' }}>
                <div className="table-header"><h3>Caixa de Entrada</h3></div>
                {messages.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)' }}>Sem contactos.</div>}
                {messages.map(m => (
                  <div key={m.id} style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--slate-100)', cursor: 'pointer', background: activeMsg?.id === m.id ? 'var(--slate-50)' : 'white' }} onClick={() => openContact(m)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: m.read ? 400 : 600, fontSize: '0.875rem' }}>{m.name}</span>{m.reply ? <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Respondido</span> : (!m.read && <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>Novo</span>)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{m.company}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.25rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{m.message}</div>
                  </div>
                ))}
              </div>
              <div className="table-wrap" style={{ overflow: 'auto' }}>
                {activeMsg ? (
                  <>
                    <div className="table-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
                      <h3>{activeMsg.name}</h3>
                      <div style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>{activeMsg.email} • {activeMsg.company} • {activeMsg.date}</div>
                    </div>
                    <div style={{ padding: '1.5rem' }}><p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--slate-700)' }}>{activeMsg.message}</p></div>
                    {activeMsg.reply && (
                      <div style={{ margin: '0 1.5rem 0.5rem', padding: '0.75rem 1rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '0.5rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Resposta {activeMsg.repliedAt ? `• ${activeMsg.repliedAt}` : ''}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--slate-700)', whiteSpace: 'pre-wrap' }}>{activeMsg.reply}</div>
                      </div>
                    )}
                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--slate-200)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <textarea className="input" rows={3} value={contactReply} onChange={e => setContactReply(e.target.value)} placeholder={`Escrever resposta a ${activeMsg.email}...`} />
                      <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }} onClick={sendContactReply} disabled={!contactReply.trim()}>{activeMsg.reply ? 'Atualizar resposta' : 'Responder'}</button>
                    </div>
                  </>
                ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--slate-400)' }}>Selecione uma mensagem</div>}
              </div>
            </div>
          )}

          {page === 'clientes' && (selectedClient ? <ClientDetail client={selectedClient} /> : (
            <div className="table-wrap">
              <div className="table-header"><h3>Clientes ({clients.length})</h3></div>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Nome</th><th>Empresa</th><th>Email</th><th>Telefone</th><th>Setor</th><th>Estado</th><th>Ações</th></tr></thead>
                  <tbody>{clients.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 500 }}>{c.name}</td>
                      <td style={{ color: 'var(--slate-500)' }}>{c.company}</td>
                      <td style={{ color: 'var(--slate-500)' }}>{c.email}</td>
                      <td style={{ color: 'var(--slate-500)' }}>{c.phone}</td>
                      <td><span className="badge badge-blue">{c.sector || '—'}</span></td>
                      <td><span className={`badge ${c.active ? 'badge-green' : 'badge-gray'}`}>{c.active ? 'Ativo' : 'Inativo'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-sm btn-outline-dark" onClick={() => { setSelectedClient(c); setClientTab('risco'); }}>Ver Ficha</button>
                          {isAdmin && <button className={`btn btn-sm ${c.active ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleClientActive(c.id)}>{c.active ? 'Revogar' : 'Ativar'}</button>}
                        </div>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          ))}

          {page === 'conteudos' && isAdmin && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}><button className="btn btn-primary" onClick={() => openArticleModal()}>+ Novo Artigo</button></div>
              <div className="table-wrap">
                <div className="table-header"><h3>Artigos ({articles.length})</h3></div>
                <div className="table-scroll">
                  <table>
                    <thead><tr><th>Título</th><th>Autor</th><th>Categoria</th><th>Data</th><th>Ações</th></tr></thead>
                    <tbody>{articles.map(a => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 500, maxWidth: '280px' }}>{a.title}</td>
                        <td style={{ color: 'var(--slate-500)' }}>{a.author}</td>
                        <td><span className="badge badge-yellow">{a.category}</span></td>
                        <td style={{ color: 'var(--slate-500)' }}>{a.date}</td>
                        <td><div style={{ display: 'flex', gap: '0.5rem' }}><button className="btn btn-sm btn-outline-dark" onClick={() => openArticleModal(a)}>Editar</button><button className="btn btn-sm btn-danger" onClick={() => deleteArticle(a.id)}>Eliminar</button></div></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {page === 'utilizadores' && (
            <>
              {isAdmin && <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}><button className="btn btn-primary" onClick={openUserModal}>+ Criar Utilizador</button></div>}
              <div className="table-wrap">
                <div className="table-header"><h3>Utilizadores ({users.length})</h3></div>
                <div className="table-scroll">
                  <table>
                    <thead><tr><th>Nome</th><th>Email</th><th>Telefone</th><th>Perfil</th><th>Estado</th>{isAdmin && <th>Ações</th>}</tr></thead>
                    <tbody>{users.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 500 }}>{u.name}</td>
                        <td style={{ color: 'var(--slate-500)' }}>{u.email}</td>
                        <td style={{ color: 'var(--slate-500)' }}>{u.phone || '—'}</td>
                        <td><span className={`badge ${u.role === 'admin' ? 'badge-red' : u.role === 'manager' ? 'badge-blue' : 'badge-yellow'}`}>{u.role === 'admin' ? 'Admin' : u.role === 'manager' ? 'Gestor' : 'Cliente'}</span></td>
                        <td><span className={`badge ${u.active ? 'badge-green' : 'badge-gray'}`}>{u.active ? 'Ativo' : 'Inativo'}</span></td>
                        {isAdmin && <td><button className={`btn btn-sm ${u.active ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleUserActive(u.id)} disabled={u.role === 'admin' && u.id === '1'}>{u.active ? 'Revogar' : 'Restaurar'}</button></td>}
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {page === 'documentos' && (
            <div className="table-wrap">
              <div className="table-header"><h3>Documentos ({documents.length})</h3></div>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Nome</th><th>Tipo</th><th>Tamanho</th><th>Data</th><th>Categoria</th><th>Cliente</th><th>Ação</th></tr></thead>
                  <tbody>{documents.map(d => (
                    <tr key={d.id}><td style={{ fontWeight: 500 }}>{d.name}</td><td><span className="badge badge-blue">{d.type}</span></td><td style={{ color: 'var(--slate-500)' }}>{d.size}</td><td style={{ color: 'var(--slate-500)' }}>{d.uploadDate}</td><td><span className="badge badge-gray">{d.category}</span></td><td style={{ color: 'var(--slate-500)' }}>{d.clientName || 'Público'}</td><td><div style={{ display: 'flex', gap: '0.4rem' }}><button className="btn btn-sm btn-outline-dark" onClick={() => downloadDoc(d)}>⬇</button><button className="btn btn-sm btn-danger" onClick={() => deleteDoc(d)}>🗑</button></div></td></tr>
                  ))}
                  {documents.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '2rem' }}>Sem documentos.</td></tr>}</tbody>
                </table>
              </div>
            </div>
          )}

          {page === 'tickets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tickets.map(t => (
                <div key={t.id} className="table-wrap">
                  <div className="table-header">
                    <div>
                      <h3 style={{ marginBottom: '0.25rem' }}>{t.title}</h3>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {statusBadge(t.status)} {priorityBadge(t.priority)}
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Cliente: {t.clientName} | {t.assignedTo}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {t.status !== 'resolved' && <button className="btn btn-success btn-sm" onClick={() => resolveTicket(t.id)}>✓ Resolver</button>}
                      <button className="btn btn-outline-dark btn-sm" onClick={() => openTicket(t)}>Conversa</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {page === 'servicos-anuais' && (
            <div className="table-wrap">
              <div className="table-header"><h3>Serviços Anuais ({annualServices.length})</h3></div>
              {annualServices.map(s => (
                <div key={s.id} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--slate-100)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div><div style={{ fontWeight: 600 }}>{s.clientName}</div><div style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>{s.serviceName || s.serviceType} • {s.assignedTo}</div></div>
                    {statusBadge(s.status)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="progress-bar" style={{ flex: 1 }}><div className={`progress-fill ${s.status === 'completed' ? 'green-fill' : s.status === 'overdue' ? 'red-fill' : ''}`} style={{ width: `${s.progress}%` }} /></div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: '2.5rem' }}>{s.progress}%</span>
                  </div>
                  {s.notes && <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.375rem' }}>{s.notes}</div>}
                </div>
              ))}
            </div>
          )}

          {page === 'auditoria' && isAdmin && (
            <div className="table-wrap">
              <div className="table-header"><h3>Log de Auditoria ({auditLog.length})</h3></div>
              {auditLog.map(entry => (
                <div key={entry.id} className="audit-item">
                  {severityDot(entry.severity)}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{entry.action}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      <span>Utilizador: {entry.user}</span><span>IP: {entry.ip}</span><span>Categoria: {entry.category}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', whiteSpace: 'nowrap' }}>{new Date(entry.timestamp).toLocaleString('pt')}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* TICKET MODAL */}
      {activeTicket && (
        <div className="modal-overlay" onClick={() => setActiveTicket(null)}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div><h3>{activeTicket.title}</h3><div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>{statusBadge(activeTicket.status)} {priorityBadge(activeTicket.priority)}</div></div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {activeTicket.status !== 'resolved' && <button className="btn btn-success btn-sm" onClick={() => resolveTicket(activeTicket.id)}>Resolver</button>}
                <button className="btn-ghost" style={{ color: 'var(--slate-600)', fontSize: '1.25rem' }} onClick={() => setActiveTicket(null)}>✕</button>
              </div>
            </div>
            <div className="ticket-messages">
              {(activeTicket.comments || []).map(c => (
                <div key={c.id} style={{ alignSelf: c.isAdmin ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                  <div className={`msg-bubble ${c.isAdmin ? 'admin-msg' : 'client-msg'}`}>{c.text}</div>
                  <div className="msg-meta" style={{ textAlign: c.isAdmin ? 'left' : 'right' }}>{c.author} • {new Date(c.date).toLocaleString('pt')}</div>
                </div>
              ))}
            </div>
            {activeTicket.status !== 'resolved' && (
              <div className="ticket-reply">
                <input className="input" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Responder ao cliente..." style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && ticketReply(true)} />
                <button className="btn btn-primary" onClick={() => ticketReply(true)}>Enviar</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ARTICLE MODAL */}
      {showArticleModal && (
        <div className="modal-overlay" onClick={() => setShowArticleModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{editArticle ? 'Editar Artigo' : 'Novo Artigo'}</h3><button className="btn-ghost" style={{ color: 'var(--slate-600)', fontSize: '1.25rem' }} onClick={() => setShowArticleModal(false)}>✕</button></div>
            <form onSubmit={saveArticle}>
              <div className="modal-body">
                <div className="form-group"><label className="label">Título *</label><input className="input" value={articleForm.title} onChange={e => setArticleForm({ ...articleForm, title: e.target.value })} required /></div>
                <div className="form-group"><label className="label">Autor *</label><input className="input" value={articleForm.author} onChange={e => setArticleForm({ ...articleForm, author: e.target.value })} required /></div>
                <div className="form-group"><label className="label">Categoria</label><select className="input" value={articleForm.category} onChange={e => setArticleForm({ ...articleForm, category: e.target.value })}><option>Técnico</option><option>Regulamentação</option><option>Consultoria</option><option>Formação</option></select></div>
                <div className="form-group"><label className="label">Resumo *</label><textarea className="input" rows={3} value={articleForm.excerpt} onChange={e => setArticleForm({ ...articleForm, excerpt: e.target.value })} required /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-outline-dark" onClick={() => setShowArticleModal(false)}>Cancelar</button><button type="submit" className="btn btn-primary">{editArticle ? 'Guardar' : 'Criar'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Criar Novo Utilizador</h3><button className="btn-ghost" style={{ color: 'var(--slate-600)', fontSize: '1.25rem' }} onClick={() => setShowUserModal(false)}>✕</button></div>
            <form onSubmit={saveUser}>
              <div className="modal-body">
                <div className="form-group"><label className="label">Tipo de Perfil *</label><select className="input" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}><option value="manager">Gestor</option><option value="client">Cliente (Empresa)</option></select></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group"><label className="label">Nome completo *</label><input className="input" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} required /></div>
                  <div className="form-group"><label className="label">Email *</label><input className="input" type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required /></div>
                  <div className="form-group"><label className="label">Telefone</label><input className="input" type="tel" value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} placeholder="+351 9XX XXX XXX" /></div>
                  <div className="form-group"><label className="label">Palavra-passe inicial *</label><input className="input" type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} required /></div>
                </div>
                <div style={{ margin: '1rem 0 0.75rem', borderTop: '1px solid var(--slate-200)', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate-500)', marginBottom: '0.25rem' }}>Palavras de Segurança (2FA)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '0.75rem' }}>Define pelo menos uma. Serão pedidas no 2.º passo do login. Se deixares em branco, a conta entra só com password.</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="form-group"><label className="label">Palavra 1</label><input className="input" value={userForm.word1} onChange={e => setUserForm({ ...userForm, word1: e.target.value })} placeholder="ex: seguranca" /></div>
                    <div className="form-group"><label className="label">Palavra 2</label><input className="input" value={userForm.word2} onChange={e => setUserForm({ ...userForm, word2: e.target.value })} /></div>
                    <div className="form-group"><label className="label">Palavra 3</label><input className="input" value={userForm.word3} onChange={e => setUserForm({ ...userForm, word3: e.target.value })} /></div>
                  </div>
                </div>
                {userForm.role === 'client' && (
                  <>
                    <div style={{ margin: '1rem 0 0.75rem', borderTop: '1px solid var(--slate-200)', paddingTop: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate-500)', marginBottom: '0.75rem' }}>Responsável de Segurança</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group"><label className="label">Nome</label><input className="input" value={userForm.securityName} onChange={e => setUserForm({ ...userForm, securityName: e.target.value })} /></div>
                        <div className="form-group"><label className="label">Email</label><input className="input" type="email" value={userForm.securityEmail} onChange={e => setUserForm({ ...userForm, securityEmail: e.target.value })} /></div>
                        <div className="form-group"><label className="label">Telefone</label><input className="input" type="tel" value={userForm.securityPhone} onChange={e => setUserForm({ ...userForm, securityPhone: e.target.value })} /></div>
                      </div>
                    </div>
                    <div style={{ margin: '0.5rem 0 0.75rem', borderTop: '1px solid var(--slate-200)', paddingTop: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate-500)', marginBottom: '0.75rem' }}>Contacto Permanente</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group"><label className="label">Nome</label><input className="input" value={userForm.contactName} onChange={e => setUserForm({ ...userForm, contactName: e.target.value })} /></div>
                        <div className="form-group"><label className="label">Email</label><input className="input" type="email" value={userForm.contactEmail} onChange={e => setUserForm({ ...userForm, contactEmail: e.target.value })} /></div>
                        <div className="form-group"><label className="label">Telefone</label><input className="input" type="tel" value={userForm.contactPhone} onChange={e => setUserForm({ ...userForm, contactPhone: e.target.value })} /></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-outline-dark" onClick={() => setShowUserModal(false)}>Cancelar</button><button type="submit" className="btn btn-primary">Criar Utilizador</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
