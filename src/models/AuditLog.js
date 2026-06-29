const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela "audit_log" (ver database/schema.sql) - registo de eventos do sistema.
const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  action: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false }, // authentication|content|users|documents|system|security
  severity: { type: DataTypes.STRING, defaultValue: 'info' }, // info|warning|critical
  user_id: { type: DataTypes.INTEGER },
  user_email: { type: DataTypes.STRING },
  ip_address: { type: DataTypes.STRING },
}, {
  tableName: 'audit_log',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = AuditLog;
