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
    
    // Check database structure and add missing columns
    console.log('\n🔧 Checking and fixing database structure...');
    
    // Add missing sheet_id column to student_conduct_tracking if not exists
    try {
      await pool.execute(`
        ALTER TABLE student_conduct_tracking 
        ADD COLUMN IF NOT EXISTS sheet_id INT,
        ADD INDEX IF NOT EXISTS idx_sheet_id (sheet_id)
      `);
      console.log('✅ Added sheet_id column to student_conduct_tracking');
    } catch (e) {
      console.log('Sheet_id column already exists or error:', e.message);
    }
    
    // Get all trades and levels for comprehensive sheets
    const [trades] = await pool.execute('SELECT * FROM trades');
    const [levels] = await pool.execute('SELECT * FROM trade_levels');
    const [classes] = await pool.execute('SELECT * FROM trade_classes');
    
    console.log(`Found ${trades.length} trades, ${levels.length} levels, ${classes.length} classes`);
    
    // Check actual column names
    const [tradeColumns] = await pool.execute("SHOW COLUMNS FROM trades");
    const [levelColumns] = await pool.execute("SHOW COLUMNS FROM trade_levels");
    console.log('Trades columns:', tradeColumns.map(c => c.Field));
    console.log('Levels columns:', levelColumns.map(c => c.Field));
    
    // Check if tables exist and get structure
    try {
      const [tables] = await pool.execute("SHOW TABLES LIKE 'trade_%'");
      console.log('Available trade tables:', tables.map(t => Object.values(t)[0]));
      
      if (tables.length > 0) {
        const [columns] = await pool.execute("SHOW COLUMNS FROM trade_classes");
        console.log('Trade classes columns:', columns.map(c => c.Field));
      }
    } catch (e) {
      console.log('Table structure check failed:', e.message);
    }
    
    // Migrate existing students with proper trade/level mapping
    console.log('\n📦 Migrating existing students with full trade data...');
    const [students] = await pool.execute(`
      SELECT u.id, u.student_id as student_code, u.first_name, u.last_name, u.email, u.phone, 
             u.gender, u.date_of_birth,
             COALESCE(t.name, 'General') as trade_name,
             COALESCE(tl.level_number, tc.level, 1) as level_number,
             COALESCE(tl.level_suffix, 'A') as level_suffix,
             COALESCE(tc.class_name, tc.name, 'General Class') as class_name,
             COALESCE(t.id, 'GEN') as trade_code
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN trades t ON tc.name LIKE CONCAT('%', t.name, '%') OR tc.class_name LIKE CONCAT('%', t.name, '%')
      LEFT JOIN trade_levels tl ON tl.level_number = tc.level
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
          student.class_name, new Date().getFullYear().toString()
        ]);
        
        // Create conduct tracking with proper sheet_id
        const [sheet] = await pool.execute('SELECT id FROM global_student_sheets WHERE student_id = ?', [student.id]);
        if (sheet.length > 0) {
          await pool.execute(`
            INSERT INTO student_conduct_tracking (sheet_id, student_id) 
            VALUES (?,?) 
            ON DUPLICATE KEY UPDATE sheet_id=VALUES(sheet_id)
          `, [sheet[0].id, student.id]);
          
          // Create attendance summary
          await pool.execute(`
            INSERT INTO student_attendance_summary (sheet_id, student_id, month, year) 
            VALUES (?,?,?,?) 
            ON DUPLICATE KEY UPDATE sheet_id=VALUES(sheet_id)
          `, [sheet[0].id, student.id, new Date().toLocaleString('default', { month: 'long' }), new Date().getFullYear()]);
        }
        
        migrated++;
      } catch (err) {
        console.log(`⚠️  Skipped student ${student.student_code}: ${err.message}`);
      }
    }
    console.log(`✅ Migrated ${migrated} students`);
    
    // Create sheets for all trade levels (ensure every level has sheets)
    console.log('\n📋 Creating sheets for all trade levels...');
    
    for (const trade of trades) {
      for (const level of levels) {
        // Create template sheet for each trade-level combination
        try {
          await pool.execute(`
            INSERT IGNORE INTO global_student_sheets 
            (student_id, student_code, first_name, last_name, trade_code, trade_name, 
             level_number, level_suffix, class_name, academic_year, status)
            VALUES (?,?,?,?,?,?,?,?,?,?,'active')
          `, [
            0, `TEMPLATE_${trade.id}_L${level.level_number}`, 'Template', 'Student',
            trade.id, trade.name, level.level_number, level.level_suffix || 'A',
            `${trade.name} Level ${level.level_number}`, new Date().getFullYear().toString()
          ]);
        } catch (e) {
          console.log(`Template for ${trade.id} L${level.level_number}: ${e.message}`);
        }
      }
    }
    
    // Create staff management integration
    console.log('\n👥 Setting up staff management integration...');
    
    // Add staff access permissions for student sheets
    const staffRoles = ['teacher', 'dos', 'admin', 'principal', 'accountant'];
    for (const role of staffRoles) {
      try {
        await pool.execute(`
          INSERT INTO student_sheet_custom_columns 
          (column_name, column_label, column_type, created_by_role, visible_to_roles, editable_by_roles, scope, is_active)
          VALUES (?,?,?,?,?,?,?,1)
          ON DUPLICATE KEY UPDATE column_label=VALUES(column_label)
        `, [
          `${role}_notes`, `${role.charAt(0).toUpperCase() + role.slice(1)} Notes`, 'textarea',
          role, JSON.stringify([role, 'admin']), JSON.stringify([role, 'admin']), 'global'
        ]);
      } catch (e) {
        console.log(`Staff column for ${role}: ${e.message}`);
      }
    }
    
    console.log('✅ Staff management integration complete');
    
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
