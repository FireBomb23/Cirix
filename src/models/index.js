// Ponto central dos models + associacoes (alinhado a database/schema.sql).
const sequelize = require('../config/database');
const User = require('./User');
const Ticket = require('./Ticket');
const TicketComment = require('./TicketComment');
const Document = require('./Document');
const ServiceRequest = require('./ServiceRequest');
const Article = require('./Article');
const Service = require('./Service');
const ServiceFeature = require('./ServiceFeature');
const TeamMember = require('./TeamMember');
const AnnualService = require('./AnnualService');
const AuditLog = require('./AuditLog');
const ContactSubmission = require('./ContactSubmission');
const Conversation = require('./Conversation');
const MessageLine = require('./MessageLine');
const TechAsset = require('./TechAsset');
const SecurityIncident = require('./SecurityIncident');
const Pentest = require('./Pentest');

// Tickets: cliente (client_id) e responsavel (assigned_to) sao utilizadores.
Ticket.belongsTo(User, { foreignKey: 'client_id', as: 'cliente' });
Ticket.belongsTo(User, { foreignKey: 'assigned_to', as: 'responsavel' });
User.hasMany(Ticket, { foreignKey: 'client_id', as: 'tickets' });

// Comentarios de tickets: pertencem a um ticket e a um utilizador (autor).
Ticket.hasMany(TicketComment, { foreignKey: 'ticket_id', as: 'comments' });
TicketComment.belongsTo(Ticket, { foreignKey: 'ticket_id' });
TicketComment.belongsTo(User, { foreignKey: 'user_id', as: 'autor' });

// Documents: cliente (client_id) e quem submeteu (uploaded_by).
Document.belongsTo(User, { foreignKey: 'client_id', as: 'cliente' });
Document.belongsTo(User, { foreignKey: 'uploaded_by', as: 'autor' });

// Service requests: cliente (client_id) e responsavel (assigned_to).
ServiceRequest.belongsTo(User, { foreignKey: 'client_id', as: 'cliente' });
ServiceRequest.belongsTo(User, { foreignKey: 'assigned_to', as: 'responsavel' });

// Articles: autor (created_by) e um utilizador.
Article.belongsTo(User, { foreignKey: 'created_by', as: 'autor' });

// Services: cada servico tem varias features.
Service.hasMany(ServiceFeature, { foreignKey: 'service_id', as: 'features' });
ServiceFeature.belongsTo(Service, { foreignKey: 'service_id' });

// Team members: opcionalmente ligados a um utilizador.
TeamMember.belongsTo(User, { foreignKey: 'user_id', as: 'utilizador' });

// Annual services: cliente (client_id) e responsavel (assigned_to).
AnnualService.belongsTo(User, { foreignKey: 'client_id', as: 'cliente' });
AnnualService.belongsTo(User, { foreignKey: 'assigned_to', as: 'responsavel' });

// Audit log: opcionalmente ligado ao utilizador que originou o evento.
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'utilizador' });

// Conversas diretas entre DOIS utilizadores quaisquer (qualquer tipo de perfil).
// Reutiliza as colunas existentes: client_id = participante 1, staff_id = participante 2.
Conversation.belongsTo(User, { foreignKey: 'client_id', as: 'participante1' });
Conversation.belongsTo(User, { foreignKey: 'staff_id', as: 'participante2' });
Conversation.hasMany(MessageLine, { foreignKey: 'conversation_id', as: 'messages' });
MessageLine.belongsTo(Conversation, { foreignKey: 'conversation_id' });
MessageLine.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// Categorias do cliente: ativos tecnologicos, incidentes e pentests.
TechAsset.belongsTo(User, { foreignKey: 'client_id', as: 'cliente' });
SecurityIncident.belongsTo(User, { foreignKey: 'client_id', as: 'cliente' });
Pentest.belongsTo(User, { foreignKey: 'client_id', as: 'cliente' });

module.exports = {
  sequelize,
  User,
  Ticket,
  TicketComment,
  Document,
  ServiceRequest,
  Article,
  Service,
  ServiceFeature,
  TeamMember,
  AnnualService,
  AuditLog,
  ContactSubmission,
  Conversation,
  MessageLine,
  TechAsset,
  SecurityIncident,
  Pentest,
};
