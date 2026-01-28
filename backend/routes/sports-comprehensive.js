const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============ FILE UPLOAD CONFIGURATION ============
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/sports';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `sport-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'));
    }
  }
});

// ============ ADMIN DASHBOARD & STATISTICS ============

// Comprehensive dashboard statistics
router.get('/admin/dashboard', authenticateToken, requireRole('admin', 'headmaster', 'dos'), async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Overall statistics
    const [teamStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_teams,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_teams,
        COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_teams
      FROM sports_teams
    `);
    
    const [playerStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_players,
        COUNT(CASE WHEN is_captain = 1 THEN 1 END) as total_captains,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_players
      FROM sports_players
    `);
    
    const [matchStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_matches,
        COUNT(CASE WHEN result = 'win' THEN 1 END) as total_wins,
        COUNT(CASE WHEN result = 'loss' THEN 1 END) as total_losses,
        COUNT(CASE WHEN result = 'draw' THEN 1 END) as total_draws,
        SUM(our_score) as total_goals_scored,
        SUM(opponent_score) as total_goals_conceded
      FROM sports_matches
    `);
    
    const [achievementStats] = await connection.execute(`
      SELECT COUNT(*) as total_achievements FROM sports_achievements
    `);
    
    const [eventStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming_events,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_events
      FROM sports_events
    `);
    
    // Recent matches
    const [recentMatches] = await connection.execute(`
      SELECT 
        sm.*,
        st.name as team_name,
        st.image_url as team_logo
      FROM sports_matches sm
      JOIN sports_teams st ON sm.team_id = st.id
      ORDER BY sm.match_date DESC, sm.match_time DESC
      LIMIT 10
    `);
    
    // Top performing teams
    const [topTeams] = await connection.execute(`
      SELECT 
        st.*,
        COUNT(DISTINCT sp.id) as player_count,
        COUNT(DISTINCT sa.id) as achievement_count,
        (SELECT COUNT(*) FROM sports_matches WHERE team_id = st.id AND result = 'win') as wins,
        (SELECT COUNT(*) FROM sports_matches WHERE team_id = st.id AND result = 'loss') as losses,
        (SELECT COUNT(*) FROM sports_matches WHERE team_id = st.id AND result = 'draw') as draws,
        (SELECT SUM(our_score) FROM sports_matches WHERE team_id = st.id) as goals_for,
        (SELECT SUM(opponent_score) FROM sports_matches WHERE team_id = st.id) as goals_against
      FROM sports_teams st
      LEFT JOIN sports_players sp ON st.id = sp.team_id AND sp.is_active = 1
      LEFT JOIN sports_achievements sa ON st.id = sa.team_id
      WHERE st.is_active = 1
      GROUP BY st.id
      ORDER BY wins DESC, goals_for DESC
      LIMIT 5
    `);
    
    // Top players (most active)
    const [topPlayers] = await connection.execute(`
      SELECT 
        sp.*,
        st.name as team_name,
        st.sport_type
      FROM sports_players sp
      JOIN sports_teams st ON sp.team_id = st.id
      WHERE sp.is_active = 1
      ORDER BY sp.is_captain DESC, sp.created_at DESC
      LIMIT 10
    `);
    
    // Upcoming events
    const [upcomingEvents] = await connection.execute(`
      SELECT * FROM sports_events
      WHERE status = 'upcoming' AND event_date >= CURDATE()
      ORDER BY event_date ASC
      LIMIT 5
    `);
    
    connection.release();
    
    res.json({
      success: true,
      dashboard: {
        overview: {
          teams: teamStats[0],
          players: playerStats[0],
          matches: matchStats[0],
          achievements: achievementStats[0],
          events: eventStats[0]
        },
        recentMatches,
        topTeams,
        topPlayers,
        upcomingEvents
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ TEAMS MANAGEMENT ============

// Get all teams with full details
router.get('/admin/teams', authenticateToken, async (req, res) => {
  try {
    const { sport_type, is_active, search } = req.query;
    
    let query = `
      SELECT 
        st.*,
        COUNT(DISTINCT sp.id) as total_players,
        COUNT(DISTINCT sa.id) as total_achievements,
        COUNT(DISTINCT sc.id) as total_coaches,
        (SELECT COUNT(*) FROM sports_matches WHERE team_id = st.id AND result = 'win') as wins,
        (SELECT COUNT(*) FROM sports_matches WHERE team_id = st.id AND result = 'loss') as losses,
        (SELECT COUNT(*) FROM sports_matches WHERE team_id = st.id AND result = 'draw') as draws,
        (SELECT COUNT(*) FROM sports_matches WHERE team_id = st.id) as total_matches
      FROM sports_teams st
      LEFT JOIN sports_players sp ON st.id = sp.team_id AND sp.is_active = 1
      LEFT JOIN sports_achievements sa ON st.id = sa.team_id
      LEFT JOIN sports_coaches sc ON st.id = sc.team_id AND sc.is_active = 1
      WHERE 1=1
    `;
    
    const params = [];
    
    if (sport_type) {
      query += ' AND st.sport_type = ?';
      params.push(sport_type);
    }
    
    if (is_active !== undefined) {
      query += ' AND st.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }
    
    if (search) {
      query += ' AND (st.name LIKE ? OR st.name_en LIKE ? OR st.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ' GROUP BY st.id ORDER BY st.created_at DESC';
    
    const [teams] = await pool.execute(query, params);
    
    res.json({ success: true, teams, total: teams.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new team
router.post('/admin/teams', authenticateToken, requireRole('admin', 'headmaster'), upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      name_en,
      sport_type,
      description,
      description_en,
      icon,
      founded_year,
      is_active
    } = req.body;
    
    const image_url = req.file ? `/uploads/sports/${req.file.filename}` : null;
    
    const [result] = await pool.execute(`
      INSERT INTO sports_teams (
        name, name_en, sport_type, description, description_en,
        icon, image_url, founded_year, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, name_en, sport_type, description, description_en,
      icon, image_url, founded_year, is_active !== undefined ? is_active : 1
    ]);
    
    res.json({
      success: true,
      message: 'Team created successfully',
      team_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update team
router.put('/admin/teams/:id', authenticateToken, requireRole('admin', 'headmaster'), upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      name_en,
      sport_type,
      description,
      description_en,
      icon,
      founded_year,
      is_active
    } = req.body;
    
    let query = `
      UPDATE sports_teams SET
        name = ?, name_en = ?, sport_type = ?, description = ?,
        description_en = ?, icon = ?, founded_year = ?, is_active = ?
    `;
    
    const params = [
      name, name_en, sport_type, description,
      description_en, icon, founded_year, is_active
    ];
    
    if (req.file) {
      query += ', image_url = ?';
      params.push(`/uploads/sports/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    
    res.json({ success: true, message: 'Team updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete team
router.delete('/admin/teams/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    // Check if team has players or matches
    const [players] = await pool.execute('SELECT COUNT(*) as count FROM sports_players WHERE team_id = ?', [req.params.id]);
    const [matches] = await pool.execute('SELECT COUNT(*) as count FROM sports_matches WHERE team_id = ?', [req.params.id]);
    
    if (players[0].count > 0 || matches[0].count > 0) {
      // Soft delete
      await pool.execute('UPDATE sports_teams SET is_active = 0 WHERE id = ?', [req.params.id]);
      return res.json({ success: true, message: 'Team deactivated (has associated data)' });
    }
    
    // Hard delete
    await pool.execute('DELETE FROM sports_teams WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ PLAYERS MANAGEMENT ============

// Get all players
router.get('/admin/players', authenticateToken, async (req, res) => {
  try {
    const { team_id, position, is_active, is_captain, search } = req.query;
    
    let query = `
      SELECT 
        sp.*,
        st.name as team_name,
        st.sport_type,
        st.image_url as team_logo
      FROM sports_players sp
      JOIN sports_teams st ON sp.team_id = st.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (team_id) {
      query += ' AND sp.team_id = ?';
      params.push(team_id);
    }
    
    if (position) {
      query += ' AND sp.position = ?';
      params.push(position);
    }
    
    if (is_active !== undefined) {
      query += ' AND sp.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }
    
    if (is_captain !== undefined) {
      query += ' AND sp.is_captain = ?';
      params.push(is_captain === 'true' ? 1 : 0);
    }
    
    if (search) {
      query += ' AND (sp.name LIKE ? OR sp.name_rw LIKE ? OR sp.jersey_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY sp.team_id, sp.is_captain DESC, sp.jersey_number ASC';
    
    const [players] = await pool.execute(query, params);
    
    res.json({ success: true, players, total: players.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new player
router.post('/admin/players', authenticateToken, requireRole('admin', 'headmaster'), upload.single('image'), async (req, res) => {
  try {
    const {
      team_id,
      name,
      name_rw,
      jersey_number,
      position,
      position_rw,
      date_of_birth,
      height,
      weight,
      class: playerClass,
      is_captain,
      is_active,
      joined_date
    } = req.body;
    
    const image_url = req.file ? `/uploads/sports/${req.file.filename}` : null;
    
    // If setting as captain, remove captain status from other players in team
    if (is_captain === 'true' || is_captain === true || is_captain === 1) {
      await pool.execute('UPDATE sports_players SET is_captain = 0 WHERE team_id = ?', [team_id]);
    }
    
    const [result] = await pool.execute(`
      INSERT INTO sports_players (
        team_id, name, name_rw, jersey_number, position, position_rw,
        date_of_birth, height, weight, class, is_captain, is_active, image_url, joined_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      team_id, name, name_rw, jersey_number, position, position_rw,
      date_of_birth || null, height || null, weight || null, playerClass || null,
      is_captain || 0, is_active !== undefined ? is_active : 1, image_url, joined_date || new Date()
    ]);
    
    res.json({
      success: true,
      message: 'Player created successfully',
      player_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update player
router.put('/admin/players/:id', authenticateToken, requireRole('admin', 'headmaster'), upload.single('image'), async (req, res) => {
  try {
    const {
      team_id,
      name,
      name_rw,
      jersey_number,
      position,
      position_rw,
      date_of_birth,
      height,
      weight,
      class: playerClass,
      is_captain,
      is_active
    } = req.body;
    
    // If setting as captain, remove captain status from other players in team
    if (is_captain === 'true' || is_captain === true || is_captain === 1) {
      await pool.execute('UPDATE sports_players SET is_captain = 0 WHERE team_id = ? AND id != ?', [team_id, req.params.id]);
    }
    
    let query = `
      UPDATE sports_players SET
        team_id = ?, name = ?, name_rw = ?, jersey_number = ?, position = ?, position_rw = ?,
        date_of_birth = ?, height = ?, weight = ?, class = ?, is_captain = ?, is_active = ?
    `;
    
    const params = [
      team_id, name, name_rw, jersey_number, position, position_rw,
      date_of_birth || null, height || null, weight || null, playerClass || null,
      is_captain || 0, is_active
    ];
    
    if (req.file) {
      query += ', image_url = ?';
      params.push(`/uploads/sports/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    
    res.json({ success: true, message: 'Player updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete player
router.delete('/admin/players/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    await pool.execute('DELETE FROM sports_players WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Player deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ COACHES MANAGEMENT ============

// Get all coaches
router.get('/admin/coaches', authenticateToken, async (req, res) => {
  try {
    const { team_id, search } = req.query;
    
    let query = `
      SELECT 
        sc.*,
        st.name as team_name,
        st.sport_type
      FROM sports_coaches sc
      JOIN sports_teams st ON sc.team_id = st.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (team_id) {
      query += ' AND sc.team_id = ?';
      params.push(team_id);
    }
    
    if (search) {
      query += ' AND (sc.name LIKE ? OR sc.name_rw LIKE ? OR sc.role LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY sc.team_id, sc.created_at DESC';
    
    const [coaches] = await pool.execute(query, params);
    
    res.json({ success: true, coaches, total: coaches.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create coach
router.post('/admin/coaches', authenticateToken, requireRole('admin', 'headmaster'), upload.single('image'), async (req, res) => {
  try {
    const {
      team_id,
      name,
      name_rw,
      role,
      role_rw,
      email,
      phone,
      experience_years,
      bio,
      bio_rw,
      is_active
    } = req.body;
    
    const image_url = req.file ? `/uploads/sports/${req.file.filename}` : null;
    
    const [result] = await pool.execute(`
      INSERT INTO sports_coaches (
        team_id, name, name_rw, role, role_rw, email, phone,
        experience_years, bio, bio_rw, image_url, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      team_id, name, name_rw, role, role_rw, email || null, phone || null,
      experience_years || 0, bio || null, bio_rw || null, image_url, is_active !== undefined ? is_active : 1
    ]);
    
    res.json({
      success: true,
      message: 'Coach created successfully',
      coach_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update coach
router.put('/admin/coaches/:id', authenticateToken, requireRole('admin', 'headmaster'), upload.single('image'), async (req, res) => {
  try {
    const {
      team_id,
      name,
      name_rw,
      role,
      role_rw,
      email,
      phone,
      experience_years,
      bio,
      bio_rw,
      is_active
    } = req.body;
    
    let query = `
      UPDATE sports_coaches SET
        team_id = ?, name = ?, name_rw = ?, role = ?, role_rw = ?, email = ?, phone = ?,
        experience_years = ?, bio = ?, bio_rw = ?, is_active = ?
    `;
    
    const params = [
      team_id, name, name_rw, role, role_rw, email, phone,
      experience_years, bio, bio_rw, is_active
    ];
    
    if (req.file) {
      query += ', image_url = ?';
      params.push(`/uploads/sports/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    
    res.json({ success: true, message: 'Coach updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete coach
router.delete('/admin/coaches/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    await pool.execute('DELETE FROM sports_coaches WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Coach deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ MATCHES MANAGEMENT ============

// Get all matches
router.get('/admin/matches', authenticateToken, async (req, res) => {
  try {
    const { team_id, result, match_type, season, from_date, to_date } = req.query;
    
    let query = `
      SELECT 
        sm.*,
        st.name as team_name,
        st.sport_type,
        st.image_url as team_logo
      FROM sports_matches sm
      JOIN sports_teams st ON sm.team_id = st.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (team_id) {
      query += ' AND sm.team_id = ?';
      params.push(team_id);
    }
    
    if (result) {
      query += ' AND sm.result = ?';
      params.push(result);
    }
    
    if (match_type) {
      query += ' AND sm.match_type = ?';
      params.push(match_type);
    }
    
    if (season) {
      query += ' AND sm.season = ?';
      params.push(season);
    }
    
    if (from_date) {
      query += ' AND sm.match_date >= ?';
      params.push(from_date);
    }
    
    if (to_date) {
      query += ' AND sm.match_date <= ?';
      params.push(to_date);
    }
    
    query += ' ORDER BY sm.match_date DESC, sm.match_time DESC';
    
    const [matches] = await pool.execute(query, params);
    
    res.json({ success: true, matches, total: matches.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create match
router.post('/admin/matches', authenticateToken, requireRole('admin', 'headmaster', 'dos'), async (req, res) => {
  try {
    const {
      team_id,
      opponent,
      match_date,
      match_time,
      location,
      location_rw,
      our_score,
      opponent_score,
      result,
      match_type,
      season
    } = req.body;
    
    const [insertResult] = await pool.execute(`
      INSERT INTO sports_matches (
        team_id, opponent, match_date, match_time, location, location_rw,
        our_score, opponent_score, result, match_type, season
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      team_id, opponent, match_date, match_time || null, location, location_rw || null,
      our_score || 0, opponent_score || 0, result || 'scheduled', match_type || 'friendly', season || new Date().getFullYear()
    ]);
    
    res.json({
      success: true,
      message: 'Match created successfully',
      match_id: insertResult.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update match
router.put('/admin/matches/:id', authenticateToken, requireRole('admin', 'headmaster', 'dos'), async (req, res) => {
  try {
    const {
      team_id,
      opponent,
      match_date,
      match_time,
      location,
      location_rw,
      our_score,
      opponent_score,
      result,
      match_type,
      season
    } = req.body;
    
    await pool.execute(`
      UPDATE sports_matches SET
        team_id = ?, opponent = ?, match_date = ?, match_time = ?, location = ?, location_rw = ?,
        our_score = ?, opponent_score = ?, result = ?, match_type = ?, season = ?
      WHERE id = ?
    `, [
      team_id, opponent, match_date, match_time, location, location_rw,
      our_score, opponent_score, result, match_type, season, req.params.id
    ]);
    
    res.json({ success: true, message: 'Match updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete match
router.delete('/admin/matches/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    await pool.execute('DELETE FROM sports_matches WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Match deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ACHIEVEMENTS MANAGEMENT ============

// Get all achievements
router.get('/admin/achievements', authenticateToken, async (req, res) => {
  try {
    const { team_id, from_date, to_date } = req.query;
    
    let query = `
      SELECT 
        sa.*,
        st.name as team_name,
        st.sport_type
      FROM sports_achievements sa
      JOIN sports_teams st ON sa.team_id = st.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (team_id) {
      query += ' AND sa.team_id = ?';
      params.push(team_id);
    }
    
    if (from_date) {
      query += ' AND sa.achievement_date >= ?';
      params.push(from_date);
    }
    
    if (to_date) {
      query += ' AND sa.achievement_date <= ?';
      params.push(to_date);
    }
    
    query += ' ORDER BY sa.achievement_date DESC';
    
    const [achievements] = await pool.execute(query, params);
    
    res.json({ success: true, achievements, total: achievements.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create achievement
router.post('/admin/achievements', authenticateToken, requireRole('admin', 'headmaster', 'dos'), async (req, res) => {
  try {
    const {
      team_id,
      title,
      title_rw,
      description,
      description_rw,
      achievement_date,
      position,
      competition_name,
      competition_name_rw,
      icon
    } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO sports_achievements (
        team_id, title, title_rw, description, description_rw,
        achievement_date, position, competition_name, competition_name_rw, icon
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      team_id, title, title_rw || null, description || null, description_rw || null,
      achievement_date, position || null, competition_name, competition_name_rw || null, icon || '🏆'
    ]);
    
    res.json({
      success: true,
      message: 'Achievement created successfully',
      achievement_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update achievement
router.put('/admin/achievements/:id', authenticateToken, requireRole('admin', 'headmaster', 'dos'), async (req, res) => {
  try {
    const {
      team_id,
      title,
      title_rw,
      description,
      description_rw,
      achievement_date,
      position,
      competition_name,
      competition_name_rw,
      icon
    } = req.body;
    
    await pool.execute(`
      UPDATE sports_achievements SET
        team_id = ?, title = ?, title_rw = ?, description = ?, description_rw = ?,
        achievement_date = ?, position = ?, competition_name = ?, competition_name_rw = ?, icon = ?
      WHERE id = ?
    `, [
      team_id, title, title_rw, description, description_rw,
      achievement_date, position, competition_name, competition_name_rw, icon, req.params.id
    ]);
    
    res.json({ success: true, message: 'Achievement updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete achievement
router.delete('/admin/achievements/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    await pool.execute('DELETE FROM sports_achievements WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Achievement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ EVENTS MANAGEMENT ============

// Get all events
router.get('/admin/events', authenticateToken, async (req, res) => {
  try {
    const { status, event_type, from_date, to_date } = req.query;
    
    let query = 'SELECT * FROM sports_events WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (event_type) {
      query += ' AND event_type = ?';
      params.push(event_type);
    }
    
    if (from_date) {
      query += ' AND event_date >= ?';
      params.push(from_date);
    }
    
    if (to_date) {
      query += ' AND event_date <= ?';
      params.push(to_date);
    }
    
    query += ' ORDER BY event_date DESC';
    
    const [events] = await pool.execute(query, params);
    
    res.json({ success: true, events, total: events.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create event
router.post('/admin/events', authenticateToken, requireRole('admin', 'headmaster', 'dos'), upload.single('image'), async (req, res) => {
  try {
    const {
      event_name,
      event_type,
      event_date,
      location,
      description,
      status
    } = req.body;
    
    const image_url = req.file ? `/uploads/sports/${req.file.filename}` : null;
    
    const [result] = await pool.execute(`
      INSERT INTO sports_events (
        event_name, event_type, event_date, location, description, image_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      event_name, event_type, event_date, location || null, description || null,
      image_url, status || 'upcoming'
    ]);
    
    res.json({
      success: true,
      message: 'Event created successfully',
      event_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update event
router.put('/admin/events/:id', authenticateToken, requireRole('admin', 'headmaster', 'dos'), upload.single('image'), async (req, res) => {
  try {
    const {
      event_name,
      event_type,
      event_date,
      location,
      description,
      status
    } = req.body;
    
    let query = `
      UPDATE sports_events SET
        event_name = ?, event_type = ?, event_date = ?, location = ?, description = ?, status = ?
    `;
    
    const params = [event_name, event_type, event_date, location, description, status];
    
    if (req.file) {
      query += ', image_url = ?';
      params.push(`/uploads/sports/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    
    res.json({ success: true, message: 'Event updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete event
router.delete('/admin/events/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    await pool.execute('DELETE FROM sports_events WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ SPORTS GALLERY MANAGEMENT ============

// Get all gallery items
router.get('/admin/gallery', authenticateToken, async (req, res) => {
  try {
    const { sport_type, from_date, to_date, limit } = req.query;
    
    let query = 'SELECT * FROM sports_gallery WHERE 1=1';
    const params = [];
    
    if (sport_type) {
      query += ' AND sport_type = ?';
      params.push(sport_type);
    }
    
    if (from_date) {
      query += ' AND event_date >= ?';
      params.push(from_date);
    }
    
    if (to_date) {
      query += ' AND event_date <= ?';
      params.push(to_date);
    }
    
    query += ' ORDER BY event_date DESC, created_at DESC';
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }
    
    const [gallery] = await pool.execute(query, params);
    
    res.json({ success: true, gallery, total: gallery.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload gallery image
router.post('/admin/gallery', authenticateToken, requireRole('admin', 'headmaster', 'dos'), upload.single('image'), async (req, res) => {
  try {
    const { title, sport_type, event_date } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }
    
    const image_url = `/uploads/sports/${req.file.filename}`;
    
    const [result] = await pool.execute(`
      INSERT INTO sports_gallery (title, sport_type, image_url, event_date)
      VALUES (?, ?, ?, ?)
    `, [title, sport_type, image_url, event_date || new Date()]);
    
    res.json({
      success: true,
      message: 'Gallery image uploaded successfully',
      gallery_id: result.insertId,
      image_url
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete gallery image
router.delete('/admin/gallery/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    await pool.execute('DELETE FROM sports_gallery WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Gallery image deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ BULK OPERATIONS ============

// Bulk activate/deactivate teams
router.post('/admin/teams/bulk-status', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { team_ids, is_active } = req.body;
    
    if (!Array.isArray(team_ids) || team_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'team_ids array is required' });
    }
    
    const placeholders = team_ids.map(() => '?').join(',');
    await pool.execute(
      `UPDATE sports_teams SET is_active = ? WHERE id IN (${placeholders})`,
      [is_active, ...team_ids]
    );
    
    res.json({
      success: true,
      message: `${team_ids.length} team(s) ${is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk delete players
router.post('/admin/players/bulk-delete', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { player_ids } = req.body;
    
    if (!Array.isArray(player_ids) || player_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'player_ids array is required' });
    }
    
    const placeholders = player_ids.map(() => '?').join(',');
    await pool.execute(
      `DELETE FROM sports_players WHERE id IN (${placeholders})`,
      player_ids
    );
    
    res.json({
      success: true,
      message: `${player_ids.length} player(s) deleted successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ PUBLIC ENDPOINTS (No Auth Required) ============

// Get public teams list
router.get('/public/teams', async (req, res) => {
  try {
    const [teams] = await pool.execute(`
      SELECT 
        st.*,
        COUNT(DISTINCT sp.id) as total_players,
        COUNT(DISTINCT sa.id) as total_achievements,
        (SELECT COUNT(*) FROM sports_matches WHERE team_id = st.id AND result = 'win') as wins,
        (SELECT COUNT(*) FROM sports_matches WHERE team_id = st.id AND result = 'loss') as losses,
        (SELECT COUNT(*) FROM sports_matches WHERE team_id = st.id AND result = 'draw') as draws
      FROM sports_teams st
      LEFT JOIN sports_players sp ON st.id = sp.team_id AND sp.is_active = 1
      LEFT JOIN sports_achievements sa ON st.id = sa.team_id
      WHERE st.is_active = 1
      GROUP BY st.id
      ORDER BY st.created_at DESC
    `);
    
    res.json({ success: true, teams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get public team details
router.get('/public/teams/:id', async (req, res) => {
  try {
    const [teams] = await pool.execute('SELECT * FROM sports_teams WHERE id = ? AND is_active = 1', [req.params.id]);
    
    if (teams.length === 0) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    
    const [players] = await pool.execute(
      'SELECT * FROM sports_players WHERE team_id = ? AND is_active = 1 ORDER BY is_captain DESC, jersey_number ASC',
      [req.params.id]
    );
    
    const [coaches] = await pool.execute(
      'SELECT * FROM sports_coaches WHERE team_id = ? AND is_active = 1',
      [req.params.id]
    );
    
    const [achievements] = await pool.execute(
      'SELECT * FROM sports_achievements WHERE team_id = ? ORDER BY achievement_date DESC',
      [req.params.id]
    );
    
    const [matches] = await pool.execute(
      'SELECT * FROM sports_matches WHERE team_id = ? ORDER BY match_date DESC LIMIT 10',
      [req.params.id]
    );
    
    res.json({
      success: true,
      team: teams[0],
      players,
      coaches,
      achievements,
      recentMatches: matches
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get public upcoming events
router.get('/public/events', async (req, res) => {
  try {
    const [events] = await pool.execute(`
      SELECT * FROM sports_events
      WHERE status = 'upcoming' AND event_date >= CURDATE()
      ORDER BY event_date ASC
      LIMIT 20
    `);
    
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get public gallery
router.get('/public/gallery', async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    
    const [gallery] = await pool.execute(
      'SELECT * FROM sports_gallery ORDER BY event_date DESC, created_at DESC LIMIT ?',
      [parseInt(limit)]
    );
    
    res.json({ success: true, gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
