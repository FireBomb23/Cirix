const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

// Tabela "users" (ver database/schema.sql).
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false }, // 'admin' | 'manager' | 'client'
  company: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  // Responsável de Segurança
  so_name: { type: DataTypes.STRING },
  so_email: { type: DataTypes.STRING },
  so_phone: { type: DataTypes.STRING },
  // Contacto Permanente
  pc_name: { type: DataTypes.STRING },
  pc_email: { type: DataTypes.STRING },
  pc_phone: { type: DataTypes.STRING },
  twofa_word1: { type: DataTypes.STRING },
  twofa_word2: { type: DataTypes.STRING },
  twofa_word3: { type: DataTypes.STRING },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Hash da password com bcrypt (como na Aula 11 dos professores).
// O hash e feito no proprio model, ao criar e ao alterar a password.
User.beforeCreate(async (user) => {
  if (user.password_hash) {
    user.password_hash = await bcrypt.hash(user.password_hash, 10);
  }
});

User.beforeUpdate(async (user) => {
  // So volta a cifrar se a password tiver mesmo mudado (evita duplo-hash).
  if (user.changed('password_hash')) {
    user.password_hash = await bcrypt.hash(user.password_hash, 10);
  }
});

module.exports = User;
