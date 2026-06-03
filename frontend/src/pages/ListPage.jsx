import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

  async function eliminar(id) {
    if (!window.confirm('Tem a certeza que deseja eliminar este registo?')) return;
    try {
      await api.delete(`${config.endpoint}/delete/${id}`);
      carregar();
    } catch (e) {
      alert('Erro ao eliminar: ' + (e.response?.data?.error || e.message));
    }
  }

  if (!config) return <p>Entidade desconhecida.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-title">{config.label}</h1>
        <button className="btn btn-primary" onClick={() => navigate(`/${entity}/novo`)}>
          + Novo {config.singular}
        </button>
      </div>

      {loading && <p className="muted">A carregar...</p>}
      {erro && <p className="erro">Erro: {erro}</p>}

      {!loading && !erro && (
        <table className="table">
          <thead>
            <tr>
              {config.columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
              <th className="acoes-col">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={config.columns.length + 1} className="muted text-center">
                  Sem registos.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id}>
                {config.columns.map((c) => (
                  <td key={c.key}>{c.render ? c.render(row) : formatar(row[c.key])}</td>
                ))}
                <td className="acoes">
                  <Link className="btn btn-sm" to={`/${entity}/editar/${row.id}`}>
                    Editar
                  </Link>
                  <button className="btn btn-sm btn-danger" onClick={() => eliminar(row.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function formatar(valor) {
  if (valor === null || valor === undefined) return '-';
  return String(valor);
}
