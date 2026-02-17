const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'school_management',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000, // 30 seconds timeout for initial connection
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000 // Keep alive after 10 seconds
});

const promisePool = pool.promise();

// Test connection with retry logic
const testConnection = async (retries = 3, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await promisePool.getConnection();
      console.log('✅ Database connected successfully');
      connection.release();
      return true;
    } catch (error) {
      console.error(`❌ Database connection attempt ${i + 1} failed:`, error.message);
      if (i < retries - 1) {
        console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error('❌ All database connection attempts failed');
  return false;
};

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('🔄 Closing database connections...');
  pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Closing database connections...');
  pool.end();
  process.exit(0);
});

// Create db object with query method for compatibility
const db = {
  query: (...args) => promisePool.query(...args),
  execute: (...args) => promisePool.execute(...args),
  getConnection: () => promisePool.getConnection(),
  pool: promisePool
};

module.exports = db;
module.exports.pool = promisePool;
module.exports.testConnection = testConnection;