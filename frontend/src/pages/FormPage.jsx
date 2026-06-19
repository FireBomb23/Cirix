import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api.js';
import { entities } from '../entities.js';

export default function FormPage() {
  const { entity, id } = useParams();
  const navigate = useNavigate();
  const config = entities[entity];
  const emEdicao = Boolean(id);

  const [form, setForm] = useState({});
  const [refOptions, setRefOptions] = useState({});
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!config) return;
    config.fields
      .filter((f) => f.type === 'ref')
      .forEach(async (f) => {
        try {
          const { data } = await api.get(f.refEndpoint);
          setRefOptions((prev) => ({ ...prev, [f.name]: data }));
        } catch { /* ignora */ }
      });
  }, [entity]); // eslint-disable-line

  useEffect(() => {
    if (!config) return;
    if (!emEdicao) {
      const inicial = {};
      config.fields.forEach((f) => { inicial[f.name] = f.type === 'boolean' ? true : ''; });
      setForm(inicial);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`${config.endpoint}/${id}`);
        const limpo = {};
        config.fields.forEach((f) => {
          let v = data[f.name];
          if (f.type === 'boolean') v = Boolean(v);
          else if (f.type === 'datetime-local' && v) v = String(v).slice(0, 16);
          else if (f.type === 'date' && v) v = String(v).slice(0, 10);
          else if (f.type === 'password') v = '';
          else v = v ?? '';
          limpo[f.name] = v;
        });
        setForm(limpo);
      } catch (e) {
        setErro(e.response?.data?.error || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [entity, id]); // eslint-disable-line

  function alterar(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submeter(e) {
    e.preventDefault();
    setErro(null);
    try {
      if (emEdicao) {
        await api.put(`${config.endpoint}/update/${id}`, form);
      } else {
        await api.post(`${config.endpoint}/create`, form);
      }
      navigate(`/admin/${entity}`);
    } catch (e) {
      setErro(e.response?.data?.error || e.message);
    }
  }

  if (!config) return <p className="muted">Entidade desconhecida.</p>;

  return (
    <div className="form-wrap">
      <div className="flex align-center gap-2 mb-4">
        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/admin/${entity}`)}>← Voltar</button>
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          {emEdicao ? `Editar ${config.singular}` : `Novo ${config.singular}`}
        </h1>
      </div>

      {erro && <p className="erro">Erro: {erro}</p>}
      {loading && <p className="muted">A carregar...</p>}

      <div className="crud-form">
        <form onSubmit={submeter}>
          {config.fields.map((f) => (
            <div className="form-row" key={f.name}>
              <label>{f.label}{f.required && <span className="req">*</span>}</label>
              {renderCampo(f, form[f.name], alterar, refOptions[f.name])}
              {f.hint && <small className="muted">{f.hint}</small>}
            </div>
          ))}
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(`/admin/${entity}`)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {emEdicao ? 'Guardar alterações' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function renderCampo(f, value, alterar, options) {
  if (f.type === 'boolean') {
    return (
      <input
        type="checkbox"
        className="checkbox"
        checked={Boolean(value)}
        onChange={(e) => alterar(f.name, e.target.checked)}
      />
    );
  }
  if (f.type === 'textarea') {
    return (
      <textarea
        rows={3}
        value={value ?? ''}
        required={f.required}
        onChange={(e) => alterar(f.name, e.target.value)}
      />
    );
  }
  if (f.type === 'select') {
    return (
      <select value={value ?? ''} onChange={(e) => alterar(f.name, e.target.value)} required={f.required}>
        <option value="">-- selecionar --</option>
        {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  if (f.type === 'ref') {
    return (
      <select value={value ?? ''} onChange={(e) => alterar(f.name, e.target.value)} required={f.required}>
        <option value="">-- selecionar --</option>
        {(options || []).map((o) => (
          <option key={o.id} value={o.id}>{o[f.refLabel]}</option>
        ))}
      </select>
    );
  }
  return (
    <input
      type={f.type}
      value={value ?? ''}
      required={f.required}
      onChange={(e) => alterar(f.name, e.target.value)}
    />
  );
}
