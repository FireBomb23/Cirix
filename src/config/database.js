require('dotenv').config();
const { Sequelize } = require('sequelize');

// Instancia unica do Sequelize ligada a base de dados PostgreSQL "projeto_BD"
// (a mesma que o projeto Django da outra cadeira utiliza).
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;
