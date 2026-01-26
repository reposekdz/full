const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== ACADEMIC CALENDAR ====================

router.get('/calendar', async (req, res) => {
  try {
    const { month, year, event_type } = req.query;
    let query = 'SELECT * FROM academic_calendar WHERE 1=1';
    const params = [];

    if (event_type) {
      query += ' AND event_type = ?';
      params.push(event_type);
    }
    if (month && year) {
      query += ' AND MONTH(event_date) = ? AND YEAR(event_date) = ?';
      params.push(month, year);
    } else if (year) {
      query += ' AND YEAR(event_date) = ?';
      params.push(year);
    }

    query += ' ORDER BY event_date ASC';
    const [events] = await pool.query(query, params);
    
    res.json({ success: true, events });
  } catch (error) {
    console.error('Academic calendar error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch calendar', error: error.message });
  }
});

router.post('/calendar', authenticateToken, requireRole('admin', 'headmaster', 'director_study'), async (req, res) => {
  try {
    const { event_name, event_type, event_date, description } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO academic_calendar (event_name, event_type, event_date, description) VALUES (?, ?, ?, ?)',
      [event_name, event_type, event_date, description]
    );

    res.status(201).json({ success: true, message: 'Event added to calendar', id: result.insertId });
  } catch (error) {
    console.error('Create calendar event error:', error);
    res.status(500).json({ success: false, message: 'Failed to create event', error: error.message });
  }
});

router.put('/calendar/:id', authenticateToken, requireRole('admin', 'headmaster', 'director_study'), async (req, res) => {
  try {
    const { id } = req.params;
    const { event_name, event_type, event_date, description } = req.body;

    await pool.query(
      'UPDATE academic_calendar SET event_name = ?, event_type = ?, event_date = ?, description = ? WHERE id = ?',
      [event_name, event_type, event_date, description, id]
    );

    res.json({ success: true, message: 'Event updated successfully' });
  } catch (error) {
    console.error('Update calendar event error:', error);
    res.status(500).json({ success: false, message: 'Failed to update event', error: error.message });
  }
});

router.delete('/calendar/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM academic_calendar WHERE id = ?', [id]);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete calendar event error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event', error: error.message });
  }
});

// ==================== ACADEMIC PERFORMANCE ====================

router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const { student_id, subject, term, academic_year, exam_type } = req.query;
    let query = `
      SELECT ap.*, u.first_name, u.last_name, u.student_id as student_code,
        t.first_name as teacher_first_name, t.last_name as teacher_last_name
      FROM academic_performance ap
      LEFT JOIN users u ON ap.student_id = u.id
      LEFT JOIN users t ON ap.teacher_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ' AND ap.student_id = ?';
      params.push(student_id);
    }
    if (subject) {
      query += ' AND ap.subject = ?';
      params.push(subject);
    }
    if (term) {
      query += ' AND ap.term = ?';
      params.push(term);
    }
    if (academic_year) {
      query += ' AND ap.academic_year = ?';
      params.push(academic_year);
    }
    if (exam_type) {
      query += ' AND ap.exam_type = ?';
      params.push(exam_type);
    }

    query += ' ORDER BY ap.created_at DESC';
    const [records] = await pool.query(query, params);

    res.json({ success: true, records });
  } catch (error) {
    console.error('Academic performance error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch performance data', error: error.message });
  }
});

router.post('/performance', authenticateToken, requireRole('teacher', 'admin', 'headmaster', 'director_study'), async (req, res) => {
  try {
    const {
      student_id, student_code, subject, exam_type, score, max_score,
      term, academic_year, teacher_id, remarks
    } = req.body;

    const percentage = (score / max_score) * 100;
    let grade = 'F';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';
    else if (percentage >= 50) grade = 'E';

    const [result] = await pool.query(
      `INSERT INTO academic_performance 
       (student_id, student_code, subject, exam_type, score, max_score, percentage, grade, term, academic_year, teacher_id, remarks) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, student_code, subject, exam_type, score, max_score, percentage, grade, term, academic_year, teacher_id, remarks]
    );

    res.status(201).json({ success: true, message: 'Performance recorded', id: result.insertId, grade, percentage });
  } catch (error) {
    console.error('Record performance error:', error);
    res.status(500).json({ success: false, message: 'Failed to record performance', error: error.message });
  }
});

