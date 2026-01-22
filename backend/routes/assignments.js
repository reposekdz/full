const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Create assignment (Teacher only)
router.post('/', authenticate, authorize(['teacher', 'dos']), async (req, res) => {
  try {
    const { title, description, subject_id, trade_class_id, assignment_type, total_marks, instructions, attachments, due_date, submission_deadline, allow_late_submission, late_submission_penalty, grading_rubric, is_published } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO assignments (title, description, subject_id, teacher_id, trade_class_id, assignment_type, total_marks, instructions, attachments, due_date, submission_deadline, allow_late_submission, late_submission_penalty, grading_rubric, is_published, published_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, subject_id, req.user.id, trade_class_id, assignment_type, total_marks, instructions, JSON.stringify(attachments), due_date, submission_deadline, allow_late_submission, late_submission_penalty, JSON.stringify(grading_rubric), is_published, is_published ? new Date() : null]
    );
    
    res.status(201).json({ id: result.insertId, message: 'Assignment created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get assignments by teacher
router.get('/teacher/:teacherId', authenticate, async (req, res) => {
  try {
    const [assignments] = await db.query(
      `SELECT a.*, s.name as subject_name, tc.name as class_name 
       FROM assignments a 
       JOIN subjects s ON a.subject_id = s.id 
       JOIN trade_classes tc ON a.trade_class_id = tc.id 
       WHERE a.teacher_id = ? ORDER BY a.due_date DESC`,
      [req.params.teacherId]
    );
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get assignments by class
router.get('/class/:classId', authenticate, async (req, res) => {
  try {
    const [assignments] = await db.query(
      `SELECT a.*, s.name as subject_name, u.name as teacher_name 
       FROM assignments a 
       JOIN subjects s ON a.subject_id = s.id 
       JOIN users u ON a.teacher_id = u.id 
       WHERE a.trade_class_id = ? AND a.is_published = true ORDER BY a.due_date DESC`,
      [req.params.classId]
    );
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit assignment (Student)
router.post('/:id/submit', authenticate, authorize(['student']), async (req, res) => {
  try {
    const { submission_content, attachments } = req.body;
    const assignment_id = req.params.id;
    
    const [assignment] = await db.query('SELECT * FROM assignments WHERE id = ?', [assignment_id]);
    const is_late = new Date() > new Date(assignment[0].submission_deadline);
    
    const [result] = await db.query(
      `INSERT INTO assignment_submissions (assignment_id, student_id, submission_content, attachments, is_late, status) 
       VALUES (?, ?, ?, ?, ?, 'submitted') 
       ON DUPLICATE KEY UPDATE submission_content = ?, attachments = ?, submitted_at = CURRENT_TIMESTAMP, status = 'submitted'`,
      [assignment_id, req.user.id, submission_content, JSON.stringify(attachments), is_late, submission_content, JSON.stringify(attachments)]
    );
    
    res.json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Grade assignment (Teacher)
router.put('/submissions/:id/grade', authenticate, authorize(['teacher', 'dos']), async (req, res) => {
  try {
    const { marks_obtained, grade_letter, teacher_feedback } = req.body;
    
    await db.query(
      `UPDATE assignment_submissions SET marks_obtained = ?, grade_letter = ?, teacher_feedback = ?, status = 'graded', graded_by = ?, graded_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [marks_obtained, grade_letter, teacher_feedback, req.user.id, req.params.id]
    );
    
    res.json({ message: 'Assignment graded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
