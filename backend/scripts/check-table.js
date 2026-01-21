const { pool } = require('../config/database');

async function checkTable() {
  try {
    const [result] = await pool.execute('DESCRIBE admin_users');
    console.log('Admin users table structure:', result);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTable();