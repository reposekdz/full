const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all sports teams
router.get('/teams', async (req, res) => {
  try {
    const { sport_type } = req.query;
    let query = `
      SELECT t.*, 
             COUNT(DISTINCT p.id) as player_count
      FROM teams t
      LEFT JOIN players p ON t.id = p.team_id
      WHERE t.status = 'active'
    `;
    const params = [];
    
    if (sport_type) {
      query += ` AND t.sport_type = ?`;
      params.push(sport_type);
    }
    
    query += ` GROUP BY t.id ORDER BY t.name`;
    const [teams] = await pool.execute(query, params);
    res.json({ success: true, teams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get sports statistics
router.get('/statistics', async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM teams WHERE status = 'active') as total_teams,
        (SELECT COUNT(*) FROM players WHERE status = 'active') as total_players,
        (SELECT COUNT(*) FROM matches WHERE status = 'completed') as completed_matches,
        (SELECT COUNT(*) FROM trophies) as total_trophies,
        (SELECT COUNT(*) FROM matches WHERE status = 'scheduled' AND match_date >= CURDATE()) as upcoming_matches
    `);
    res.json({ success: true, statistics: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get upcoming matches
router.get('/matches/upcoming', async (req, res) => {
  try {
    const { limit = 10, sport_type } = req.query;
    let query = `
      SELECT m.*, 
             t1.name as home_team, t1.logo as home_logo,
             t2.name as away_team, t2.logo as away_logo
      FROM matches m
      JOIN teams t1 ON m.home_team_id = t1.id
      JOIN teams t2 ON m.away_team_id = t2.id
      WHERE m.match_date >= CURDATE() AND m.status = 'scheduled'
    `;
    const params = [];
    
    if (sport_type) {
      query += ` AND m.sport_type = ?`;
      params.push(sport_type);
    }
    
    query += ` ORDER BY m.match_date ASC LIMIT ?`;
    params.push(parseInt(limit));
    
    const [matches] = await pool.execute(query, params);
    res.json({ success: true, matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get recent results
router.get('/matches/results', async (req, res) => {
  try {
    const { limit = 10, sport_type } = req.query;
    let query = `
      SELECT m.*, 
             t1.name as home_team, t1.logo as home_logo,
             t2.name as away_team, t2.logo as away_logo
      FROM matches m
      JOIN teams t1 ON m.home_team_id = t1.id
      JOIN teams t2 ON m.away_team_id = t2.id
      WHERE m.status = 'completed'
    `;
    const params = [];
    
    if (sport_type) {
      query += ` AND m.sport_type = ?`;
      params.push(sport_type);
    }
    
    query += ` ORDER BY m.match_date DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const [matches] = await pool.execute(query, params);
    res.json({ success: true, matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get top players
router.get('/players/top', async (req, res) => {
  try {
    const { sport_type, limit = 10 } = req.query;
    let query = `
      SELECT p.*, t.name as team_name,
             SUM(ps.goals) as total_goals,
             SUM(ps.assists) as total_assists,
             COUNT(DISTINCT ps.match_id) as matches_played
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      LEFT JOIN player_stats ps ON p.id = ps.player_id
      WHERE p.status = 'active'
    `;
    const params = [];
    
    if (sport_type) {
      query += ` AND p.sport_type = ?`;
      params.push(sport_type);
    }
    
    query += ` GROUP BY p.id ORDER BY total_goals DESC, total_assists DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const [players] = await pool.execute(query, params);
    res.json({ success: true, players });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get trophies showcase
router.get('/trophies', async (req, res) => {
  try {
    const { sport_type, year } = req.query;
    let query = `SELECT * FROM trophies WHERE 1=1`;
    const params = [];
    
    if (sport_type) {
      query += ` AND sport_type = ?`;
      params.push(sport_type);
    }
    if (year) {
      query += ` AND year = ?`;
      params.push(year);
    }
    
    query += ` ORDER BY year DESC, date_won DESC`;
    const [trophies] = await pool.execute(query, params);
    res.json({ success: true, trophies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get sports gallery
router.get('/gallery', async (req, res) => {
  try {
    const { sport_type, limit = 20 } = req.query;
    let query = `SELECT * FROM sports_gallery WHERE 1=1`;
    const params = [];
    
    if (sport_type) {
      query += ` AND sport_type = ?`;
      params.push(sport_type);
    }
    
    query += ` ORDER BY event_date DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const [gallery] = await pool.execute(query, params);
    res.json({ success: true, gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get sports by type
router.get('/by-type/:sportType', async (req, res) => {
  try {
    const { sportType } = req.params;
    
    const [teams] = await pool.execute(`SELECT * FROM teams WHERE sport_type = ? AND status = 'active'`, [sportType]);
    const [players] = await pool.execute(`SELECT * FROM players WHERE sport_type = ? AND status = 'active' LIMIT 20`, [sportType]);
    const [matches] = await pool.execute(`
      SELECT m.*, t1.name as home_team, t2.name as away_team
      FROM matches m
      JOIN teams t1 ON m.home_team_id = t1.id
      JOIN teams t2 ON m.away_team_id = t2.id
      WHERE m.sport_type = ?
      ORDER BY m.match_date DESC
      LIMIT 10
    `, [sportType]);
    const [trophies] = await pool.execute(`SELECT * FROM trophies WHERE sport_type = ? ORDER BY year DESC`, [sportType]);
    
    res.json({ 
      success: true, 
      sportType,
      teams,
      players,
      recentMatches: matches,
      trophies
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
