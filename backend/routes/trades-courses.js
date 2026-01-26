const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all trades with their classes and levels
router.get('/all', async (req, res) => {
  try {
    const [trades] = await pool.execute(`
      SELECT t.*, 
             (SELECT COUNT(*) FROM trade_classes WHERE trade_code = t.code) as total_classes,
             (SELECT COUNT(DISTINCT e.student_id) 
              FROM enrollments e 
              JOIN trade_classes tc ON e.class_id = tc.id 
              WHERE tc.trade_code = t.code AND e.status = 'active') as total_students
      FROM trades t
      WHERE t.is_active = true
      ORDER BY t.name
    `);

    res.json({ success: true, trades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get trade classes by trade code
router.get('/trade/:tradeCode/classes', async (req, res) => {
  try {
    const [classes] = await pool.execute(`
      SELECT tc.*, 
             t.name as trade_name,
             t.description as trade_description,
             (SELECT COUNT(*) FROM enrollments WHERE class_id = tc.id AND status = 'active') as student_count,
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name
      FROM trade_classes tc
      JOIN trades t ON tc.trade_code = t.code
      LEFT JOIN users u ON tc.teacher_id = u.id
      WHERE tc.trade_code = ?
      ORDER BY tc.level_number, tc.level_suffix
    `, [req.params.tradeCode]);

    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all levels for a specific trade
router.get('/trade/:tradeCode/levels', async (req, res) => {
  try {
    const [levels] = await pool.execute(`
      SELECT DISTINCT 
             tc.level_number,
             tc.level_suffix,
             CONCAT('Level ', tc.level_number, tc.level_suffix) as level_name,
             COUNT(*) as class_count,
             SUM((SELECT COUNT(*) FROM enrollments WHERE class_id = tc.id AND status = 'active')) as student_count
      FROM trade_classes tc
      WHERE tc.trade_code = ?
      GROUP BY tc.level_number, tc.level_suffix
      ORDER BY tc.level_number, tc.level_suffix
    `, [req.params.tradeCode]);

    res.json({ success: true, levels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get complete trade structure (trades -> levels -> courses/classes)
router.get('/structure', async (req, res) => {
  try {
    // Get all active trades
    const [trades] = await pool.execute(`
      SELECT id, code, name, description, duration_months, is_active 
      FROM trades 
      WHERE is_active = true 
      ORDER BY name
    `);

    // Build structure for each trade
    const structure = await Promise.all(trades.map(async (trade) => {
      // Get all classes for this trade
      const [classes] = await pool.execute(`
        SELECT 
          tc.id,
          tc.name,
          tc.trade_code,
          tc.level_number,
          tc.level_suffix,
          tc.capacity,
          tc.teacher_id,
          tc.is_active,
          (SELECT COUNT(*) FROM enrollments WHERE class_id = tc.id AND status = 'active') as student_count,
          CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) as teacher_name
        FROM trade_classes tc
        LEFT JOIN users u ON tc.teacher_id = u.id
        WHERE tc.trade_code = ?
        ORDER BY tc.level_number, tc.level_suffix, tc.name
      `, [trade.code]);

      // Group classes by level
      const levelMap = new Map();
      classes.forEach(cls => {
        const levelKey = `${cls.level_number}${cls.level_suffix || ''}`;
        if (!levelMap.has(levelKey)) {
          levelMap.set(levelKey, {
            level_number: cls.level_number,
            level_suffix: cls.level_suffix || '',
            level_name: `Level ${cls.level_number}${cls.level_suffix || ''}`,
            courses: [],
            total_students: 0
          });
        }
        const level = levelMap.get(levelKey);
        level.courses.push({
          id: cls.id,
          name: cls.name,
          capacity: cls.capacity,
          student_count: cls.student_count || 0,
          teacher_name: cls.teacher_name?.trim() || 'Not assigned',
          is_active: cls.is_active
        });
        level.total_students += (cls.student_count || 0);
      });

      const levels = Array.from(levelMap.values());
      
      return {
        id: trade.id,
        code: trade.code,
        name: trade.name,
        description: trade.description,
        duration_months: trade.duration_months,
        levels: levels,
        total_levels: levels.length,
        total_courses: classes.length,
        total_students: classes.reduce((sum, cls) => sum + (cls.student_count || 0), 0)
      };
    }));

    res.json({ 
      success: true, 
      structure,
      summary: {
        total_trades: structure.length,
        total_courses: structure.reduce((sum, t) => sum + t.total_courses, 0),
        total_students: structure.reduce((sum, t) => sum + t.total_students, 0)
      }
    });
  } catch (error) {
    console.error('Structure error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get students by trade and level
router.get('/trade/:tradeCode/level/:levelNumber/students', authenticateToken, async (req, res) => {
  try {
    const { tradeCode, levelNumber } = req.params;
    const { levelSuffix = '' } = req.query;

    const [students] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone,
             sp.admission_number, sp.date_of_birth, sp.gender,
             tc.name as class_name, tc.id as class_id,
             e.enrollment_date, e.status as enrollment_status
      FROM users u
      JOIN student_profiles sp ON u.id = sp.user_id
      JOIN enrollments e ON u.id = e.student_id
      JOIN trade_classes tc ON e.class_id = tc.id
      WHERE u.role = 'student'
        AND tc.trade_code = ?
        AND tc.level_number = ?
        AND tc.level_suffix = ?
        AND e.status = 'active'
      ORDER BY u.last_name, u.first_name
    `, [tradeCode, levelNumber, levelSuffix]);

    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get class details with students
router.get('/class/:classId', authenticateToken, async (req, res) => {
  try {
    const [classInfo] = await pool.execute(`
      SELECT tc.*, 
             t.name as trade_name,
             t.description as trade_description,
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
             u.email as teacher_email
      FROM trade_classes tc
      JOIN trades t ON tc.trade_code = t.code
      LEFT JOIN users u ON tc.teacher_id = u.id
      WHERE tc.id = ?
    `, [req.params.classId]);

    if (classInfo.length === 0) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const [students] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.email,
             sp.admission_number,
             e.enrollment_date, e.status
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE e.class_id = ? AND e.status = 'active'
      ORDER BY u.last_name, u.first_name
    `, [req.params.classId]);

    res.json({ 
      success: true, 
      class: classInfo[0],
      students,
      student_count: students.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
