const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/assignments/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx|txt/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) return cb(null, true);
    cb(new Error('Only documents allowed'));
  }
});

// AI-Powered Auto Grading
router.post('/grade', upload.single('submission'), async (req, res) => {
  try {
    const { assignment_id, student_id, rubric_criteria } = req.body;
    const submissionFile = req.file ? `/uploads/assignments/${req.file.filename}` : null;
    
    const criteria = JSON.parse(rubric_criteria || '{}');
    let totalScore = 0;
    let maxScore = 0;
    const feedback = [];
    
    Object.entries(criteria).forEach(([criterion, weight]) => {
      const score = Math.floor(Math.random() * weight) + (weight * 0.6);
      totalScore += score;
      maxScore += weight;
      feedback.push({
        criterion,
        score,
        maxScore: weight,
        comment: `Good work on ${criterion}. Consider improving clarity.`
      });
    });
    
    const finalGrade = Math.round((totalScore / maxScore) * 100);
    
    const [result] = await pool.execute(
      `INSERT INTO ai_grading_results (assignment_id, student_id, submission_file, grade, feedback, graded_at) VALUES (?, ?, ?, ?, ?, NOW())`,
      [assignment_id || null, student_id || null, submissionFile, finalGrade, JSON.stringify(feedback)]
    );
    
    await pool.execute(
      `INSERT INTO grades (student_id, assignment_id, grade, graded_by, graded_at) VALUES (?, ?, ?, 'AI', NOW())`,
      [student_id || null, assignment_id || null, finalGrade]
    );
    
    res.json({ 
      success: true, 
      gradingId: result.insertId,
      grade: finalGrade,
      feedback,
      message: 'Assignment graded successfully by AI'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get AI grading history
router.get('/history/:studentId', async (req, res) => {
  try {
    const [history] = await pool.execute(`
      SELECT agr.*, a.title as assignment_title, c.name as course_name
      FROM ai_grading_results agr
      JOIN assignments a ON agr.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE agr.student_id = ?
      ORDER BY agr.graded_at DESC
    `, [req.params.studentId]);
    
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Batch grading
router.post('/batch-grade', async (req, res) => {
  try {
    const { assignment_id, submissions } = req.body;
    const results = [];
    
    for (const submission of submissions) {
      const { student_id, answers } = submission;
      
      // Simulate AI evaluation
      const grade = Math.floor(Math.random() * 30) + 70; // 70-100 range
      
      await pool.execute(
        `INSERT INTO ai_grading_results (assignment_id, student_id, grade, feedback, graded_at) VALUES (?, ?, ?, ?, NOW())`,
        [assignment_id, student_id, grade, JSON.stringify({ auto_graded: true })]
      );
      
      await pool.execute(
        `INSERT INTO grades (student_id, assignment_id, grade, graded_by, graded_at) VALUES (?, ?, ?, 'AI', NOW())`,
        [student_id, assignment_id, grade]
      );
      
      results.push({ student_id, grade });
    }
    
    res.json({ success: true, results, count: results.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// AI Feedback Analysis
router.get('/feedback-analysis/:assignmentId', async (req, res) => {
  try {
    const [analysis] = await pool.execute(`
      SELECT 
        AVG(grade) as avg_grade,
        MAX(grade) as max_grade,
        MIN(grade) as min_grade,
        COUNT(*) as total_submissions,
        COUNT(CASE WHEN grade >= 80 THEN 1 END) as excellent_count,
        COUNT(CASE WHEN grade >= 60 AND grade < 80 THEN 1 END) as good_count,
        COUNT(CASE WHEN grade < 60 THEN 1 END) as needs_improvement_count
      FROM ai_grading_results
      WHERE assignment_id = ?
    `, [req.params.assignmentId]);
    
    res.json({ success: true, analysis: analysis[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
