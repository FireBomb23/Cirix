import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api.js';
import { entities } from '../entities.js';

export default function ListPage() {
  const { entity } = useParams();
  const navigate = useNavigate();
  const config = entities[entity];

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

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

  if (!config) return <p className="muted">Entidade desconhecida.</p>;

  return (
    <div>
      <div className="flex align-center justify-between mb-4">
        <h1 className="page-title">{config.label}</h1>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin')}>← Dashboard</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/admin/${entity}/novo`)}>
            + Novo {config.singular}
          </button>
        </div>
      </div>

      {loading && <p className="muted">A carregar...</p>}
      {erro && <p className="erro">Erro: {erro}</p>}

      {!loading && !erro && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                {config.columns.map((c) => <th key={c.key}>{c.label}</th>)}
                <th className="acoes-col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={config.columns.length + 1} className="muted text-center">Sem registos.</td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id}>
                  {config.columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(row) : formatar(row[c.key])}</td>
                  ))}
                  <td>
                    <div className="acoes">
                      <button className="btn btn-sm" onClick={() => navigate(`/admin/${entity}/editar/${row.id}`)}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => eliminar(row.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatar(valor) {
  if (valor === null || valor === undefined) return '-';
  return String(valor);
}
