import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  mockArticles, mockTickets, mockAnnualServices, mockAuditLog, mockDocuments,
  mockClients, mockRiskAssessment, mockAtivos, mockIncidentes, mockPenTests,
} from '../mockData.js';
import { apiGetUsers, apiCreateUser, apiToggleUserActive, apiGetTickets, apiUpdateTicketStatus } from '../apiService.js';

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28" style={{ color: 'var(--yellow)' }}>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
);

const mockMessages = [
  { id: 'm1', name: 'Tech Solutions Lda.', email: 'info@techsolutions.pt', company: 'Tech Solutions', message: 'Gostaríamos de agendar uma avaliação de maturidade.', date: '2026-03-15', read: false },
  { id: 'm2', name: 'João Costa', email: 'joao@startup.pt', company: 'Startup Inovação', message: 'Temos interesse nos serviços de PenTest.', date: '2026-03-14', read: true },
  { id: 'm3', name: 'Maria Silva', email: 'maria@hospital.pt', company: 'Hospital Central', message: 'Precisamos de apoio na conformidade NIS2.', date: '2026-03-13', read: true },
];

const initialUsers = [
  { id: '1', name: 'João Silva', email: 'admin@ciryx.pt', role: 'admin', active: true, phone: '+351 910 111 222' },
  { id: '2', name: 'Maria Santos', email: 'manager@ciryx.pt', role: 'manager', active: true, phone: '+351 910 333 444' },
  { id: '3', name: 'Carlos Oliveira', email: 'cliente@empresa.pt', role: 'client', active: true, phone: '+351 912 345 678' },
];

