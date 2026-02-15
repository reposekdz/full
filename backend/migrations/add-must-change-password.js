const { pool } = require('../config/database');

async function addMustChangePasswordColumn() {
  const connection = await pool.getConnection();
  try {
    console.log('Adding must_change_password column to users and admin_users tables...');

    // Add column to users table
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS must_change_password TINYINT(1) DEFAULT 0
    `).catch(err => {
      if (!err.message.includes('Duplicate column')) {
        throw err;
      }
      console.log('Column must_change_password already exists in users table');
    });

    // Add column to admin_users table
    await connection.execute(`
      ALTER TABLE admin_users 
      ADD COLUMN IF NOT EXISTS must_change_password TINYINT(1) DEFAULT 0
    `).catch(err => {
      if (!err.message.includes('Duplicate column')) {
        throw err;
      }
      console.log('Column must_change_password already exists in admin_users table');
    });

    // Mark users with default email as needing password change
    const defaultEmail = process.env.UNIFIED_STAFF_EMAIL || 'reponse@gmail.com';
    
    await connection.execute(`
      UPDATE users 
      SET must_change_password = 1 
      WHERE email = ?
    `, [defaultEmail]);

    await connection.execute(`
      UPDATE admin_users 
      SET must_change_password = 1 
      WHERE email = ?
    `, [defaultEmail]);

    // Create user_activity_logs table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_activity_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Successfully added must_change_password column and activity logs table');
    console.log(`✅ Marked users with email ${defaultEmail} to change password`);
  } catch (error) {
    console.error('❌ Error adding must_change_password column:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run if called directly
if (require.main === module) {
  addMustChangePasswordColumn()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = { addMustChangePasswordColumn };
