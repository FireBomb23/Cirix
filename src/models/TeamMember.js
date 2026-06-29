const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela "team_members" (ver database/schema.sql) - equipa mostrada em "Sobre Nos".
const TeamMember = sequelize.define('TeamMember', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  role_label: { type: DataTypes.STRING, allowNull: false },
  initials: { type: DataTypes.STRING, allowNull: false },
  user_id: { type: DataTypes.INTEGER },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'team_members',
  timestamps: false,
});

module.exports = TeamMember;
