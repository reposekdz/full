const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all home slides
router.get('/slides', async (req, res) => {
  try {
    const [slides] = await pool.execute(
      'SELECT * FROM home_slides WHERE is_active = true ORDER BY sort_order ASC'
    );

    res.json({
      success: true,
      slides
    });

  } catch (error) {
    console.error('Get slides error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new slide
router.post('/slides', [
  authenticateToken,
  requireRole('admin', 'super_admin'),
  body('title').notEmpty().withMessage('Title is required'),
  body('image_url').notEmpty().withMessage('Image URL is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { title, subtitle, description, image_url, button_text, button_link, sort_order = 0 } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO home_slides (title, subtitle, description, image_url, button_text, button_link, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, subtitle, description, image_url, button_text, button_link, sort_order]
    );

    res.status(201).json({
      success: true,
      message: 'Slide created successfully',
      slide: {
        id: result.insertId,
        title,
        subtitle,
        description,
        image_url,
        button_text,
        button_link,
        sort_order
      }
    });

  } catch (error) {
    console.error('Create slide error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update slide
router.put('/slides/:id', [
  authenticateToken,
  requireRole('admin', 'super_admin'),
  body('title').notEmpty().withMessage('Title is required'),
  body('image_url').notEmpty().withMessage('Image URL is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { title, subtitle, description, image_url, button_text, button_link, sort_order, is_active } = req.body;

    await pool.execute(
      'UPDATE home_slides SET title = ?, subtitle = ?, description = ?, image_url = ?, button_text = ?, button_link = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [title, subtitle, description, image_url, button_text, button_link, sort_order, is_active, id]
    );

    res.json({
      success: true,
      message: 'Slide updated successfully'
    });

  } catch (error) {
    console.error('Update slide error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete slide
router.delete('/slides/:id', [
  authenticateToken,
  requireRole('admin', 'super_admin')
], async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM home_slides WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Slide deleted successfully'
    });

  } catch (error) {
    console.error('Delete slide error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get dynamic content
router.get('/dynamic/:page/:section?', async (req, res) => {
  try {
    const { page, section } = req.params;
    
    let query = 'SELECT * FROM dynamic_content WHERE page = ? AND is_active = true';
    let params = [page];
    
    if (section) {
      query += ' AND section = ?';
      params.push(section);
    }
    
    const [content] = await pool.execute(query, params);

    res.json({
      success: true,
      content
    });

  } catch (error) {
    console.error('Get dynamic content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update dynamic content
router.put('/dynamic', [
  authenticateToken,
  requireRole('admin', 'super_admin', 'editor'),
  body('page').notEmpty().withMessage('Page is required'),
  body('section').notEmpty().withMessage('Section is required'),
  body('content_key').notEmpty().withMessage('Content key is required'),
  body('content_value').notEmpty().withMessage('Content value is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { page, section, content_key, content_value, content_type = 'text' } = req.body;

    await pool.execute(
      'INSERT INTO dynamic_content (page, section, content_key, content_value, content_type) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE content_value = VALUES(content_value), content_type = VALUES(content_type)',
      [page, section, content_key, content_value, content_type]
    );

    res.json({
      success: true,
      message: 'Content updated successfully'
    });

  } catch (error) {
    console.error('Update dynamic content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get trade programs
router.get('/trades', async (req, res) => {
  try {
    const [trades] = await pool.execute(
      'SELECT * FROM trade_programs WHERE is_active = true ORDER BY code ASC'
    );

    res.json({
      success: true,
      trades
    });

  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;