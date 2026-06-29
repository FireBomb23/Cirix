import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'ciryx_token';
const USER_KEY = 'ciryx_user';

export function AuthProvider({ children }) {
  // Recupera a sessao guardada (mantem login apos refresh)
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((text, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const persist = useCallback((token, userData) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  // Atualiza so os dados do utilizador (ex.: depois de editar o perfil)
  const applyUser = useCallback((userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  // 1o passo: email + password. Pode pedir 2FA (devolve needs2FA) ou autenticar logo.
  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/users/login', { email: email.toLowerCase().trim(), password });
      if (data.status === '2fa_required') {
        return { needs2FA: true, userId: data.userId, name: data.name };
      }
      if (data.status === 'success') {
        persist(data.token, data.user);
        showToast(`Bem-vindo, ${data.user.name}!`, 'success');
        return { needs2FA: false, user: data.user };
      }
      throw new Error(data.message || 'Credenciais inválidas.');
    } catch (err) {
      const msg = err.response?.data?.message
        || (err.request && !err.response
              ? 'Não foi possível ligar ao servidor. Confirme que o backend está a correr (porta 3000).'
              : err.message || 'Credenciais inválidas.');
      throw new Error(msg);
    }
  }, [persist, showToast]);

  // 2o passo: palavra de seguranca (2FA), verificada no servidor.
  const verify2fa = useCallback(async (userId, word) => {
    try {
      const { data } = await api.post('/users/verify-2fa', { userId, word });
      if (data.status === 'success') {
        persist(data.token, data.user);
        showToast(`Bem-vindo, ${data.user.name}!`, 'success');
        return data.user;
      }
      throw new Error(data.message || 'Palavra de segurança incorreta.');
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Palavra de segurança incorreta.');
    }
  }, [persist, showToast]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    showToast('Sessão terminada com sucesso.', 'success');
  }, [showToast]);

  return (
    <AuthContext.Provider value={{ user, login, verify2fa, logout, showToast, applyUser }}>
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
