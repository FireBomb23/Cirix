import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api.js';
import { entities } from '../entities.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ListPage() {
  const { entity } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const config = entities[entity];

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  async function carregar() {
    if (!config) return;
    setLoading(true);
    setErro(null);
    try {
      const { data } = await api.get(config.endpoint);
      setRows(data);
    } catch (e) {
      setErro(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, [entity]); // eslint-disable-line

  async function eliminar(id) {
    if (!window.confirm('Tem a certeza que deseja eliminar este registo?')) return;
    try {
      await api.delete(`${config.endpoint}/delete/${id}`);
      carregar();
    } catch (e) {
      alert('Erro ao eliminar: ' + (e.response?.data?.error || e.message));
    }
  }

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  // Pesquisa (em todas as colunas) + ordenacao
  const visibleRows = useMemo(() => {
    if (!config) return [];
    let r = rows;
    if (q.trim()) {
      const t = q.toLowerCase();
      r = r.filter((row) => JSON.stringify(row).toLowerCase().includes(t));
    }
    if (sortKey) {
      r = [...r].sort((a, b) => {
        const va = a[sortKey], vb = b[sortKey];
        if (va == null) return 1;
        if (vb == null) return -1;
        const na = Number(va), nb = Number(vb);
        const cmp = (!isNaN(na) && !isNaN(nb)) ? na - nb : String(va).localeCompare(String(vb));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return r;
  }, [rows, q, sortKey, sortDir, config]);

  // Volta a pagina 1 quando muda a pesquisa/ordenacao
  useEffect(() => { setPage(1); }, [q, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(visibleRows.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = visibleRows.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  if (!config) return <p className="muted">Entidade desconhecida.</p>;
  if (user && user.role !== 'admin') return <p className="erro">Acesso restrito a administradores.</p>;

  return (
    <div>
      <div className="flex align-center justify-between mb-4">
        <h1 className="page-title">{config.label}</h1>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin')}>← Dashboard</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/crud/${entity}/novo`)}>
            + Novo {config.singular}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          className="input"
          placeholder={`Pesquisar em ${config.label.toLowerCase()}...`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: '320px' }}
        />
      </div>

      {loading && <p className="muted">A carregar...</p>}
      {erro && <p className="erro">Erro: {erro}</p>}

      {!loading && !erro && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                {config.columns.map((c) => (
                  <th key={c.key} style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort(c.key)}>
                    {c.label}{sortKey === c.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                  </th>
                ))}
                <th className="acoes-col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={config.columns.length + 1} className="muted text-center">Sem registos.</td>
                </tr>
              )}
              {paged.map((row) => (
                <tr key={row.id}>
                  {config.columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(row) : formatar(row[c.key])}</td>
                  ))}
                  <td>
                    <div className="acoes">
                      <button className="btn btn-sm" onClick={() => navigate(`/crud/${entity}/editar/${row.id}`)}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => eliminar(row.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {visibleRows.length > PAGE_SIZE && (
            <div className="flex align-center justify-between" style={{ marginTop: '1rem' }}>
              <span className="muted" style={{ fontSize: '0.85rem' }}>
                {visibleRows.length} registo(s) — página {pageSafe} de {totalPages}
              </span>
              <div className="flex gap-2">
                <button className="btn btn-outline btn-sm" disabled={pageSafe <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>← Anterior</button>
                <button className="btn btn-outline btn-sm" disabled={pageSafe >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Seguinte →</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatar(valor) {
  if (valor === null || valor === undefined) return '-';
  return String(valor);
}
