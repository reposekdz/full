const { pool } = require('./config/database');

async function checkTable() {
  try {
    const [create] = await pool.query('SHOW CREATE TABLE global_student_sheets');
    console.log('\n=== GLOBAL_STUDENT_SHEETS TABLE ===');
    console.log(create[0]['Create Table']);
    
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_KEY, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'school_management' 
      AND TABLE_NAME = 'global_student_sheets' 
      AND COLUMN_NAME IN ('student_id', 'id')
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('\n=== STUDENT_ID COLUMN INFO ===');
    console.log(JSON.stringify(columns, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkTable();
