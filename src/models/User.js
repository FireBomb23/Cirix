const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela "users" (ver database/schema.sql).
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false }, // 'admin' | 'manager' | 'client'
  company: { type: DataTypes.STRING },
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

module.exports = User;
