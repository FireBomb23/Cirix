const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela "tickets" conforme definida em database/schema.sql (fonte oficial).
// Colunas: id, assunto, estado, data_criacao, data_resolucao.
const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  assunto: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  data_criacao: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  data_resolucao: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'tickets',
  timestamps: false,
});

module.exports = Ticket;
