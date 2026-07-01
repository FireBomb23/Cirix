// Configuracao da autenticacao (JWT).
// A chave secreta vem do .env (JWT_SECRET); ha um valor por omissao so para desenvolvimento.
require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'cyrix-dev-secret-trocar-em-producao',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
};
