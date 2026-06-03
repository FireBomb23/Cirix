import { Link } from 'react-router-dom';
import { entityKeys, entities } from '../entities.js';

export default function Home() {
  return (
    <div>
      <h1 className="page-title">Painel de Gestao Cirix</h1>
      <p className="muted mb-6">
        Interface React que consome a API Node + Express (Sequelize) ligada a base de dados
        PostgreSQL <code>projeto_BD</code>.
      </p>
      <div className="cards">
        {entityKeys.map((key) => (
          <Link key={key} to={`/${key}`} className="card">
            <h3>{entities[key].label}</h3>
            <span className="muted">Listar, inserir e editar</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
