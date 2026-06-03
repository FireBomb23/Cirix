import axios from 'axios';

// Cliente HTTP central. baseURL aponta para o backend Express (porta 3000).
const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export default api;
