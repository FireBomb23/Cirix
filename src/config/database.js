require('dotenv').config();
const { Sequelize } = require('sequelize');

// Liga em SSL quando DB_SSL=true (necessario em BD na cloud, ex.: Neon/Render).
// Local: deixa DB_SSL vazio/false.
const useSSL = String(process.env.DB_SSL).toLowerCase() === 'true';

// Suporta tambem DATABASE_URL (formato usado pelo Neon/Render) ou os campos DB_* separados.
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false,
        ...(useSSL ? { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } } : {}),
      }
    );

module.exports = sequelize;
