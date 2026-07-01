import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGetArticles, apiGetServices } from '../apiService.js';

const serviceIcons = {
  shield: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--yellow-dark)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  bug: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--yellow-dark)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  'file-check': (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--yellow-dark)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  'graduation-cap': (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--yellow-dark)' }}>
      <path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default function Home() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    apiGetServices().then(setServices).catch(() => setServices([]));
    apiGetArticles().then((a) => setArticles(a.slice(0, 3))).catch(() => setArticles([]));
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-inner">
          <h1>Cibersegurança para organizações<br />que <span>não podem parar</span></h1>
          <p>
            A Cyrix apoia organizações de setores críticos no cumprimento da Diretiva NIS2,
            na gestão de riscos cibernéticos e na construção de uma postura de segurança resiliente.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/contacto')}>
              Agendar Consulta
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/servicos')}>
              Ver Serviços
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><span className="hero-stat-num">150+</span><span className="hero-stat-label">Organizações Apoiadas</span></div>
            <div className="hero-stat"><span className="hero-stat-num">NIS2</span><span className="hero-stat-label">Conformidade Garantida</span></div>
            <div className="hero-stat"><span className="hero-stat-num">ISO</span><span className="hero-stat-label">27001 · NIST · CIS</span></div>
            <div className="hero-stat"><span className="hero-stat-num">24/7</span><span className="hero-stat-label">Suporte Dedicado</span></div>
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-8">
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Os Nossos Serviços</h2>
            <p style={{ color: 'var(--slate-600)', maxWidth: 600, margin: '0 auto' }}>
              Oferecemos uma gama completa de serviços de cibersegurança para proteger e preparar a sua organização.
            </p>
          </div>
          <div className="services-grid">
            {services.map((s) => (
              <div key={s.id} className="card">
                <div className="card-content">
                  <div className="service-icon-box">{serviceIcons[s.icon]}</div>
                  <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>{s.title}</h3>
                  <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', marginBottom: '1rem' }}>{s.description}</p>
                  {s.features.map((f, i) => (
                    <div key={i} className="service-feature">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} style={{ color: 'var(--green)', flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/servicos')}>Ver Todos os Serviços</button>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="section section-bg">
        <div className="container two-col">
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Por que escolher a Cyrix?</h2>
            <div className="why-item">
              <div className="why-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--yellow-dark)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h4 style={{ marginBottom: '0.25rem' }}>Especialização Comprovada</h4>
                <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem' }}>Equipa certificada com vasta experiência em segurança da informação e conformidade regulatória.</p>
              </div>
            </div>
            <div className="why-item">
              <div className="why-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--yellow-dark)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h4 style={{ marginBottom: '0.25rem' }}>Abordagem Proativa</h4>
                <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem' }}>Identificamos e mitigamos ameaças antes que causem impacto no seu negócio.</p>
              </div>
            </div>
            <div className="why-item">
              <div className="why-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--yellow-dark)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <h4 style={{ marginBottom: '0.25rem' }}>Parceria de Confiança</h4>
                <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem' }}>Construímos relações de longo prazo, acompanhando a evolução das suas necessidades.</p>
              </div>
            </div>
            <div className="why-item">
              <div className="why-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--yellow-dark)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div>
                <h4 style={{ marginBottom: '0.25rem' }}>Resultados Mensuráveis</h4>
                <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem' }}>Relatórios detalhados e métricas claras para demonstrar o valor dos nossos serviços.</p>
              </div>
            </div>
          </div>
          <div>
            <div style={{ background: 'linear-gradient(145deg, var(--slate-900) 0%, #1a2744 100%)', color: 'white', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
              <div style={{ padding: '0.5rem 0 0', background: 'linear-gradient(90deg, rgba(234,179,8,0.15), transparent)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ padding: '0.75rem 1.75rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Consulta Gratuita
                </div>
              </div>
              <div style={{ padding: '1.75rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'white', fontSize: '1.5rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>Pronto para fortalecer a sua segurança?</h3>
                <p style={{ color: 'var(--slate-400)', marginBottom: '1.75rem', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  Agende uma consulta gratuita com os nossos especialistas e descubra como podemos ajudar a sua organização.
                </p>
                <button className="btn btn-primary btn-lg w-full" onClick={() => navigate('/contacto')}>
                  Falar com um Especialista
                </button>
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem' }}>
                  {['Análise inicial gratuita', 'Proposta personalizada', 'Sem compromisso'].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--slate-300)' }}>
                      <div style={{ width: '1.25rem', height: '1.25rem', background: 'rgba(234,179,8,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} style={{ color: 'var(--yellow)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NIS2 CONTEXT */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-8">
            <span className="badge badge-yellow" style={{ fontSize: '0.8rem', marginBottom: '0.75rem', display: 'inline-block' }}>Diretiva NIS2</span>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>O contexto que mudou tudo</h2>
            <p style={{ color: 'var(--slate-600)', maxWidth: 680, margin: '0 auto' }}>
              A Diretiva NIS2 veio ampliar significativamente o âmbito das obrigações de cibersegurança na União Europeia.
              Organizações de setores críticos e essenciais devem implementar medidas robustas — ou enfrentar coimas de até 10 milhões de euros.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
            {[
              { icon: '🏛️', label: 'Administração Pública' },
              { icon: '🏭', label: 'Indústria' },
              { icon: '⚡', label: 'Energia' },
              { icon: '🏥', label: 'Saúde' },
              { icon: '🚢', label: 'Transportes' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--slate-900)', borderRadius: '1rem', color: 'white', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Metodologias que aplicamos</div>
            {['ISO 27001', 'NIST CSF', 'CIS Controls', 'ENISA'].map((m, i) => (
              <div key={i} style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--yellow)', padding: '0.375rem 1rem', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '6px' }}>{m}</div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS PREVIEW */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Últimas Notícias</h2>
              <p style={{ color: 'var(--slate-600)' }}>Mantenha-se atualizado com as tendências em cibersegurança.</p>
            </div>
            <button className="btn btn-outline-dark" onClick={() => navigate('/noticias')}>Ver Todas</button>
          </div>
          <div className="articles-grid">
            {articles.map((a) => (
              <div key={a.id} className="card">
                <div className="article-img">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="card-content">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span className="badge badge-yellow">{a.category}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{a.date}</span>
                  </div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{a.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '1rem' }}>{a.excerpt}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{a.author}</span>
                    <button className="btn btn-sm" style={{ color: 'var(--yellow-dark)', fontWeight: 600, padding: 0, background: 'none' }}>
                      Ler mais →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <h2>Pronto para Proteger a sua Organização?</h2>
          <p>Junte-se a mais de 150 empresas que confiam na Cyrix para a sua segurança cibernética e conformidade regulatória.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-white btn-lg" onClick={() => navigate('/contacto')}>Agendar Consulta Gratuita</button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/servicos')}>Conhecer os Serviços</button>
          </div>
        </div>
      </section>
    </>
  );
}
