const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true
  });

  console.log('🌱 Seeding Finance and Academic data...');

  try {
    // 0. Clean up existing test data to ensure fresh seed
    await connection.query('DELETE FROM grades');
    await connection.query('DELETE FROM fee_payments');
    await connection.query('DELETE FROM fee_structures');
    await connection.query('DELETE FROM fee_types');
    
    // 1. Create Academic Year
    await connection.query(`
      INSERT IGNORE INTO academic_years (id, name, start_date, end_date, is_active)
      VALUES (1, '2025-2026', '2025-01-01', '2025-12-31', 1)
    `);

    // 2. Create Course
    await connection.query(`
      INSERT IGNORE INTO courses (id, name, code, description, duration_months, is_active)
      VALUES (1, 'Software Development', 'SOD', 'Computer Science and Software Development', 36, 1)
    `);

    // 3. Create Class
    await connection.query(`
      INSERT IGNORE INTO classes (id, name, course_id, academic_year_id, teacher_id, capacity, level, section)
      VALUES (1, 'Senior 1 A', 1, 1, 3, 40, 'S1', 'A')
    `);

    // 4. Create Subject
    await connection.query(`
      INSERT IGNORE INTO subjects (id, name, code, description, course_id)
      VALUES (1, 'Mathematics', 'MATH101', 'Basic Mathematics', 1)
    `);

    // 5. Create Fee Types
    await connection.query(`
      INSERT IGNORE INTO fee_types (id, name, description, is_recurring, recurrence_period)
      VALUES 
      (1, 'Tuition Fee', 'Main school fees', 1, 'semester'),
      (2, 'Library Fee', 'Access to library', 0, 'annual'),
      (3, 'Computer Lab Fee', 'Lab maintenance', 1, 'semester')
    `);

    // 6. Create Fee Structures
    await connection.query(`
      INSERT IGNORE INTO fee_structures (id, course_id, fee_type_id, academic_year_id, amount, due_date_offset_days)
      VALUES 
      (1, 1, 1, 1, 500000.00, 30),
      (2, 1, 2, 1, 50000.00, 30),
      (3, 1, 3, 1, 100000.00, 30)
    `);

    // 7. Enroll Students
    // Student 1 (id: 1) is already in DB from check-users.js
    await connection.query(`
      INSERT IGNORE INTO enrollments (student_id, class_id, academic_year_id, enrollment_date, status)
      VALUES (1, 1, 1, CURDATE(), 'active')
    `);

    // 8. Create Sample Fee Payments
    // Using the schema from financeController.js (requires fee_structure_id, received_by)
    // and accountant-advanced.js (academic_year_id, term, total_amount, paid_amount, remaining_amount)
    // Our migration script added those columns to fee_payments
    
    await connection.query(`
      INSERT IGNORE INTO fee_payments (student_id, fee_structure_id, academic_year_id, term, total_amount, paid_amount, remaining_amount, amount_paid, payment_date, payment_method, status, received_by, transaction_code)
      VALUES 
      (1, 1, 1, 'Term 1', 500000.00, 200000.00, 300000.00, 200000.00, CURDATE(), 'bank_transfer', 'partially_paid', 4, 'TXN123456')
    `);

    // 9. Create Sample Grades
    await connection.query(`
      INSERT IGNORE INTO grades (student_id, subject_id, class_id, assessment_type, assessment_name, max_marks, obtained_marks, percentage, grade_letter, assessment_date, teacher_id)
      VALUES 
      (1, 1, 1, 'quiz', 'Quiz 1', 20.00, 15.00, 75.00, 'C', CURDATE(), 3)
    `);

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await connection.end();
  }
}

seed();
