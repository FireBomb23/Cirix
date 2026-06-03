const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela "incidentes" conforme definida em database/schema.sql (fonte oficial).
// Colunas: id, cliente_id (FK clientes), descricao, severidade, estado, data_ocorrencia.
const Incidente = sequelize.define('Incidente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  severidade: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  data_ocorrencia: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'incidentes',
  timestamps: false,
});

module.exports = Incidente;
