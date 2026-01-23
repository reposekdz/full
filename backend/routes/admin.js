const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Search endpoint
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q, type } = req.query;
    let query = 'SELECT id, name, email, role, created_at, "user" as type FROM users WHERE ';
    
    if (type === 'students') query += 'role = "student" AND ';
    else if (type === 'teachers') query += 'role = "teacher" AND ';
    else if (type === 'users') query += '';
    
    query += '(name LIKE ? OR email LIKE ?) LIMIT 50';
    
    const [results] = await pool.execute(query, [`%${q}%`, `%${q}%`]);
    res.json({ success: true, results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

// Users CRUD
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT id, name, email, phone, role, is_active, created_at FROM users ORDER BY created_at DESC');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Fetch failed' });
  }
});

router.post('/users', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, phone, role, password, is_active) VALUES (?, ?, ?, ?, ?, true)',
      [name, email, phone, role, hashedPassword]
    );
    res.json({ success: true, message: 'User created', userId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Create failed' });
  }
});

router.put('/users/:id', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    await pool.execute(
      'UPDATE users SET name = ?, email = ?, phone = ?, role = ? WHERE id = ?',
      [name, email, phone, role, req.params.id]
    );
    res.json({ success: true, message: 'User updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

router.delete('/users/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
});

// Notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const [notifications] = await pool.execute(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100'
    );
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Fetch failed' });
  }
});

router.post('/notifications', authenticateToken, async (req, res) => {
  try {
    const { title, message, target } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO notifications (title, message, target, created_by, created_at) VALUES (?, ?, ?, ?, NOW())',
      [title, message, target, req.user.userId]
    );
    res.json({ success: true, message: 'Notification sent', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Send failed' });
  }
});

router.delete('/notifications/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
});

// Analytics with financial data
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const [students] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "student"');
    const [teachers] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "teacher"');
    const [parents] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "parent"');
    const [staff] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role IN ("admin", "accountant", "stock_manager", "director_of_study", "director_of_discipline", "head_master")');
    const [courses] = await pool.execute('SELECT COUNT(*) as count FROM trade_classes');
    const [revenue] = await pool.execute('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = "completed" AND YEAR(created_at) = YEAR(CURDATE())');
    const [stock] = await pool.execute('SELECT COUNT(*) as count FROM inventory WHERE is_active = true');
    
    res.json({
      success: true,
      analytics: {
        students: students[0].count,
        teachers: teachers[0].count,
        parents: parents[0].count,
        staff: staff[0].count,
        courses: courses[0].count,
        revenue: revenue[0].total,
        stock: stock[0].count
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Fetch failed' });
  }
});

// Reports
router.get('/reports/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    let data = [];
    
    if (type === 'users') {
      const [users] = await pool.execute('SELECT * FROM users ORDER BY created_at DESC');
      data = users;
    } else if (type === 'attendance') {
      const [attendance] = await pool.execute('SELECT * FROM attendance ORDER BY date DESC LIMIT 1000');
      data = attendance;
    }
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Report generation failed' });
  }
});

// Settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const [settings] = await pool.execute('SELECT * FROM system_settings');
    res.json({ success: true, settings: settings[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Fetch failed' });
  }
});

router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { school_name, email, phone, address, academic_year } = req.body;
    await pool.execute(
      'UPDATE system_settings SET school_name = ?, email = ?, phone = ?, address = ?, academic_year = ? WHERE id = 1',
      [school_name, email, phone, address, academic_year]
    );
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// Security logs
router.get('/security/logs', authenticateToken, async (req, res) => {
  try {
    const [logs] = await pool.execute('SELECT * FROM security_logs ORDER BY created_at DESC LIMIT 500');
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Fetch failed' });
  }
});

// Backup
router.post('/backup', authenticateToken, async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    const [result] = await pool.execute(
      'INSERT INTO backups (filename, size, created_by, created_at) VALUES (?, ?, ?, NOW())',
      [`backup_${timestamp}.sql`, 0, req.user.userId]
    );
    res.json({ success: true, message: 'Backup created', backupId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Backup failed' });
  }
});

router.get('/backups', authenticateToken, async (req, res) => {
  try {
    const [backups] = await pool.execute('SELECT * FROM backups ORDER BY created_at DESC');
    res.json({ success: true, backups });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Fetch failed' });
  }
});

// Get all images
router.get('/images', authenticateToken, async (req, res) => {
  try {
    const [images] = await pool.execute('SELECT * FROM gallery_images ORDER BY created_at DESC');
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Fetch failed' });
  }
});

// Get all content
router.get('/content', authenticateToken, async (req, res) => {
  try {
    const [content] = await pool.execute('SELECT * FROM page_content ORDER BY updated_at DESC');
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Fetch failed' });
  }
});

module.exports = router;
