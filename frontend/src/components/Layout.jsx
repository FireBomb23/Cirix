import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_PUBLIC = [
  { path: '/', label: 'Início' },
  { path: '/sobre', label: 'Sobre Nós' },
  { path: '/servicos', label: 'Serviços' },
  { path: '/noticias', label: 'Notícias' },
  { path: '/contacto', label: 'Contacto' },
];

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32" style={{ color: 'var(--yellow)' }}>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
);

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const dashPath = user?.role === 'client' ? '/dashboard' : '/admin';

  const go = (path) => { navigate(path); setMenuOpen(false); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav className="main-nav">
        <div className="container nav-inner">
          <button className="nav-logo" onClick={() => go('/')}>
            <ShieldIcon />
            <div className="nav-logo-text">
              <span className="nav-logo-brand">Cyrix</span>
              <span className="nav-logo-sub">Cybersecurity</span>
            </div>
          </button>

          {/* Desktop links */}
          <div className="nav-links">
            {NAV_PUBLIC.map((item) => (
              <button
                key={item.path}
                className={`nav-link${isActive(item.path) ? ' active' : ''}`}
                onClick={() => go(item.path)}
              >
                {item.label}
              </button>
            ))}
            {!user ? (
              <button className="btn btn-primary btn-sm" onClick={() => go('/login')}>
                Área Restrita
              </button>
            ) : (
              <>
                <button
                  className={`nav-link${isActive(dashPath) ? ' active' : ''}`}
                  onClick={() => go(dashPath)}
                >
                  Dashboard
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => { logout(); go('/'); }}>
                  Sair
                </button>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`nav-mobile${menuOpen ? ' open' : ''}`}>
          <div className="container">
            {NAV_PUBLIC.map((item) => (
              <button
                key={item.path}
                className={isActive(item.path) ? 'nav-mobile-active' : ''}
                onClick={() => go(item.path)}
              >
                {item.label}
              </button>
            ))}
            <div className="nav-mobile-actions">
              {!user ? (
                <button className="btn btn-primary" onClick={() => go('/login')}>
                  Área Restrita
                </button>
              ) : (
                <>
                  <button className="btn btn-outline" onClick={() => go(dashPath)}>
                    Dashboard
                  </button>
                  <button className="btn btn-ghost" onClick={() => { logout(); go('/'); }}>
                    Sair ({user.name?.split(' ')[0]})
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer className="main-footer">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem', cursor: 'pointer' }} onClick={() => go('/')}>
                <ShieldIcon />
                <div>
                  <div className="footer-heading" style={{ marginBottom: 0 }}>Cyrix</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>Cybersecurity</div>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-400)', lineHeight: 1.7 }}>
                Consultoria especializada em cibersegurança e conformidade NIS2 para organizações portuguesas.
              </p>
            </div>
            {/* Links */}
            <div>
              <h4 className="footer-heading">Navegação</h4>
              <ul className="footer-links">
                {NAV_PUBLIC.map(item => (
                  <li key={item.path}><button onClick={() => go(item.path)}>{item.label}</button></li>
                ))}
              </ul>
            </div>
            {/* Services */}
            <div>
              <h4 className="footer-heading">Serviços</h4>
              <ul className="footer-links">
                <li><button onClick={() => go('/servicos')}>Avaliação de Maturidade</button></li>
                <li><button onClick={() => go('/servicos')}>Testes de Intrusão</button></li>
                <li><button onClick={() => go('/servicos')}>Conformidade NIS2</button></li>
                <li><button onClick={() => go('/servicos')}>Formação Especializada</button></li>
              </ul>
            </div>
            {/* Contact */}
            <div>
              <h4 className="footer-heading">Contacto</h4>
              <div className="footer-contact-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2, color: 'var(--yellow)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Viseu, Portugal</span>
              </div>
              <div className="footer-contact-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0, color: 'var(--yellow)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@cyrix.pt</span>
              </div>
              <div className="footer-contact-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0, color: 'var(--yellow)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+351 232 000 000</span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; 2026 Cyrix Cybersecurity. Todos os direitos reservados. Projeto Académico — ESTGV.
          </div>
        </div>
      </footer>
    </div>
  );
}
