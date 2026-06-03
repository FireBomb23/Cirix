const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela "service_requests" (ver database/schema.sql).
const ServiceRequest = sequelize.define('ServiceRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'pending' }, // pending|in-progress|completed|cancelled
  client_id: { type: DataTypes.INTEGER, allowNull: false },
  assigned_to: { type: DataTypes.INTEGER },
  request_date: { type: DataTypes.DATEONLY }, // DEFAULT CURRENT_DATE na BD
}, {
  tableName: 'service_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = ServiceRequest;
