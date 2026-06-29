const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela "conversations" (ver database/schema.sql) - chat direto cliente <-> equipa.
const Conversation = sequelize.define('Conversation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  client_id: { type: DataTypes.INTEGER, allowNull: false },
  staff_id: { type: DataTypes.INTEGER },
  subject: { type: DataTypes.STRING },
  unread_count: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'conversations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Conversation;
