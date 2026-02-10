const { pool } = require('../config/database');

async function setupAdvancedStaffTables() {
  try {
    console.log('Creating advanced staff management tables...');

    // Create staff_profiles table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS staff_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        staff_id INT NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        profile_image TEXT,
        date_of_birth DATE,
        address TEXT,
        emergency_contact VARCHAR(200),
        emergency_phone VARCHAR(20),
        hire_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_staff_id (staff_id),
        INDEX idx_email (email)
      )
    `);
    console.log('✓ staff_profiles table created');

    // Create staff_reviews table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS staff_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        staff_id INT NOT NULL,
        evaluator_id INT,
        evaluation_period VARCHAR(50),
        overall_rating DECIMAL(3,2),
        rating_breakdown JSON,
        strengths TEXT,
        areas_for_improvement TEXT,
        recommendations TEXT,
        goals JSON,
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_staff_id (staff_id),
        INDEX idx_evaluation_period (evaluation_period)
      )
    `);
    console.log('✓ staff_reviews table created');

    // Create staff_schedule table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS staff_schedule (
        id INT AUTO_INCREMENT PRIMARY KEY,
        staff_id INT NOT NULL,
        day_of_week INT NOT NULL COMMENT '1=Monday, 7=Sunday',
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        location VARCHAR(200),
        activity VARCHAR(200),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_staff_id (staff_id),
        INDEX idx_day_of_week (day_of_week)
      )
    `);
    console.log('✓ staff_schedule table created');

    // Create staff_documents table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS staff_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        staff_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_type VARCHAR(100),
        file_size INT,
        category ENUM('contract', 'certificate', 'id_document', 'resume', 'performance', 'other') DEFAULT 'other',
        description TEXT,
        uploaded_by INT,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_staff_id (staff_id),
        INDEX idx_category (category)
      )
    `);
    console.log('✓ staff_documents table created');

    // Create staff_notifications table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS staff_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        staff_id INT NOT NULL,
        sender_id INT,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
        priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
        action_url TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_staff_id (staff_id),
        INDEX idx_is_read (is_read)
      )
    `);
    console.log('✓ staff_notifications table created');

    // Create staff_activity_log table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS staff_activity_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        staff_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        description TEXT,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_staff_id (staff_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✓ staff_activity_log table created');

    // Create staff_leaves table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS staff_leaves (
        id INT AUTO_INCREMENT PRIMARY KEY,
        staff_id INT NOT NULL,
        leave_type VARCHAR(50),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        coverage_arrangement TEXT,
        status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
        reviewed_by INT,
        reviewed_at TIMESTAMP NULL,
        reviewer_comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_staff_id (staff_id),
        INDEX idx_status (status)
      )
    `);
    console.log('✓ staff_leaves table created');

    // Create staff_attendance table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS staff_attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        staff_id INT NOT NULL,
        date DATE NOT NULL,
        check_in TIME,
        check_out TIME,
        status ENUM('present', 'absent', 'late', 'half_day', 'on_leave') DEFAULT 'present',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_staff_date (staff_id, date),
        INDEX idx_staff_id (staff_id),
        INDEX idx_date (date),
        INDEX idx_status (status)
      )
    `);
    console.log('✓ staff_attendance table created');

    console.log('\n✅ All advanced staff management tables created successfully!');
    console.log('\nTables created:');
    console.log('  - staff_profiles');
    console.log('  - staff_reviews');
    console.log('  - staff_schedule');
    console.log('  - staff_documents');
    console.log('  - staff_notifications');
    console.log('  - staff_activity_log');
    console.log('  - staff_leaves');
    console.log('  - staff_attendance');

  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setupAdvancedStaffTables()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = setupAdvancedStaffTables;
