const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela existente "utilizadores" (id, nome, email, password, perfil)
const Utilizador = sequelize.define('Utilizador', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  perfil: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'utilizadores',
  timestamps: false,
});

module.exports = Utilizador;
