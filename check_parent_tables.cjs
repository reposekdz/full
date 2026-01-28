const { pool } = require('./backend/config/database');
async function run() {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    const tableNames = rows.map(r => Object.values(r)[0]);
    console.log('parent_student exists:', tableNames.includes('parent_student'));
    console.log('parent_sheets exists:', tableNames.includes('parent_sheets'));
    
    if (tableNames.includes('parent_student')) {
      const [t1] = await pool.query('SELECT COUNT(*) as count FROM parent_student');
      console.log('parent_student count:', t1[0].count);
    }
    if (tableNames.includes('parent_sheets')) {
      const [t2] = await pool.query('SELECT COUNT(*) as count FROM parent_sheets');
      console.log('parent_sheets count:', t2[0].count);
    }
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit();
}
run();
