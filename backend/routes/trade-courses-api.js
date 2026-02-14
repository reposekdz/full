const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all courses for a specific trade
router.get('/trade/:tradeCode', async (req, res) => {
  try {
    const { tradeCode } = req.params;
    
    const [courses] = await pool.execute(`
      SELECT * FROM v_trade_courses
      WHERE trade_code = ?
      ORDER BY level_number, course_name
    `, [tradeCode]);

    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching trade courses:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get courses for a specific trade and level
router.get('/trade/:tradeCode/level/:levelNumber', async (req, res) => {
  try {
    const { tradeCode, levelNumber } = req.params;
    
    const [courses] = await pool.execute(`
      SELECT * FROM v_trade_courses
      WHERE trade_code = ? AND level_number = ?
      ORDER BY course_name
    `, [tradeCode, levelNumber]);

    res.json({ success: true, courses, count: courses.length });
  } catch (error) {
    console.error('Error fetching level courses:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all trades with their courses grouped by level
router.get('/structure', async (req, res) => {
  try {
    // Get all active trades
    const [trades] = await pool.execute(`
      SELECT code, name, description, duration_months 
      FROM trades 
      WHERE is_active = true 
      ORDER BY name
    `);

    // Build structure for each trade
    const structure = await Promise.all(trades.map(async (trade) => {
      // Get courses grouped by level
      const [courses] = await pool.execute(`
        SELECT 
          level_number,
          CONCAT('Level ', level_number) as level_name,
          course_name,
          course_code,
          description,
          credits,
          is_required
        FROM trade_courses
        WHERE trade_code = ? AND is_active = true
        ORDER BY level_number, course_name
      `, [trade.code]);

      // Group courses by level
      const levelMap = new Map();
      courses.forEach(course => {
        if (!levelMap.has(course.level_number)) {
          levelMap.set(course.level_number, {
            level_number: course.level_number,
            level_name: course.level_name,
            courses: []
          });
        }
        levelMap.get(course.level_number).courses.push({
          name: course.course_name,
          code: course.course_code,
          description: course.description,
          credits: course.credits,
          is_required: course.is_required
        });
      });

      const levels = Array.from(levelMap.values());

      return {
        code: trade.code,
        name: trade.name,
        description: trade.description,
        duration_months: trade.duration_months,
        levels: levels,
        total_levels: levels.length,
        total_courses: courses.length
      };
    }));

    res.json({ 
      success: true, 
      structure,
      summary: {
        total_trades: structure.length,
        total_courses: structure.reduce((sum, t) => sum + t.total_courses, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching course structure:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get course summary by trade
router.get('/summary', async (req, res) => {
  try {
    const [summary] = await pool.execute(`
      SELECT * FROM v_trade_course_summary
      ORDER BY trade_name, level_number
    `);

    res.json({ success: true, summary });
  } catch (error) {
    console.error('Error fetching course summary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all levels for a specific trade with course counts
router.get('/trade/:tradeCode/levels', async (req, res) => {
  try {
    const { tradeCode } = req.params;
    
    const [levels] = await pool.execute(`
      SELECT 
        level_number,
        CONCAT('Level ', level_number) as level_name,
        COUNT(*) as course_count,
        SUM(credits) as total_credits,
        SUM(CASE WHEN is_required THEN 1 ELSE 0 END) as required_count
      FROM trade_courses
      WHERE trade_code = ? AND is_active = true
      GROUP BY level_number
      ORDER BY level_number
    `, [tradeCode]);

    res.json({ success: true, levels });
  } catch (error) {
    console.error('Error fetching trade levels:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add a new course
router.post('/add', async (req, res) => {
  try {
    const { trade_code, level_number, course_name, course_code, description, credits, is_required } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO trade_courses (trade_code, level_number, course_name, course_code, description, credits, is_required)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [trade_code, level_number, course_name, course_code, description, credits || 1, is_required !== false]);

    res.json({ success: true, message: 'Course added successfully', courseId: result.insertId });
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a course
router.put('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { course_name, course_code, description, credits, is_required, is_active } = req.body;

    const [result] = await pool.execute(`
      UPDATE trade_courses 
      SET course_name = ?, course_code = ?, description = ?, credits = ?, is_required = ?, is_active = ?
      WHERE id = ?
    `, [course_name, course_code, description, credits, is_required, is_active, courseId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, message: 'Course updated successfully' });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a course
router.delete('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;

    const [result] = await pool.execute(`
      DELETE FROM trade_courses WHERE id = ?
    `, [courseId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Search courses
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    const [courses] = await pool.execute(`
      SELECT * FROM v_trade_courses
      WHERE course_name LIKE ? OR trade_name LIKE ?
      ORDER BY trade_name, level_number, course_name
      LIMIT 50
    `, [`%${query}%`, `%${query}%`]);

    res.json({ success: true, courses, count: courses.length });
  } catch (error) {
    console.error('Error searching courses:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
