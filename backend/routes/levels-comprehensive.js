const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all levels with statistics
router.get('/', async (req, res) => {
  try {
    const [levels] = await db.query(`
      SELECT 
        l.id, l.name, l.code, l.order_index, l.is_active,
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT CASE WHEN t.code = 'BDC' THEN s.id END) as bdc_students,
        COUNT(DISTINCT CASE WHEN t.code = 'SOD' THEN s.id END) as sod_students,
        COUNT(DISTINCT CASE WHEN t.code = 'AUT' THEN s.id END) as aut_students
      FROM levels l
      LEFT JOIN students s ON s.level = l.name AND s.status = 'active'
      LEFT JOIN trades t ON s.trade = t.name
      WHERE l.is_active = TRUE AND (t.code IN ('BDC', 'SOD', 'AUT') OR t.code IS NULL)
      GROUP BY l.id
      ORDER BY l.order_index
    `);
    res.json({ success: true, data: levels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single level with detailed breakdown
router.get('/:code', async (req, res) => {
  try {
    const [level] = await db.query(`
      SELECT * FROM levels WHERE code = ? AND is_active = TRUE
    `, [req.params.code]);

    if (!level.length) {
      return res.status(404).json({ success: false, message: 'Level not found' });
    }

    const [tradeBreakdown] = await db.query(`
      SELECT 
        t.name as trade,
        t.code as trade_code,
        COUNT(s.id) as student_count,
        ROUND(AVG(g.marks), 2) as avg_marks,
        COUNT(DISTINCT g.subject) as subjects_taught,
        COUNT(DISTINCT tc.id) as total_courses
      FROM trades t
      LEFT JOIN students s ON s.trade = t.name AND s.level = ? AND s.status = 'active'
      LEFT JOIN grades g ON g.student_id = s.id
      LEFT JOIN trade_courses tc ON tc.trade_code = t.code AND tc.level = ?
      WHERE t.is_active = TRUE AND t.code IN ('BDC', 'SOD', 'AUT')
      GROUP BY t.id
      ORDER BY t.code
    `, [level[0].name, req.params.code]);

    res.json({ success: true, data: { ...level[0], trade_breakdown: tradeBreakdown } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET students by level
router.get('/:code/students', async (req, res) => {
  try {
    const { trade, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const [level] = await db.query('SELECT name FROM levels WHERE code = ?', [req.params.code]);
    if (!level.length) {
      return res.status(404).json({ success: false, message: 'Level not found' });
    }

    let query = `
      SELECT 
        s.*,
        COALESCE(AVG(g.marks), 0) as average_marks,
        COUNT(DISTINCT a.id) as total_attendance
      FROM students s
      LEFT JOIN grades g ON s.id = g.student_id
      LEFT JOIN attendance a ON s.id = a.student_id
      WHERE s.level = ? AND s.status = 'active'
    `;
    const params = [level[0].name];

    if (trade) {
      query += ' AND s.trade = ?';
      params.push(trade);
    }

    query += ' GROUP BY s.id ORDER BY s.trade, s.last_name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [students] = await db.query(query, params);
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM students WHERE level = ? AND status = 'active'${trade ? ' AND trade = ?' : ''}`,
      trade ? [level[0].name, trade] : [level[0].name]
    );

    res.json({ 
      success: true, 
      data: students,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET level performance comparison
router.get('/:code/performance', async (req, res) => {
  try {
    const { academic_year = '2024', term = 'Term 1' } = req.query;
    const [level] = await db.query('SELECT name FROM levels WHERE code = ?', [req.params.code]);
    
    if (!level.length) {
      return res.status(404).json({ success: false, message: 'Level not found' });
    }

    const [performance] = await db.query(`
      SELECT 
        t.name as trade,
        t.code as trade_code,
        COUNT(DISTINCT s.id) as total_students,
        ROUND(AVG(g.marks), 2) as average_marks,
        MAX(g.marks) as highest_mark,
        MIN(g.marks) as lowest_mark,
        COUNT(DISTINCT CASE WHEN g.marks >= 70 THEN s.id END) as distinction_count,
        COUNT(DISTINCT CASE WHEN g.marks >= 50 THEN s.id END) as pass_count,
        ROUND(
          (COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) * 100.0) / 
          NULLIF(COUNT(DISTINCT a.id), 0), 2
        ) as attendance_rate,
        COUNT(DISTINCT tc.id) as courses_offered
      FROM trades t
      LEFT JOIN students s ON s.trade = t.name AND s.level = ? AND s.status = 'active'
      LEFT JOIN grades g ON g.student_id = s.id AND g.academic_year = ? AND g.term = ?
      LEFT JOIN attendance a ON a.student_id = s.id
      LEFT JOIN trade_courses tc ON tc.trade_code = t.code AND tc.level = ?
      WHERE t.is_active = TRUE AND t.code IN ('BDC', 'SOD', 'AUT')
      GROUP BY t.id
      ORDER BY average_marks DESC
    `, [level[0].name, academic_year, term, req.params.code]);

    res.json({ success: true, data: performance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create new level (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, code, order_index } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO levels (name, code, order_index) VALUES (?, ?, ?)',
      [name, code, order_index]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Level created successfully',
      data: { id: result.insertId, name, code, order_index }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Level code or name already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update level
router.put('/:code', async (req, res) => {
  try {
    const { name, order_index, is_active } = req.body;
    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (order_index !== undefined) { updates.push('order_index = ?'); params.push(order_index); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    params.push(req.params.code);
    await db.query(`UPDATE levels SET ${updates.join(', ')} WHERE code = ?`, params);

    res.json({ success: true, message: 'Level updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
