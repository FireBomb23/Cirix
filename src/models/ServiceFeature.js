const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela "service_features" (ver database/schema.sql) - features de cada servico.
const ServiceFeature = sequelize.define('ServiceFeature', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  service_id: { type: DataTypes.INTEGER, allowNull: false },
  feature: { type: DataTypes.STRING, allowNull: false },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'service_features',
  timestamps: false,
});

module.exports = ServiceFeature;
