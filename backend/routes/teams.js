const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all teams
router.get('/', async (req, res) => {
  try {
    const { is_active } = req.query;
    
    let query = 'SELECT * FROM teams WHERE 1=1';
    const params = [];

    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true');
    }

    query += ' ORDER BY sort_order ASC, name ASC';

    const [teams] = await pool.query(query, params);
    
    // Parse JSON fields
    const parsedTeams = teams.map(team => ({
      ...team,
      responsibilities: team.responsibilities ? JSON.parse(team.responsibilities) : []
    }));

    res.json({ success: true, teams: parsedTeams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teams' });
  }
});

// Get team by ID
router.get('/:id', async (req, res) => {
  try {
    const [teams] = await pool.query('SELECT * FROM teams WHERE id = ?', [req.params.id]);
    
    if (teams.length === 0) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const team = {
      ...teams[0],
      responsibilities: teams[0].responsibilities ? JSON.parse(teams[0].responsibilities) : []
    };

    res.json({ success: true, team });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch team' });
  }
});

// Create team
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, role, head_name, team_size, description, responsibilities, image_url, avatar_emoji, color_gradient, is_active, sort_order } = req.body;

    const [result] = await pool.query(`
      INSERT INTO teams (name, role, head_name, team_size, description, responsibilities, image_url, avatar_emoji, color_gradient, is_active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      role,
      head_name,
      team_size || 1,
      description,
      JSON.stringify(responsibilities || []),
      image_url,
      avatar_emoji,
      color_gradient,
      is_active !== false,
      sort_order || 0
    ]);

    res.json({ success: true, message: 'Team created successfully', teamId: result.insertId });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ success: false, message: 'Failed to create team' });
  }
});

// Update team
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updates = [];
    const values = [];

    const allowedFields = ['name', 'role', 'head_name', 'team_size', 'description', 'responsibilities', 'image_url', 'avatar_emoji', 'color_gradient', 'is_active', 'sort_order'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        if (field === 'responsibilities') {
          values.push(JSON.stringify(req.body[field]));
        } else {
          values.push(req.body[field]);
        }
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(req.params.id);
    await pool.query(`UPDATE teams SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'Team updated successfully' });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ success: false, message: 'Failed to update team' });
  }
});

// Delete team
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE teams SET is_active = FALSE WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ success: false, message: 'Failed to delete team' });
  }
});

module.exports = router;
