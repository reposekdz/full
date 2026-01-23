const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all players
router.get('/players', async (req, res) => {
  try {
    const { team_id } = req.query;
    let query = `
      SELECT p.*, t.name as team_name, t.sport 
      FROM sports_players p 
      LEFT JOIN sports_teams t ON p.team_id = t.id 
      WHERE p.is_active = true
    `;
    const params = [];
    
    if (team_id) {
      query += ' AND p.team_id = ?';
      params.push(team_id);
    }
    
    query += ' ORDER BY p.is_captain DESC, p.jersey_number';
    
    const [players] = await pool.query(query, params);
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET player by ID
router.get('/players/:id', async (req, res) => {
  try {
    const [players] = await pool.query(`
      SELECT p.*, t.name as team_name, t.sport 
      FROM sports_players p 
      LEFT JOIN sports_teams t ON p.team_id = t.id 
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (players.length === 0) return res.status(404).json({ error: 'Player not found' });
    res.json(players[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all goals
router.get('/goals', async (req, res) => {
  try {
    const { match_id, team_id, player_id } = req.query;
    let query = `
      SELECT g.*, 
             p.name as player_name, p.jersey_number,
             a.name as assist_name,
             t.name as team_name,
             m.opponent, m.match_date
      FROM sports_goals g
      LEFT JOIN sports_players p ON g.player_id = p.id
      LEFT JOIN sports_players a ON g.assisted_by = a.id
      LEFT JOIN sports_teams t ON g.team_id = t.id
      LEFT JOIN sports_matches m ON g.match_id = m.id
      WHERE 1=1
    `;
    const params = [];
    
    if (match_id) {
      query += ' AND g.match_id = ?';
      params.push(match_id);
    }
    if (team_id) {
      query += ' AND g.team_id = ?';
      params.push(team_id);
    }
    if (player_id) {
      query += ' AND g.player_id = ?';
      params.push(player_id);
    }
    
    query += ' ORDER BY g.created_at DESC';
    
    const [goals] = await pool.query(query, params);
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create player (admin)
router.post('/players', async (req, res) => {
  try {
    const { team_id, name, jersey_number, position, age, class: playerClass, image_url, is_captain } = req.body;
    
    const [result] = await pool.query(`
      INSERT INTO sports_players (team_id, name, jersey_number, position, age, class, image_url, is_captain)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [team_id, name, jersey_number, position, age, playerClass, image_url, is_captain || false]);
    
    res.json({ id: result.insertId, message: 'Player created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update player (admin)
router.put('/players/:id', async (req, res) => {
  try {
    const { name, jersey_number, position, age, class: playerClass, image_url, goals_scored, assists, matches_played, is_captain } = req.body;
    
    await pool.query(`
      UPDATE sports_players 
      SET name = ?, jersey_number = ?, position = ?, age = ?, class = ?, image_url = ?, 
          goals_scored = ?, assists = ?, matches_played = ?, is_captain = ?
      WHERE id = ?
    `, [name, jersey_number, position, age, playerClass, image_url, goals_scored, assists, matches_played, is_captain, req.params.id]);
    
    res.json({ message: 'Player updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE player (admin)
router.delete('/players/:id', async (req, res) => {
  try {
    await pool.query('UPDATE sports_players SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create goal (admin)
router.post('/goals', async (req, res) => {
  try {
    const { match_id, player_id, team_id, minute, goal_type, assisted_by } = req.body;
    
    const [result] = await pool.query(`
      INSERT INTO sports_goals (match_id, player_id, team_id, minute, goal_type, assisted_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [match_id, player_id, team_id, minute, goal_type, assisted_by]);
    
    // Update player stats
    await pool.query('UPDATE sports_players SET goals_scored = goals_scored + 1 WHERE id = ?', [player_id]);
    if (assisted_by) {
      await pool.query('UPDATE sports_players SET assists = assists + 1 WHERE id = ?', [assisted_by]);
    }
    
    res.json({ id: result.insertId, message: 'Goal recorded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET team statistics
router.get('/teams/:id/stats', async (req, res) => {
  try {
    const [players] = await pool.query(`
      SELECT COUNT(*) as total_players,
             SUM(goals_scored) as total_goals,
             SUM(assists) as total_assists,
             AVG(age) as avg_age
      FROM sports_players 
      WHERE team_id = ? AND is_active = true
    `, [req.params.id]);
    
    const [topScorers] = await pool.query(`
      SELECT name, jersey_number, position, goals_scored, assists
      FROM sports_players 
      WHERE team_id = ? AND is_active = true
      ORDER BY goals_scored DESC
      LIMIT 5
    `, [req.params.id]);
    
    res.json({
      stats: players[0],
      topScorers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