router.get('/performance/analytics', authenticateToken, async (req, res) => {
  try {
    const { student_id, academic_year, term } = req.query;
    
    let query = `
      SELECT 
        subject,
        AVG(percentage) as avg_percentage,
        MAX(percentage) as max_percentage,
        MIN(percentage) as min_percentage,
        COUNT(*) as total_exams
      FROM academic_performance
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ' AND student_id = ?';
      params.push(student_id);
    }
    if (academic_year) {
      query += ' AND academic_year = ?';
      params.push(academic_year);
    }
    if (term) {
      query += ' AND term = ?';
      params.push(term);
    }

    query += ' GROUP BY subject ORDER BY avg_percentage DESC';
    const [analytics] = await pool.query(query, params);

    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Performance analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
});

// ==================== ACADEMIC PROGRESS ====================

router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const { student_id, course_id, term, academic_year } = req.query;
    let query = 'SELECT * FROM academic_progress WHERE 1=1';
    const params = [];

    if (student_id) {
      query += ' AND student_id = ?';
      params.push(student_id);
    }
    if (course_id) {
      query += ' AND course_id = ?';
      params.push(course_id);
    }
    if (term) {
      query += ' AND term = ?';
      params.push(term);
    }
    if (academic_year) {
      query += ' AND academic_year = ?';
      params.push(academic_year);
    }

    query += ' ORDER BY created_at DESC';
    const [progress] = await pool.query(query, params);

    res.json({ success: true, progress });
  } catch (error) {
    console.error('Academic progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch progress', error: error.message });
  }
});

router.post('/progress', authenticateToken, requireRole('teacher', 'admin', 'headmaster', 'director_study'), async (req, res) => {
  try {
    const {
      student_id, course_id, term, academic_year, marks, grade, rank_in_class,
      teacher_comment_rw, teacher_comment_en, advisor_comment_rw, advisor_comment_en,
      strengths_rw, strengths_en, areas_improvement_rw, areas_improvement_en
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO academic_progress 
       (student_id, course_id, term, academic_year, marks, grade, rank_in_class,
        teacher_comment_rw, teacher_comment_en, advisor_comment_rw, advisor_comment_en,
        strengths_rw, strengths_en, areas_improvement_rw, areas_improvement_en) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, course_id, term, academic_year, marks, grade, rank_in_class,
       teacher_comment_rw, teacher_comment_en, advisor_comment_rw, advisor_comment_en,
       strengths_rw, strengths_en, areas_improvement_rw, areas_improvement_en]
    );

    res.status(201).json({ success: true, message: 'Progress recorded', id: result.insertId });
  } catch (error) {
    console.error('Record progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to record progress', error: error.message });
  }
});

router.put('/progress/:id/notify-parent', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE academic_progress SET parent_notified = 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Parent notified' });
  } catch (error) {
    console.error('Notify parent error:', error);
    res.status(500).json({ success: false, message: 'Failed to notify parent', error: error.message });
  }
});

// ==================== ACADEMIC YEARS ====================

router.get('/years', async (req, res) => {
  try {
    const [years] = await pool.query('SELECT * FROM academic_years ORDER BY start_date DESC');
    res.json({ success: true, years });
  } catch (error) {
    console.error('Academic years error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch academic years', error: error.message });
  }
});

router.get('/years/active', async (req, res) => {
  try {
    const [years] = await pool.query('SELECT * FROM academic_years WHERE is_active = 1 LIMIT 1');
    res.json({ success: true, activeYear: years[0] || null });
  } catch (error) {
    console.error('Active academic year error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active year', error: error.message });
  }
});

router.post('/years', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { name, start_date, end_date, is_active } = req.body;

    // If setting as active, deactivate all others
    if (is_active) {
      await pool.query('UPDATE academic_years SET is_active = 0');
    }

    const [result] = await pool.query(
      'INSERT INTO academic_years (name, start_date, end_date, is_active) VALUES (?, ?, ?, ?)',
      [name, start_date, end_date, is_active || 0]
    );

    res.status(201).json({ success: true, message: 'Academic year created', id: result.insertId });
  } catch (error) {
    console.error('Create academic year error:', error);
    res.status(500).json({ success: false, message: 'Failed to create academic year', error: error.message });
  }
});

router.put('/years/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, start_date, end_date, is_active } = req.body;

    if (is_active) {
      await pool.query('UPDATE academic_years SET is_active = 0 WHERE id != ?', [id]);
    }

    await pool.query(
      'UPDATE academic_years SET name = ?, start_date = ?, end_date = ?, is_active = ? WHERE id = ?',
      [name, start_date, end_date, is_active, id]
    );

    res.json({ success: true, message: 'Academic year updated' });
  } catch (error) {
    console.error('Update academic year error:', error);
    res.status(500).json({ success: false, message: 'Failed to update academic year', error: error.message });
  }
});

module.exports = router;
