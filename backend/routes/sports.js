const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all teams
router.get('/teams', async (req, res) => {
  try {
    const [teams] = await pool.query(`
      SELECT t.*, 
        (SELECT COUNT(*) FROM sports_achievements WHERE team_id = t.id) as achievements_count
      FROM sports_teams t
      WHERE t.is_active = true
      ORDER BY t.id
    `);
    
    // Get achievements for each team
    for (let team of teams) {
      const [achievements] = await pool.query(
        'SELECT title, year FROM sports_achievements WHERE team_id = ? ORDER BY year DESC',
        [team.id]
      );
      team.achievements = achievements;
    }
    
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Error fetching teams' });
  }
});

// Get single team
router.get('/teams/:id', async (req, res) => {
  try {
    const [teams] = await pool.query(
      'SELECT * FROM sports_teams WHERE id = ? AND is_active = true',
      [req.params.id]
    );
    
    if (teams.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    const team = teams[0];
    
    // Get achievements
    const [achievements] = await pool.query(
      'SELECT * FROM sports_achievements WHERE team_id = ? ORDER BY year DESC',
      [team.id]
    );
    team.achievements = achievements;
    
    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Error fetching team' });
  }
});

// Get all matches
router.get('/matches', async (req, res) => {
  try {
    const { upcoming } = req.query;
    let query = 'SELECT * FROM sports_matches WHERE 1=1';
    const params = [];
    
    if (upcoming === 'true') {
      query += ' AND is_upcoming = true';
    } else if (upcoming === 'false') {
      query += ' AND is_upcoming = false';
    }
    
    query += ' ORDER BY match_date DESC';
    
    const [matches] = await pool.query(query, params);
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Error fetching matches' });
  }
});

// Admin: Create team
router.post('/admin/teams', async (req, res) => {
  try {
    const { name, sport, players_count, wins, losses, draws, founded_year, coach, captain, description_rw, description_en, image_url } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO sports_teams (name, sport, players_count, wins, losses, draws, founded_year, coach, captain, description_rw, description_en, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, sport, players_count || 0, wins || 0, losses || 0, draws || 0, founded_year, coach, captain, description_rw, description_en, image_url]
    );
    
    res.status(201).json({ message: 'Team created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Error creating team' });
  }
});

// Admin: Update team
router.put('/admin/teams/:id', async (req, res) => {
  try {
    const { name, sport, players_count, wins, losses, draws, founded_year, coach, captain, description_rw, description_en, image_url } = req.body;
    
    await pool.query(
      'UPDATE sports_teams SET name = ?, sport = ?, players_count = ?, wins = ?, losses = ?, draws = ?, founded_year = ?, coach = ?, captain = ?, description_rw = ?, description_en = ?, image_url = ? WHERE id = ?',
      [name, sport, players_count, wins, losses, draws, founded_year, coach, captain, description_rw, description_en, image_url, req.params.id]
    );
    
    res.json({ message: 'Team updated successfully' });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Error updating team' });
  }
});

// Admin: Delete team
router.delete('/admin/teams/:id', async (req, res) => {
  try {
    await pool.query('UPDATE sports_teams SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Error deleting team' });
  }
});

// Admin: Create match
router.post('/admin/matches', async (req, res) => {
  try {
    const { team_id, team_name, opponent, score, result, match_date, match_time, venue, sport, is_upcoming } = req.body;
    
    const [matchResult] = await pool.query(
      'INSERT INTO sports_matches (team_id, team_name, opponent, score, result, match_date, match_time, venue, sport, is_upcoming) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [team_id, team_name, opponent, score, result, match_date, match_time, venue, sport, is_upcoming]
    );
    
    res.status(201).json({ message: 'Match created successfully', id: matchResult.insertId });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ message: 'Error creating match' });
  }
});

// Admin: Update match
router.put('/admin/matches/:id', async (req, res) => {
  try {
    const { team_id, team_name, opponent, score, result, match_date, match_time, venue, sport, is_upcoming } = req.body;
    
    await pool.query(
      'UPDATE sports_matches SET team_id = ?, team_name = ?, opponent = ?, score = ?, result = ?, match_date = ?, match_time = ?, venue = ?, sport = ?, is_upcoming = ? WHERE id = ?',
      [team_id, team_name, opponent, score, result, match_date, match_time, venue, sport, is_upcoming, req.params.id]
    );
    
    res.json({ message: 'Match updated successfully' });
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ message: 'Error updating match' });
  }
});

// Admin: Delete match
router.delete('/admin/matches/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM sports_matches WHERE id = ?', [req.params.id]);
    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ message: 'Error deleting match' });
  }
});

// Admin: Add achievement
router.post('/admin/achievements', async (req, res) => {
  try {
    const { team_id, title, description, year, image_url } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO sports_achievements (team_id, title, description, year, image_url) VALUES (?, ?, ?, ?, ?)',
      [team_id, title, description, year, image_url]
    );
    
    res.status(201).json({ message: 'Achievement added successfully', id: result.insertId });
  } catch (error) {
    console.error('Error adding achievement:', error);
    res.status(500).json({ message: 'Error adding achievement' });
  }
});

module.exports = router;
