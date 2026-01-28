const { pool } = require('../config/database');

async function checkUsers() {
  try {
    const [rows] = await pool.query('SELECT id, username, role_id FROM users');
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

checkUsers();
