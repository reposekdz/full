const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configure multer for sports images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/sports/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image files allowed'));
  }
});

// Get all matches
router.get('/matches', async (req, res) => {
  try {
    const [matches] = await db.query(`
      SELECT m.*, t1.name as home_team, t2.name as away_team,
             t1.logo as home_logo, t2.logo as away_logo
      FROM matches m
      LEFT JOIN teams t1 ON m.home_team_id = t1.id
      LEFT JOIN teams t2 ON m.away_team_id = t2.id
      ORDER BY m.match_date DESC
    `);
    res.json({ success: true, matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create match
router.post('/matches', async (req, res) => {
  try {
    const { home_team_id, away_team_id, match_date, venue, sport_type, competition, status } = req.body;
    const [result] = await db.query(
      `INSERT INTO matches (home_team_id, away_team_id, match_date, venue, sport_type, competition, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [home_team_id, away_team_id, match_date, venue, sport_type, competition, status || 'scheduled']
    );
    res.json({ success: true, matchId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update match result
router.put('/matches/:id/result', async (req, res) => {
  try {
    const { home_score, away_score, status } = req.body;
    await db.query(
      `UPDATE matches SET home_score = ?, away_score = ?, status = ? WHERE id = ?`,
      [home_score, away_score, status || 'completed', req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all players
router.get('/players', async (req, res) => {
  try {
    const { sport_type, team_id } = req.query;
    let query = `SELECT p.*, t.name as team_name FROM players p LEFT JOIN teams t ON p.team_id = t.id WHERE 1=1`;
    const params = [];
    
    if (sport_type) {
      query += ` AND p.sport_type = ?`;
      params.push(sport_type);
    }
    if (team_id) {
      query += ` AND p.team_id = ?`;
      params.push(team_id);
    }
    
    query += ` ORDER BY p.jersey_number`;
    const [players] = await db.query(query, params);
    res.json({ success: true, players });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add player with image
router.post('/players', upload.single('image'), async (req, res) => {
  try {
    const { name, jersey_number, position, team_id, sport_type, date_of_birth, height, weight } = req.body;
    const image = req.file ? `/uploads/sports/${req.file.filename}` : null;
    
    const [result] = await db.query(
      `INSERT INTO players (name, jersey_number, position, team_id, sport_type, image, date_of_birth, height, weight) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, jersey_number, position, team_id, sport_type, image, date_of_birth, height, weight]
    );
    res.json({ success: true, playerId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update player
router.put('/players/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, jersey_number, position, team_id, date_of_birth, height, weight } = req.body;
    let query = `UPDATE players SET name = ?, jersey_number = ?, position = ?, team_id = ?, date_of_birth = ?, height = ?, weight = ?`;
    const params = [name, jersey_number, position, team_id, date_of_birth, height, weight];
    
    if (req.file) {
      query += `, image = ?`;
      params.push(`/uploads/sports/${req.file.filename}`);
    }
    
    query += ` WHERE id = ?`;
    params.push(req.params.id);
    
    await db.query(query, params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get trophies/cups
router.get('/trophies', async (req, res) => {
  try {
    const [trophies] = await db.query(`
      SELECT * FROM trophies ORDER BY year DESC, date_won DESC
    `);
    res.json({ success: true, trophies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add trophy
router.post('/trophies', upload.single('image'), async (req, res) => {
  try {
    const { name, competition, sport_type, year, date_won, description } = req.body;
    const image = req.file ? `/uploads/sports/${req.file.filename}` : null;
    
    const [result] = await db.query(
      `INSERT INTO trophies (name, competition, sport_type, year, date_won, image, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, competition, sport_type, year, date_won, image, description]
    );
    res.json({ success: true, trophyId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Sports gallery
router.post('/gallery', upload.array('images', 20), async (req, res) => {
  try {
    const { sport_type, event_name, event_date, description } = req.body;
    const images = req.files.map(file => `/uploads/sports/${file.filename}`);
    
    const insertPromises = images.map(image => 
      db.query(
        `INSERT INTO sports_gallery (sport_type, event_name, event_date, image, description) VALUES (?, ?, ?, ?, ?)`,
        [sport_type, event_name, event_date, image, description]
      )
    );
    
    await Promise.all(insertPromises);
    res.json({ success: true, count: images.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get sports gallery
router.get('/gallery', async (req, res) => {
  try {
    const { sport_type } = req.query;
    let query = `SELECT * FROM sports_gallery WHERE 1=1`;
    const params = [];
    
    if (sport_type) {
      query += ` AND sport_type = ?`;
      params.push(sport_type);
    }
    
    query += ` ORDER BY event_date DESC`;
    const [gallery] = await db.query(query, params);
    res.json({ success: true, gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Player statistics
router.post('/players/:id/stats', async (req, res) => {
  try {
    const { match_id, goals, assists, yellow_cards, red_cards, minutes_played } = req.body;
    const [result] = await db.query(
      `INSERT INTO player_stats (player_id, match_id, goals, assists, yellow_cards, red_cards, minutes_played) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, match_id, goals || 0, assists || 0, yellow_cards || 0, red_cards || 0, minutes_played || 0]
    );
    res.json({ success: true, statId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get player statistics
router.get('/players/:id/stats', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT ps.*, m.match_date, m.competition, 
             t1.name as home_team, t2.name as away_team
      FROM player_stats ps
      JOIN matches m ON ps.match_id = m.id
      LEFT JOIN teams t1 ON m.home_team_id = t1.id
      LEFT JOIN teams t2 ON m.away_team_id = t2.id
      WHERE ps.player_id = ?
      ORDER BY m.match_date DESC
    `, [req.params.id]);
    
    const [summary] = await db.query(`
      SELECT 
        COUNT(*) as matches_played,
        SUM(goals) as total_goals,
        SUM(assists) as total_assists,
        SUM(yellow_cards) as total_yellow_cards,
        SUM(red_cards) as total_red_cards,
        SUM(minutes_played) as total_minutes
      FROM player_stats WHERE player_id = ?
    `, [req.params.id]);
    
    res.json({ success: true, stats, summary: summary[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
