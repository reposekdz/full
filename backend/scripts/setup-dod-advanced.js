const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management',
  multipleStatements: true
};

async function setupDODAdvanced() {
  let connection;
  
  try {
    console.log('========================================');
    console.log('   DOD Advanced Features Setup');
    console.log('========================================\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');
    
    // Read and execute SQL schema
    console.log('[1/3] Creating database tables...');
    const sqlPath = path.join(__dirname, 'dod-advanced-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await connection.query(sql);
    console.log('✅ Database tables created\n');
    
    // Verify tables
    console.log('[2/3] Verifying tables...');
    const tables = [
      'scheduled_meetings',
      'parent_messages',
      'bulk_actions_log',
      'student_parents',
      'dod_activity_log',
      'dod_statistics_cache'
    ];
    
    for (const table of tables) {
      const [rows] = await connection.query(`SHOW TABLES LIKE '${table}'`);
      if (rows.length > 0) {
        console.log(`  ✅ ${table}`);
      } else {
        console.log(`  ❌ ${table} - NOT FOUND`);
      }
    }
    
    // Update existing tables
    console.log('\n[3/3] Updating existing tables...');
    
    // Check and add columns to discipline_records
    const [disciplineColumns] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'school_management' 
      AND TABLE_NAME = 'discipline_records'
    `);
    
    const disciplineColumnNames = disciplineColumns.map(c => c.COLUMN_NAME);
    
    if (!disciplineColumnNames.includes('conduct_points_deducted')) {
      await connection.query('ALTER TABLE discipline_records ADD COLUMN conduct_points_deducted INT DEFAULT 0');
      console.log('  ✅ Added conduct_points_deducted to discipline_records');
    }
    
    if (!disciplineColumnNames.includes('new_conduct_score')) {
      await connection.query('ALTER TABLE discipline_records ADD COLUMN new_conduct_score INT DEFAULT 40');
      console.log('  ✅ Added new_conduct_score to discipline_records');
    }
    
    // Check and add columns to global_students
    const [studentColumns] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'school_management' 
      AND TABLE_NAME = 'global_students'
    `);
    
    const studentColumnNames = studentColumns.map(c => c.COLUMN_NAME);
    
    if (!studentColumnNames.includes('conduct_score')) {
      await connection.query('ALTER TABLE global_students ADD COLUMN conduct_score INT DEFAULT 40');
      console.log('  ✅ Added conduct_score to global_students');
    }
    
    if (!studentColumnNames.includes('overall_attendance_percentage')) {
      await connection.query('ALTER TABLE global_students ADD COLUMN overall_attendance_percentage DECIMAL(5,2) DEFAULT 100.00');
      console.log('  ✅ Added overall_attendance_percentage to global_students');
    }
    
    console.log('\n========================================');
    console.log('✅ DOD Advanced Features Setup Complete!');
    console.log('========================================\n');
    
    console.log('Next Steps:');
    console.log('1. Add route to server.js:');
    console.log('   app.use(\'/api/dod-advanced\', require(\'./routes/dod-advanced\'));');
    console.log('2. Restart the backend server');
    console.log('3. Access DOD Dashboard in the frontend\n');
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

setupDODAdvanced();
