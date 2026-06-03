const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela existente "clientes" (id, nome, estado_nis2)
const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado_nis2: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'clientes',
  timestamps: false,
});

module.exports = Cliente;
