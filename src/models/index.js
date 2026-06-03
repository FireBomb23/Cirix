// Ponto central dos models + associacoes (alinhado a database/schema.sql).
const sequelize = require('../config/database');
const User = require('./User');
const Ticket = require('./Ticket');
const Document = require('./Document');
const ServiceRequest = require('./ServiceRequest');

// Tickets: cliente (client_id) e responsavel (assigned_to) sao utilizadores.
Ticket.belongsTo(User, { foreignKey: 'client_id', as: 'cliente' });
Ticket.belongsTo(User, { foreignKey: 'assigned_to', as: 'responsavel' });
User.hasMany(Ticket, { foreignKey: 'client_id', as: 'tickets' });

// Documents: cliente (client_id) e quem submeteu (uploaded_by).
Document.belongsTo(User, { foreignKey: 'client_id', as: 'cliente' });
Document.belongsTo(User, { foreignKey: 'uploaded_by', as: 'autor' });

// Service requests: cliente (client_id) e responsavel (assigned_to).
ServiceRequest.belongsTo(User, { foreignKey: 'client_id', as: 'cliente' });
ServiceRequest.belongsTo(User, { foreignKey: 'assigned_to', as: 'responsavel' });

module.exports = {
  sequelize,
  User,
  Ticket,
  Document,
  ServiceRequest,
};
