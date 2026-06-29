const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela "annual_services" (ver database/schema.sql) - contratos/projetos anuais.
const AnnualService = sequelize.define('AnnualService', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  client_name: { type: DataTypes.STRING, allowNull: false },
  client_id: { type: DataTypes.INTEGER },
  service_type: { type: DataTypes.STRING, allowNull: false }, // pentest|nis-compliance|maturity-assessment|training|other
  service_name: { type: DataTypes.STRING, allowNull: false },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  deadline: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'pending' }, // pending|in-progress|completed|overdue|cancelled
  progress: { type: DataTypes.INTEGER, defaultValue: 0 },
  assigned_to: { type: DataTypes.INTEGER },
  notes: { type: DataTypes.TEXT },
}, {
  tableName: 'annual_services',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = AnnualService;
