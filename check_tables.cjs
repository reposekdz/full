const { pool } = require('./backend/config/database');
async function run() {
  try {
    const [t1] = await pool.query('SELECT COUNT(*) as count FROM parent_student');
    console.log('parent_student count:', t1[0].count);
  } catch (err) {
    console.log('parent_student table error:', err.message);
  }
  try {
    const [t2] = await pool.query('SELECT COUNT(*) as count FROM parent_sheets');
    console.log('parent_sheets count:', t2[0].count);
  } catch (err) {
    console.log('parent_sheets table error:', err.message);
  }
  process.exit();
}
run();
