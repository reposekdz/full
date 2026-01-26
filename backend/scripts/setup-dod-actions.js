const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDODActions() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  console.log('🔧 Setting up DOD Actions tables...\n');

  try {
    // Student Expulsions Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_expulsions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        reason TEXT NOT NULL,
        effective_date DATE NOT NULL,
        notes TEXT,
        status ENUM('active', 'revoked', 'completed') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ student_expulsions table created');

    // Student Leaves Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_leaves (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        leave_type ENUM('uruhushya', 'indwara', 'ikibazo_cyumuryango', 'ikindi') DEFAULT 'uruhushya',
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT NOT NULL,
        approved_by INT,
        status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ student_leaves table created');

    // Add status column to users if not exists
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'
    `);
    console.log('✅ users.status column added');

    // Insert sample data
    console.log('\n📝 Inserting sample data...');

    // Sample leave request
    await connection.execute(`
      INSERT IGNORE INTO student_leaves (id, student_id, leave_type, start_date, end_date, reason, status)
      VALUES 
        (1, 1, 'uruhushya', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Gusura umuryango', 'approved'),
        (2, 2, 'indwara', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Kurwara', 'pending')
    `);
    console.log('✅ Sample leaves inserted');

    console.log('\n✅ DOD Actions setup completed successfully!');
    console.log('\n📊 Available Actions:');
    console.log('   - POST /api/dod-actions/actions/expel-student');
    console.log('   - POST /api/dod-actions/actions/suspend-student');
    console.log('   - POST /api/dod-actions/actions/grant-leave');
    console.log('   - POST /api/dod-actions/actions/message-parent');
    console.log('   - POST /api/dod-actions/actions/bulk');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

setupDODActions();
