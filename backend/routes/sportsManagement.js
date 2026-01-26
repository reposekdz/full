const express = require('express');
const router = express.Router();
const { pool: db } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all coaches
router.get('/coaches', async (req, res) => {
  try {
    const [coaches] = await db.query('SELECT * FROM sports_coaches ORDER BY id DESC');
    res.json({ success: true, coaches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create coach
router.post('/coaches', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { name, name_rw, team_id, experience_years, role, role_rw, specialization, bio_rw, image_url } = req.body;
    const [result] = await db.query(
      'INSERT INTO sports_coaches (name, name_rw, team_id, experience_years, role, role_rw, specialization, bio_rw, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, name_rw, team_id, experience_years, role, role_rw, specialization, bio_rw, image_url]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update coach
router.put('/coaches/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { name, name_rw, team_id, experience_years, role, role_rw, specialization, bio_rw, image_url } = req.body;
    await db.query(
      'UPDATE sports_coaches SET name=?, name_rw=?, team_id=?, experience_years=?, role=?, role_rw=?, specialization=?, bio_rw=?, image_url=? WHERE id=?',
      [name, name_rw, team_id, experience_years, role, role_rw, specialization, bio_rw, image_url, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete coach
router.delete('/coaches/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    await db.query('DELETE FROM sports_coaches WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all players
router.get('/players', async (req, res) => {
  try {
    const [players] = await db.query('SELECT * FROM sports_players ORDER BY team_id, jersey_number');
    res.json({ success: true, players });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create player
router.post('/players', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { name, name_rw, team_id, jersey_number, position, position_rw, class: playerClass, height, is_captain, image_url } = req.body;
    const [result] = await db.query(
      'INSERT INTO sports_players (name, name_rw, team_id, jersey_number, position, position_rw, class, height, is_captain, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, name_rw, team_id, jersey_number, position, position_rw, playerClass, height, is_captain || false, image_url]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update player
router.put('/players/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { name, name_rw, team_id, jersey_number, position, position_rw, class: playerClass, height, is_captain, image_url } = req.body;
    await db.query(
      'UPDATE sports_players SET name=?, name_rw=?, team_id=?, jersey_number=?, position=?, position_rw=?, class=?, height=?, is_captain=?, image_url=? WHERE id=?',
      [name, name_rw, team_id, jersey_number, position, position_rw, playerClass, height, is_captain, image_url, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete player
router.delete('/players/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    await db.query('DELETE FROM sports_players WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all achievements
router.get('/achievements', async (req, res) => {
  try {
    const [achievements] = await db.query('SELECT * FROM sports_achievements ORDER BY achievement_date DESC');
    res.json({ success: true, achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create achievement
router.post('/achievements', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { team_id, title, title_rw, description_rw, competition_name, competition_name_rw, position, achievement_date, icon } = req.body;
    const [result] = await db.query(
      'INSERT INTO sports_achievements (team_id, title, title_rw, description_rw, competition_name, competition_name_rw, position, achievement_date, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [team_id, title, title_rw, description_rw, competition_name, competition_name_rw, position, achievement_date, icon]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update achievement
router.put('/achievements/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { team_id, title, title_rw, description_rw, competition_name, competition_name_rw, position, achievement_date, icon } = req.body;
    await db.query(
      'UPDATE sports_achievements SET team_id=?, title=?, title_rw=?, description_rw=?, competition_name=?, competition_name_rw=?, position=?, achievement_date=?, icon=? WHERE id=?',
      [team_id, title, title_rw, description_rw, competition_name, competition_name_rw, position, achievement_date, icon, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete achievement
router.delete('/achievements/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    await db.query('DELETE FROM sports_achievements WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all matches
router.get('/matches', async (req, res) => {
  try {
    const [matches] = await db.query('SELECT * FROM sports_matches ORDER BY match_date DESC');
    res.json({ success: true, matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create match
router.post('/matches', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { team_id, opponent, our_score, opponent_score, match_date, match_time, location, location_rw, result } = req.body;
    const [result_db] = await db.query(
      'INSERT INTO sports_matches (team_id, opponent, our_score, opponent_score, match_date, match_time, location, location_rw, result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [team_id, opponent, our_score, opponent_score, match_date, match_time, location, location_rw, result]
    );
    res.json({ success: true, id: result_db.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update match
router.put('/matches/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { team_id, opponent, our_score, opponent_score, match_date, match_time, location, location_rw, result } = req.body;
    await db.query(
      'UPDATE sports_matches SET team_id=?, opponent=?, our_score=?, opponent_score=?, match_date=?, match_time=?, location=?, location_rw=?, result=? WHERE id=?',
      [team_id, opponent, our_score, opponent_score, match_date, match_time, location, location_rw, result, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete match
router.delete('/matches/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    await db.query('DELETE FROM sports_matches WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update team
router.put('/teams/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { name, name_rw, sport_type, icon } = req.body;
    await db.query(
      'UPDATE sports_teams SET name=?, name_rw=?, sport_type=?, icon=? WHERE id=?',
      [name, name_rw, sport_type, icon, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create team
router.post('/teams', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { name, name_rw, sport_type, icon } = req.body;
    const [result] = await db.query(
      'INSERT INTO sports_teams (name, name_rw, sport_type, icon) VALUES (?, ?, ?, ?)',
      [name, name_rw, sport_type, icon]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete team
router.delete('/teams/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    await db.query('DELETE FROM sports_teams WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get team overview content
router.get('/teams/:id/overview', async (req, res) => {
  try {
    const [content] = await db.query('SELECT * FROM sports_team_overview WHERE team_id=? ORDER BY sort_order', [req.params.id]);
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create overview content
router.post('/teams/:id/overview', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { content_type, title, title_rw, description, description_rw, image_url, icon, value, color, sort_order } = req.body;
    const [result] = await db.query(
      'INSERT INTO sports_team_overview (team_id, content_type, title, title_rw, description, description_rw, image_url, icon, value, color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.params.id, content_type, title, title_rw, description, description_rw, image_url, icon, value, color, sort_order]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update overview content
router.put('/overview/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { content_type, title, title_rw, description, description_rw, image_url, icon, value, color, sort_order } = req.body;
    await db.query(
      'UPDATE sports_team_overview SET content_type=?, title=?, title_rw=?, description=?, description_rw=?, image_url=?, icon=?, value=?, color=?, sort_order=? WHERE id=?',
      [content_type, title, title_rw, description, description_rw, image_url, icon, value, color, sort_order, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete overview content
router.delete('/overview/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    await db.query('DELETE FROM sports_team_overview WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
