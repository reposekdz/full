const { pool } = require('./config/database');

async function createTables() {
  try {
    console.log('Creating custom sheet tables...\n');
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS custom_sheet_columns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id INT NOT NULL,
        column_name VARCHAR(255) NOT NULL,
        column_type VARCHAR(50) NOT NULL,
        calculation_formula TEXT,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_class (class_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ custom_sheet_columns table created');
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS generated_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id INT NOT NULL,
        academic_year INT NOT NULL,
        term VARCHAR(50),
        report_data LONGTEXT,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        generated_by INT,
        INDEX idx_class_year (class_id, academic_year)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ generated_reports table created');
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS parent_student_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        parent_phone VARCHAR(20) NOT NULL,
        parent_email VARCHAR(255),
        student_id INT NOT NULL,
        relationship VARCHAR(50) DEFAULT 'parent',
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_student (student_id),
        INDEX idx_parent_phone (parent_phone)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ parent_student_links table created');
    
    console.log('\n✅ All tables created successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

createTables();
