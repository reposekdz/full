const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all classes
router.get('/', async (req, res) => {
  try {
    const [classes] = await pool.execute(`
      SELECT 
        tc.id,
        tc.trade_code,
        tc.level_number,
        tc.level_suffix,
        tc.class_name,
        tc.academic_year,
        tc.capacity,
        COUNT(DISTINCT s.id) as student_count,
        t.name
      FROM trade_classes tc
      LEFT JOIN students s ON tc.trade_code = s.trade_code AND tc.level_number = s.level_number
      LEFT JOIN trades t ON tc.trade_code = t.code
      GROUP BY tc.id, tc.trade_code, tc.level_number, tc.level_suffix, tc.class_name, tc.academic_year, tc.capacity, t.name
      ORDER BY tc.trade_code, tc.level_number, tc.level_suffix
    `);
    
    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.json([]);
  }
});

// Get class by ID
router.get('/:id', async (req, res) => {
  try {
    const [classes] = await pool.execute(`
      SELECT 
        tc.*,
        t.name,
        COUNT(DISTINCT s.id) as student_count
      FROM trade_classes tc
      LEFT JOIN trades t ON tc.trade_code = t.code
      LEFT JOIN students s ON tc.trade_code = s.trade_code AND tc.level_number = s.level_number
      WHERE tc.id = ?
      GROUP BY tc.id
    `, [req.params.id]);
    
    if (classes.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    res.json(classes[0]);
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json({ error: 'Failed to fetch class' });
  }
});

// Get students in a class
router.get('/:id/students', async (req, res) => {
  try {
    const [classInfo] = await pool.execute('SELECT trade_code, level_number FROM trade_classes WHERE id = ?', [req.params.id]);
    
    if (classInfo.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    const [students] = await pool.execute(`
      SELECT 
        s.*,
        COALESCE(sf.total_fees, 0) as total_fees,
        COALESCE(SUM(p.amount), 0) as paid_amount,
        COALESCE(sf.total_fees, 0) - COALESCE(SUM(p.amount), 0) as remaining_amount
      FROM students s
      LEFT JOIN student_fees sf ON s.id = sf.student_id
      LEFT JOIN payments p ON s.id = p.student_id
      WHERE s.trade_code = ? AND s.level_number = ?
      GROUP BY s.id
      ORDER BY s.last_name, s.first_name
    `, [classInfo[0].trade_code, classInfo[0].level_number]);
    
    res.json(students);
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({ error: 'Failed to fetch class students' });
  }
});

module.exports = router;
