const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get personalized learning recommendations
router.get('/recommendations/:userId', async (req, res) => {
  try {
    // Analyze student performance
    const [performance] = await pool.execute(`
      SELECT c.id, c.name, AVG(g.grade) as avg_grade, COUNT(a.id) as assignments_completed
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN grades g ON c.id = g.course_id AND g.student_id = e.student_id
      LEFT JOIN assignments a ON c.id = a.course_id AND a.student_id = e.student_id AND a.status = 'submitted'
      WHERE e.student_id = ?
      GROUP BY c.id
    `, [req.params.userId]);
    
    const recommendations = [];
    
    performance.forEach(course => {
      if (course.avg_grade < 60) {
        recommendations.push({
          type: 'remedial',
          course_id: course.id,
          course_name: course.name,
          priority: 'high',
          message: `Focus on ${course.name} - current average: ${course.avg_grade}%`,
          suggested_resources: ['video_tutorials', 'practice_exercises', 'tutoring']
        });
      } else if (course.avg_grade >= 85) {
        recommendations.push({
          type: 'advanced',
          course_id: course.id,
          course_name: course.name,
          priority: 'medium',
          message: `Excellent progress in ${course.name}! Try advanced topics.`,
          suggested_resources: ['advanced_projects', 'research_papers']
        });
      }
    });
    
    // Recommend new courses based on interests
    const [suggestedCourses] = await pool.execute(`
      SELECT c.* FROM courses c
      WHERE c.id NOT IN (SELECT course_id FROM enrollments WHERE student_id = ?)
      AND c.status = 'active'
      LIMIT 5
    `, [req.params.userId]);
    
    res.json({ success: true, recommendations, suggestedCourses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get adaptive learning path
router.get('/learning-path/:userId', async (req, res) => {
  try {
    const [path] = await pool.execute(`
      SELECT alp.*, c.name as course_name, c.description
      FROM adaptive_learning_paths alp
      JOIN courses c ON alp.course_id = c.id
      WHERE alp.user_id = ?
      ORDER BY alp.sequence
    `, [req.params.userId]);
    
    res.json({ success: true, learningPath: path });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create adaptive learning path
router.post('/learning-path', async (req, res) => {
  try {
    const { user_id, course_id, sequence, difficulty_level, estimated_duration } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO adaptive_learning_paths (user_id, course_id, sequence, difficulty_level, estimated_duration, status) VALUES (?, ?, ?, ?, ?, 'active')`,
      [user_id, course_id, sequence, difficulty_level, estimated_duration]
    );
    res.json({ success: true, pathId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Track learning progress
router.post('/progress', async (req, res) => {
  try {
    const { user_id, course_id, topic, completion_percentage, time_spent, mastery_level } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO learning_progress (user_id, course_id, topic, completion_percentage, time_spent, mastery_level) VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, course_id, topic, completion_percentage, time_spent, mastery_level]
    );
    res.json({ success: true, progressId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get learning analytics
router.get('/analytics/:userId', async (req, res) => {
  try {
    const [analytics] = await pool.execute(`
      SELECT 
        AVG(completion_percentage) as avg_completion,
        SUM(time_spent) as total_time_spent,
        AVG(mastery_level) as avg_mastery,
        COUNT(DISTINCT course_id) as courses_in_progress
      FROM learning_progress
      WHERE user_id = ?
    `, [req.params.userId]);
    
    const [topicMastery] = await pool.execute(`
      SELECT topic, AVG(mastery_level) as mastery, COUNT(*) as attempts
      FROM learning_progress
      WHERE user_id = ?
      GROUP BY topic
      ORDER BY mastery DESC
    `, [req.params.userId]);
    
    res.json({ success: true, analytics: analytics[0], topicMastery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Skill gap analysis
router.get('/skill-gaps/:userId', async (req, res) => {
  try {
    const [gaps] = await pool.execute(`
      SELECT 
        c.name as course_name,
        lp.topic,
        lp.mastery_level,
        CASE 
          WHEN lp.mastery_level < 50 THEN 'critical'
          WHEN lp.mastery_level < 70 THEN 'needs_improvement'
          ELSE 'good'
        END as gap_level
      FROM learning_progress lp
      JOIN courses c ON lp.course_id = c.id
      WHERE lp.user_id = ? AND lp.mastery_level < 70
      ORDER BY lp.mastery_level ASC
    `, [req.params.userId]);
    
    res.json({ success: true, skillGaps: gaps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
