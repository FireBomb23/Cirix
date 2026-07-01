import axios from 'axios';

// Cliente HTTP central. Em local usa a porta 3000; em produção define-se VITE_API_URL
// (ex.: no Vercel) a apontar para o backend publicado (Render).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Anexa automaticamente o token JWT (se existir) a todos os pedidos.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cyrix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se o token expirar/for invalido (401), termina a sessao e volta ao login.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('cyrix_token');
      localStorage.removeItem('cyrix_user');
      const path = window.location.pathname;
      const publicas = ['/', '/login', '/sobre', '/servicos', '/noticias', '/contacto'];
      if (!publicas.includes(path)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
