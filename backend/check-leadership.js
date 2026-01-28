const { pool } = require('./config/database');

async function checkLeadership() {
  try {
    const [rows] = await pool.execute('SELECT * FROM leadership LIMIT 10');
    console.log('Leadership data:', JSON.stringify(rows, null, 2));
    console.log(`\nTotal leaders found: ${rows.length}`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

checkLeadership();
