const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/sports';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `sport-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ============ ADVANCED STATISTICS ============

router.get('/statistics', async (req, res) => {
  try {
    const [teams] = await pool.query('SELECT COUNT(*) as total FROM sports_teams');
    const [players] = await pool.query('SELECT COUNT(*) as total FROM sports_players');
    const [matches] = await pool.query('SELECT COUNT(*) as total FROM sports_matches');
    const [goals] = await pool.query('SELECT COUNT(*) as total FROM sports_goals');
    const [wins] = await pool.query('SELECT SUM(wins) as total FROM sports_teams');
    const [topScorers] = await pool.query(`
      SELECT p.*, COUNT(g.id) as goals_count
      FROM sports_players p
      LEFT JOIN sports_goals g ON p.id = g.player_id
      GROUP BY p.id
      ORDER BY goals_count DESC
      LIMIT 5
    `);

    res.json({
      totalTeams: teams[0].total,
      totalPlayers: players[0].total,
      totalMatches: matches[0].total,
      totalGoals: goals[0].total,
      totalWins: wins[0].total || 0,
      topScorers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ TEAM MANAGEMENT ============

router.post('/teams', upload.single('logo'), async (req, res) => {
  try {
    const { name, sport, coach, description, founded_year } = req.body;
    const logo_url = req.file ? `/uploads/sports/${req.file.filename}` : null;
    
    const [result] = await pool.query(
      'INSERT INTO sports_teams (name, sport, coach, description, logo_url, founded_year) VALUES (?, ?, ?, ?, ?, ?)',
      [name, sport, coach, description, logo_url, founded_year]
    );
    
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/teams/:id', upload.single('logo'), async (req, res) => {
  try {
    const { name, sport, coach, description, founded_year, wins, losses, draws } = req.body;
    let query = 'UPDATE sports_teams SET name=?, sport=?, coach=?, description=?, founded_year=?, wins=?, losses=?, draws=?';
    let params = [name, sport, coach, description, founded_year, wins || 0, losses || 0, draws || 0];
    
    if (req.file) {
      query += ', logo_url=?';
      params.push(`/uploads/sports/${req.file.filename}`);
    }
    
    query += ' WHERE id=?';
    params.push(req.params.id);
    
    await pool.query(query, params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/teams/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM sports_teams WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PLAYER MANAGEMENT ============

router.post('/players', upload.single('photo'), async (req, res) => {
  try {
    const { team_id, name, jersey_number, position, age, class_level, height, weight, nationality } = req.body;
    const photo_url = req.file ? `/uploads/sports/${req.file.filename}` : null;
    
    const [result] = await pool.query(
      'INSERT INTO sports_players (team_id, name, jersey_number, position, age, class_level, photo_url, height, weight, nationality) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [team_id, name, jersey_number, position, age, class_level, photo_url, height, weight, nationality]
    );
    
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/players/:id', upload.single('photo'), async (req, res) => {
  try {
    const { name, jersey_number, position, age, class_level, goals, assists, matches_played, height, weight, nationality } = req.body;
    let query = 'UPDATE sports_players SET name=?, jersey_number=?, position=?, age=?, class_level=?, goals=?, assists=?, matches_played=?, height=?, weight=?, nationality=?';
    let params = [name, jersey_number, position, age, class_level, goals || 0, assists || 0, matches_played || 0, height, weight, nationality];
    
    if (req.file) {
      query += ', photo_url=?';
      params.push(`/uploads/sports/${req.file.filename}`);
    }
    
    query += ' WHERE id=?';
    params.push(req.params.id);
    
    await pool.query(query, params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/players/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM sports_players WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ MATCH MANAGEMENT ============

router.post('/matches', async (req, res) => {
  try {
    const { team1_id, team2_id, match_date, location, competition, team1_score, team2_score, status, notes } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO sports_matches (team1_id, team2_id, match_date, location, competition, team1_score, team2_score, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [team1_id, team2_id, match_date, location, competition, team1_score || 0, team2_score || 0, status || 'scheduled', notes]
    );
    
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/matches/:id', async (req, res) => {
  try {
    const { match_date, location, competition, team1_score, team2_score, status, notes } = req.body;
    
    await pool.query(
      'UPDATE sports_matches SET match_date=?, location=?, competition=?, team1_score=?, team2_score=?, status=?, notes=? WHERE id=?',
      [match_date, location, competition, team1_score, team2_score, status, notes, req.params.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/matches/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM sports_matches WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GOAL TRACKING ============

router.post('/goals', async (req, res) => {
  try {
    const { match_id, player_id, minute, goal_type, assisted_by } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO sports_goals (match_id, player_id, minute, goal_type, assisted_by) VALUES (?, ?, ?, ?, ?)',
      [match_id, player_id, minute, goal_type, assisted_by]
    );
    
    // Update player goals count
    await pool.query('UPDATE sports_players SET goals = goals + 1 WHERE id = ?', [player_id]);
    if (assisted_by) {
      await pool.query('UPDATE sports_players SET assists = assists + 1 WHERE id = ?', [assisted_by]);
    }
    
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/goals/:id', async (req, res) => {
  try {
    const [goal] = await pool.query('SELECT player_id, assisted_by FROM sports_goals WHERE id = ?', [req.params.id]);
    
    if (goal.length > 0) {
      await pool.query('UPDATE sports_players SET goals = goals - 1 WHERE id = ?', [goal[0].player_id]);
      if (goal[0].assisted_by) {
        await pool.query('UPDATE sports_players SET assists = assists - 1 WHERE id = ?', [goal[0].assisted_by]);
      }
    }
    
    await pool.query('DELETE FROM sports_goals WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ TEAM PERFORMANCE ============

router.get('/teams/:id/performance', async (req, res) => {
  try {
    const [matches] = await pool.query(`
      SELECT * FROM sports_matches 
      WHERE (team1_id = ? OR team2_id = ?) AND status = 'completed'
      ORDER BY match_date DESC
    `, [req.params.id, req.params.id]);
    
    const [players] = await pool.query('SELECT * FROM sports_players WHERE team_id = ?', [req.params.id]);
    
    const [goals] = await pool.query(`
      SELECT g.*, p.name as player_name, m.match_date
      FROM sports_goals g
      JOIN sports_players p ON g.player_id = p.id
      JOIN sports_matches m ON g.match_id = m.id
      WHERE p.team_id = ?
      ORDER BY m.match_date DESC
    `, [req.params.id]);
    
    res.json({ matches, players, goals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
