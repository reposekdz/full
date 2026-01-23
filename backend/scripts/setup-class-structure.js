const mysql = require('mysql2/promise');

async function setupClassStructure() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    // Class structure table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS class_structure (
        id INT PRIMARY KEY AUTO_INCREMENT,
        trade ENUM('SOD', 'AUT', 'BDC') NOT NULL,
        level VARCHAR(20) NOT NULL,
        section VARCHAR(10),
        class_name VARCHAR(100) NOT NULL,
        capacity INT DEFAULT 40,
        current_enrollment INT DEFAULT 0,
        class_teacher_id INT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_teacher_id) REFERENCES users(id),
        UNIQUE KEY unique_class (trade, level, section)
      )
    `);

    // Insert predefined class structure
    const classes = [
      // SOD - Software Development
      { trade: 'SOD', level: 'Level 3', section: null, class_name: 'SOD Level 3' },
      { trade: 'SOD', level: 'Level 4', section: null, class_name: 'SOD Level 4' },
      { trade: 'SOD', level: 'Level 5', section: null, class_name: 'SOD Level 5' },
      
      // AUT - Automotive
      { trade: 'AUT', level: 'Level 3', section: null, class_name: 'AUT Level 3' },
      { trade: 'AUT', level: 'Level 4', section: 'A', class_name: 'AUT Level 4A' },
      { trade: 'AUT', level: 'Level 4', section: 'B', class_name: 'AUT Level 4B' },
      { trade: 'AUT', level: 'Level 5', section: 'A', class_name: 'AUT Level 5A' },
      { trade: 'AUT', level: 'Level 5', section: 'B', class_name: 'AUT Level 5B' },
      
      // BDC - Building Construction
      { trade: 'BDC', level: 'Level 3', section: null, class_name: 'BDC Level 3' },
      { trade: 'BDC', level: 'Level 4', section: null, class_name: 'BDC Level 4' },
      { trade: 'BDC', level: 'Level 5', section: null, class_name: 'BDC Level 5' }
    ];

    for (const cls of classes) {
      await connection.execute(
        'INSERT IGNORE INTO class_structure (trade, level, section, class_name) VALUES (?, ?, ?, ?)',
        [cls.trade, cls.level, cls.section, cls.class_name]
      );
    }

    // Student class enrollment
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_class_enrollment (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        class_structure_id INT NOT NULL,
        enrollment_date DATE NOT NULL,
        status ENUM('active', 'transferred', 'graduated', 'dropped') DEFAULT 'active',
        academic_year VARCHAR(20),
        enrolled_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (class_structure_id) REFERENCES class_structure(id),
        FOREIGN KEY (enrolled_by) REFERENCES users(id)
      )
    `);

    // Student transfers
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_transfers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        from_class_id INT NOT NULL,
        to_class_id INT NOT NULL,
        transfer_date DATE NOT NULL,
        reason TEXT,
        approved_by INT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (from_class_id) REFERENCES class_structure(id),
        FOREIGN KEY (to_class_id) REFERENCES class_structure(id),
        FOREIGN KEY (approved_by) REFERENCES users(id)
      )
    `);

    // New comers registration
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS new_comers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        trade ENUM('SOD', 'AUT', 'BDC') NOT NULL,
        level VARCHAR(20) NOT NULL,
        section VARCHAR(10),
        registration_date DATE NOT NULL,
        status ENUM('pending', 'approved', 'enrolled', 'rejected') DEFAULT 'pending',
        documents_submitted BOOLEAN DEFAULT false,
        approved_by INT,
        enrolled_as_student_id INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (approved_by) REFERENCES users(id),
        FOREIGN KEY (enrolled_as_student_id) REFERENCES students(id)
      )
    `);

    // Student removals
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_removals (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        student_code VARCHAR(50),
        student_name VARCHAR(255),
        trade VARCHAR(50),
        class_level VARCHAR(50),
        removal_type ENUM('expelled', 'withdrawn', 'transferred_out', 'graduated') NOT NULL,
        removal_date DATE NOT NULL,
        reason TEXT NOT NULL,
        removed_by INT NOT NULL,
        approved_by INT,
        status ENUM('pending', 'approved', 'completed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (removed_by) REFERENCES users(id),
        FOREIGN KEY (approved_by) REFERENCES users(id)
      )
    `);

    // Payment tracking by class
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS class_payment_summary (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_structure_id INT NOT NULL,
        total_students INT DEFAULT 0,
        paid_students INT DEFAULT 0,
        unpaid_students INT DEFAULT 0,
        partial_paid_students INT DEFAULT 0,
        total_expected DECIMAL(15,2) DEFAULT 0,
        total_collected DECIMAL(15,2) DEFAULT 0,
        total_outstanding DECIMAL(15,2) DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_structure_id) REFERENCES class_structure(id)
      )
    `);

    console.log('✅ Class structure system created successfully');
    await connection.end();
  } catch (error) {
    console.error('❌ Error setting up class structure:', error);
    await connection.end();
    process.exit(1);
  }
}

setupClassStructure();
