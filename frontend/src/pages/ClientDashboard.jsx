import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  mockTickets, mockDocuments, mockRequests,
  mockRiskAssessment, mockAtivos, mockIncidentes, mockPenTests,
} from '../mockData.js';
import {
  apiGetTickets, apiCreateTicket,
  apiGetDocuments,
  apiGetServiceRequests, apiCreateServiceRequest,
} from '../apiService.js';

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="26" height="26" style={{ color: 'var(--yellow)' }}>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
);

function statusBadge(s) {
  const map = {
    'in-progress': ['badge-yellow', 'Em Progresso'], completed: ['badge-green', 'Concluído'],
    open: ['badge-blue', 'Aberto'], resolved: ['badge-gray', 'Resolvido'],
    pending: ['badge-gray', 'Pendente'], overdue: ['badge-red', 'Atrasado'],
  };
  const [cls, label] = map[s] || ['badge-gray', s];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function priorityBadge(p) {
  const m = { urgent: 'badge-red', high: 'badge-orange', medium: 'badge-yellow', low: 'badge-gray', critical: 'badge-red' };
  const l = { urgent: 'Urgente', high: 'Alta', medium: 'Média', low: 'Baixa', critical: 'Crítico' };
  return <span className={`badge ${m[p] || 'badge-gray'}`}>{l[p] || p}</span>;
}

function RiskGauge({ score }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
  const level = score >= 80 ? 'Baixo' : score >= 60 ? 'Médio' : 'Alto';
  return (
    <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
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
      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>Pontuação de Maturidade</div>
    </div>
  );
}

const BLANK_TICKET = { title: '', description: '', category: 'Suporte Técnico', priority: 'medium' };
const BLANK_REQUEST = { title: '', description: '' };

const EVID_CATS = [
  { id: 'ativos', label: 'Ativos Tecnológicos', icon: '🖥️' },
  { id: 'incidentes', label: 'Report de Incidente', icon: '⚠️' },
  { id: 'documentacao', label: 'Documentação', icon: '📄' },
  { id: 'pentests', label: 'Pen Tests', icon: '🔍' },
  { id: 'outros', label: 'Outras Evidências', icon: '📎' },
];

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user, logout, showToast } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef(null);

  const clientId = user?.id || '3';

  // Dados do backend (null = ainda não carregou, usa mock)
  const [apiTickets, setApiTickets] = useState(null);
  const [apiDocs, setApiDocs] = useState(null);
  const [apiRequests, setApiRequests] = useState(null);

  // Estado local
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState(BLANK_TICKET);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState(BLANK_REQUEST);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [activeCat, setActiveCat] = useState('ativos');

  // Risco
  const risco = mockRiskAssessment[clientId];
  const ativos = mockAtivos[clientId] || [];
  const incidentes = mockIncidentes[clientId] || [];
  const penTests = mockPenTests[clientId] || [];

  // Carregar dados reais da API
  useEffect(() => {
    apiGetTickets()
      .then(t => setApiTickets(t.filter(x => x.clientId === clientId)))
      .catch(() => {});
    apiGetDocuments()
      .then(d => setApiDocs(d.filter(x => x.clientId === clientId)))
      .catch(() => {});
    apiGetServiceRequests()
      .then(r => setApiRequests(r.filter(x => x.clientId === clientId)))
      .catch(() => {});
  }, [clientId]);

  const myTickets = apiTickets ?? mockTickets.filter(t => t.clientId === clientId || !t.clientId);
  const myDocs = apiDocs ?? mockDocuments.filter(d => d.clientId === clientId);
  const myRequests = apiRequests ?? mockRequests.filter(r => r.clientId === clientId);

  const submitTicket = async (e) => {
    e.preventDefault();
    const tempId = 't-' + Date.now();
    const newT = { id: tempId, ...ticketForm, status: 'open', clientId, clientName: user?.name || '', assignedTo: 'Equipa Ciryx', comments: [] };
    setApiTickets(prev => [...(prev || myTickets), newT]);
    setShowTicketModal(false);
    setTicketForm(BLANK_TICKET);
    showToast('Ticket submetido com sucesso!');
    try {
      const created = await apiCreateTicket({ ...ticketForm, clientId });
      setApiTickets(prev => prev.map(t => t.id === tempId ? created : t));
    } catch {}
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    const tempId = 'r-' + Date.now();
    const newR = { id: tempId, ...requestForm, status: 'pending', clientId, date: new Date().toISOString().split('T')[0] };
    setApiRequests(prev => [...(prev || myRequests), newR]);
    setShowRequestModal(false);
    setRequestForm(BLANK_REQUEST);
    showToast('Pedido de serviço enviado!');
    try {
      const created = await apiCreateServiceRequest({ ...requestForm, clientId });
      setApiRequests(prev => prev.map(r => r.id === tempId ? created : r));
    } catch {}
  };

  const ticketReply = () => {
    if (!replyText.trim() || !activeTicket) return;
    const comment = { id: 'c' + Date.now(), author: user?.name || 'Cliente', isAdmin: false, text: replyText, date: new Date().toISOString() };
    setApiTickets(prev => (prev || myTickets).map(t => t.id === activeTicket.id ? { ...t, comments: [...(t.comments || []), comment] } : t));
    setActiveTicket(prev => ({ ...prev, comments: [...(prev.comments || []), comment] }));
    setReplyText('');
  };

  const handleFileUpload = (e, cat) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadedFiles(prev => ({ ...prev, [cat]: [...(prev[cat] || []), ...files.map(f => ({ name: f.name, size: `${(f.size / 1024).toFixed(0)} KB`, date: new Date().toISOString().split('T')[0] }))] }));
    showToast(`${files.length} ficheiro(s) carregados em "${EVID_CATS.find(c => c.id === cat)?.label}".`);
  };

  const triggerFileUpload = (cat) => {
    if (fileInputRef.current) {
      fileInputRef.current.onchange = (e) => handleFileUpload(e, cat);
      fileInputRef.current.click();
    }
  };

  const go = (p) => { setPage(p); setSidebarOpen(false); };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'tickets', label: 'Tickets de Suporte', icon: '🎫' },
    { id: 'pedidos', label: 'Pedidos de Serviço', icon: '📋' },
    { id: 'documentos', label: 'Documentos', icon: '📄' },
    { id: 'risco', label: 'Avaliação de Risco', icon: '🛡️' },
    { id: 'evidencias', label: 'Submeter Evidências', icon: '📤' },
  ];

  const sevBadge = (s) => { const m = { critical: 'badge-red', high: 'badge-orange', medium: 'badge-yellow', low: 'badge-gray' }; const l = { critical: 'Crítico', high: 'Alto', medium: 'Médio', low: 'Baixo' }; return <span className={`badge ${m[s] || 'badge-gray'}`}>{l[s] || s}</span>; };
  const critBadge = (c) => { const m = { 'crítico': 'badge-red', 'alto': 'badge-orange', 'médio': 'badge-yellow', 'baixo': 'badge-gray' }; return <span className={`badge ${m[c] || 'badge-gray'}`}>{c}</span>; };

  return (
    <div className="dash-layout">
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple />

      <div className={`sidebar-overlay${sidebarOpen ? ' show' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-logo" onClick={() => navigate('/')}><ShieldIcon /><div><div className="sidebar-logo-text">Ciryx</div><div className="sidebar-logo-sub">Portal do Cliente</div></div></div>
        <div className="sidebar-user"><div className="sidebar-user-name">{user?.name}</div><div className="sidebar-user-role">{user?.company || 'Cliente'}</div></div>
        <nav className="sidebar-nav">
          <div className="sidebar-section">PORTAL</div>
          {navItems.map(item => <button key={item.id} className={`sidebar-link${page === item.id ? ' active' : ''}`} onClick={() => go(item.id)}><span>{item.icon}</span> {item.label}</button>)}
        </nav>
        <div className="sidebar-footer"><button className="btn btn-outline btn-sm w-full" onClick={() => { logout(); navigate('/'); }}>Terminar Sessão</button></div>
      </aside>

      <div className="dash-main">
        <header className="dash-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="dash-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="dash-topbar-title">{navItems.find(n => n.id === page)?.label || 'Dashboard'}</span>
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
                <div className="stat-card"><div className="stat-card-label">Tickets Ativos</div><div className="stat-card-value">{myTickets.filter(t => t.status !== 'resolved').length}</div></div>
                <div className="stat-card"><div className="stat-card-label">Documentos</div><div className="stat-card-value">{myDocs.length}</div></div>
                <div className="stat-card"><div className="stat-card-label">Pedidos de Serviço</div><div className="stat-card-value">{myRequests.length}</div></div>
                {risco && <div className="stat-card"><div className="stat-card-label">Índice de Risco</div><div className="stat-card-value" style={{ color: risco.score >= 80 ? '#22c55e' : risco.score >= 60 ? '#eab308' : '#ef4444' }}>{risco.score}</div><div className="stat-card-change">{risco.level}</div></div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="table-wrap">
                  <div className="table-header"><h3>Tickets Recentes</h3><button className="btn btn-outline-dark btn-sm" onClick={() => go('tickets')}>Ver todos</button></div>
                  {myTickets.slice(0, 4).map(t => (
                    <div key={t.id} style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{t.title}</div><div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{t.category} • {t.assignedTo || 'Equipa Ciryx'}</div></div>
                      {statusBadge(t.status)}
                    </div>
                  ))}
                  {myTickets.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)' }}>Sem tickets.</div>}
                </div>
                <div className="table-wrap">
                  <div className="table-header"><h3>Pedidos de Serviço</h3><button className="btn btn-outline-dark btn-sm" onClick={() => go('pedidos')}>Ver todos</button></div>
                  {myRequests.slice(0, 4).map(s => (
                    <div key={s.id} style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{s.title || s.serviceName}</div>
                      {statusBadge(s.status)}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {page === 'tickets' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button className="btn btn-primary" onClick={() => { setTicketForm(BLANK_TICKET); setShowTicketModal(true); }}>+ Novo Ticket</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myTickets.map(t => (
                  <div key={t.id} className="table-wrap">
                    <div className="table-header">
                      <div>
                        <h3 style={{ marginBottom: '0.25rem' }}>{t.title}</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>{statusBadge(t.status)} {priorityBadge(t.priority)}<span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{t.category} • {t.assignedTo || 'Equipa Ciryx'}</span></div>
                      </div>
                      <button className="btn btn-outline-dark btn-sm" onClick={() => { setActiveTicket(t); setReplyText(''); }}>💬 Conversa</button>
                    </div>
                    {t.description && <div style={{ padding: '0 1.5rem 1rem', fontSize: '0.875rem', color: 'var(--slate-600)' }}>{t.description}</div>}
                  </div>
                ))}
                {myTickets.length === 0 && <div className="table-wrap" style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-400)' }}>Sem tickets abertos. <button className="btn btn-primary btn-sm" style={{ marginLeft: '1rem' }} onClick={() => setShowTicketModal(true)}>Criar ticket</button></div>}
              </div>
            </>
          )}

          {page === 'pedidos' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button className="btn btn-primary" onClick={() => { setRequestForm(BLANK_REQUEST); setShowRequestModal(true); }}>+ Novo Pedido</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myRequests.map(s => (
                  <div key={s.id} className="table-wrap" style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{s.title || s.serviceName}</div>
                        {s.description && <div style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '0.5rem' }}>{s.description}</div>}
                        {s.date && <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{s.date}</div>}
                      </div>
                      {statusBadge(s.status)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {page === 'documentos' && (
            <div className="table-wrap">
              <div className="table-header"><h3>Documentos ({myDocs.length})</h3></div>
              {myDocs.length > 0 ? (
                <div className="table-scroll">
                  <table>
                    <thead><tr><th>Nome</th><th>Tipo</th><th>Tamanho</th><th>Data</th><th>Categoria</th><th>Ação</th></tr></thead>
                    <tbody>{myDocs.map(d => (
                      <tr key={d.id}><td style={{ fontWeight: 500 }}>{d.name}</td><td><span className="badge badge-blue">{d.type}</span></td><td style={{ color: 'var(--slate-500)' }}>{d.size}</td><td style={{ color: 'var(--slate-500)' }}>{d.uploadDate}</td><td><span className="badge badge-gray">{d.category}</span></td><td><button className="btn btn-sm btn-outline-dark" onClick={() => showToast('Download (demo)')}>⬇</button></td></tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)' }}>Nenhum documento disponível.</div>}
            </div>
          )}

          {page === 'risco' && (
            risco ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem' }}>
                  <div className="table-wrap" style={{ padding: '0' }}>
                    <RiskGauge score={risco.score} />
                    <div style={{ padding: '0 1.25rem 1.25rem', fontSize: '0.8rem', color: 'var(--slate-500)', textAlign: 'center' }}>Última avaliação: {risco.lastUpdated}</div>
                  </div>
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
                </div>
                <div className="table-wrap">
                  <div className="table-header"><h3>Não Conformidades Identificadas</h3></div>
                  <div className="table-scroll">
                    <table>
                      <thead><tr><th>Categoria</th><th>Descrição</th><th>Severidade</th><th>Estado</th></tr></thead>
                      <tbody>{risco.findings.map(f => <tr key={f.id}><td style={{ fontWeight: 500 }}>{f.category}</td><td style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>{f.description}</td><td>{sevBadge(f.severity)}</td><td>{statusBadge(f.status)}</td></tr>)}</tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="table-wrap" style={{ padding: '4rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Avaliação de Risco Pendente</div>
                <div style={{ color: 'var(--slate-400)', marginBottom: '1.5rem' }}>A sua avaliação de risco ainda não foi concluída. Entre em contacto com a equipa Ciryx para agendar.</div>
                <button className="btn btn-primary" onClick={() => go('pedidos')}>Solicitar Avaliação</button>
              </div>
            )
          )}

          {page === 'evidencias' && (
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '2px' }}>
                {EVID_CATS.map(c => (
                  <button key={c.id} className={`btn btn-sm ${activeCat === c.id ? 'btn-primary' : 'btn-outline-dark'}`} style={{ whiteSpace: 'nowrap' }} onClick={() => setActiveCat(c.id)}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>

              {activeCat === 'ativos' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="table-wrap">
                    <div className="table-header"><h3>Ativos Tecnológicos Registados ({ativos.length})</h3><button className="btn btn-primary btn-sm" onClick={() => triggerFileUpload('ativos')}>+ Carregar</button></div>
                    {ativos.length > 0 ? (
                      <div className="table-scroll">
                        <table>
                          <thead><tr><th>Nome</th><th>Tipo</th><th>IP</th><th>SO</th><th>Criticidade</th><th>Estado</th></tr></thead>
                          <tbody>{ativos.map(a => <tr key={a.id}><td style={{ fontWeight: 500 }}>{a.nome}</td><td><span className="badge badge-blue">{a.tipo}</span></td><td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{a.ip}</td><td style={{ color: 'var(--slate-500)' }}>{a.so}</td><td>{critBadge(a.criticidade)}</td><td><span className={`badge ${a.estado === 'ativo' ? 'badge-green' : 'badge-gray'}`}>{a.estado}</span></td></tr>)}</tbody>
                        </table>
                      </div>
                    ) : null}
                  </div>
                  {(uploadedFiles['ativos'] || []).length > 0 && (
                    <div className="table-wrap">
                      <div className="table-header"><h3>Ficheiros Carregados</h3></div>
                      <div className="table-scroll"><table><thead><tr><th>Ficheiro</th><th>Tamanho</th><th>Data</th></tr></thead><tbody>{(uploadedFiles['ativos'] || []).map((f, i) => <tr key={i}><td>{f.name}</td><td>{f.size}</td><td>{f.date}</td></tr>)}</tbody></table></div>
                    </div>
                  )}
                </div>
              )}

              {activeCat === 'incidentes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="btn btn-primary btn-sm" onClick={() => triggerFileUpload('incidentes')}>+ Carregar Relatório</button></div>
                  {incidentes.map(i => (
                    <div key={i.id} className="table-wrap" style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 600 }}>{i.titulo}</div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>{sevBadge(i.severidade)}{statusBadge(i.estado)}</div>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '0.375rem' }}>{i.descricao}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{i.data} • <span className="badge badge-blue">{i.tipo}</span></div>
                    </div>
                  ))}
                  {incidentes.length === 0 && <div className="table-wrap" style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)' }}>Nenhum incidente reportado.</div>}
                </div>
              )}

              {activeCat === 'documentacao' && (
                <div>
                  <div
                    style={{ border: '2px dashed var(--slate-300)', borderRadius: '10px', padding: '3rem', textAlign: 'center', cursor: 'pointer', background: 'var(--slate-50)', marginBottom: '1rem' }}
                    onClick={() => triggerFileUpload('documentacao')}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--yellow)'; }}
                    onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--slate-300)'; }}
                    onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--slate-300)'; const files = Array.from(e.dataTransfer.files); if (files.length) { setUploadedFiles(prev => ({ ...prev, documentacao: [...(prev.documentacao || []), ...files.map(f => ({ name: f.name, size: `${(f.size / 1024).toFixed(0)} KB`, date: new Date().toISOString().split('T')[0] }))] })); showToast(`${files.length} ficheiro(s) carregados.`); } }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📄</div>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Arraste ficheiros para aqui ou clique para selecionar</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>PDF, DOCX, XLSX, PNG, JPG — até 50 MB por ficheiro</div>
                  </div>
                  {(uploadedFiles['documentacao'] || []).length > 0 && (
                    <div className="table-wrap">
                      <div className="table-header"><h3>Ficheiros Carregados ({(uploadedFiles['documentacao'] || []).length})</h3></div>
                      <div className="table-scroll"><table><thead><tr><th>Ficheiro</th><th>Tamanho</th><th>Data</th></tr></thead><tbody>{(uploadedFiles['documentacao'] || []).map((f, i) => <tr key={i}><td>{f.name}</td><td>{f.size}</td><td>{f.date}</td></tr>)}</tbody></table></div>
                    </div>
                  )}
                </div>
              )}

              {activeCat === 'pentests' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="btn btn-primary btn-sm" onClick={() => triggerFileUpload('pentests')}>+ Carregar Relatório</button></div>
                  {penTests.map(p => (
                    <div key={p.id} className="table-wrap" style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{p.titulo}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '0.75rem' }}>{p.data} • {p.tipo} • {p.consultor}</div>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {[['Crítico', p.critico, '#ef4444', '#fef2f2'], ['Alto', p.alto, '#f97316', '#fff7ed'], ['Médio', p.medio, '#eab308', '#fefce8'], ['Baixo', p.baixo, 'var(--slate-500)', 'var(--slate-50)']].map(([label, count, color, bg]) => (
                          <div key={label} style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: bg, textAlign: 'center', minWidth: '80px' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color }}>{count}</div>
                            <div style={{ fontSize: '0.7rem', color }}>{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {penTests.length === 0 && <div className="table-wrap" style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)' }}>Nenhum pen test registado.</div>}
                </div>
              )}

              {activeCat === 'outros' && (
                <div>
                  <div
                    style={{ border: '2px dashed var(--slate-300)', borderRadius: '10px', padding: '3rem', textAlign: 'center', cursor: 'pointer', background: 'var(--slate-50)', marginBottom: '1rem' }}
                    onClick={() => triggerFileUpload('outros')}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--yellow)'; }}
                    onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--slate-300)'; }}
                    onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--slate-300)'; const files = Array.from(e.dataTransfer.files); if (files.length) { setUploadedFiles(prev => ({ ...prev, outros: [...(prev.outros || []), ...files.map(f => ({ name: f.name, size: `${(f.size / 1024).toFixed(0)} KB`, date: new Date().toISOString().split('T')[0] }))] })); showToast(`${files.length} ficheiro(s) carregados.`); } }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📎</div>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Arraste ficheiros para aqui ou clique para selecionar</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Qualquer formato aceite</div>
                  </div>
                  {(uploadedFiles['outros'] || []).length > 0 && (
                    <div className="table-wrap">
                      <div className="table-header"><h3>Ficheiros Carregados ({(uploadedFiles['outros'] || []).length})</h3></div>
                      <div className="table-scroll"><table><thead><tr><th>Ficheiro</th><th>Tamanho</th><th>Data</th></tr></thead><tbody>{(uploadedFiles['outros'] || []).map((f, i) => <tr key={i}><td>{f.name}</td><td>{f.size}</td><td>{f.date}</td></tr>)}</tbody></table></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* TICKET CONVERSATION MODAL */}
      {activeTicket && (
        <div className="modal-overlay" onClick={() => setActiveTicket(null)}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div><h3>{activeTicket.title}</h3><div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>{statusBadge(activeTicket.status)} {priorityBadge(activeTicket.priority)}</div></div>
              <button className="btn-ghost" style={{ color: 'var(--slate-600)', fontSize: '1.25rem' }} onClick={() => setActiveTicket(null)}>✕</button>
            </div>
            <div className="ticket-messages">
              {(activeTicket.comments || []).length === 0 && <div style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '2rem' }}>Sem mensagens ainda.</div>}
              {(activeTicket.comments || []).map(c => (
                <div key={c.id} style={{ alignSelf: c.isAdmin ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                  <div className={`msg-bubble ${c.isAdmin ? 'admin-msg' : 'client-msg'}`}>{c.text}</div>
                  <div className="msg-meta" style={{ textAlign: c.isAdmin ? 'left' : 'right' }}>{c.author} • {new Date(c.date).toLocaleString('pt')}</div>
                </div>
              ))}
            </div>
            {activeTicket.status !== 'resolved' && (
              <div className="ticket-reply">
                <input className="input" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Escrever mensagem..." style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && ticketReply()} />
                <button className="btn btn-primary" onClick={ticketReply}>Enviar</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEW TICKET MODAL */}
      {showTicketModal && (
        <div className="modal-overlay" onClick={() => setShowTicketModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Novo Ticket de Suporte</h3><button className="btn-ghost" style={{ color: 'var(--slate-600)', fontSize: '1.25rem' }} onClick={() => setShowTicketModal(false)}>✕</button></div>
            <form onSubmit={submitTicket}>
              <div className="modal-body">
                <div className="form-group"><label className="label">Título *</label><input className="input" value={ticketForm.title} onChange={e => setTicketForm({ ...ticketForm, title: e.target.value })} required placeholder="Descreva brevemente o problema..." /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group"><label className="label">Categoria</label><select className="input" value={ticketForm.category} onChange={e => setTicketForm({ ...ticketForm, category: e.target.value })}><option>Suporte Técnico</option><option>Segurança</option><option>Auditoria</option><option>NIS2</option><option>Outro</option></select></div>
                  <div className="form-group"><label className="label">Prioridade</label><select className="input" value={ticketForm.priority} onChange={e => setTicketForm({ ...ticketForm, priority: e.target.value })}><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option><option value="urgent">Urgente</option></select></div>
                </div>
                <div className="form-group"><label className="label">Descrição *</label><textarea className="input" rows={4} value={ticketForm.description} onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })} required placeholder="Descreva o problema em detalhe..." /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-outline-dark" onClick={() => setShowTicketModal(false)}>Cancelar</button><button type="submit" className="btn btn-primary">Submeter Ticket</button></div>
            </form>
          </div>
        </div>
      )}

      {/* NEW REQUEST MODAL */}
      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Novo Pedido de Serviço</h3><button className="btn-ghost" style={{ color: 'var(--slate-600)', fontSize: '1.25rem' }} onClick={() => setShowRequestModal(false)}>✕</button></div>
            <form onSubmit={submitRequest}>
              <div className="modal-body">
                <div className="form-group"><label className="label">Tipo de Serviço *</label><select className="input" value={requestForm.title} onChange={e => setRequestForm({ ...requestForm, title: e.target.value })} required><option value="">Selecionar...</option><option>Implementação NIS2</option><option>Auditoria de Segurança</option><option>Formação & Security Awareness</option><option>Gestão Contínua de Risco</option><option>Pen Test</option><option>Resposta a Incidentes</option><option>Consultoria</option></select></div>
                <div className="form-group"><label className="label">Descrição</label><textarea className="input" rows={4} value={requestForm.description} onChange={e => setRequestForm({ ...requestForm, description: e.target.value })} placeholder="Informações adicionais sobre o pedido..." /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-outline-dark" onClick={() => setShowRequestModal(false)}>Cancelar</button><button type="submit" className="btn btn-primary">Enviar Pedido</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
