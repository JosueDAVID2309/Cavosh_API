const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'cavosh_cafe';
const dbUser = process.env.DB_USER || 'root';
const dbPass = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT, 10) || 3306;
const dbDialect = process.env.DB_DIALECT || 'mysql';

// Detecta si la conexión es a Aiven o a un entorno de producción que requiera SSL
const isRemote = dbHost.includes('aivencloud.com') || process.env.NODE_ENV === 'production';

// Configuración de SSL requerida por Aiven
const sslOptions = isRemote
  ? {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Permite conectar sin verificar el certificado CA local
    },
  }
  : {};

async function createDatabaseIfNotExists() {
  // En Aiven no se permite crear bases de datos dinámicamente con `avnadmin`
  if (isRemote) return;

  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPass,
      ...sslOptions,
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await connection.end();
  } catch (error) {
    console.warn('[DB Warning] Omite CREATE DATABASE:', error.message);
  }
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
    ...(isRemote && {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }),
  },
});

async function connectDatabase() {
  await createDatabaseIfNotExists();

  try {
    await sequelize.authenticate();
    console.log('[DB] Conexión establecida con MySQL');
  } catch (err) {
    console.error('[DB] Error de conexión:', err.message);
    throw err;
  }
}

module.exports = { sequelize, Sequelize, connectDatabase };