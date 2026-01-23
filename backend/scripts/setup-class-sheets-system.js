const db = require('../config/database');

async function setupClassSheets() {
  console.log('🔄 Setting up class sheets system...\n');

  try {
    // Create class_sheets table
    console.log('Creating class_sheets table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS class_sheets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id INT NOT NULL,
        student_id INT NOT NULL,
        sheet_number INT NOT NULL,
        serial_code VARCHAR(50) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        parent_phone VARCHAR(20) NOT NULL,
        location VARCHAR(200) NOT NULL,
        date_of_birth DATE,
        gender ENUM('male', 'female', 'other'),
        enrollment_date DATE NOT NULL,
        status ENUM('active', 'removed', 'transferred') DEFAULT 'active',
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_class_student (class_id, student_id),
        INDEX idx_serial_code (serial_code),
        INDEX idx_sheet_number (class_id, sheet_number)
      )
    `);
    console.log('✅ class_sheets table created\n');

    // Update users table to add first_name and last_name
    console.log('Updating users table...');
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) NULL AFTER serial_code,
      ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) NULL AFTER first_name,
      ADD COLUMN IF NOT EXISTS date_of_birth DATE NULL AFTER address,
      ADD COLUMN IF NOT EXISTS gender ENUM('male', 'female', 'other') NULL AFTER date_of_birth
    `);
    console.log('✅ users table updated\n');

    console.log('✅ Class sheets system setup complete!\n');
    console.log('📋 Summary:');
    console.log('   - class_sheets table created');
    console.log('   - first_name, last_name, date_of_birth, gender added to users');
    console.log('   - Indexes created for performance');
    console.log('   - Foreign keys configured\n');

  } catch (error) {
    console.error('❌ Error setting up class sheets:', error.message);
    throw error;
  }
}

if (require.main === module) {
  setupClassSheets()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

module.exports = setupClassSheets;
