import { NavLink, Link } from 'react-router-dom';
import { entityKeys, entities } from '../entities.js';

export default function Layout({ children }) {
  return (
    <div className="app">
      <header className="topbar">
        <div className="container flex items-center justify-between">
          <Link to="/" className="brand">
            <span className="brand-mark">C</span> Cirix
          </Link>
          <nav className="nav">
            {entityKeys.map((key) => (
              <NavLink
                key={key}
                to={`/${key}`}
                className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
              >
                {entities[key].label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="container main">{children}</main>
      <footer className="footer container">
        Cirix &middot; Aplicacoes para a Internet II &middot; Node + Express + React + Sequelize
      </footer>
    </div>
  );
}
