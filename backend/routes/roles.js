const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Teacher Routes
router.get('/teacher/dashboard', authenticateToken, async (req, res) => {
  try {
    const [courses] = await pool.execute('SELECT COUNT(*) as count FROM courses WHERE instructor_id = ?', [req.user.id]);
    const [students] = await pool.execute(`
      SELECT COUNT(DISTINCT e.student_id) as count 
      FROM enrollments e 
      JOIN courses c ON e.course_id = c.id 
      WHERE c.instructor_id = ?
    `, [req.user.id]);
    const [assignments] = await pool.execute('SELECT COUNT(*) as count FROM assignments a JOIN courses c ON a.course_id = c.id WHERE c.instructor_id = ?', [req.user.id]);
    
    res.json({ success: true, stats: { courses: courses[0].count, students: students[0].count, assignments: assignments[0].count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/teacher/courses', authenticateToken, async (req, res) => {
  try {
    const [courses] = await pool.execute('SELECT * FROM courses WHERE instructor_id = ?', [req.user.id]);
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/teacher/assignments', authenticateToken, async (req, res) => {
  try {
    const { course_id, title, description, due_date, total_marks } = req.body;
    const [result] = await pool.execute(`
      INSERT INTO assignments (course_id, title, description, due_date, total_marks, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [course_id, title, description, due_date, total_marks, req.user.id]);
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/teacher/grades', authenticateToken, async (req, res) => {
  try {
    const { student_id, course_id, exam_id, score, grade, remarks } = req.body;
    const [result] = await pool.execute(`
      INSERT INTO grades (student_id, course_id, exam_id, score, grade, remarks)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE score = ?, grade = ?, remarks = ?
    `, [student_id, course_id, exam_id, score, grade, remarks, score, grade, remarks]);
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Headmaster Routes
router.get('/headmaster/dashboard', authenticateToken, async (req, res) => {
  try {
    const [students] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role_id = (SELECT id FROM roles WHERE name = "student")');
    const [teachers] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role_id = (SELECT id FROM roles WHERE name = "teacher")');
    const [revenue] = await pool.execute('SELECT SUM(amount) as total FROM payments WHERE status = "completed"');
    const [attendance] = await pool.execute('SELECT AVG(CASE WHEN status = "present" THEN 100 ELSE 0 END) as rate FROM attendance WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
    
    res.json({ success: true, stats: { students: students[0].count, teachers: teachers[0].count, revenue: revenue[0].total || 0, attendanceRate: attendance[0].rate || 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/headmaster/reports', authenticateToken, async (req, res) => {
  try {
    const { type, period } = req.query;
    let query = '';
    
    if (type === 'academic') {
      query = 'SELECT AVG(score) as avg_score, COUNT(*) as total_grades FROM grades WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
    } else if (type === 'financial') {
      query = 'SELECT SUM(amount) as total, COUNT(*) as transactions FROM payments WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
    }
    
    const [results] = await pool.execute(query, [period || 30]);
    res.json({ success: true, data: results[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Accountant Routes
router.get('/accountant/dashboard', authenticateToken, async (req, res) => {
  try {
    const [revenue] = await pool.execute('SELECT SUM(amount) as total FROM payments WHERE status = "completed"');
    const [pending] = await pool.execute('SELECT SUM(amount) as total FROM payments WHERE status = "pending"');
    const [expenses] = await pool.execute('SELECT SUM(amount) as total FROM expenses');
    
    res.json({ success: true, stats: { revenue: revenue[0].total || 0, pending: pending[0].total || 0, expenses: expenses[0].total || 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/accountant/payments', authenticateToken, async (req, res) => {
  try {
    const { status, student_id } = req.query;
    let query = 'SELECT p.*, u.first_name, u.last_name FROM payments p JOIN users u ON p.student_id = u.id WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    if (student_id) {
      query += ' AND p.student_id = ?';
      params.push(student_id);
    }
    
    query += ' ORDER BY p.created_at DESC';
    const [payments] = await pool.execute(query, params);
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/accountant/payments', authenticateToken, async (req, res) => {
  try {
    const { student_id, amount, payment_type, description } = req.body;
    const [result] = await pool.execute(`
      INSERT INTO payments (student_id, amount, payment_type, description, status, recorded_by)
      VALUES (?, ?, ?, ?, 'completed', ?)
    `, [student_id, amount, payment_type, description, req.user.id]);
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stock Manager Routes
router.get('/stock/dashboard', authenticateToken, async (req, res) => {
  try {
    const [items] = await pool.execute('SELECT COUNT(*) as count FROM inventory_items');
    const [lowStock] = await pool.execute('SELECT COUNT(*) as count FROM inventory_items WHERE quantity <= reorder_level');
    const [value] = await pool.execute('SELECT SUM(quantity * unit_price) as total FROM inventory_items');
    
    res.json({ success: true, stats: { totalItems: items[0].count, lowStock: lowStock[0].count, totalValue: value[0].total || 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stock/items', authenticateToken, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM inventory_items WHERE 1=1';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (item_name LIKE ? OR item_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    const [items] = await pool.execute(query, params);
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/stock/items', authenticateToken, async (req, res) => {
  try {
    const { item_code, item_name, category, quantity, unit_price, reorder_level } = req.body;
    const [result] = await pool.execute(`
      INSERT INTO inventory_items (item_code, item_name, category, quantity, unit_price, reorder_level)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [item_code, item_name, category, quantity, unit_price, reorder_level]);
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/stock/items/:id', authenticateToken, async (req, res) => {
  try {
    const { quantity, unit_price } = req.body;
    await pool.execute('UPDATE inventory_items SET quantity = ?, unit_price = ? WHERE id = ?', [quantity, unit_price, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Director of Discipline Routes
router.get('/dod/dashboard', authenticateToken, async (req, res) => {
  try {
    const [incidents] = await pool.execute('SELECT COUNT(*) as count FROM discipline_incidents WHERE status = "open"');
    const [resolved] = await pool.execute('SELECT COUNT(*) as count FROM discipline_incidents WHERE status = "resolved" AND resolved_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
    
    res.json({ success: true, stats: { openIncidents: incidents[0].count, resolvedThisMonth: resolved[0].count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/dod/incidents', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT i.*, u.first_name, u.last_name FROM discipline_incidents i JOIN users u ON i.student_id = u.id WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY i.created_at DESC';
    const [incidents] = await pool.execute(query, params);
    res.json({ success: true, incidents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/dod/incidents', authenticateToken, async (req, res) => {
  try {
    const { student_id, incident_type, description, severity } = req.body;
    const [result] = await pool.execute(`
      INSERT INTO discipline_incidents (student_id, incident_type, description, severity, reported_by, status)
      VALUES (?, ?, ?, ?, ?, 'open')
    `, [student_id, incident_type, description, severity, req.user.id]);
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
