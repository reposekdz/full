const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function setupDODParentManagement() {
  console.log('🚀 Setting up DOD Parent Management System...\n');

  try {
    const sqlFile = path.join(__dirname, '../migrations/dod-parent-linking-advanced.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    for (const statement of statements) {
      if (statement.includes('DELIMITER')) continue;
      try {
        await pool.execute(statement);
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.error('Error executing statement:', err.message);
        }
      }
    }

    console.log('✅ Database schema created successfully\n');

    // Sync Level 4 SOD students
    console.log('📊 Syncing Level 4 SOD students...');
    await pool.execute(`
      INSERT INTO level4_sod_students (
        student_id, student_code, first_name, last_name, gender, phone, email,
        trade_code, trade_name, level_number, conduct_score, status
      )
      SELECT 
        u.id,
        sp.admission_number,
        u.first_name,
        u.last_name,
        u.gender,
        u.phone,
        u.email,
        'SOD',
        'Software Development',
        4,
        40,
        'active'
      FROM users u
      JOIN student_profiles sp ON u.id = sp.user_id
      JOIN enrollments e ON u.id = e.student_id
      WHERE u.role = 'student' 
        AND e.trade_code = 'SOD' 
        AND e.level_number = 4
        AND e.status = 'active'
      ON DUPLICATE KEY UPDATE 
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        gender = VALUES(gender),
        phone = VALUES(phone),
        email = VALUES(email),
        updated_at = NOW()
    `);

    const [[{ count }]] = await pool.execute(
      'SELECT COUNT(*) as count FROM level4_sod_students WHERE status = "active"'
    );
    console.log(`✅ Synced ${count} Level 4 SOD students\n`);

    console.log('✅ DOD Parent Management System setup complete!\n');
    console.log('📋 Summary:');
    console.log('   - Parent-Student linking system ready');
    console.log('   - Level 4 SOD students sheet created');
    console.log('   - Automatic parent linking enabled');
    console.log('   - Contact history tracking active');
    console.log('   - Notification queue system ready\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupDODParentManagement();
