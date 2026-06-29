const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela "articles" (ver database/schema.sql) - noticias / blog.
const Article = sequelize.define('Article', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  excerpt: { type: DataTypes.TEXT },
  content: { type: DataTypes.TEXT },
  author: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING },
  published: { type: DataTypes.BOOLEAN, defaultValue: true },
  published_at: { type: DataTypes.DATEONLY },
  created_by: { type: DataTypes.INTEGER },
}, {
  tableName: 'articles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Article;
