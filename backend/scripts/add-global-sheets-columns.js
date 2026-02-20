// Script to add missing columns to global_student_sheets
// Run with: node scripts/add-global-sheets-columns.js

const mysql = require('mysql2/promise');

async function addMissingColumns() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  console.log('🔄 Adding missing columns to global_student_sheets...\n');

  const columns = [
    { name: 'student_code', type: 'VARCHAR(50)', after: 'id' },
    { name: 'trade_name', type: 'VARCHAR(200)', after: 'trade_code' },
    { name: 'class_name', type: 'VARCHAR(200)', after: 'level_suffix' },
    { name: 'gpa', type: 'DECIMAL(3,2) DEFAULT 0', after: 'class_name' },
    { name: 'attendance_percentage', type: 'DECIMAL(5,2) DEFAULT 0', after: 'gpa' },
    { name: 'conduct_score', type: 'DECIMAL(5,2) DEFAULT 40', after: 'attendance_percentage' },
    { name: 'conduct_grade', type: 'VARCHAR(20) DEFAULT "Good"', after: 'conduct_score' },
    { name: 'academic_year', type: 'VARCHAR(20) DEFAULT "2024-2025"', after: 'conduct_grade' },
    { name: 'profile_image', type: 'VARCHAR(500)', after: 'academic_year' },
    { name: 'emergency_contact', type: 'VARCHAR(50)', after: 'profile_image' }
  ];

  for (const col of columns) {
    try {
      await pool.execute(`ALTER TABLE global_student_sheets ADD COLUMN ${col.name} ${col.type}`);
      console.log(`   ✅ Added column: ${col.name}`);
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log(`   ⏭️  Column already exists: ${col.name}`);
      } else {
        console.log(`   ❌ Error adding ${col.name}: ${error.message}`);
      }
    }
  }

  console.log('\n🔄 Updating existing records...\n');

  // Update trade_name from trade_code
  try {
    const [result] = await pool.execute(`
      UPDATE global_student_sheets 
      SET trade_name = CASE 
          WHEN trade_code = 'BDC' THEN 'Building and Construction'
          WHEN trade_code = 'SOD' THEN 'Software Development'
          WHEN trade_code = 'AUTO' THEN 'Automobile Technology'
          WHEN trade_code = 'ENG' THEN 'Engineering'
          WHEN trade_code = 'HTL' THEN 'Hotel and Tourism'
          ELSE trade_code
      END
      WHERE (trade_name IS NULL OR trade_name = '') AND trade_code IS NOT NULL
    `);
    console.log(`   ✅ Updated trade_name for ${result.affectedRows} records`);
  } catch (error) {
    console.log(`   ❌ Error updating trade_name: ${error.message}`);
  }

  // Update student_code from student_id
  try {
    const [result] = await pool.execute(`
      UPDATE global_student_sheets 
      SET student_code = student_id 
      WHERE (student_code IS NULL OR student_code = '') AND student_id IS NOT NULL
    `);
    console.log(`   ✅ Updated student_code for ${result.affectedRows} records`);
  } catch (error) {
    console.log(`   ❌ Error updating student_code: ${error.message}`);
  }

  // Set default academic year
  try {
    const [result] = await pool.execute(`
      UPDATE global_student_sheets 
      SET academic_year = '2024-2025' 
      WHERE academic_year IS NULL OR academic_year = ''
    `);
    console.log(`   ✅ Set academic_year for ${result.affectedRows} records`);
  } catch (error) {
    console.log(`   ❌ Error setting academic_year: ${error.message}`);
  }

  // Show table structure
  console.log('\n📋 Current table structure:');
  try {
    const [columns] = await pool.execute('DESCRIBE global_student_sheets');
    console.table(columns.map(c => ({ Field: c.Field, Type: c.Type })));
  } catch (error) {
    console.log(`   ❌ Error showing structure: ${error.message}`);
  }

  // Show sample data
  console.log('\n📊 Sample data:');
  try {
    const [students] = await pool.execute('SELECT student_code, first_name, last_name, trade_name, level_number, gpa, attendance_percentage, conduct_score FROM global_student_sheets LIMIT 5');
    console.table(students);
  } catch (error) {
    console.log(`   ❌ Error getting sample: ${error.message}`);
  }

  console.log('\n✅ Migration complete!\n');
  
  await pool.end();
}

addMissingColumns();
