const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get comprehensive analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { range = 'month' } = req.query;

    // Get counts
    const [students] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "student" AND is_active = true');
    const [teachers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "teacher" AND is_active = true');
    const [parents] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "parent" AND is_active = true');
    const [staff] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role IN ("staff", "admin") AND is_active = true');
    const [courses] = await pool.query('SELECT COUNT(*) as count FROM courses WHERE is_active = true');
    const [stock] = await pool.query('SELECT COUNT(*) as count FROM stock_items WHERE quantity > 0');

    // Get revenue
    const [revenue] = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM payments 
      WHERE status = 'completed' 
      AND created_at >= DATE_SUB(NOW(), INTERVAL 1 ${range === 'week' ? 'WEEK' : range === 'month' ? 'MONTH' : 'YEAR'})
    `);

    // Get enrollments this month
    const [enrollments] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM enrollments 
      WHERE enrollment_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    `);

    // Get attendance rate
    const [attendance] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / COUNT(*) as rate
      FROM attendance
      WHERE date >= DATE_SUB(NOW(), INTERVAL 1 ${range === 'week' ? 'WEEK' : range === 'month' ? 'MONTH' : 'YEAR'})
    `);

    // Get payment collection rate
    const [paymentRate] = await pool.query(`
      SELECT 
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) * 100.0 / SUM(amount) as rate
      FROM payments
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 ${range === 'week' ? 'WEEK' : range === 'month' ? 'MONTH' : 'YEAR'})
    `);

    // Get active classes
    const [classes] = await pool.query('SELECT COUNT(*) as count FROM trade_classes WHERE is_active = true');

    // Get pending assignments
    const [assignments] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM assignments 
      WHERE due_date >= CURDATE() AND status = 'active'
    `);

    res.json({
      success: true,
      analytics: {
        students: students[0].count,
        teachers: teachers[0].count,
        parents: parents[0].count,
        staff: staff[0].count,
        courses: courses[0].count,
        revenue: revenue[0].total,
        stock: stock[0].count,
        enrollments_this_month: enrollments[0].count,
        attendance_rate: attendance[0]?.rate || 0,
        payment_collection_rate: paymentRate[0]?.rate || 0,
        active_classes: classes[0].count,
        pending_assignments: assignments[0].count
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get recent activities
router.get('/activities', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [activities] = await pool.query(`
      SELECT 
        'login' as type,
        CONCAT(name, ' logged in') as action,
        last_login as created_at
      FROM users
      WHERE last_login IS NOT NULL
      ORDER BY last_login DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({ success: true, activities });
  } catch (error) {
    console.error('Activities error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get system logs
router.get('/security/logs', authenticateToken, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const [logs] = await pool.query(`
      SELECT 
        id,
        user_id,
        action,
        ip_address,
        user_agent,
        created_at
      FROM security_logs
      ORDER BY created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({ success: true, logs });
  } catch (error) {
    console.error('Logs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all users with pagination
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT id, name, email, phone, role, is_active, created_at, last_login FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [users] = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];

    if (role) {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }

    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [count] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count[0].total,
        pages: Math.ceil(count[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create user
router.post('/users', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get the role_id from roles table
    const [roleResult] = await pool.query('SELECT id FROM roles WHERE name = ?', [role]);
    if (roleResult.length === 0) {
      return res.status(400).json({ success: false, message: `Role '${role}' not found in system` });
    }
    const roleId = roleResult[0].id;

    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, role, role_id, password, is_active) VALUES (?, ?, ?, ?, ?, ?, true)',
      [name, email, phone, role, roleId, hashedPassword]
    );

    res.json({ success: true, id: result.insertId, message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user
router.put('/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, is_active } = req.body;

    await pool.query(
      'UPDATE users SET name = ?, email = ?, phone = ?, role = ?, is_active = ? WHERE id = ?',
      [name, email, phone, role, is_active, id]
    );

    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user
router.delete('/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('UPDATE users SET is_active = false WHERE id = ?', [id]);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get dashboard stats
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const [students] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "student" AND is_active = true');
    const [teachers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "teacher" AND is_active = true');
    const [parents] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "parent" AND is_active = true');
    const [staff] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role IN ("staff", "admin") AND is_active = true');
    const [courses] = await pool.query('SELECT COUNT(*) as count FROM courses WHERE is_active = true');
    const [revenue] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = "completed"');
    const [stock] = await pool.query('SELECT COUNT(*) as count FROM stock_items WHERE quantity > 0');

    res.json({
      success: true,
      stats: {
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
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get quick actions data
router.get('/quick-actions', authenticateToken, async (req, res) => {
  try {
    const [recentLogins] = await pool.query(`
      SELECT name, last_login 
      FROM users 
      WHERE last_login IS NOT NULL 
      ORDER BY last_login DESC 
      LIMIT 5
    `);

    const [pendingMessages] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM messages 
      WHERE is_read = false
    `);

    const [upcomingExams] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM exams 
      WHERE exam_date >= CURDATE() 
      AND exam_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    `);

    const [systemAlerts] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE type = 'alert' 
      AND is_read = false
    `);

    res.json({
      success: true,
      quickActions: {
        recentLogins: recentLogins.map(l => ({
          action: 'Kwinjira mu sisiteme / System login',
          user: l.name,
          time: l.last_login
        })),
        pendingMessages: pendingMessages[0].count,
        upcomingExams: upcomingExams[0].count,
        systemAlerts: systemAlerts[0].count
      }
    });
  } catch (error) {
    console.error('Quick actions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
