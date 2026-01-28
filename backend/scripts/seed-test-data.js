const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seedTestData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true
  });

  console.log('🌱 Seeding test data...');

  try {
    // 1. Ensure Teachers and Accountants roles exist (already checked they do)
    
    // 2. Create a Teacher if not exists
    await connection.query(`
      INSERT IGNORE INTO users (id, username, email, password_hash, first_name, last_name, role_id, is_active, created_at, updated_at)
      VALUES (3, 'teacher1', 'teacher1@example.com', 'hashed_password', 'John', 'Doe', 6, 1, NOW(), NOW())
    `);

    // 3. Create an Accountant if not exists
    await connection.query(`
      INSERT IGNORE INTO users (id, username, email, password_hash, first_name, last_name, role_id, is_active, created_at, updated_at)
      VALUES (4, 'accountant1', 'accountant1@example.com', 'hashed_password', 'Jane', 'Smith', 9, 1, NOW(), NOW())
    `);

    // 4. Create Academic Year
    await connection.query(`
      INSERT IGNORE INTO academic_years (id, name, start_date, end_date, is_active)
      VALUES (1, '2025-2026', '2025-01-01', '2025-12-31', 1)
    `);

    // 5. Create Class
    await connection.query(`
      INSERT IGNORE INTO classes (id, name, level, section, created_at, updated_at)
      VALUES (1, 'Senior 1 A', 'S1', 'A', NOW(), NOW())
    `);

    // 6. Create Subject
    await connection.query(`
      INSERT IGNORE INTO subjects (id, name, code, description, created_at, updated_at)
      VALUES (1, 'Mathematics', 'MATH101', 'Basic Mathematics', NOW(), NOW())
    `);

    // 7. Enroll Student 1 in Class 1
    await connection.query(`
      INSERT IGNORE INTO enrollments (student_id, class_id, academic_year_id, status, enrollment_date)
      VALUES (1, 1, 1, 'active', CURDATE())
    `);

    console.log('✅ Seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await connection.end();
  }
}

seedTestData();
