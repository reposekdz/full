const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../config/database');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/teams');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'team-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all teams
router.get('/', async (req, res) => {
  try {
    const [teams] = await db.query(
      'SELECT * FROM teams WHERE is_active = true ORDER BY sort_order ASC, created_at DESC'
    );

    // Parse responsibilities JSON for each team
    const teamsWithParsedData = teams.map(team => ({
      ...team,
      responsibilities: team.responsibilities ? JSON.parse(team.responsibilities) : []
    }));

    res.json({
      success: true,
      data: teamsWithParsedData
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teams',
      error: error.message
    });
  }
});

// Get team by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [teams] = await db.query(
      'SELECT * FROM teams WHERE id = ? AND is_active = true',
      [id]
    );

    if (teams.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const team = teams[0];
    team.responsibilities = team.responsibilities ? JSON.parse(team.responsibilities) : [];

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team',
      error: error.message
    });
  }
});

// Create new team (Admin only)
router.post('/', authenticateToken, requireRole(['admin', 'super_admin']), upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      role,
      description,
      head_name,
      head_email,
      head_phone,
      team_size,
      avatar_emoji,
      color_gradient,
      responsibilities
    } = req.body;

    // Validate required fields
    if (!name || !role || !head_name) {
      return res.status(400).json({
        success: false,
        message: 'Name, role, and head name are required'
      });
    }

    // Handle image upload
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/teams/${req.file.filename}`;
    }

    // Parse responsibilities
    let responsibilitiesJson = null;
    if (responsibilities) {
      try {
        responsibilitiesJson = JSON.stringify(
          Array.isArray(responsibilities) ? responsibilities : [responsibilities]
        );
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid responsibilities format'
        });
      }
    }

    const [result] = await db.query(
      `INSERT INTO teams
       (name, role, description, head_name, head_email, head_phone, team_size, image_url, avatar_emoji, color_gradient, responsibilities)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        role,
        description || null,
        head_name,
        head_email || null,
        head_phone || null,
        team_size || 0,
        image_url,
        avatar_emoji || '👥',
        color_gradient || 'from-blue-500 to-purple-500',
        responsibilitiesJson
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: {
        id: result.insertId,
        name,
        role,
        image_url
      }
    });
  } catch (error) {
    console.error('Error creating team:', error);

    // Delete uploaded file if database operation failed
    if (req.file) {
      fs.removeSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create team',
      error: error.message
    });
  }
});

// Update team (Admin only)
router.put('/:id', authenticateToken, requireRole(['admin', 'super_admin']), upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      role,
      description,
      head_name,
      head_email,
      head_phone,
      team_size,
      avatar_emoji,
      color_gradient,
      responsibilities,
      is_active,
      sort_order
    } = req.body;

    // Check if team exists
    const [existingTeam] = await db.query('SELECT * FROM teams WHERE id = ?', [id]);
    if (existingTeam.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Handle image upload
    let image_url = existingTeam[0].image_url;
    if (req.file) {
      // Delete old image if exists
      if (existingTeam[0].image_url) {
        const oldImagePath = path.join(__dirname, '../', existingTeam[0].image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.removeSync(oldImagePath);
        }
      }
      image_url = `/uploads/teams/${req.file.filename}`;
    }

    // Parse responsibilities
    let responsibilitiesJson = existingTeam[0].responsibilities;
    if (responsibilities) {
      try {
        responsibilitiesJson = JSON.stringify(
          Array.isArray(responsibilities) ? responsibilities : [responsibilities]
        );
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid responsibilities format'
        });
      }
    }

    await db.query(
      `UPDATE teams SET
       name = ?, role = ?, description = ?, head_name = ?, head_email = ?, head_phone = ?,
       team_size = ?, image_url = ?, avatar_emoji = ?, color_gradient = ?, responsibilities = ?,
       is_active = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name || existingTeam[0].name,
        role || existingTeam[0].role,
        description !== undefined ? description : existingTeam[0].description,
        head_name || existingTeam[0].head_name,
        head_email !== undefined ? head_email : existingTeam[0].head_email,
        head_phone !== undefined ? head_phone : existingTeam[0].head_phone,
        team_size !== undefined ? team_size : existingTeam[0].team_size,
        image_url,
        avatar_emoji || existingTeam[0].avatar_emoji,
        color_gradient || existingTeam[0].color_gradient,
        responsibilitiesJson,
        is_active !== undefined ? is_active : existingTeam[0].is_active,
        sort_order !== undefined ? sort_order : existingTeam[0].sort_order,
        id
      ]
    );

    res.json({
      success: true,
      message: 'Team updated successfully'
    });
  } catch (error) {
    console.error('Error updating team:', error);

    // Delete uploaded file if database operation failed
    if (req.file) {
      fs.removeSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update team',
      error: error.message
    });
  }
});

// Delete team (Admin only)
router.delete('/:id', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if team exists
    const [existingTeam] = await db.query('SELECT * FROM teams WHERE id = ?', [id]);
    if (existingTeam.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Soft delete - set is_active to false
    await db.query(
      'UPDATE teams SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    // Optionally delete image file
    if (existingTeam[0].image_url) {
      const imagePath = path.join(__dirname, '../', existingTeam[0].image_url);
      if (fs.existsSync(imagePath)) {
        fs.removeSync(imagePath);
      }
    }

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete team',
      error: error.message
    });
  }
});

// Update team sort order (Admin only)
router.put('/:id/sort', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { sort_order } = req.body;

    if (sort_order === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Sort order is required'
      });
    }

    await db.query(
      'UPDATE teams SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [sort_order, id]
    );

    res.json({
      success: true,
      message: 'Team sort order updated successfully'
    });
  } catch (error) {
    console.error('Error updating team sort order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update team sort order',
      error: error.message
    });
  }
});

module.exports = router;
