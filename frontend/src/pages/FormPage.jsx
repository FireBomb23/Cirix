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
  const [refOptions, setRefOptions] = useState({}); // opcoes para campos "ref"
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);

  // Carrega as opcoes dos campos "ref" (ex: lista de utilizadores)
  useEffect(() => {
    if (!config) return;
    config.fields
      .filter((f) => f.type === 'ref')
      .forEach(async (f) => {
        try {
          const { data } = await api.get(f.refEndpoint);
          setRefOptions((prev) => ({ ...prev, [f.name]: data }));
        } catch {
          /* ignora: campo fica vazio se a BD estiver offline */
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

  // Valores iniciais (criar) ou carregamento do registo (editar)
  useEffect(() => {
    if (!config) return;

    if (!emEdicao) {
      // Defaults para criacao (booleans a true por omissao)
      const inicial = {};
      config.fields.forEach((f) => {
        inicial[f.name] = f.type === 'boolean' ? true : '';
      });
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
          else if (f.type === 'password') v = ''; // nunca pre-preencher passwords
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, id]);

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
      navigate(`/${entity}`);
    } catch (e) {
      setErro(e.response?.data?.error || e.message);
    }
  }

  if (!config) return <p>Entidade desconhecida.</p>;

  return (
    <div className="form-wrap">
      <h1 className="page-title mb-4">
        {emEdicao ? `Editar ${config.singular}` : `Novo ${config.singular}`}
      </h1>

      {erro && <p className="erro">Erro: {erro}</p>}
      {loading && <p className="muted">A carregar...</p>}

      <form onSubmit={submeter} className="form">
        {config.fields.map((f) => (
          <div className="form-row" key={f.name}>
            <label>{f.label}{f.required && <span className="req">*</span>}</label>
            {renderCampo(f, form[f.name], alterar, refOptions[f.name])}
            {f.hint && <small className="muted">{f.hint}</small>}
          </div>
        ))}
        <div className="form-actions">
          <button type="button" className="btn" onClick={() => navigate(`/${entity}`)}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            {emEdicao ? 'Guardar alteracoes' : 'Criar'}
          </button>
        </div>
      </form>
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
        {f.options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
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
