import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import ListPage from './pages/ListPage.jsx';
import FormPage from './pages/FormPage.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Listagem de uma entidade */}
        <Route path="/:entity" element={<ListPage />} />
        {/* Insercao de um novo registo */}
        <Route path="/:entity/novo" element={<FormPage />} />
        {/* Edicao de um registo existente */}
        <Route path="/:entity/editar/:id" element={<FormPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
