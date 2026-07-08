const { Pool } = require('pg');

function getPgConfig() {
  return {
    host: process.env.POSTGRES_HOST || process.env.DB_HOST || 'backend-postgres',
    port: parseInt(process.env.POSTGRES_PORT || process.env.DB_PORT || '5432', 10),
    database: process.env.POSTGRES_DB || process.env.DB_NAME || 'garden_backend',
    user: process.env.POSTGRES_USER || process.env.DB_USER || 'garden',
    password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'garden',
  };
}

function createPool() {
  return new Pool(getPgConfig());
}

module.exports = { getPgConfig, createPool };
