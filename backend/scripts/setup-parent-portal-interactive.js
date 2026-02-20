const mysql = require('mysql2/promise');
require('dotenv').config();

const setupParentPortalTables = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  try {
    console.log('🔧 Setting up Parent Portal Interactive tables...\n');

    // Parent Notifications Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS parent_notifications (
        notification_id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        student_id INT,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('conduct', 'attendance', 'grades', 'fees', 'general') DEFAULT 'general',
        is_read BOOLEAN DEFAULT FALSE,
        read_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES parents(parent_id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
        INDEX idx_parent_read (parent_id, is_read),
        INDEX idx_created (created_at)
      )
    `);
    console.log('✅ parent_notifications table created');

    // Leave Requests Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        request_id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        leave_type ENUM('sick', 'family', 'personal', 'emergency', 'other') NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT NOT NULL,
        requested_by INT NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        approved_by INT,
        approved_at DATETIME,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
        FOREIGN KEY (requested_by) REFERENCES parents(parent_id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
        INDEX idx_student_status (student_id, status),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ leave_requests table created');

    // Messages Table (if not exists)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        message_id INT PRIMARY KEY AUTO_INCREMENT,
        sender_id INT NOT NULL,
        recipient_id INT NOT NULL,
        student_id INT,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('sent', 'read', 'archived') DEFAULT 'sent',
        read_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE SET NULL,
        INDEX idx_recipient_status (recipient_id, status),
        INDEX idx_sender (sender_id)
      )
    `);
    console.log('✅ messages table created');

    // Report Cards Table (if not exists)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS report_cards (
        report_id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        term VARCHAR(50) NOT NULL,
        year INT NOT NULL,
        overall_grade VARCHAR(10),
        overall_percentage DECIMAL(5,2),
        class_rank INT,
        total_students INT,
        teacher_comment TEXT,
        headmaster_comment TEXT,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
        INDEX idx_student_term (student_id, term, year)
      )
    `);
    console.log('✅ report_cards table created');

    // Fee Payments Table (if not exists)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fee_payments (
        payment_id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        amount_paid DECIMAL(10,2) NOT NULL,
        payment_method ENUM('cash', 'mobile_money', 'bank_transfer', 'card') NOT NULL,
        transaction_reference VARCHAR(255),
        payment_date DATE NOT NULL,
        received_by INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
        FOREIGN KEY (received_by) REFERENCES users(user_id) ON DELETE SET NULL,
        INDEX idx_student_date (student_id, payment_date)
      )
    `);
    console.log('✅ fee_payments table created');

    // Assignment Submissions Table (if not exists)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS assignment_submissions (
        submission_id INT PRIMARY KEY AUTO_INCREMENT,
        assignment_id INT NOT NULL,
        student_id INT NOT NULL,
        submission_date DATETIME NOT NULL,
        submission_file VARCHAR(500),
        submission_text TEXT,
        marks_obtained DECIMAL(5,2),
        feedback TEXT,
        status ENUM('submitted', 'graded', 'late', 'missing') DEFAULT 'submitted',
        graded_by INT,
        graded_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
        FOREIGN KEY (graded_by) REFERENCES teachers(teacher_id) ON DELETE SET NULL,
        INDEX idx_assignment_student (assignment_id, student_id)
      )
    `);
    console.log('✅ assignment_submissions table created');

    // Insert sample notifications
    await connection.query(`
      INSERT IGNORE INTO parent_notifications (parent_id, student_id, title, message, type)
      SELECT 
        p.parent_id,
        psl.student_id,
        'Welcome to Parent Portal',
        'You can now monitor your child\\'s conduct, attendance, grades, and more!',
        'general'
      FROM parents p
      JOIN parent_student_links psl ON p.parent_id = psl.parent_id
      WHERE psl.status = 'linked'
      LIMIT 10
    `);
    console.log('✅ Sample notifications inserted');

    console.log('\n✅ Parent Portal Interactive setup complete!');
    console.log('\n📊 Available Features:');
    console.log('   - Real-time conduct monitoring');
    console.log('   - Attendance tracking');
    console.log('   - Grade viewing');
    console.log('   - Fee management');
    console.log('   - Assignment tracking');
    console.log('   - Leave request submission');
    console.log('   - Direct messaging with teachers');
    console.log('   - Notification system');
    console.log('   - Report card access\n');

  } catch (error) {
    console.error('❌ Error setting up tables:', error.message);
  } finally {
    await connection.end();
  }
};

setupParentPortalTables();
