const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// Get DOD profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    
    const [users] = await pool.query(`
      SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.phone, u.role, u.created_at
      FROM users u
      WHERE u.id = ? AND u.role = 'director_of_discipline'
    `, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    res.json({ success: true, profile: users[0] });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// Update DOD profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { first_name, last_name, email, phone } = req.body;
    
    await pool.query(`
      UPDATE users 
      SET first_name = ?, last_name = ?, email = ?, phone = ?
      WHERE id = ? AND role = 'director_of_discipline'
    `, [first_name, last_name, email, phone, userId]);
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { currentPassword, newPassword } = req.body;
    
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

// Change email
router.put('/change-email', async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { newEmail, password } = req.body;
    
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(password, users[0].password);
    
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password is incorrect' });
    }
    
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [newEmail, userId]);
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    
    await pool.query('UPDATE users SET email = ? WHERE id = ?', [newEmail, userId]);
    
    res.json({ success: true, message: 'Email changed successfully' });
  } catch (error) {
    console.error('Error changing email:', error);
    res.status(500).json({ success: false, message: 'Failed to change email' });
  }
});

module.exports = router;
