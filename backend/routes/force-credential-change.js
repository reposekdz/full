const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Check if user needs to change credentials
router.get('/check-default-credentials', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [users] = await pool.execute(
      'SELECT email, must_change_password FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const user = users[0];
    const isDefaultEmail = user.email && user.email.includes('@reponsekdz06.com');
    const mustChangePassword = user.must_change_password === 1;
    
    res.json({
      success: true,
      needsChange: isDefaultEmail || mustChangePassword,
      isDefaultEmail,
      mustChangePassword
    });
  } catch (error) {
    console.error('Check credentials error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Force change credentials
router.post('/force-change-credentials', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { userId, newEmail, currentPassword, newPassword } = req.body;
    
    // Validate user
    if (req.user.id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Validate inputs
    if (!newEmail || !newEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }
    
    if (newEmail.includes('@reponsekdz06.com')) {
      return res.status(400).json({ success: false, message: 'Cannot use default email domain' });
    }
    
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }
    
    if (newPassword === '2026') {
      return res.status(400).json({ success: false, message: 'Cannot use default password' });
    }
    
    // Get current user
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const user = users[0];
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      await connection.rollback();
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Check if new email already exists
    const [existingEmail] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [newEmail, userId]
    );
    
    if (existingEmail.length > 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user credentials
    await connection.execute(
      `UPDATE users 
       SET email = ?, password = ?, must_change_password = 0, updated_at = NOW() 
       WHERE id = ?`,
      [newEmail, hashedPassword, userId]
    );
    
    // Log the change
    await connection.execute(
      `INSERT INTO user_activity_logs (user_id, action, details, ip_address, created_at)
       VALUES (?, 'credentials_changed', 'Email and password updated from default', ?, NOW())`,
      [userId, req.ip]
    );
    
    await connection.commit();
    
    // Generate new token with updated email
    const token = jwt.sign(
      { id: user.id, email: newEmail, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '150d' }
    );
    
    res.json({
      success: true,
      message: 'Credentials updated successfully',
      token
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Force change credentials error:', error);
    res.status(500).json({ success: false, message: 'Failed to update credentials' });
  } finally {
    connection.release();
  }
});

// Add must_change_password column if not exists
router.post('/setup-force-change', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Add column if not exists
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS must_change_password TINYINT(1) DEFAULT 1
    `);
    
    // Mark all users with default email as needing password change
    await connection.execute(`
      UPDATE users 
      SET must_change_password = 1 
      WHERE email LIKE '%@reponsekdz06.com' 
         OR password = ?
    `, [await bcrypt.hash('2026', 10)]);
    
    // Create activity logs table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_activity_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    res.json({ success: true, message: 'Force change system setup complete' });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
