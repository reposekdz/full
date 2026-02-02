const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initComprehensiveGlobalSystem() {
  let connection;
  
  try {
    console.log('🚀 Initializing Comprehensive Global Student Management System...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    });

    console.log('✅ Connected to database\n');

    // Read and execute the comprehensive schema
    const schemaPath = path.join(__dirname, 'comprehensive-global-system-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error('Schema file not found: ' + schemaPath);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Executing comprehensive schema...');
    await connection.query(schema);
    console.log('✅ Schema executed successfully\n');

    // Verify tables were created
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN (
        'global_students', 'student_parents', 'student_academic_records',
        'student_attendance', 'student_discipline_records', 'student_fee_payments',
        'student_activities', 'student_health_records', 'staff_student_actions',
        'parent_portal_sessions', 'parent_student_communications', 
        'parent_payment_requests', 'parent_notifications',
        'student_portal_sessions', 'student_learning_progress',
        'student_achievements', 'student_notifications', 'student_analytics',
        'system_notifications'
      )
    `, [process.env.DB_NAME || 'school_management']);

    console.log('✅ Tables created:');
    tables.forEach(table => {
      console.log(`   - ${table.TABLE_NAME}`);
    });
    console.log();

    // Check if we need to migrate data from existing students table
    const [existingStudents] = await connection.query(`
      SELECT COUNT(*) as count FROM users WHERE role = 'student'
    `);

    if (existingStudents[0].count > 0) {
      console.log(`📊 Found ${existingStudents[0].count} existing students`);
      console.log('🔄 Migrating students to global_students table...');

      await connection.query(`
        INSERT INTO global_students (
          student_id, admission_number, first_name, last_name,
          date_of_birth, gender, phone, email, address,
          current_class_id, enrollment_date, academic_status,
          profile_image, created_at
        )
        SELECT 
          COALESCE(student_id, CONCAT('STD-', id)) as student_id,
          COALESCE(student_id, CONCAT('ADM-', id)) as admission_number,
          COALESCE(first_name, name) as first_name,
          COALESCE(last_name, '') as last_name,
          date_of_birth,
          gender,
          phone,
          email,
          address,
          role_id as current_class_id,
          created_at as enrollment_date,
          CASE WHEN is_active = 1 THEN 'Active' ELSE 'Inactive' END as academic_status,
          profile_image,
          created_at
        FROM users
        WHERE role = 'student'
        ON DUPLICATE KEY UPDATE
          first_name = VALUES(first_name),
          last_name = VALUES(last_name)
      `);

      console.log('✅ Students migrated successfully\n');
    }

    // Create default academic year if not exists
    await connection.query(`
      INSERT IGNORE INTO academic_years (year_name, start_date, end_date, is_current)
      VALUES ('2024-2025', '2024-09-01', '2025-08-31', true)
    `);

    // Create sample subjects if table exists and is empty
    const [subjectCheck] = await connection.query(`
      SELECT COUNT(*) as count FROM subjects
    `);

    if (subjectCheck[0].count === 0) {
      console.log('📚 Creating sample subjects...');
      await connection.query(`
        INSERT INTO subjects (name, code, description) VALUES
        ('Mathematics', 'MATH', 'Mathematics and numerical skills'),
        ('English', 'ENG', 'English language and literature'),
        ('Kinyarwanda', 'KIN', 'Kinyarwanda language'),
        ('Physics', 'PHY', 'Physics and physical sciences'),
        ('Chemistry', 'CHEM', 'Chemistry and chemical sciences'),
        ('Biology', 'BIO', 'Biology and life sciences'),
        ('Computer Science', 'CS', 'Computer science and programming'),
        ('History', 'HIST', 'History and social studies'),
        ('Geography', 'GEO', 'Geography and earth sciences'),
        ('Entrepreneurship', 'ENT', 'Business and entrepreneurship')
        ON DUPLICATE KEY UPDATE name = name
      `);
      console.log('✅ Sample subjects created\n');
    }

    // Create indexes for performance
    console.log('🔧 Creating performance indexes...');
    
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_global_students_status ON global_students(academic_status)`,
      `CREATE INDEX IF NOT EXISTS idx_student_attendance_date ON student_attendance(date, student_id)`,
      `CREATE INDEX IF NOT EXISTS idx_student_academic_year ON student_academic_records(student_id, academic_year, term)`,
      `CREATE INDEX IF NOT EXISTS idx_staff_actions_date ON staff_student_actions(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_parent_notif_unread ON parent_notifications(parent_id, is_read)`,
      `CREATE INDEX IF NOT EXISTS idx_student_notif_unread ON student_notifications(student_id, is_read)`
    ];

    for (const indexSql of indexes) {
      try {
        await connection.query(indexSql);
      } catch (err) {
        // Index might already exist, continue
      }
    }

    console.log('✅ Indexes created\n');

    // Create sample data for testing (if in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🧪 Creating sample test data...');

      // Create a test student if none exist
      const [testStudentCheck] = await connection.query(`
        SELECT COUNT(*) as count FROM global_students
      `);

      if (testStudentCheck[0].count === 0) {
        const [testStudent] = await connection.query(`
          INSERT INTO global_students (
            student_id, admission_number, first_name, middle_name, last_name,
            date_of_birth, gender, phone, email, nationality,
            enrollment_date, academic_status, academic_year
          ) VALUES (
            'STD-2024-001', 'ADM-2024-001', 'John', 'Paul', 'Doe',
            '2005-05-15', 'Male', '0788123456', 'john.doe@student.school.rw', 'Rwandan',
            '2024-09-01', 'Active', '2024-2025'
          )
        `);

        const studentId = testStudent.insertId;

        // Add parent for test student
        await connection.query(`
          INSERT INTO student_parents (
            student_id, parent_type, first_name, last_name,
            phone, email, is_primary_contact
          ) VALUES (?, 'Father', 'James', 'Doe', '0788654321', 'james.doe@parent.rw', true)
        `, [studentId]);

        console.log('✅ Sample student and parent created');
        console.log('   Student ID: STD-2024-001');
        console.log('   Admission: ADM-2024-001');
        console.log('   Parent Phone: 0788654321\n');
      }
    }

    console.log('🎉 Comprehensive Global System initialized successfully!\n');
    console.log('📊 System Statistics:');
    
    const [stats] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM global_students) as total_students,
        (SELECT COUNT(*) FROM global_students WHERE academic_status = 'Active') as active_students,
        (SELECT COUNT(*) FROM student_parents) as total_parents,
        (SELECT COUNT(*) FROM staff_student_actions) as total_staff_actions
    `);

    console.log(`   Total Students: ${stats[0].total_students}`);
    console.log(`   Active Students: ${stats[0].active_students}`);
    console.log(`   Total Parents: ${stats[0].total_parents}`);
    console.log(`   Staff Actions Logged: ${stats[0].total_staff_actions}`);
    console.log();

    console.log('✅ System is ready for use!\n');
    console.log('📝 Next Steps:');
    console.log('   1. Update server.js to register new API routes');
    console.log('   2. Restart the backend server');
    console.log('   3. Test the new APIs using the documentation');
    console.log();

  } catch (error) {
    console.error('❌ Error initializing system:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if executed directly
if (require.main === module) {
  initComprehensiveGlobalSystem();
}

module.exports = initComprehensiveGlobalSystem;
