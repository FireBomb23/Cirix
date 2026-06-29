import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="36" height="36" style={{ color: 'var(--yellow)' }}>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
);

const DEMO_USERS = [
  { email: 'admin@ciryx.pt', password: 'admin123', role: 'Administrador', words: 'segurança, firewall, cifra' },
  { email: 'manager@ciryx.pt', password: 'manager123', role: 'Gestor', words: 'proteção, ameaça, escudo' },
  { email: 'cliente@empresa.pt', password: 'client123', role: 'Cliente', words: 'privacidade, código, autenticação' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, verify2fa } = useAuth();

  const [step, setStep] = useState(1); // 1 = credentials, 2 = 2FA
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFAInput, setTwoFAInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);

  const handleStep1 = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.needs2FA) {
        setPendingUserId(res.userId);
        setStep(2);
      } else {
        redirectUser(res.user);
      }
    } catch (err) {
      setError(err.message || 'Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await verify2fa(pendingUserId, twoFAInput);
      redirectUser(user);
    } catch (err) {
      setError(err.message || 'Palavra de segurança incorreta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (user) => {
    if (user.role === 'client') navigate('/dashboard', { replace: true });
    else navigate('/admin', { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <button className="login-logo" onClick={() => navigate('/')}>
          <ShieldIcon />
          <div className="login-logo-text">
            <span className="login-logo-brand">Ciryx</span>
            <span className="login-logo-sub">Cybersecurity</span>
          </div>
        </button>

        <div className="login-card">
          <div className="login-card-header">
            <h2>{step === 1 ? 'Área Restrita' : 'Verificação 2FA'}</h2>
            <p>
              {step === 1
                ? 'Introduza as suas credenciais para aceder'
                : 'Introduza uma das suas palavras de segurança'}
            </p>
          </div>
          <div className="login-card-body">
            {error && <div className="alert alert-error mb-4">{error}</div>}

            {step === 1 ? (
              <form onSubmit={handleStep1}>
                <div className="form-group">
                  <label className="label">Email</label>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@empresa.pt"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="label">Palavra-passe</label>
                  <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '0.5rem', padding: '0.75rem' }} disabled={loading}>
                  {loading ? 'A autenticar...' : 'Entrar'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleStep2}>
                <div style={{ background: '#FEF9C3', border: '1px solid #FDE68A', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--yellow-dark)' }}>
                  <strong>Verificação em 2 passos</strong>
                  <p style={{ marginTop: '0.25rem' }}>Introduza uma das palavras de segurança configuradas na sua conta.</p>
                </div>
                <div className="form-group">
                  <label className="label">Palavra de Segurança</label>
                  <input
                    className="input"
                    type="text"
                    value={twoFAInput}
                    onChange={(e) => setTwoFAInput(e.target.value)}
                    placeholder="Ex: segurança"
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full" style={{ padding: '0.75rem' }}>
                  Verificar
                </button>
                <button type="button" className="btn w-full" style={{ marginTop: '0.5rem', color: 'var(--slate-600)', background: 'none', padding: '0.625rem' }} onClick={() => { setStep(1); setError(''); setTwoFAInput(''); }}>
                  ← Voltar
                </button>
              </form>
            )}

            {/* Demo users */}
            <div className="login-demo">
              <div className="login-demo-title">UTILIZADORES DE DEMONSTRAÇÃO</div>
              {DEMO_USERS.map((u, i) => (
                <div key={i} className="login-demo-user" onClick={() => { setEmail(u.email); setPassword(u.password); }} style={{ cursor: 'pointer' }}>
                  <div style={{ fontSize: '0.8rem' }}>
                    <strong>{u.role}</strong> — {u.email} / {u.password}
                  </div>
                  <div className="login-demo-2fa">2FA: {u.words}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
