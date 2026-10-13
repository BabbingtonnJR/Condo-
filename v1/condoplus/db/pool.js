require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'condoplus_app',
  password: process.env.DB_PASSWORD || 'condoplus_pass',
  database: process.env.DB_NAME || 'condoplus',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
