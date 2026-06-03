const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela "tickets" (ver database/schema.sql). Um ticket pertence a um cliente
// (client_id) e pode estar atribuido a um colaborador (assigned_to).
const Ticket = sequelize.define('Ticket', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING, allowNull: false }, // technical|general|incident|billing|other
  priority: { type: DataTypes.STRING, defaultValue: 'medium' }, // low|medium|high|urgent
  status: { type: DataTypes.STRING, defaultValue: 'open' }, // open|in-progress|resolved|closed
  client_id: { type: DataTypes.INTEGER, allowNull: false },
  assigned_to: { type: DataTypes.INTEGER },
}, {
  tableName: 'tickets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Ticket;
