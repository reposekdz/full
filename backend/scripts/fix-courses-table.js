const mysql = require('mysql2/promise');

async function fixCoursesTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    console.log('Checking courses table structure...\n');

    // Check current structure
    const [columns] = await connection.query('SHOW COLUMNS FROM courses');
    console.log('Current columns:');
    columns.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));

    // Check if we need to add columns
    const columnNames = columns.map(c => c.Field);
    
    if (!columnNames.includes('trade_code')) {
      console.log('\n✓ Adding trade_code column...');
      await connection.query('ALTER TABLE courses ADD COLUMN trade_code VARCHAR(10) AFTER id');
    }
    
    if (!columnNames.includes('level_number')) {
      console.log('✓ Adding level_number column...');
      await connection.query('ALTER TABLE courses ADD COLUMN level_number INT AFTER trade_code');
    }
    
    if (!columnNames.includes('level_suffix')) {
      console.log('✓ Adding level_suffix column...');
      await connection.query('ALTER TABLE courses ADD COLUMN level_suffix VARCHAR(5) DEFAULT \'\' AFTER level_number');
    }

    if (!columnNames.includes('course_name_rw')) {
      console.log('✓ Adding course_name_rw column...');
      await connection.query('ALTER TABLE courses ADD COLUMN course_name_rw VARCHAR(255) AFTER course_name');
    }

    if (!columnNames.includes('credits')) {
      console.log('✓ Adding credits column...');
      await connection.query('ALTER TABLE courses ADD COLUMN credits INT DEFAULT 3');
    }

    if (!columnNames.includes('is_active')) {
      console.log('✓ Adding is_active column...');
      await connection.query('ALTER TABLE courses ADD COLUMN is_active BOOLEAN DEFAULT 1');
    }

    console.log('\n✅ Courses table structure updated!');
    console.log('\nNow run: ensure-trades-courses.bat');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixCoursesTable();
