import { useNavigate } from 'react-router-dom';

const team = [
  { name: 'Dr. Miguel Ferreira', role: 'CEO & Fundador', initials: 'MF' },
  { name: 'Eng. Ana Costa', role: 'Diretora Técnica', initials: 'AC' },
  { name: 'João Silva', role: 'Consultor Sénior', initials: 'JS' },
  { name: 'Maria Santos', role: 'Especialista NIS2', initials: 'MS' },
];

export default function About() {
  const navigate = useNavigate();
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>Sobre Nós</h1>
          <p>Especialistas em cibersegurança e conformidade regulatória ao serviço das organizações portuguesas.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="text-center mb-8">
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Missão, Visão e Valores</h2>
            <p style={{ color: 'var(--slate-600)', maxWidth: 600, margin: '0 auto' }}>
              Os princípios que guiam cada projeto e cada interação com os nossos clientes.
            </p>
          </div>
          <div className="mvv-grid">
            {[
              {
                label: 'Missão',
                text: 'Proteger as organizações portuguesas através de consultoria especializada em cibersegurança, contribuindo para um ecossistema digital mais seguro e resiliente.',
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--yellow-dark)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              },
              {
                label: 'Visão',
                text: 'Ser a referência nacional em consultoria de cibersegurança e conformidade NIS2, reconhecida pela excelência técnica e compromisso com os clientes.',
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--yellow-dark)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
              },
              {
                label: 'Valores',
                text: 'Integridade, excelência técnica, inovação contínua e parceria genuína com os nossos clientes são os pilares da nossa atuação.',
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--yellow-dark)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
              },
            ].map((m, i) => (
              <div key={i} className="card text-center">
                <div className="card-content">
                  <div className="mvv-icon">{m.icon}</div>
                  <h3 style={{ marginBottom: '0.75rem' }}>{m.label}</h3>
                  <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem' }}>{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-bg">
        <div className="container two-col">
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>A Nossa História</h2>
            <p style={{ color: 'var(--slate-600)', marginBottom: '1rem' }}>
              Fundada em 2016, a Ciryx nasceu da visão de criar uma empresa portuguesa de referência em cibersegurança. Com base em Viseu, crescemos para servir organizações em todo o país.
            </p>
            <p style={{ color: 'var(--slate-600)', marginBottom: '1rem' }}>
              Ao longo de mais de uma década, especializámo-nos em conformidade NIS2, testes de intrusão e avaliações de maturidade, ajudando mais de 150 organizações a fortalecer a sua postura de segurança.
            </p>
            <p style={{ color: 'var(--slate-600)', marginBottom: '2rem' }}>
              A nossa equipa é composta por especialistas certificados, com experiência em setores críticos como saúde, energia, finanças e administração pública.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/contacto')}>Contacte-nos</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { num: '150+', label: 'Clientes em todo o país' },
              { num: '98%', label: 'Taxa de satisfação' },
              { num: '10+', label: 'Anos de experiência' },
              { num: '500+', label: 'Projetos concluídos' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: 'var(--yellow-dark)' }}>{s.num}</span>
                <span style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="text-center mb-8">
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>A Nossa Equipa</h2>
            <p style={{ color: 'var(--slate-600)', maxWidth: 500, margin: '0 auto' }}>Profissionais certificados e apaixonados por cibersegurança.</p>
          </div>
          <div className="team-grid">
            {team.map((m, i) => (
              <div key={i} className="card text-center">
                <div className="card-content">
                  <div className="team-avatar">{m.initials}</div>
                  <h4 style={{ marginBottom: '0.25rem' }}>{m.name}</h4>
                  <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
