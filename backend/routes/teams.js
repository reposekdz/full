const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/sports/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) return cb(null, true);
    cb(new Error('Only images allowed'));
  }
});

// Get all teams
router.get('/', async (req, res) => {
  try {
    const [teams] = await pool.execute(`
      SELECT t.*, 
             COUNT(DISTINCT p.id) as player_count,
             COUNT(DISTINCT m.id) as match_count
      FROM teams t
      LEFT JOIN players p ON t.id = p.team_id
      LEFT JOIN matches m ON t.id = m.home_team_id OR t.id = m.away_team_id
      WHERE t.is_active = 1
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);
    res.json({ success: true, teams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get team by ID with full details
router.get('/:id', async (req, res) => {
  try {
    const [teams] = await pool.execute(`SELECT * FROM teams WHERE id = ?`, [req.params.id]);
    
    if (!teams.length) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    
    const [players] = await pool.execute(`
      SELECT * FROM players WHERE team_id = ? ORDER BY jersey_number
    `, [req.params.id]);
    
    const [matches] = await pool.execute(`
      SELECT * FROM matches 
      WHERE home_team_id = ? OR away_team_id = ?
      ORDER BY match_date DESC
      LIMIT 10
    `, [req.params.id, req.params.id]);
    
    res.json({ 
      success: true, 
      team: teams[0],
      players,
      recentMatches: matches
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create team with logo
router.post('/', upload.single('logo'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const logo = req.file ? `/uploads/sports/${req.file.filename}` : null;
    
    const [result] = await pool.execute(
      `INSERT INTO teams (name, description, logo, is_active) VALUES (?, ?, ?, 1)`,
      [name || 'New Team', description || null, logo]
    );
    res.json({ success: true, teamId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update team
router.put('/:id', upload.single('logo'), async (req, res) => {
  try {
    const { name, sport, coach, captain, description, is_active } = req.body;
    let query = `UPDATE teams SET name = ?, sport = ?, coach = ?, captain = ?, description = ?, is_active = ?`;
    const params = [name, sport, coach, captain, description, is_active !== undefined ? is_active : 1];
    
    if (req.file) {
      query += `, logo = ?`;
      params.push(`/uploads/sports/${req.file.filename}`);
    }
    
    query += ` WHERE id = ?`;
    params.push(req.params.id);
    
    await pool.execute(query, params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete team
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('UPDATE teams SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get team statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT m.id) as total_matches,
        SUM(CASE WHEN (m.home_team_id = ? AND m.home_score > m.away_score) OR (m.away_team_id = ? AND m.away_score > m.home_score) THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN m.home_score = m.away_score THEN 1 ELSE 0 END) as draws,
        SUM(CASE WHEN (m.home_team_id = ? AND m.home_score < m.away_score) OR (m.away_team_id = ? AND m.away_score < m.home_score) THEN 1 ELSE 0 END) as losses,
        SUM(CASE WHEN m.home_team_id = ? THEN m.home_score ELSE m.away_score END) as goals_scored,
        SUM(CASE WHEN m.home_team_id = ? THEN m.away_score ELSE m.home_score END) as goals_conceded
      FROM matches m
      WHERE (m.home_team_id = ? OR m.away_team_id = ?) AND m.status = 'completed'
    `, [req.params.id, req.params.id, req.params.id, req.params.id, req.params.id, req.params.id, req.params.id, req.params.id]);
    
    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
