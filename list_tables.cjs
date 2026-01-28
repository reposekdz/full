const { pool } = require('./backend/config/database');
async function run() {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.log(rows);
  } catch (err) {
    console.error('Error listing tables:', err);
  }
  process.exit();
}
run();
