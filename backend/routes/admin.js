const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all admin users (super admin only)
router.get('/users', [
  authenticateToken,
  requireRole('super_admin')
], async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, email, role, created_at, updated_at FROM admin_users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new admin user (super admin only)
router.post('/users', [
  authenticateToken,
  requireRole('super_admin'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'editor']).withMessage('Role must be admin or editor')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { username, email, password, role } = req.body;

    // Check if username or email already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM admin_users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO admin_users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: result.insertId,
        username,
        email,
        role
      }
    });

  } catch (error) {
    console.error('Create admin user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update admin user (super admin only)
router.put('/users/:id', [
  authenticateToken,
  requireRole('super_admin'),
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['admin', 'editor']).withMessage('Role must be admin or editor')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { username, email, role } = req.body;

    // Prevent super admin from changing their own role
    if (req.user.id === parseInt(id) && role && role !== 'super_admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    const updates = [];
    const values = [];

    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (role) {
      updates.push('role = ?');
      values.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    await pool.execute(
      `UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Admin user updated successfully'
    });

  } catch (error) {
    console.error('Update admin user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete admin user (super admin only)
router.delete('/users/:id', [
  authenticateToken,
  requireRole('super_admin')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent super admin from deleting themselves
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await pool.execute('DELETE FROM admin_users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Admin user deleted successfully'
    });

  } catch (error) {
    console.error('Delete admin user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Dashboard statistics
router.get('/dashboard', [
  authenticateToken
], async (req, res) => {
  try {
    // Get various statistics
    const [slideCount] = await pool.execute('SELECT COUNT(*) as count FROM home_slides WHERE is_active = true');
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM admin_users');
    const [tradeCount] = await pool.execute('SELECT COUNT(*) as count FROM trade_programs WHERE is_active = true');
    const [contentCount] = await pool.execute('SELECT COUNT(*) as count FROM dynamic_content WHERE is_active = true');

    const stats = {
      slides: slideCount[0].count,
      users: userCount[0].count,
      trades: tradeCount[0].count,
      content: contentCount[0].count
    };

    // Get recent activity (last 10 slides created)
    const [recentSlides] = await pool.execute(
      'SELECT id, title, created_at FROM home_slides ORDER BY created_at DESC LIMIT 10'
    );

    res.json({
      success: true,
      stats,
      recentActivity: recentSlides
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;