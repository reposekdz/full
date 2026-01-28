const { pool } = require('../config/database');

async function fix() {
  try {
    await pool.query("ALTER TABLE fee_payments MODIFY COLUMN status VARCHAR(50) DEFAULT 'unpaid'");
    console.log('✅ Fixed fee_payments status column');
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

fix();
