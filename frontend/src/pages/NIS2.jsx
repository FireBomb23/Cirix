import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiGetDocuments, apiGetIncidents, apiGetTechAssets } from '../apiService.js';

const REQS = [
  { t: 'Políticas de segurança da informação e análise de risco aprovadas pela gestão', p: 'Governança & Risco' },
  { t: 'Controlo de acessos e gestão de identidades (privilégio mínimo)', p: 'Governança & Risco' },
  { t: 'Autenticação multifator (MFA) e comunicações seguras', p: 'Governança & Risco' },
  { t: 'Uso de criptografia e cifragem de dados sensíveis', p: 'Governança & Risco' },
  { t: 'Formação e sensibilização em cibersegurança dos colaboradores', p: 'Governança & Risco' },
  { t: 'Procedimento de gestão e notificação de incidentes (alerta 24h / notificação 72h)', p: 'Deteção & Resposta' },
  { t: 'Testes e auditorias de segurança regulares (ex.: pentests)', p: 'Deteção & Resposta' },
  { t: 'Plano de continuidade de negócio e recuperação de desastres (backups testados)', p: 'Resiliência' },
  { t: 'Segurança da cadeia de fornecedores e prestadores de serviços', p: 'Resiliência' },
  { t: 'Segurança na aquisição, desenvolvimento e manutenção de sistemas', p: 'Resiliência' },
];
const PILLARS = ['Governança & Risco', 'Deteção & Resposta', 'Resiliência'];

export default function NIS2() {
  const { user } = useAuth();
  const storeKey = `nis2_assessment_${user?.email || 'anon'}`;
  const [checked, setChecked] = useState({});
  const [comp, setComp] = useState(null);

  // Carregar avaliação guardada (persiste entre visitas)
  useEffect(() => {
    try { const s = localStorage.getItem(storeKey); if (s) setChecked(JSON.parse(s)); else setChecked({}); }
    catch { setChecked({}); }
  }, [storeKey]);
  // Guardar sempre que muda
  useEffect(() => {
    try { localStorage.setItem(storeKey, JSON.stringify(checked)); } catch { /* ignora */ }
  }, [checked, storeKey]);

  useEffect(() => {
    if (user && user.role === 'client') {
      Promise.all([
        apiGetDocuments().catch(() => []),
        apiGetIncidents().catch(() => []),
        apiGetTechAssets().catch(() => []),
      ]).then(([docs, inc, ass]) =>
        setComp({
          docs: Array.isArray(docs) ? docs.length : 0,
          inc: Array.isArray(inc) ? inc.length : 0,
          ass: Array.isArray(ass) ? ass.length : 0,
        })
      );
    }
  }, [user]);

  const done = Object.values(checked).filter(Boolean).length;
  const total = REQS.length;
  const pct = Math.round((done / total) * 100);
  const estado = pct >= 80 ? 'Conforme' : pct >= 50 ? 'Em avaliação' : 'Com pendências';
  const cor = pct >= 80 ? '#16A34A' : pct >= 50 ? '#EAB308' : '#DC2626';
  const toggle = (i) => setChecked((c) => ({ ...c, [i]: !c[i] }));
  const repor = () => setChecked({});

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Diretiva <span style={{ color: 'var(--yellow)' }}>NIS2</span></h1>
          <p>A diretiva (UE) 2022/2555 reforça a cibersegurança das entidades essenciais e importantes na União Europeia. Avalie o nível de conformidade da sua organização.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {comp && (
            <div className="card" style={{ marginBottom: '2.5rem', borderColor: 'var(--yellow)' }}>
              <div className="card-content">
                <h3 style={{ marginBottom: '1rem' }}>O seu estado de conformidade <span style={{ color: 'var(--yellow)' }}>(dados reais)</span></h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }}>
                  <div><div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--yellow)' }}>{comp.docs}</div><div style={{ color: 'var(--slate-500)', fontSize: '.85rem' }}>Documentos de evidência</div></div>
                  <div><div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--yellow)' }}>{comp.inc}</div><div style={{ color: 'var(--slate-500)', fontSize: '.85rem' }}>Incidentes reportados</div></div>
                  <div><div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--yellow)' }}>{comp.ass}</div><div style={{ color: 'var(--slate-500)', fontSize: '.85rem' }}>Ativos registados</div></div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
            <div className="card"><div className="card-content"><h3>O que é?</h3><p style={{ color: 'var(--slate-600)' }}>Quadro legal europeu que obriga entidades essenciais e importantes a adotar medidas de gestão de risco de cibersegurança e a notificar incidentes graves às autoridades.</p></div></div>
            <div className="card"><div className="card-content"><h3>A quem se aplica?</h3><p style={{ color: 'var(--slate-600)' }}>Energia, saúde, transportes, banca, infraestruturas digitais, administração pública, águas e fornecedores considerados críticos.</p></div></div>
            <div className="card"><div className="card-content"><h3>Prazos &amp; coimas</h3><p style={{ color: 'var(--slate-600)' }}>Transposição em 2024. Incidentes: alerta em 24h e notificação em 72h. Coimas até 10M€ ou 2% do volume de negócios global.</p></div></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem' }}>Autoavaliação de conformidade</h2>
            <button className="btn btn-outline-dark btn-sm" onClick={repor}>Repor avaliação</button>
          </div>

          <div className="two-col" style={{ alignItems: 'start', gap: '2.5rem' }}>
            <div className="card"><div className="card-content">
              <p style={{ color: 'var(--slate-500)', fontSize: '.9rem', marginBottom: '1rem' }}>Assinale as medidas que a sua organização já implementa (guardado automaticamente):</p>
              {PILLARS.map((pil) => (
                <div key={pil} style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--yellow-dark)', marginBottom: '.4rem' }}>{pil}</div>
                  {REQS.map((r, i) => r.p === pil && (
                    <label key={i} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start', padding: '.5rem 0', borderBottom: '1px solid var(--slate-200)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={!!checked[i]} onChange={() => toggle(i)} style={{ marginTop: '.2rem', width: 18, height: 18, accentColor: 'var(--yellow)', flexShrink: 0 }} />
                      <span style={{ color: 'var(--slate-700)', fontSize: '.92rem' }}>{r.t}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div></div>
            <div className="card" style={{ position: 'sticky', top: '5.5rem' }}><div className="card-content" style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Resultado</h3>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: "'Syne', sans-serif", color: cor, lineHeight: 1 }}>{pct}%</div>
              <div style={{ display: 'inline-block', padding: '.35rem 1rem', borderRadius: 9999, background: cor, color: '#0f172a', fontWeight: 700, marginTop: '.75rem' }}>{estado}</div>
              <div className="progress-bar" style={{ marginTop: '1.5rem', height: '.75rem' }}><div className="progress-fill" style={{ width: `${pct}%`, background: cor }} /></div>
              <p style={{ color: 'var(--slate-500)', fontSize: '.9rem', marginTop: '1rem' }}>{done} de {total} medidas implementadas.</p>
              {done < total
                ? <p style={{ color: 'var(--slate-500)', fontSize: '.85rem', marginTop: '.5rem' }}>Faltam <b style={{ color: 'var(--yellow-dark)' }}>{total - done}</b> medida(s). Priorize as não assinaladas para reduzir o risco.</p>
                : <p style={{ color: 'var(--green)', fontSize: '.9rem', marginTop: '.5rem' }}>Excelente! Todas as medidas essenciais estão implementadas.</p>}
            </div></div>
          </div>
        </div>
      </section>
    </>
  );
}
