const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela "ticket_comments" (ver database/schema.sql) - mensagens da conversa de um ticket.
const TicketComment = sequelize.define('TicketComment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ticket_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
}, {
  tableName: 'ticket_comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = TicketComment;
