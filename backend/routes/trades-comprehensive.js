const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all trades with levels and student counts
router.get('/', async (req, res) => {
  try {
    const [trades] = await db.query(`
      SELECT 
        t.id, t.name, t.code, t.description, t.duration_years, t.is_active,
        COUNT(DISTINCT s.id) as student_count,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'level', l.name,
            'code', l.code,
            'order_index', l.order_index,
            'student_count', (
              SELECT COUNT(*) FROM students 
              WHERE trade = t.name AND level = l.name AND status = 'active'
            )
          )
        ) as levels
      FROM trades t
      CROSS JOIN levels l
      LEFT JOIN students s ON s.trade = t.name AND s.status = 'active'
      WHERE t.is_active = TRUE AND l.is_active = TRUE
      GROUP BY t.id
      ORDER BY t.code
    `);
    res.json({ success: true, data: trades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single trade with detailed statistics
router.get('/:code', async (req, res) => {
  try {
    const [trade] = await db.query(`
      SELECT t.*, 
        (SELECT COUNT(*) FROM students WHERE trade = t.name AND status = 'active') as total_students
      FROM trades t WHERE t.code = ? AND t.is_active = TRUE
    `, [req.params.code]);

    if (!trade.length) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    const [levelStats] = await db.query(`
      SELECT 
        l.name as level,
        l.code,
        COUNT(s.id) as student_count,
        ROUND(AVG(g.marks), 2) as avg_marks,
        COUNT(DISTINCT g.subject) as subjects_count
      FROM levels l
      LEFT JOIN students s ON s.level = l.name AND s.trade = ? AND s.status = 'active'
      LEFT JOIN grades g ON g.student_id = s.id
      WHERE l.is_active = TRUE
      GROUP BY l.id
      ORDER BY l.order_index
    `, [trade[0].name]);

    res.json({ success: true, data: { ...trade[0], level_statistics: levelStats } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET students by trade and level
router.get('/:code/students', async (req, res) => {
  try {
    const { level, status = 'active', page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const [trade] = await db.query('SELECT name FROM trades WHERE code = ?', [req.params.code]);
    if (!trade.length) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    let query = `
      SELECT 
        s.*,
        COALESCE(AVG(g.marks), 0) as average_marks,
        COUNT(DISTINCT a.id) as attendance_count,
        COALESCE(SUM(CASE WHEN f.status = 'pending' THEN f.amount ELSE 0 END), 0) as pending_fees
      FROM students s
      LEFT JOIN grades g ON s.id = g.student_id
      LEFT JOIN attendance a ON s.id = a.student_id AND a.status = 'present'
      LEFT JOIN fees f ON s.id = f.student_id
      WHERE s.trade = ? AND s.status = ?
    `;
    const params = [trade[0].name, status];

    if (level) {
      query += ' AND s.level = ?';
      params.push(level);
    }

    query += ' GROUP BY s.id ORDER BY s.last_name, s.first_name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [students] = await db.query(query, params);
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM students WHERE trade = ? AND status = ?${level ? ' AND level = ?' : ''}`,
      level ? [trade[0].name, status, level] : [trade[0].name, status]
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

// GET trade performance analytics
router.get('/:code/analytics', async (req, res) => {
  try {
    const { academic_year = '2024', term = 'Term 1' } = req.query;
    const [trade] = await db.query('SELECT name FROM trades WHERE code = ?', [req.params.code]);
    
    if (!trade.length) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    const [analytics] = await db.query(`
      SELECT 
        l.name as level,
        COUNT(DISTINCT s.id) as total_students,
        ROUND(AVG(g.marks), 2) as average_marks,
        COUNT(DISTINCT CASE WHEN g.marks >= 70 THEN s.id END) as distinction_count,
        COUNT(DISTINCT CASE WHEN g.marks >= 50 AND g.marks < 70 THEN s.id END) as pass_count,
        COUNT(DISTINCT CASE WHEN g.marks < 50 THEN s.id END) as fail_count,
        ROUND(
          (COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) * 100.0) / 
          NULLIF(COUNT(DISTINCT a.id), 0), 2
        ) as attendance_percentage,
        SUM(CASE WHEN f.status = 'paid' THEN f.amount ELSE 0 END) as fees_collected,
        SUM(CASE WHEN f.status = 'pending' THEN f.amount ELSE 0 END) as fees_pending
      FROM levels l
      LEFT JOIN students s ON s.level = l.name AND s.trade = ? AND s.status = 'active'
      LEFT JOIN grades g ON g.student_id = s.id AND g.academic_year = ? AND g.term = ?
      LEFT JOIN attendance a ON a.student_id = s.id
      LEFT JOIN fees f ON f.student_id = s.id AND f.academic_year = ?
      WHERE l.is_active = TRUE
      GROUP BY l.id
      ORDER BY l.order_index
    `, [trade[0].name, academic_year, term, academic_year]);

    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create new trade (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, code, description, duration_years = 3 } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO trades (name, code, description, duration_years) VALUES (?, ?, ?, ?)',
      [name, code, description, duration_years]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Trade created successfully',
      data: { id: result.insertId, name, code, description, duration_years }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Trade code or name already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update trade
router.put('/:code', async (req, res) => {
  try {
    const { name, description, duration_years, is_active } = req.body;
    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (description) { updates.push('description = ?'); params.push(description); }
    if (duration_years) { updates.push('duration_years = ?'); params.push(duration_years); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    params.push(req.params.code);
    await db.query(`UPDATE trades SET ${updates.join(', ')} WHERE code = ?`, params);

    res.json({ success: true, message: 'Trade updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE trade (soft delete)
router.delete('/:code', async (req, res) => {
  try {
    await db.query('UPDATE trades SET is_active = FALSE WHERE code = ?', [req.params.code]);
    res.json({ success: true, message: 'Trade deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
