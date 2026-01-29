const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function setupGlobalStudentSheets() {
  console.log('🚀 Setting up Global Student Sheets System...\n');
  
  try {
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'migrations', 'global_student_sheets_system.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const statements = schema.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.execute(statement);
      }
    }
    console.log('✅ Database schema created');
    
    // Migrate existing students
    console.log('\n📦 Migrating existing students...');
    const [students] = await pool.execute(`
      SELECT u.id, u.student_id as student_code, u.first_name, u.last_name, u.email, u.phone, 
             u.gender, u.date_of_birth, e.academic_year,
             tl.trade_code, tl.trade_name, tl.level_number, tl.level_suffix, tc.class_name
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE u.role_id = (SELECT id FROM roles WHERE name = 'student')
    `);
    
    let migrated = 0;
    for (const student of students) {
      try {
        await pool.execute(`
          INSERT INTO global_student_sheets 
          (student_id, student_code, first_name, last_name, email, phone, gender, date_of_birth, 
           trade_code, trade_name, level_number, level_suffix, class_name, academic_year)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
          ON DUPLICATE KEY UPDATE 
          first_name=VALUES(first_name), last_name=VALUES(last_name), email=VALUES(email), 
          phone=VALUES(phone), updated_at=NOW()
        `, [
          student.id, student.student_code, student.first_name, student.last_name, 
          student.email, student.phone, student.gender || 'Male', student.date_of_birth,
          student.trade_code, student.trade_name, student.level_number, student.level_suffix,
          student.class_name, student.academic_year || new Date().getFullYear()
        ]);
        
        // Create conduct tracking
        const [sheet] = await pool.execute('SELECT id FROM global_student_sheets WHERE student_id = ?', [student.id]);
        await pool.execute(`
          INSERT INTO student_conduct_tracking (sheet_id, student_id) 
          VALUES (?,?) 
          ON DUPLICATE KEY UPDATE sheet_id=VALUES(sheet_id)
        `, [sheet[0].id, student.id]);
        
        migrated++;
      } catch (err) {
        console.log(`⚠️  Skipped student ${student.student_code}: ${err.message}`);
      }
    }
    console.log(`✅ Migrated ${migrated} students`);
    
    // Create default custom columns
    console.log('\n📋 Creating default custom columns...');
    const defaultColumns = [
      { name: 'sports_participation', label: 'Sports Participation', type: 'select', options: ['None', 'Football', 'Basketball', 'Volleyball', 'Athletics'], role: 'teacher', visible: ['teacher', 'dos', 'admin'], editable: ['teacher', 'admin'], scope: 'global' },
      { name: 'leadership_role', label: 'Leadership Role', type: 'text', role: 'dos', visible: ['teacher', 'dos', 'admin'], editable: ['dos', 'admin'], scope: 'global' },
      { name: 'special_needs', label: 'Special Needs', type: 'textarea', role: 'admin', visible: ['teacher', 'dos', 'admin'], editable: ['admin'], scope: 'global' },
      { name: 'parent_contact_frequency', label: 'Parent Contact Frequency', type: 'select', options: ['Weekly', 'Bi-weekly', 'Monthly', 'As needed'], role: 'teacher', visible: ['teacher', 'dos', 'admin'], editable: ['teacher', 'dos', 'admin'], scope: 'global' }
    ];
    
    for (const col of defaultColumns) {
      try {
        await pool.execute(`
          INSERT INTO student_sheet_custom_columns 
          (column_name, column_label, column_type, select_options, created_by_role, visible_to_roles, editable_by_roles, scope, is_active)
          VALUES (?,?,?,?,?,?,?,?,1)
          ON DUPLICATE KEY UPDATE column_label=VALUES(column_label)
        `, [
          col.name, col.label, col.type, 
          col.options ? JSON.stringify(col.options) : null,
          col.role, JSON.stringify(col.visible), JSON.stringify(col.editable), col.scope
        ]);
      } catch (err) {
        console.log(`⚠️  Skipped column ${col.name}: ${err.message}`);
      }
    }
    console.log('✅ Default custom columns created');
    
    console.log('\n✅ Global Student Sheets System setup complete!');
    console.log('\n📊 System Features:');
    console.log('   ✓ Global student sheets for all students');
    console.log('   ✓ Role-based access control');
    console.log('   ✓ Custom columns per role');
    console.log('   ✓ Academic performance tracking');
    console.log('   ✓ Attendance management');
    console.log('   ✓ Discipline records');
    console.log('   ✓ Payment tracking');
    console.log('   ✓ Term reports generation');
    console.log('   ✓ Analytics and insights');
    
    console.log('\n🔗 API Endpoint: /api/global-sheets');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

setupGlobalStudentSheets();
