const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela "documents" (ver database/schema.sql).
const Document = sequelize.define('Document', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  file_type: { type: DataTypes.STRING },   // PDF, XLSX, DOCX, ...
  file_size: { type: DataTypes.STRING },   // ex: "2.4 MB"
  file_path: { type: DataTypes.STRING },
  file_data: { type: DataTypes.TEXT },     // base64 (data URL) para upload/download real
  category: { type: DataTypes.STRING },    // Relatorios, Templates, Documentacao
  visibility: { type: DataTypes.STRING, defaultValue: 'client' }, // global|client
  client_id: { type: DataTypes.INTEGER },
  uploaded_by: { type: DataTypes.INTEGER },
  upload_date: { type: DataTypes.DATE },   // DEFAULT NOW() na BD
}, {
  tableName: 'documents',
  timestamps: false,
});

module.exports = Document;
