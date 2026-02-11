const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
  try {
    console.log('============================================');
    console.log('STUDENT TRAINING & PARENT SYSTEM SETUP');
    console.log('============================================\n');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'school_management',
      multipleStatements: true
    });
    
    console.log('Reading migration file...');
    const sqlFile = await fs.readFile(
      path.join(__dirname, 'backend/migrations/student-training-parent-system.sql'),
      'utf8'
    );
    
    console.log('Running database migration...\n');
    
    // Split SQL by DELIMITER and execute separately
    const sqlParts = sqlFile.split('DELIMITER');
    
    // Execute first part (tables and inserts)
    if (sqlParts[0]) {
      await connection.query(sqlParts[0]);
    }
    
    // Execute procedures (change delimiter temporarily)
    if (sqlParts.length > 1) {
      const procedureSQL = sqlParts[1]
        .replace(/\/\//g, '')
        .split(';')
        .filter(stmt => stmt.trim().length > 0);
      
      for (const stmt of procedureSQL) {
        if (stmt.trim()) {
          await connection.query(stmt);
        }
      }
    }
    
    console.log('============================================');
    console.log('MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('============================================\n');
    console.log('The following features are now available:\n');
    console.log('STUDENT TRAINING:');
    console.log('- Training programs management');
    console.log('- Module management');
    console.log('- Training sessions scheduling');
    console.log('- Student enrollments');
    console.log('- Module progress tracking');
    console.log('- Assessment management');
    console.log('- Training resources\n');
    console.log('PARENT PORTAL:');
    console.log('- Enhanced parent dashboard');
    console.log('- Child academics monitoring');
    console.log('- Child attendance tracking');
    console.log('- Child finance management');
    console.log('- Discipline monitoring');
    console.log('- Parent messaging');
    console.log('- Payment proof submission');
    console.log('- Notification settings\n');
    console.log('STUDENT-PARENT LINKING:');
    console.log('- Parent verification requests');
    console.log('- Admin approval workflow');
    console.log('- Direct linking by staff');
    console.log('- Access control permissions');
    console.log('- Activity logging\n');
    
    await connection.end();
    process.exit(0);
    
  } catch (error) {
    console.error('\nERROR: Migration failed');
    console.error(error.message);
    process.exit(1);
  }
}

runMigration();