const BLANK_USER_FORM = {
  role: 'client', name: '', email: '', phone: '', password: '',
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
  const { user, logout, showToast } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [articles, setArticles] = useState(mockArticles);
  const [tickets, setTickets] = useState(mockTickets);
  const [annualServices] = useState(mockAnnualServices);
  const [messages, setMessages] = useState(mockMessages);
  const [users, setUsers] = useState(initialUsers);
  const [clients, setClients] = useState(mockClients);

  const [activeMsg, setActiveMsg] = useState(null);
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

  // Carregar dados reais da API
  useEffect(() => {
    apiGetUsers()
      .then(apiUsers => {
        const norm = apiUsers.map(u => ({
          id: String(u.id), name: u.name, email: u.email,
          role: u.role, company: u.company || '', phone: u.phone || '', active: u.active,
        }));
        setUsers(norm);
        const apiClients = norm.filter(u => u.role === 'client').map(u => {
          const ex = mockClients.find(c => c.email === u.email);
          return ex ? { ...ex, ...u } : { ...u, sector: '', createdAt: '', securityContact: {}, permanentContact: {} };
        });
        if (apiClients.length > 0) setClients(apiClients);
      })
      .catch(() => {});

    apiGetTickets()
      .then(t => { if (t.length > 0) setTickets(t); })
      .catch(() => {});
  }, []);

  const navSections = [
    { label: 'GERAL', items: [{ id: 'dashboard', label: 'Dashboard', icon: '📊' }, { id: 'mensagens', label: 'Mensagens', icon: '📬' }] },
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

  const ticketReply = (isAdminReply = true) => {
    if (!replyText.trim() || !activeTicket) return;
    const comment = { id: 'c' + Date.now(), author: isAdminReply ? user.name : 'Cliente', isAdmin: isAdminReply, text: replyText, date: new Date().toISOString() };
    setTickets(prev => prev.map(t => t.id === activeTicket.id ? { ...t, comments: [...(t.comments || []), comment] } : t));
    setActiveTicket(prev => ({ ...prev, comments: [...(prev.comments || []), comment] }));
    setReplyText('');
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

  const saveArticle = (e) => {
    e.preventDefault();
    if (editArticle) {
      setArticles(prev => prev.map(a => a.id === editArticle.id ? { ...a, ...articleForm } : a));
      showToast('Artigo atualizado.');
    } else {
      setArticles(prev => [{ id: String(Date.now()), ...articleForm, date: new Date().toISOString().split('T')[0] }, ...prev]);
      showToast('Artigo criado.');
    }
    setShowArticleModal(false);
  };

  const deleteArticle = (id) => { setArticles(prev => prev.filter(a => a.id !== id)); showToast('Artigo removido.'); };

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
    const tempId = String(Date.now());
    const newUser = { id: tempId, name: userForm.name, email: userForm.email, phone: userForm.phone, role: userForm.role, active: true };
    setUsers(prev => [...prev, newUser]);
    if (userForm.role === 'client') {
      setClients(prev => [...prev, {
        ...newUser, company: '', sector: '', createdAt: new Date().toISOString().split('T')[0],
        securityContact: { name: userForm.securityName, email: userForm.securityEmail, phone: userForm.securityPhone },
        permanentContact: { name: userForm.contactName, email: userForm.contactEmail, phone: userForm.contactPhone },
      }]);
    }
    setShowUserModal(false);
    showToast(`${userForm.role === 'client' ? 'Cliente' : 'Gestor'} criado com sucesso!`);
    try {
      const created = await apiCreateUser({ name: userForm.name, email: userForm.email, password: userForm.password, role: userForm.role, company: userForm.role === 'client' ? '' : 'Ciryx' });
      const realId = String(created.id);
      setUsers(prev => prev.map(u => u.id === tempId ? { ...u, id: realId } : u));
      if (userForm.role === 'client') setClients(prev => prev.map(c => c.id === tempId ? { ...c, id: realId } : c));
    } catch {}
  };

  const totalPageTitle = navSections.flatMap(s => s.items).find(i => i.id === page)?.label || 'Dashboard';

  // ─── CLIENT DETAIL ────────────────────────────────────────────────────────
  const ClientDetail = ({ client }) => {
    const risco = mockRiskAssessment[client.id];
    const ativos = mockAtivos[client.id] || [];
    const incidentes = mockIncidentes[client.id] || [];
    const penTests = mockPenTests[client.id] || [];
    const docs = mockDocuments.filter(d => d.clientId === client.id);

    const TABS = [
      { id: 'risco', label: 'Avaliação de Risco' }, { id: 'ativos', label: 'Ativos Tecnológicos' },
      { id: 'incidentes', label: 'Incidentes' }, { id: 'documentacao', label: 'Documentação' },
      { id: 'pentests', label: 'Pen Tests' }, { id: 'outros', label: 'Outros' },
    ];

    const critBadge = (c) => { const m = { 'crítico': 'badge-red', 'alto': 'badge-orange', 'médio': 'badge-yellow', 'baixo': 'badge-gray' }; return <span className={`badge ${m[c] || 'badge-gray'}`}>{c}</span>; };
    const sevBadge = (s) => { const m = { critical: 'badge-red', high: 'badge-orange', medium: 'badge-yellow', low: 'badge-gray' }; const l = { critical: 'Crítico', high: 'Alto', medium: 'Médio', low: 'Baixo' }; return <span className={`badge ${m[s] || 'badge-gray'}`}>{l[s] || s}</span>; };

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
                  <thead><tr><th>Nome</th><th>Tipo</th><th>IP</th><th>Sistema Operativo</th><th>Criticidade</th><th>Estado</th></tr></thead>
                  <tbody>{ativos.map(a => <tr key={a.id}><td style={{ fontWeight: 500 }}>{a.nome}</td><td><span className="badge badge-blue">{a.tipo}</span></td><td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{a.ip}</td><td style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>{a.so}</td><td>{critBadge(a.criticidade)}</td><td><span className={`badge ${a.estado === 'ativo' ? 'badge-green' : 'badge-gray'}`}>{a.estado}</span></td></tr>)}</tbody>
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
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{i.titulo}</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}><span className="badge badge-blue">{i.tipo}</span>{sevBadge(i.severidade)}{statusBadge(i.estado)}</div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>{i.data}</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '0.5rem' }}>{i.descricao}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}><strong>Ações:</strong> {i.acoes}</div>
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
                  <tbody>{docs.map(d => <tr key={d.id}><td style={{ fontWeight: 500 }}>{d.name}</td><td><span className="badge badge-blue">{d.type}</span></td><td style={{ color: 'var(--slate-500)' }}>{d.size}</td><td style={{ color: 'var(--slate-500)' }}>{d.uploadDate}</td><td><span className="badge badge-gray">{d.category}</span></td><td><button className="btn btn-sm btn-outline-dark" onClick={() => showToast('Download (demo)')}>⬇</button></td></tr>)}</tbody>
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
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{p.titulo}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--slate-500)' }}><span className="badge badge-blue">{p.tipo}</span><span>{p.consultor} • {p.data}</span></div>
                  </div>
                  <button className="btn btn-sm btn-outline-dark" onClick={() => showToast('Download (demo)')}>⬇ Relatório PDF</button>
                </div>
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
            <div style={{ color: 'var(--slate-400)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Sem evidências adicionais submetidas.</div>
            <button className="btn btn-primary btn-sm" onClick={() => showToast('Upload disponível após integração.')}>+ Carregar Evidência</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dash-layout">
      <div className={`sidebar-overlay${sidebarOpen ? ' show' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-logo" onClick={() => navigate('/')}><ShieldIcon /><div><div className="sidebar-logo-text">Ciryx</div><div className="sidebar-logo-sub">{isAdmin ? 'Administração' : 'Gestão'}</div></div></div>
        <div className="sidebar-user"><div className="sidebar-user-name">{user?.name}</div><div className="sidebar-user-role">{isAdmin ? 'Administrador' : 'Gestor'}</div></div>
        <nav className="sidebar-nav">
          {navSections.map((section, i) => (
            <div key={i}>
              <div className="sidebar-section">{section.label}</div>
              {section.items.map(item => <button key={item.id} className={`sidebar-link${page === item.id ? ' active' : ''}`} onClick={() => go(item.id)}><span>{item.icon}</span> {item.label}</button>)}
            </div>
          ))}
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

          {page === 'mensagens' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', height: '600px' }}>
              <div className="table-wrap" style={{ overflow: 'auto' }}>
                <div className="table-header"><h3>Caixa de Entrada</h3></div>
                {messages.map(m => (
                  <div key={m.id} style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--slate-100)', cursor: 'pointer', background: activeMsg?.id === m.id ? 'var(--slate-50)' : 'white' }} onClick={() => { setActiveMsg(m); setMessages(prev => prev.map(x => x.id === m.id ? { ...x, read: true } : x)); }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: m.read ? 400 : 600, fontSize: '0.875rem' }}>{m.name}</span>{!m.read && <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>Novo</span>}</div>
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
                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--slate-200)', display: 'flex', gap: '0.75rem' }}>
                      <input className="input" placeholder={`Responder a ${activeMsg.email}...`} style={{ flex: 1 }} readOnly onClick={() => showToast('Email em desenvolvimento (demo)')} />
                      <button className="btn btn-primary" onClick={() => showToast('Resposta enviada (demo)')}>Responder</button>
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
              <div className="table-header"><h3>Documentos ({mockDocuments.length})</h3><button className="btn btn-primary btn-sm" onClick={() => showToast('Upload (demo)')}>+ Upload</button></div>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Nome</th><th>Tipo</th><th>Tamanho</th><th>Data</th><th>Categoria</th><th>Cliente</th></tr></thead>
                  <tbody>{mockDocuments.map(d => (
                    <tr key={d.id}><td style={{ fontWeight: 500 }}>{d.name}</td><td><span className="badge badge-blue">{d.type}</span></td><td style={{ color: 'var(--slate-500)' }}>{d.size}</td><td style={{ color: 'var(--slate-500)' }}>{d.uploadDate}</td><td><span className="badge badge-gray">{d.category}</span></td><td style={{ color: 'var(--slate-500)' }}>{d.clientId ? 'Carlos Oliveira' : 'Público'}</td></tr>
                  ))}</tbody>
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
                      <button className="btn btn-outline-dark btn-sm" onClick={() => { setActiveTicket(t); setReplyText(''); }}>Conversa</button>
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
              <div className="table-header"><h3>Log de Auditoria</h3></div>
              {mockAuditLog.map(entry => (
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
