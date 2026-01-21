const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

async function setupAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('2026', 10);
    
    // Check if admin user with this email exists
    const [existingByEmail] = await pool.execute('SELECT * FROM admin_users WHERE email = ?', ['reponsekdz06@gmail.com']);
    
    if (existingByEmail.length > 0) {
      // Update existing user by email
      await pool.execute(
        'UPDATE admin_users SET password = ?, role = ? WHERE email = ?',
        [hashedPassword, 'admin', 'reponsekdz06@gmail.com']
      );
      console.log('✅ Admin user updated successfully');
    } else {
      // Check if username 'admin_main' exists to avoid conflict
      const [existingByUsername] = await pool.execute('SELECT * FROM admin_users WHERE username = ?', ['admin_main']);
      const username = existingByUsername.length > 0 ? 'admin_main_2026' : 'admin_main';
      
      // Create new admin user
      await pool.execute(
        'INSERT INTO admin_users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, 'reponsekdz06@gmail.com', hashedPassword, 'admin']
      );
      console.log('✅ Admin user created successfully with username:', username);
    }
    
    // Show current admin users
    const [users] = await pool.execute('SELECT id, username, email, role FROM admin_users');
    console.log('📋 Current admin users:', users);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupAdminUser();