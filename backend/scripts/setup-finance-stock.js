const mysql = require('mysql2/promise');

async function setupFinanceStock() {
  let connection;
  try {
    console.log('🚀 Setting up Finance & Stock tables...\n');

    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'school_management',
      multipleStatements: true
    });

    // Create payments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        payment_type ENUM('tuition', 'exam', 'library', 'hostel', 'transport', 'other') DEFAULT 'tuition',
        amount DECIMAL(10,2) NOT NULL,
        payment_method ENUM('cash', 'bank_transfer', 'mobile_money', 'card', 'cheque') DEFAULT 'cash',
        payment_date DATE NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        term ENUM('1', '2', '3') DEFAULT '1',
        reference_number VARCHAR(100) UNIQUE,
        description TEXT,
        status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
        received_by INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (received_by) REFERENCES users(id),
        INDEX idx_student (student_id),
        INDEX idx_payment_date (payment_date),
        INDEX idx_status (status)
      );
    `);
    console.log('✅ Payments table created');

    // Create fee_structure table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fee_structure (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id INT,
        fee_type ENUM('tuition', 'exam', 'library', 'hostel', 'transport', 'other') DEFAULT 'tuition',
        amount DECIMAL(10,2) NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        term ENUM('1', '2', '3') DEFAULT '1',
        description TEXT,
        is_mandatory BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES trade_classes(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Fee structure table created');

    // Create stock_items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stock_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_name VARCHAR(255) NOT NULL,
        item_code VARCHAR(50) UNIQUE,
        category ENUM('stationery', 'electronics', 'furniture', 'lab_equipment', 'sports', 'books', 'maintenance', 'other') DEFAULT 'other',
        description TEXT,
        quantity INT NOT NULL DEFAULT 0,
        unit VARCHAR(50) DEFAULT 'pcs',
        unit_price DECIMAL(10,2) DEFAULT 0.00,
        reorder_level INT DEFAULT 10,
        location VARCHAR(255),
        supplier VARCHAR(255),
        supplier_contact VARCHAR(255),
        last_restock_date DATE,
        last_restock_quantity INT DEFAULT 0,
        status ENUM('available', 'low_stock', 'out_of_stock', 'discontinued') DEFAULT 'available',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_item_code (item_code),
        INDEX idx_category (category),
        INDEX idx_status (status)
      );
    `);
    console.log('✅ Stock items table created');

    // Create stock_transactions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stock_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_id INT NOT NULL,
        transaction_type ENUM('purchase', 'issue', 'return', 'adjustment', 'damage', 'loss') DEFAULT 'issue',
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) DEFAULT 0.00,
        total_value DECIMAL(10,2) DEFAULT 0.00,
        transaction_date DATE NOT NULL,
        reference_number VARCHAR(100),
        issued_to INT,
        issued_by INT,
        department VARCHAR(100),
        purpose TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES stock_items(id) ON DELETE CASCADE,
        FOREIGN KEY (issued_to) REFERENCES users(id),
        FOREIGN KEY (issued_by) REFERENCES users(id),
        INDEX idx_item (item_id),
        INDEX idx_transaction_date (transaction_date),
        INDEX idx_type (transaction_type)
      );
    `);
    console.log('✅ Stock transactions table created');

    // Create courses table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE,
        description TEXT,
        trade_level_id INT,
        instructor_id INT,
        credits INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES users(id)
      );
    `);
    console.log('✅ Courses table created');

    // Create grades table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS grades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT,
        subject_id INT,
        class_id INT,
        assessment_type ENUM('assignment', 'quiz', 'exam', 'project', 'final') DEFAULT 'exam',
        score DECIMAL(5,2) NOT NULL,
        max_score DECIMAL(5,2) DEFAULT 100.00,
        percentage DECIMAL(5,2),
        grade VARCHAR(2),
        academic_year VARCHAR(20),
        term ENUM('1', '2', '3'),
        assessment_date DATE,
        teacher_id INT,
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES trade_classes(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id),
        INDEX idx_student (student_id),
        INDEX idx_course (course_id),
        INDEX idx_class (class_id)
      );
    `);
    console.log('✅ Grades table created');

    // Create attendance table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        class_id INT,
        course_id INT,
        attendance_date DATE NOT NULL,
        status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
        check_in_time TIME,
        check_out_time TIME,
        marked_by INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES trade_classes(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (marked_by) REFERENCES users(id),
        UNIQUE KEY unique_attendance (student_id, attendance_date, course_id),
        INDEX idx_student (student_id),
        INDEX idx_date (attendance_date),
        INDEX idx_status (status)
      );
    `);
    console.log('✅ Attendance table created');

    // Insert sample data
    console.log('\n📝 Inserting sample data...');

    // Sample stock items
    await connection.query(`
      INSERT IGNORE INTO stock_items (item_name, item_code, category, quantity, unit, unit_price, reorder_level, status) VALUES
      ('A4 Paper (Ream)', 'STN001', 'stationery', 50, 'ream', 25.00, 10, 'available'),
      ('Ballpoint Pens (Box)', 'STN002', 'stationery', 30, 'box', 15.00, 5, 'available'),
      ('Whiteboard Markers', 'STN003', 'stationery', 45, 'box', 20.00, 10, 'available'),
      ('Desktop Computer', 'ELC001', 'electronics', 15, 'pcs', 1500.00, 2, 'available'),
      ('Projector', 'ELC002', 'electronics', 8, 'pcs', 2500.00, 1, 'available'),
      ('Student Desk', 'FUR001', 'furniture', 120, 'pcs', 150.00, 10, 'available'),
      ('Teacher Chair', 'FUR002', 'furniture', 25, 'pcs', 200.00, 3, 'available'),
      ('Football', 'SPT001', 'sports', 12, 'pcs', 50.00, 3, 'available'),
      ('Basketball', 'SPT002', 'sports', 8, 'pcs', 60.00, 2, 'available'),
      ('Laboratory Microscope', 'LAB001', 'lab_equipment', 5, 'pcs', 3500.00, 1, 'available')
    `);
    console.log('✅ Sample stock items inserted');

    // Sample payments (for existing students)
    const currentYear = new Date().getFullYear();
    await connection.query(`
      INSERT IGNORE INTO payments (student_id, payment_type, amount, payment_method, payment_date, academic_year, term, reference_number, status)
      SELECT id, 'tuition', 5000.00, 'bank_transfer', CURDATE(), '${currentYear}/${currentYear + 1}', '1', CONCAT('PAY', id, LPAD(FLOOR(RAND() * 10000), 4, '0')), 'completed'
      FROM users WHERE role = 'student' LIMIT 10
    `);
    console.log('✅ Sample payments inserted');

    console.log('\n✅ Finance & Stock setup completed successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupFinanceStock();
