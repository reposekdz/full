const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupTeacherPortal() {
  let connection;
  
  try {
    console.log('🚀 Setting up Teacher Portal...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    });
    
    console.log('✅ Connected to database\n');
    
    // Read and execute schema
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, '../migrations/teacher-portal-simple.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📝 Creating tables...');
    await connection.query(schema);
    console.log('✅ Tables created\n');
    
    // Assign sample teacher to courses
    console.log('👨‍🏫 Setting up teacher assignments...');
    const [teachers] = await connection.query(`
      SELECT id, first_name, last_name FROM users WHERE role = 'teacher' LIMIT 1
    `);
    
    if (teachers.length > 0) {
      const teacherId = teachers[0].id;
      console.log(`   Teacher: ${teachers[0].first_name} ${teachers[0].last_name} (ID: ${teacherId})`);
      
      // Assign teacher to courses
      await connection.query(`
        UPDATE courses SET teacher_id = ? WHERE teacher_id IS NULL LIMIT 4
      `, [teacherId]);
      
      console.log('✅ Teacher assigned to courses\n');
    } else {
      console.log('⚠️  No teacher found. Creating sample teacher...');
      
      const [result] = await connection.query(`
        INSERT INTO users (first_name, last_name, email, password, role, status)
        VALUES ('John', 'Teacher', 'teacher@garden.rw', '$2b$10$YourHashedPasswordHere', 'teacher', 'active')
      `);
      
      const teacherId = result.insertId;
      await connection.query(`UPDATE courses SET teacher_id = ? LIMIT 4`, [teacherId]);
      
      console.log('✅ Sample teacher created and assigned\n');
    }
    
    // Create sample enrollments
    console.log('📚 Creating sample enrollments...');
    const [students] = await connection.query(`
      SELECT id FROM users WHERE role = 'student' AND status = 'active' LIMIT 20
    `);
    
    const [courses] = await connection.query(`
      SELECT id FROM courses WHERE teacher_id IS NOT NULL LIMIT 4
    `);
    
    if (students.length > 0 && courses.length > 0) {
      for (const student of students) {
        for (const course of courses) {
          await connection.query(`
            INSERT IGNORE INTO enrollments (student_id, course_id, status)
            VALUES (?, ?, 'active')
          `, [student.id, course.id]);
        }
      }
      console.log(`✅ Created ${students.length * courses.length} enrollments\n`);
    }
    
    // Statistics
    const [[stats]] = await connection.query(`
      SELECT
        (SELECT COUNT(*) FROM courses WHERE teacher_id IS NOT NULL) as courses_count,
        (SELECT COUNT(*) FROM enrollments WHERE status = 'active') as enrollments_count,
        (SELECT COUNT(*) FROM users WHERE role = 'teacher') as teachers_count,
        (SELECT COUNT(*) FROM users WHERE role = 'student' AND status = 'active') as students_count
    `);
    
    console.log('📊 Setup Summary:');
    console.log(`   Teachers: ${stats.teachers_count}`);
    console.log(`   Students: ${stats.students_count}`);
    console.log(`   Courses: ${stats.courses_count}`);
    console.log(`   Enrollments: ${stats.enrollments_count}`);
    console.log('');
    
    console.log('✅ Teacher Portal Setup Complete!\n');
    console.log('🎯 Next Steps:');
    console.log('   1. Restart backend: npm start');
    console.log('   2. Login as teacher: teacher@garden.rw');
    console.log('   3. Access dashboard at /dashboard-teacher\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Setup Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

setupTeacherPortal();
