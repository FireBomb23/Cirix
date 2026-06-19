import { mockArticles } from '../mockData.js';

export default function News() {
  const featured = mockArticles[0];
  const rest = mockArticles.slice(1);

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>Notícias & Artigos</h1>
          <p>Mantenha-se atualizado com as últimas tendências em cibersegurança e conformidade regulatória.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Featured article */}
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Artigo em Destaque</h2>
            <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--yellow), var(--yellow-dark))', minHeight: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="card-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span className="badge badge-yellow" style={{ marginBottom: '0.75rem', alignSelf: 'flex-start' }}>{featured.category}</span>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{featured.title}</h3>
                <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', marginBottom: '1rem' }}>{featured.excerpt}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  <span>{featured.author}</span>
                  <span>{featured.date}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Other articles */}
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Mais Artigos</h2>
          <div className="articles-grid">
            {rest.map((a) => (
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
                    <button style={{ color: 'var(--yellow-dark)', fontWeight: 600, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}>Ler mais →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
