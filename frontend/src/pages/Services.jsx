import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGetServices } from '../apiService.js';

const serviceIcons = {
  shield: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--yellow-dark)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  bug: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--yellow-dark)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  'file-check': <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--yellow-dark)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  'graduation-cap': <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--yellow-dark)' }}><path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

const steps = [
  { num: '01', title: 'Diagnóstico Inicial', desc: 'Análise do estado atual de segurança e identificação das principais áreas de risco.' },
  { num: '02', title: 'Plano de Ação', desc: 'Desenvolvimento de um roadmap personalizado com prioridades e prazos definidos.' },
  { num: '03', title: 'Implementação', desc: 'Execução das medidas de segurança com acompanhamento técnico especializado.' },
  { num: '04', title: 'Monitorização', desc: 'Acompanhamento contínuo e relatórios periódicos sobre o estado da segurança.' },
];

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);

  useEffect(() => {
    apiGetServices().then(setServices).catch(() => setServices([]));
  }, []);

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>Os Nossos Serviços</h1>
          <p>Apoiamos organizações de setores críticos a cumprir a NIS2, gerir riscos e construir uma postura de segurança resiliente.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="text-center mb-8">
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>O que oferecemos</h2>
            <p style={{ color: 'var(--slate-600)', maxWidth: 600, margin: '0 auto' }}>
              Uma gama completa de serviços de cibersegurança para proteger e preparar a sua organização para os desafios digitais.
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
        </div>
      </section>

      <section className="section section-bg">
        <div className="container">
          <div className="text-center mb-8">
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>O Nosso Processo</h2>
            <p style={{ color: 'var(--slate-600)', maxWidth: 600, margin: '0 auto' }}>
              Uma abordagem estruturada para garantir os melhores resultados.
            </p>
          </div>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="step-num">{s.num}</div>
                <h4 style={{ marginBottom: '0.5rem' }}>{s.title}</h4>
                <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Pronto para começar?</h2>
          <p>Contacte-nos hoje para uma consulta gratuita e descubra como podemos ajudar a sua organização.</p>
          <button className="btn btn-white btn-lg" onClick={() => navigate('/contacto')}>Falar com um Especialista</button>
        </div>
      </section>
    </>
  );
}
