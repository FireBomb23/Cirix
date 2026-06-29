const jwt = require('jsonwebtoken');
const config = require('../config/auth');

// Verifica o token JWT enviado no cabecalho Authorization: Bearer <token>
// (mesma ideia do middleware da Aula 11 dos professores).
function checkToken(req, res, next) {
  let token = req.headers['authorization'] || req.headers['x-access-token'];
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7);
  }
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Token em falta. Inicie sessão.' });
  }
  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ status: 'error', message: 'Token inválido ou expirado.' });
    }
    req.user = decoded; // { id, email, role }
    next();
  });
}

// Restringe o acesso a determinados perfis (ex.: checkRole('admin')).
// Usar sempre DEPOIS de checkToken.
function checkRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'Sem permissões para esta ação.' });
    }
    next();
  };
}

module.exports = { checkToken, checkRole };
