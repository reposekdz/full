const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get user points
router.get('/points/:userId', async (req, res) => {
  try {
    const [points] = await pool.execute(`
      SELECT SUM(points) as total_points,
             COUNT(*) as total_activities
      FROM gamification_points
      WHERE user_id = ?
    `, [req.params.userId]);
    
    const [history] = await pool.execute(`
      SELECT * FROM gamification_points
      WHERE user_id = ?
      ORDER BY earned_at DESC
      LIMIT 50
    `, [req.params.userId]);
    
    res.json({ success: true, points: points[0], history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/points', async (req, res) => {
  try {
    const { user_id, points, activity_type, description } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO gamification_points (user_id, points, activity_type, description) VALUES (?, ?, ?, ?)`,
      [user_id, points, activity_type, description]
    );
    
    // Check for badge eligibility
    const [totalPoints] = await pool.execute(`SELECT SUM(points) as total FROM gamification_points WHERE user_id = ?`, [user_id]);
    const total = totalPoints[0].total;
    
    if (total >= 1000 && total < 1100) {
      await pool.execute(`INSERT INTO user_badges (user_id, badge_id) VALUES (?, (SELECT id FROM badges WHERE points_required <= ? ORDER BY points_required DESC LIMIT 1))`, [user_id, total]);
    }
    
    res.json({ success: true, pointId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get badges
router.get('/badges', async (req, res) => {
  try {
    const [badges] = await pool.execute(`SELECT * FROM badges ORDER BY points_required ASC`);
    res.json({ success: true, badges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/badges/:userId', async (req, res) => {
  try {
    const [badges] = await pool.execute(`
      SELECT b.*, ub.earned_at
      FROM user_badges ub
      JOIN badges b ON ub.badge_id = b.id
      WHERE ub.user_id = ?
      ORDER BY ub.earned_at DESC
    `, [req.params.userId]);
    res.json({ success: true, badges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'all', limit = 50 } = req.query;
    let dateFilter = '';
    
    if (period === 'week') dateFilter = 'AND gp.earned_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    else if (period === 'month') dateFilter = 'AND gp.earned_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    
    const [leaderboard] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.profile_image,
             SUM(gp.points) as total_points,
             COUNT(DISTINCT ub.badge_id) as badge_count,
             RANK() OVER (ORDER BY SUM(gp.points) DESC) as rank
      FROM users u
      LEFT JOIN gamification_points gp ON u.id = gp.user_id ${dateFilter}
      LEFT JOIN user_badges ub ON u.id = ub.user_id
      WHERE u.role = 'student'
      GROUP BY u.id
      ORDER BY total_points DESC
      LIMIT ?
    `, [parseInt(limit)]);
    
    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Achievements
router.get('/achievements/:userId', async (req, res) => {
  try {
    const [achievements] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM assignments WHERE student_id = ? AND status = 'submitted') as assignments_completed,
        (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = ? AND score >= 80) as quizzes_passed,
        (SELECT COUNT(DISTINCT course_id) FROM enrollments WHERE student_id = ?) as courses_enrolled,
        (SELECT AVG(score) FROM quiz_attempts WHERE user_id = ?) as avg_quiz_score,
        (SELECT COUNT(*) FROM attendance WHERE student_id = ? AND status = 'present') as attendance_count
    `, [req.params.userId, req.params.userId, req.params.userId, req.params.userId, req.params.userId]);
    
    res.json({ success: true, achievements: achievements[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
