import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api.js';

const AuthContext = createContext(null);

// Utilizadores de demonstração — usados como fallback se o backend não estiver disponível
// ou se as credenciais de demo ainda não foram inseridas na BD.
const MOCK_USERS = {
  'admin@ciryx.pt':     { id: '1', name: 'João Silva',      email: 'admin@ciryx.pt',     role: 'admin',   company: 'Ciryx', active: true, _pw: 'admin123' },
  'manager@ciryx.pt':   { id: '2', name: 'Maria Santos',    email: 'manager@ciryx.pt',   role: 'manager', company: 'Ciryx', active: true, _pw: 'manager123' },
  'cliente@empresa.pt': { id: '3', name: 'Carlos Oliveira', email: 'cliente@empresa.pt', role: 'client',  company: 'Empresa ABC', active: true, _pw: 'cliente123' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((text, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const login = useCallback(async (email, password) => {
    const emailLower = email.toLowerCase().trim();

    // 1) Tentar o backend real
    try {
      const { data } = await api.post('/users/login', { email: emailLower, password });
      if (data.status === 'success') {
        setUser(data.user);
        showToast(`Bem-vindo, ${data.user.name}!`, 'success');
        return data.user;
      }
      throw new Error(data.message || 'Credenciais inválidas.');
    } catch (apiErr) {
      // 2) Fallback para utilizadores mock:
      //    - Se o backend não está acessível (erro de rede)
      //    - OU se é um utilizador de demo e a BD ainda não tem o seed
      const isNetworkError = !apiErr.response;
      const isDemoUser = !!MOCK_USERS[emailLower];

      if (isNetworkError || isDemoUser) {
        const mock = MOCK_USERS[emailLower];
        if (mock && mock._pw === password) {
          const { _pw, ...userData } = mock;
          setUser(userData);
          showToast(`Bem-vindo, ${userData.name}!`, 'success');
          return userData;
        }
      }

      // 3) Repassar mensagem de erro do backend, ou genérica
      const msg = apiErr.response?.data?.message || 'Credenciais inválidas.';
      throw new Error(msg);
    }
  }, [showToast]);

  const logout = useCallback(() => {
    setUser(null);
    showToast('Sessão terminada com sucesso.', 'success');
  }, [showToast]);

  return (
    <AuthContext.Provider value={{ user, login, logout, showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item ${t.type}`}>{t.text}</div>
        ))}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
