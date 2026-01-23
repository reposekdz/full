const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Get all active competitions
router.get('/competitions', authenticate, async (req, res) => {
  try {
    const { trade_id, level, status = 'active' } = req.query;
    let query = `
      SELECT c.*, cc.name as category_name, cc.icon, cc.color,
             COUNT(DISTINCT cp.id) as participant_count,
             (SELECT COUNT(*) FROM competition_participants WHERE competition_id = c.id AND student_id = ?) as is_registered
      FROM competitions c
      LEFT JOIN competition_categories cc ON c.category_id = cc.id
      LEFT JOIN competition_participants cp ON c.id = cp.competition_id
      WHERE c.status = ?
    `;
    const params = [req.user.id, status];

    if (trade_id) {
      query += ' AND (c.trade_id = ? OR c.trade_id IS NULL)';
      params.push(trade_id);
    }
    if (level) {
      query += ' AND (c.level = ? OR c.level IS NULL)';
      params.push(level);
    }

    query += ' GROUP BY c.id ORDER BY c.start_date ASC';
    const [competitions] = await db.query(query, params);
    res.json(competitions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register for competition
router.post('/competitions/:id/register', authenticate, authorize(['student']), async (req, res) => {
  try {
    const competition_id = req.params.id;
    const student_id = req.user.id;

    // Get student's trade
    const [student] = await db.query('SELECT trade_id FROM students WHERE user_id = ?', [student_id]);
    if (!student.length) return res.status(404).json({ error: 'Student not found' });

    // Check if competition exists and is active
    const [competition] = await db.query('SELECT * FROM competitions WHERE id = ? AND status IN ("upcoming", "active")', [competition_id]);
    if (!competition.length) return res.status(404).json({ error: 'Competition not available' });

    // Check if already registered
    const [existing] = await db.query('SELECT id FROM competition_participants WHERE competition_id = ? AND student_id = ?', [competition_id, student_id]);
    if (existing.length) return res.status(400).json({ error: 'Already registered' });

    // Check participant limit
    const [count] = await db.query('SELECT COUNT(*) as count FROM competition_participants WHERE competition_id = ?', [competition_id]);
    if (count[0].count >= competition[0].max_participants) return res.status(400).json({ error: 'Competition is full' });

    await db.query(
      'INSERT INTO competition_participants (competition_id, student_id, trade_id) VALUES (?, ?, ?)',
      [competition_id, student_id, student[0].trade_id]
    );

    res.json({ success: true, message: 'Registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit competition score
router.post('/competitions/:id/submit', authenticate, authorize(['student']), async (req, res) => {
  try {
    const { score } = req.body;
    const competition_id = req.params.id;
    const student_id = req.user.id;

    await db.query(
      'UPDATE competition_participants SET score = ?, completion_status = "completed", completed_at = NOW() WHERE competition_id = ? AND student_id = ?',
      [score, competition_id, student_id]
    );

    res.json({ success: true, message: 'Score submitted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get competition leaderboard
router.get('/competitions/:id/leaderboard', authenticate, async (req, res) => {
  try {
    const [leaderboard] = await db.query(`
      SELECT cp.*, u.name as student_name, s.student_code, tc.name as trade_name,
             RANK() OVER (ORDER BY cp.score DESC) as rank
      FROM competition_participants cp
      JOIN users u ON cp.student_id = u.id
      JOIN students s ON u.id = s.user_id
      LEFT JOIN trade_classes tc ON cp.trade_id = tc.id
      WHERE cp.competition_id = ? AND cp.completion_status = 'completed'
      ORDER BY cp.score DESC
      LIMIT 100
    `, [req.params.id]);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate and award medals (Admin/Teacher)
router.post('/competitions/:id/award-medals', authenticate, authorize(['admin', 'teacher', 'dos']), async (req, res) => {
  try {
    const competition_id = req.params.id;

    // Get competition details
    const [competition] = await db.query('SELECT * FROM competitions WHERE id = ?', [competition_id]);
    if (!competition.length) return res.status(404).json({ error: 'Competition not found' });

    // Get top performers
    const [participants] = await db.query(`
      SELECT * FROM competition_participants 
      WHERE competition_id = ? AND completion_status = 'completed'
      ORDER BY score DESC
    `, [competition_id]);

    if (participants.length === 0) return res.status(400).json({ error: 'No completed participants' });

    // Award medals based on rank
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      let medal = 'none';
      let points = 0;

      if (i === 0) { medal = 'diamond'; points = 500; }
      else if (i === 1) { medal = 'gold'; points = 300; }
      else if (i === 2) { medal = 'silver'; points = 200; }
      else if (i < 10) { medal = 'bronze'; points = 100; }
      else { points = 50; }

      // Update participant
      await db.query(
        'UPDATE competition_participants SET rank = ?, medal_earned = ?, points_earned = ? WHERE id = ?',
        [i + 1, medal, points, participant.id]
      );

      // Award medal
      if (medal !== 'none') {
        await db.query(
          'INSERT INTO student_medals (student_id, medal_type, competition_id) VALUES (?, ?, ?)',
          [participant.student_id, medal, competition_id]
        );
      }

      // Award points
      await db.query(
        'INSERT INTO student_points (student_id, points, source, source_id, description) VALUES (?, ?, "competition", ?, ?)',
        [participant.student_id, points, competition_id, `Competition: ${competition[0].title}`]
      );

      // Update trade leaderboard
      await db.query(`
        INSERT INTO trade_leaderboard (trade_id, student_id, total_points, total_competitions, ${medal}_medals)
        VALUES (?, ?, ?, 1, 1)
        ON DUPLICATE KEY UPDATE
          total_points = total_points + ?,
          total_competitions = total_competitions + 1,
          ${medal}_medals = ${medal}_medals + ${medal !== 'none' ? 1 : 0}
      `, [participant.trade_id, participant.student_id, points, points]);
    }

    // Update competition status
    await db.query('UPDATE competitions SET status = "completed" WHERE id = ?', [competition_id]);

    res.json({ success: true, message: 'Medals awarded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student dashboard
router.get('/student/dashboard', authenticate, authorize(['student']), async (req, res) => {
  try {
    const student_id = req.user.id;

    // Get total points
    const [points] = await db.query('SELECT COALESCE(SUM(points), 0) as total_points FROM student_points WHERE student_id = ?', [student_id]);

    // Get medals count
    const [medals] = await db.query(`
      SELECT 
        COUNT(CASE WHEN medal_type = 'diamond' THEN 1 END) as diamond,
        COUNT(CASE WHEN medal_type = 'gold' THEN 1 END) as gold,
        COUNT(CASE WHEN medal_type = 'silver' THEN 1 END) as silver,
        COUNT(CASE WHEN medal_type = 'bronze' THEN 1 END) as bronze
      FROM student_medals WHERE student_id = ?
    `, [student_id]);

    // Get competitions count
    const [competitions] = await db.query('SELECT COUNT(*) as total FROM competition_participants WHERE student_id = ?', [student_id]);

    // Get trade rank
    const [student] = await db.query('SELECT trade_id FROM students WHERE user_id = ?', [student_id]);
    const [rank] = await db.query('SELECT rank_in_trade, overall_rank FROM trade_leaderboard WHERE student_id = ?', [student_id]);

    // Get recent achievements
    const [achievements] = await db.query(`
      SELECT sa.*, ca.name, ca.description, ca.icon
      FROM student_achievements sa
      JOIN competition_achievements ca ON sa.achievement_id = ca.id
      WHERE sa.student_id = ?
      ORDER BY sa.earned_at DESC
      LIMIT 5
    `, [student_id]);

    res.json({
      total_points: points[0].total_points,
      medals: medals[0],
      total_competitions: competitions[0].total,
      rank_in_trade: rank[0]?.rank_in_trade || null,
      overall_rank: rank[0]?.overall_rank || null,
      recent_achievements: achievements
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trade leaderboard
router.get('/leaderboard/trade/:tradeId', authenticate, async (req, res) => {
  try {
    const [leaderboard] = await db.query(`
      SELECT tl.*, u.name as student_name, s.student_code, tc.name as trade_name
      FROM trade_leaderboard tl
      JOIN users u ON tl.student_id = u.id
      JOIN students s ON u.id = s.user_id
      JOIN trade_classes tc ON tl.trade_id = tc.id
      WHERE tl.trade_id = ?
      ORDER BY tl.total_points DESC
      LIMIT 50
    `, [req.params.tradeId]);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get overall leaderboard
router.get('/leaderboard/overall', authenticate, async (req, res) => {
  try {
    const [leaderboard] = await db.query(`
      SELECT tl.*, u.name as student_name, s.student_code, tc.name as trade_name,
             RANK() OVER (ORDER BY tl.total_points DESC) as rank
      FROM trade_leaderboard tl
      JOIN users u ON tl.student_id = u.id
      JOIN students s ON u.id = s.user_id
      JOIN trade_classes tc ON tl.trade_id = tc.id
      ORDER BY tl.total_points DESC
      LIMIT 100
    `);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create competition (Admin/Teacher)
router.post('/competitions', authenticate, authorize(['admin', 'teacher', 'dos']), async (req, res) => {
  try {
    const { title, description, category_id, trade_id, level, competition_type, start_date, end_date, points_reward, medal_type, max_participants, rules } = req.body;

    const [result] = await db.query(
      `INSERT INTO competitions (title, description, category_id, trade_id, level, competition_type, start_date, end_date, points_reward, medal_type, max_participants, rules, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, category_id, trade_id, level, competition_type, start_date, end_date, points_reward, medal_type, max_participants, rules, req.user.id]
    );

    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student's competitions
router.get('/student/my-competitions', authenticate, authorize(['student']), async (req, res) => {
  try {
    const [competitions] = await db.query(`
      SELECT c.*, cp.score, cp.rank, cp.medal_earned, cp.points_earned, cp.completion_status,
             cc.name as category_name, cc.icon, cc.color,
             (SELECT COUNT(*) FROM competition_participants WHERE competition_id = c.id) as total_participants
      FROM competition_participants cp
      JOIN competitions c ON cp.competition_id = c.id
      LEFT JOIN competition_categories cc ON c.category_id = cc.id
      WHERE cp.student_id = ?
      ORDER BY c.start_date DESC
    `, [req.user.id]);

    res.json(competitions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get competition analytics
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const [analytics] = await db.query(`
      SELECT 
        COUNT(DISTINCT id) as total_competitions,
        COUNT(DISTINCT CASE WHEN status = 'active' THEN id END) as active_competitions,
        COUNT(DISTINCT CASE WHEN status = 'completed' THEN id END) as completed_competitions,
        (SELECT COUNT(*) FROM competition_participants) as total_participants,
        (SELECT COUNT(DISTINCT student_id) FROM competition_participants) as unique_students
      FROM competitions
    `);
    res.json(analytics[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
