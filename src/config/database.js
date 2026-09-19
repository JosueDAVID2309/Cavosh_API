const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'cavosh_cafe';
const dbUser = process.env.DB_USER || 'root';
const dbPass = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT, 10) || 3306;
const dbDialect = process.env.DB_DIALECT || 'mysql';

async function createDatabaseIfNotExists() {
  const connection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPass,
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await connection.end();
}

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: dbDialect,
  logging: false,
  timezone: '-05:00',
  define: {
    underscored: false,
    freezeTableName: true,
    charset: 'utf8mb4',
  },
  dialectOptions: {
    charset: 'utf8mb4',
  },
});

async function connectDatabase() {
  await createDatabaseIfNotExists();

  await sequelize.authenticate()
    .then(() => console.log('[DB] Conexión establecida con MySQL'))
    .catch((err) => {
      console.error('[DB] Error de conexión:', err.message);
      throw err;
    });
}

module.exports = { sequelize, Sequelize, connectDatabase };
