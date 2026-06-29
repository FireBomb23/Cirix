const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela "message_lines" (ver database/schema.sql) - cada mensagem de uma conversa.
const MessageLine = sequelize.define('MessageLine', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  conversation_id: { type: DataTypes.INTEGER, allowNull: false },
  sender_id: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
}, {
  tableName: 'message_lines',
  timestamps: true,
  createdAt: 'sent_at',
  updatedAt: false,
});

module.exports = MessageLine;
