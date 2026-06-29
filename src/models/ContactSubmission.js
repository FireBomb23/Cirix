const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela "contact_submissions" (ver database/schema.sql) - mensagens do formulario publico.
const ContactSubmission = sequelize.define('ContactSubmission', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  company: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  message: { type: DataTypes.TEXT, allowNull: false },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
  reply: { type: DataTypes.TEXT },          // resposta do staff (admin/gestor)
  replied_at: { type: DataTypes.DATE },     // quando foi respondido
}, {
  tableName: 'contact_submissions',
  timestamps: true,
  createdAt: 'submitted_at',
  updatedAt: false,
});

module.exports = ContactSubmission;
