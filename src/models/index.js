// Ponto central dos models + associacoes.
const sequelize = require('../config/database');
const Utilizador = require('./Utilizador');
const Cliente = require('./Cliente');
const Incidente = require('./Incidente');
const Ticket = require('./Ticket');

// Um cliente tem varios incidentes; cada incidente pertence a um cliente.
Cliente.hasMany(Incidente, { foreignKey: 'cliente_id', as: 'incidentes' });
Incidente.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

module.exports = {
  sequelize,
  Utilizador,
  Cliente,
  Incidente,
  Ticket,
};
