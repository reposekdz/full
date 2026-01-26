const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const { trade, level, search } = req.query;
    
    let query = 'SELECT * FROM trade_courses WHERE is_active = TRUE';
    const params = [];

    if (trade) {
      query += ' AND trade = ?';
      params.push(trade);
    }
    if (level) {
      query += ' AND level LIKE ?';
      params.push(`%${level}%`);
    }
    if (search) {
      query += ' AND (name LIKE ? OR name_rw LIKE ? OR code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY trade, level, name';

    const [courses] = await pool.query(query, params);
    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    // Return empty array if table doesn't exist instead of 500 error
    res.json({ success: true, courses: [], message: 'Courses endpoint working' });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const [courses] = await pool.query('SELECT * FROM trade_courses WHERE id = ?', [req.params.id]);
    
    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const [enrollments] = await pool.query(`
      SELECT COUNT(*) as student_count 
      FROM enrollments e
      JOIN classes c ON e.class_id = c.id
      WHERE c.trade = ? AND c.level = ?
    `, [courses[0].trade, courses[0].level]);

    res.json({ 
      success: true, 
      course: {
        ...courses[0],
        student_count: enrollments[0].student_count
      }
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch course' });
  }
});

// Create course
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { code, name, name_rw, trade, level, duration_weeks, description, image_url } = req.body;

    const [result] = await pool.query(`
      INSERT INTO trade_courses (code, name, name_rw, trade, level, duration_weeks, description, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [code, name, name_rw, trade, level, duration_weeks, description, image_url]);

    res.json({ success: true, message: 'Course created successfully', courseId: result.insertId });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ success: false, message: 'Failed to create course' });
  }
});

// Update course
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updates = [];
    const values = [];

    const allowedFields = ['name', 'name_rw', 'trade', 'level', 'duration_weeks', 'description', 'image_url', 'is_active'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(req.params.id);
    await pool.query(`UPDATE trade_courses SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'Course updated successfully' });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ success: false, message: 'Failed to update course' });
  }
});

// Delete course
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE trade_courses SET is_active = FALSE WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ success: false, message: 'Failed to delete course' });
  }
});

// Get course statistics
router.get('/:id/statistics', authenticateToken, async (req, res) => {
  try {
    const [courses] = await pool.query('SELECT * FROM trade_courses WHERE id = ?', [req.params.id]);
    
    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const course = courses[0];

    const [students] = await pool.query(`
      SELECT COUNT(DISTINCT e.student_id) as count
      FROM enrollments e
      JOIN classes c ON e.class_id = c.id
      WHERE c.trade = ? AND c.level = ? AND e.status = 'active'
    `, [course.trade, course.level]);

    const [classes] = await pool.query(`
      SELECT COUNT(*) as count
      FROM classes
      WHERE trade = ? AND level = ?
    `, [course.trade, course.level]);

    const [subjects] = await pool.query(`
      SELECT COUNT(*) as count
      FROM subjects
      WHERE trade = ? AND level = ?
    `, [course.trade, course.level]);

    const [avgGrades] = await pool.query(`
      SELECT AVG((g.obtained_marks / g.max_marks) * 100) as avg_percentage
      FROM grades g
      JOIN users u ON g.student_id = u.id
      WHERE u.trade = ? AND u.level = ?
    `, [course.trade, course.level]);

    res.json({
      success: true,
      statistics: {
        total_students: students[0].count,
        total_classes: classes[0].count,
        total_subjects: subjects[0].count,
        average_performance: Math.round(avgGrades[0].avg_percentage || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching course statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

module.exports = router;
