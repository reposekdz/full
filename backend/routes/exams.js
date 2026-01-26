const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all exams with filters
router.get('/', async (req, res) => {
  try {
    const { trade, level, type, status, search } = req.query;
    
    let query = `
      SELECT e.*, 
        s.name as subject_name,
        u.first_name, u.last_name,
        (SELECT COUNT(*) FROM exam_registrations WHERE exam_id = e.id) as students_enrolled
      FROM exams e
      LEFT JOIN subjects s ON e.subject_id = s.id
      LEFT JOIN users u ON e.instructor_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (trade) {
      query += ' AND e.trade = ?';
      params.push(trade);
    }
    if (level) {
      query += ' AND e.level LIKE ?';
      params.push(`%${level}%`);
    }
    if (type) {
      query += ' AND e.exam_type = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (e.title LIKE ? OR e.title_rw LIKE ? OR e.code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY e.exam_date DESC, e.start_time DESC';

    const [exams] = await pool.query(query, params);
    
    res.json({ success: true, exams });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.json({ success: true, exams: [] });
  }
});

// Get exam by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [exams] = await pool.query(`
      SELECT e.*, 
        s.name as subject_name,
        u.first_name, u.last_name, u.profile_image,
        (SELECT COUNT(*) FROM exam_registrations WHERE exam_id = e.id) as students_enrolled
      FROM exams e
      LEFT JOIN subjects s ON e.subject_id = s.id
      LEFT JOIN users u ON e.instructor_id = u.id
      WHERE e.id = ?
    `, [req.params.id]);

    if (exams.length === 0) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    res.json({ success: true, exam: exams[0] });
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch exam' });
  }
});

// Create new exam
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      code, title, title_rw, subject_id, trade, level, exam_type,
      exam_date, start_time, end_time, duration_minutes, room,
      instructor_id, total_marks, passing_marks, description,
      topics, materials, rules
    } = req.body;

    const [result] = await pool.query(`
      INSERT INTO exams (
        code, title, title_rw, subject_id, trade, level, exam_type,
        exam_date, start_time, end_time, duration_minutes, room,
        instructor_id, total_marks, passing_marks, description,
        topics, materials, rules, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming')
    `, [
      code, title, title_rw, subject_id, trade, level, exam_type,
      exam_date, start_time, end_time, duration_minutes, room,
      instructor_id, total_marks, passing_marks, description,
      JSON.stringify(topics), JSON.stringify(materials), JSON.stringify(rules)
    ]);

    res.json({ success: true, message: 'Exam created successfully', examId: result.insertId });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ success: false, message: 'Failed to create exam' });
  }
});

// Update exam
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updates = [];
    const values = [];

    const allowedFields = [
      'title', 'title_rw', 'subject_id', 'trade', 'level', 'exam_type',
      'exam_date', 'start_time', 'end_time', 'duration_minutes', 'room',
      'instructor_id', 'total_marks', 'passing_marks', 'description',
      'topics', 'materials', 'rules', 'status'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        if (['topics', 'materials', 'rules'].includes(field)) {
          values.push(JSON.stringify(req.body[field]));
        } else {
          values.push(req.body[field]);
        }
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(req.params.id);
    await pool.query(`UPDATE exams SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'Exam updated successfully' });
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ success: false, message: 'Failed to update exam' });
  }
});

// Delete exam
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM exam_registrations WHERE exam_id = ?', [req.params.id]);
    await pool.query('DELETE FROM exam_results WHERE exam_id = ?', [req.params.id]);
    await pool.query('DELETE FROM exams WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ success: false, message: 'Failed to delete exam' });
  }
});

// Register student for exam
router.post('/:id/register', authenticateToken, async (req, res) => {
  try {
    const { student_id } = req.body;
    
    await pool.query(`
      INSERT INTO exam_registrations (exam_id, student_id, status)
      VALUES (?, ?, 'registered')
    `, [req.params.id, student_id]);

    res.json({ success: true, message: 'Student registered for exam' });
  } catch (error) {
    console.error('Error registering for exam:', error);
    res.status(500).json({ success: false, message: 'Failed to register for exam' });
  }
});

// Submit exam results
router.post('/:id/results', authenticateToken, async (req, res) => {
  try {
    const { student_id, obtained_marks, remarks } = req.body;
    const examId = req.params.id;

    const [exams] = await pool.query('SELECT total_marks, passing_marks FROM exams WHERE id = ?', [examId]);
    if (exams.length === 0) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const exam = exams[0];
    const percentage = (obtained_marks / exam.total_marks) * 100;
    let grade_letter = 'F';
    
    if (percentage >= 90) grade_letter = 'A';
    else if (percentage >= 80) grade_letter = 'B';
    else if (percentage >= 70) grade_letter = 'C';
    else if (percentage >= 60) grade_letter = 'D';
    else if (percentage >= 50) grade_letter = 'E';

    await pool.query(`
      INSERT INTO exam_results (exam_id, student_id, obtained_marks, grade_letter, percentage, remarks, result_date)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        obtained_marks = VALUES(obtained_marks),
        grade_letter = VALUES(grade_letter),
        percentage = VALUES(percentage),
        remarks = VALUES(remarks),
        result_date = VALUES(result_date)
    `, [examId, student_id, obtained_marks, grade_letter, percentage, remarks]);

    res.json({ success: true, message: 'Exam result submitted successfully' });
  } catch (error) {
    console.error('Error submitting exam result:', error);
    res.status(500).json({ success: false, message: 'Failed to submit exam result' });
  }
});

// Get exam results
router.get('/:id/results', authenticateToken, async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT er.*, u.first_name, u.last_name, u.student_code
      FROM exam_results er
      JOIN users u ON er.student_id = u.id
      WHERE er.exam_id = ?
      ORDER BY er.percentage DESC
    `, [req.params.id]);

    res.json({ success: true, results });
  } catch (error) {
    console.error('Error fetching exam results:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch exam results' });
  }
});

module.exports = router;
