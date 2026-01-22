const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Create holiday package (Teacher only)
router.post('/', authenticate, authorize(['teacher', 'dos']), async (req, res) => {
  try {
    const { title, description, trade_class_id, package_type, subject_id, total_activities, estimated_duration_days, difficulty_level, learning_objectives, resources, instructions, submission_required, peer_collaboration, parent_involvement, start_date, end_date, is_active } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO holiday_packages (title, description, teacher_id, trade_class_id, package_type, subject_id, total_activities, estimated_duration_days, difficulty_level, learning_objectives, resources, instructions, submission_required, peer_collaboration, parent_involvement, start_date, end_date, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, req.user.id, trade_class_id, package_type, subject_id, total_activities, estimated_duration_days, difficulty_level, JSON.stringify(learning_objectives), JSON.stringify(resources), instructions, submission_required, peer_collaboration, parent_involvement, start_date, end_date, is_active]
    );
    
    res.status(201).json({ id: result.insertId, message: 'Holiday package created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get holiday packages by class
router.get('/class/:classId', authenticate, async (req, res) => {
  try {
    const [packages] = await db.query(
      `SELECT hp.*, u.name as teacher_name, s.name as subject_name 
       FROM holiday_packages hp 
       JOIN users u ON hp.teacher_id = u.id 
       LEFT JOIN subjects s ON hp.subject_id = s.id 
       WHERE hp.trade_class_id = ? AND hp.is_active = true ORDER BY hp.start_date DESC`,
      [req.params.classId]
    );
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update progress (Student)
router.put('/:id/progress', authenticate, authorize(['student']), async (req, res) => {
  try {
    const { activities_completed, progress_percentage, submission_content, attachments } = req.body;
    
    await db.query(
      `INSERT INTO holiday_package_progress (package_id, student_id, activity_completed, progress_percentage, submission_content, status) 
       VALUES (?, ?, ?, ?, ?, 'in_progress') 
       ON DUPLICATE KEY UPDATE activity_completed = ?, progress_percentage = ?, submission_content = ?, updated_at = CURRENT_TIMESTAMP`,
      [req.params.id, req.user.id, activities_completed, progress_percentage, JSON.stringify(submission_content), activities_completed, progress_percentage, JSON.stringify(submission_content)]
    );
    
    res.json({ message: 'Progress updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
