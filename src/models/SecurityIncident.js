const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela "security_incidents" (ver database/fix_bd2.sql) - report de incidentes (base CNCS).
const SecurityIncident = sequelize.define('SecurityIncident', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  client_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  incident_date: { type: DataTypes.DATEONLY },
  category: { type: DataTypes.STRING },
  severity: { type: DataTypes.STRING, defaultValue: 'media' }, // baixa|media|alta|critica
  description: { type: DataTypes.TEXT },
  impact: { type: DataTypes.TEXT },
  actions: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'aberto' }, // aberto|em-analise|resolvido|fechado
}, {
  tableName: 'security_incidents',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = SecurityIncident;
