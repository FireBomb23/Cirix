import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Services from './pages/Services.jsx';
import News from './pages/News.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import ClientDashboard from './pages/ClientDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { useAuth } from './context/AuthContext.jsx';

function RequireAuth({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role === 'client' && user.role !== 'client') return <Navigate to="/admin" replace />;
  if (role === 'admin' && user.role === 'client') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/servicos" element={<Services />} />
        <Route path="/noticias" element={<News />} />
        <Route path="/contacto" element={<Contact />} />
      </Route>

      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={
        <RequireAuth role="client"><ClientDashboard /></RequireAuth>
      } />

      <Route path="/admin" element={
        <RequireAuth role="admin"><AdminDashboard /></RequireAuth>
      } />
      <Route path="/admin/:section" element={
        <RequireAuth role="admin"><AdminDashboard /></RequireAuth>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
