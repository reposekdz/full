const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Create homework (Teacher only)
router.post('/', authenticate, authorize(['teacher', 'dos']), async (req, res) => {
  try {
    const { title, description, subject_id, trade_class_id, homework_type, total_marks, instructions, resources, due_date, submission_required, peer_review_required, parent_notification } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO homework (title, description, subject_id, teacher_id, trade_class_id, homework_type, total_marks, instructions, resources, due_date, submission_required, peer_review_required, parent_notification) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, subject_id, req.user.id, trade_class_id, homework_type, total_marks, instructions, JSON.stringify(resources), due_date, submission_required, peer_review_required, parent_notification]
    );
    
    res.status(201).json({ id: result.insertId, message: 'Homework created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get homework by class
router.get('/class/:classId', authenticate, async (req, res) => {
  try {
    const [homework] = await db.query(
      `SELECT h.*, s.name as subject_name, u.name as teacher_name 
       FROM homework h 
       JOIN subjects s ON h.subject_id = s.id 
       JOIN users u ON h.teacher_id = u.id 
       WHERE h.trade_class_id = ? AND h.is_active = true ORDER BY h.due_date DESC`,
      [req.params.classId]
    );
    res.json(homework);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit homework (Student)
router.post('/:id/submit', authenticate, authorize(['student']), async (req, res) => {
  try {
    const { submission_content, attachments } = req.body;
    const homework_id = req.params.id;
    
    const [homework] = await db.query('SELECT * FROM homework WHERE id = ?', [homework_id]);
    const is_late = new Date() > new Date(homework[0].due_date);
    
    const [result] = await db.query(
      `INSERT INTO homework_submissions (homework_id, student_id, submission_content, attachments, is_late, status) 
       VALUES (?, ?, ?, ?, ?, 'submitted') 
       ON DUPLICATE KEY UPDATE submission_content = ?, attachments = ?, submitted_at = CURRENT_TIMESTAMP, status = 'submitted'`,
      [homework_id, req.user.id, submission_content, JSON.stringify(attachments), is_late, submission_content, JSON.stringify(attachments)]
    );
    
    res.json({ message: 'Homework submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Grade homework (Teacher)
router.put('/submissions/:id/grade', authenticate, authorize(['teacher', 'dos']), async (req, res) => {
  try {
    const { marks_obtained, teacher_feedback } = req.body;
    
    await db.query(
      `UPDATE homework_submissions SET marks_obtained = ?, teacher_feedback = ?, status = 'graded', graded_by = ?, graded_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [marks_obtained, teacher_feedback, req.user.id, req.params.id]
    );
    
    res.json({ message: 'Homework graded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
