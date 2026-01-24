const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all teams with stats
router.get('/teams', async (req, res) => {
  try {
    const [teams] = await pool.query(`
      SELECT 
        t.*,
        COUNT(DISTINCT p.id) as total_players,
        COUNT(DISTINCT a.id) as total_achievements,
        COUNT(DISTINCT CASE WHEN m.result = 'win' THEN m.id END) as total_wins
      FROM sports_teams t
      LEFT JOIN sports_players p ON t.id = p.team_id AND p.is_active = true
      LEFT JOIN sports_achievements a ON t.id = a.team_id
      LEFT JOIN sports_matches m ON t.id = m.team_id
      WHERE t.is_active = true
      GROUP BY t.id
      ORDER BY t.id
    `);
    res.json({ success: true, teams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single team with full details
router.get('/teams/:id', async (req, res) => {
  try {
    const [teams] = await pool.query('SELECT * FROM sports_teams WHERE id = ? AND is_active = true', [req.params.id]);
    if (teams.length === 0) return res.status(404).json({ success: false, message: 'Team not found' });

    const [coaches] = await pool.query('SELECT * FROM sports_coaches WHERE team_id = ? AND is_active = true', [req.params.id]);
    const [players] = await pool.query('SELECT * FROM sports_players WHERE team_id = ? AND is_active = true ORDER BY is_captain DESC, jersey_number', [req.params.id]);
    const [achievements] = await pool.query('SELECT * FROM sports_achievements WHERE team_id = ? ORDER BY achievement_date DESC', [req.params.id]);
    const [matches] = await pool.query('SELECT * FROM sports_matches WHERE team_id = ? ORDER BY match_date DESC LIMIT 10', [req.params.id]);

    res.json({
      success: true,
      team: teams[0],
      coach: coaches[0] || null,
      players,
      achievements,
      recentMatches: matches
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
