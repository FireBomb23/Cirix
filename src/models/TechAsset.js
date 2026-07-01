const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela "tech_assets" (ver database/fix_bd2.sql) - ativos tecnologicos do cliente.
const TechAsset = sequelize.define('TechAsset', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  client_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  asset_type: { type: DataTypes.STRING },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  location: { type: DataTypes.STRING },
  criticality: { type: DataTypes.STRING, defaultValue: 'media' }, // baixa|media|alta|critica
  notes: { type: DataTypes.TEXT },
}, {
  tableName: 'tech_assets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = TechAsset;
