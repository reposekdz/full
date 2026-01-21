const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/content');
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ================= SLIDES MANAGEMENT =================

// Get all home slides
router.get('/slides', async (req, res) => {
  try {
    const [slides] = await pool.execute(
      'SELECT * FROM slides WHERE is_active = true ORDER BY sort_order ASC'
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

// Get all slides for admin (including inactive)
router.get('/admin/slides', [
  authenticateToken,
  requireRole('admin', 'super_admin')
], async (req, res) => {
  try {
    const [slides] = await pool.execute(
      'SELECT * FROM slides ORDER BY sort_order ASC'
    );

    res.json({
      success: true,
      slides
    });

  } catch (error) {
    console.error('Get admin slides error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new slide with image upload
router.post('/admin/slides', [
  authenticateToken,
  requireRole('admin', 'super_admin'),
  upload.single('image'),
  body('title').notEmpty().withMessage('Title is required')
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

    const { title, subtitle, description, button_text, button_link, sort_order = 0 } = req.body;
    let image_url = req.body.image_url || '';

    // If file was uploaded, use the uploaded file path
    if (req.file) {
      image_url = `/uploads/content/${req.file.filename}`;
    }

    if (!image_url) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO slides (title, subtitle, description, image_url, button_text, button_link, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
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
router.put('/admin/slides/:id', [
  authenticateToken,
  requireRole('admin', 'super_admin'),
  upload.single('image'),
  body('title').notEmpty().withMessage('Title is required')
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
    const { title, subtitle, description, button_text, button_link, sort_order, is_active } = req.body;
    let image_url = req.body.image_url || '';

    // Get current slide to check for existing image
    const [currentSlide] = await pool.execute('SELECT image_url FROM slides WHERE id = ?', [id]);
    if (currentSlide.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slide not found'
      });
    }

    // If file was uploaded, use the new file and delete old one
    if (req.file) {
      const oldImagePath = path.join(__dirname, '..', currentSlide[0].image_url);
      if (fs.existsSync(oldImagePath) && currentSlide[0].image_url.startsWith('/uploads/')) {
        fs.unlinkSync(oldImagePath);
      }
      image_url = `/uploads/content/${req.file.filename}`;
    } else if (!image_url) {
      image_url = currentSlide[0].image_url;
    }

    await pool.execute(
      'UPDATE slides SET title = ?, subtitle = ?, description = ?, image_url = ?, button_text = ?, button_link = ?, sort_order = ?, is_active = ? WHERE id = ?',
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
router.delete('/admin/slides/:id', [
  authenticateToken,
  requireRole('admin', 'super_admin')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Get slide info to delete associated image
    const [slide] = await pool.execute('SELECT image_url FROM slides WHERE id = ?', [id]);
    if (slide.length > 0 && slide[0].image_url.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', slide[0].image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await pool.execute('DELETE FROM slides WHERE id = ?', [id]);

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

// ================= NEWS ARTICLES MANAGEMENT =================

// Get news articles
router.get('/news', async (req, res) => {
  try {
    const [articles] = await pool.execute(
      'SELECT * FROM news_articles WHERE is_active = true ORDER BY sort_order ASC, created_at DESC'
    );

    res.json({
      success: true,
      articles
    });

  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all news for admin
router.get('/admin/news', [
  authenticateToken,
  requireRole('admin', 'super_admin')
], async (req, res) => {
  try {
    const [articles] = await pool.execute(
      'SELECT * FROM news_articles ORDER BY sort_order ASC, created_at DESC'
    );

    res.json({
      success: true,
      articles
    });

  } catch (error) {
    console.error('Get admin news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create news article
router.post('/admin/news', [
  authenticateToken,
  requireRole('admin', 'super_admin'),
  upload.single('image'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required')
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

    const { title, description, content, author, category, publish_date, sort_order = 0 } = req.body;
    let image_url = req.body.image_url || '';

    if (req.file) {
      image_url = `/uploads/content/${req.file.filename}`;
    }

    const [result] = await pool.execute(
      'INSERT INTO news_articles (title, description, content, image_url, author, category, publish_date, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, content, image_url, author, category, publish_date, sort_order]
    );

    res.status(201).json({
      success: true,
      message: 'News article created successfully',
      article: {
        id: result.insertId,
        title,
        description,
        content,
        image_url,
        author,
        category,
        publish_date,
        sort_order
      }
    });

  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update news article
router.put('/admin/news/:id', [
  authenticateToken,
  requireRole('admin', 'super_admin'),
  upload.single('image'),
  body('title').notEmpty().withMessage('Title is required')
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
    const { title, description, content, author, category, publish_date, sort_order, is_active } = req.body;
    let image_url = req.body.image_url || '';

    // Get current article
    const [currentArticle] = await pool.execute('SELECT image_url FROM news_articles WHERE id = ?', [id]);
    if (currentArticle.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    if (req.file) {
      const oldImagePath = path.join(__dirname, '..', currentArticle[0].image_url);
      if (fs.existsSync(oldImagePath) && currentArticle[0].image_url.startsWith('/uploads/')) {
        fs.unlinkSync(oldImagePath);
      }
      image_url = `/uploads/content/${req.file.filename}`;
    } else if (!image_url) {
      image_url = currentArticle[0].image_url;
    }

    await pool.execute(
      'UPDATE news_articles SET title = ?, description = ?, content = ?, image_url = ?, author = ?, category = ?, publish_date = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [title, description, content, image_url, author, category, publish_date, sort_order, is_active, id]
    );

    res.json({
      success: true,
      message: 'News article updated successfully'
    });

  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete news article
router.delete('/admin/news/:id', [
  authenticateToken,
  requireRole('admin', 'super_admin')
], async (req, res) => {
  try {
    const { id } = req.params;

    const [article] = await pool.execute('SELECT image_url FROM news_articles WHERE id = ?', [id]);
    if (article.length > 0 && article[0].image_url.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', article[0].image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await pool.execute('DELETE FROM news_articles WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'News article deleted successfully'
    });

  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ================= HOME CONTENT MANAGEMENT =================

// Get home content sections
router.get('/home-content', async (req, res) => {
  try {
    const [content] = await pool.execute(
      'SELECT * FROM home_content WHERE is_active = true'
    );

    res.json({
      success: true,
      content
    });

  } catch (error) {
    console.error('Get home content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update home content section
router.put('/admin/home-content/:section_key', [
  authenticateToken,
  requireRole('admin', 'super_admin'),
  body('title').optional(),
  body('subtitle').optional(),
  body('content').optional()
], async (req, res) => {
  try {
    const { section_key } = req.params;
    const { title, subtitle, content, additional_data } = req.body;

    await pool.execute(
      'UPDATE home_content SET title = ?, subtitle = ?, content = ?, additional_data = ? WHERE section_key = ?',
      [title, subtitle, content, additional_data ? JSON.stringify(additional_data) : null, section_key]
    );

    res.json({
      success: true,
      message: 'Home content updated successfully'
    });

  } catch (error) {
    console.error('Update home content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ================= TESTIMONIALS MANAGEMENT =================

// Get testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const [testimonials] = await pool.execute(
      'SELECT * FROM testimonials WHERE is_active = true ORDER BY sort_order ASC'
    );

    res.json({
      success: true,
      testimonials
    });

  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all testimonials for admin
router.get('/admin/testimonials', [
  authenticateToken,
  requireRole('admin', 'super_admin')
], async (req, res) => {
  try {
    const [testimonials] = await pool.execute(
      'SELECT * FROM testimonials ORDER BY sort_order ASC'
    );

    res.json({
      success: true,
      testimonials
    });

  } catch (error) {
    console.error('Get admin testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create testimonial
router.post('/admin/testimonials', [
  authenticateToken,
  requireRole('admin', 'super_admin'),
  body('name').notEmpty().withMessage('Name is required'),
  body('quote').notEmpty().withMessage('Quote is required')
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

    const { name, role, avatar, quote, rating = 5, sort_order = 0 } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO testimonials (name, role, avatar, quote, rating, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [name, role, avatar, quote, rating, sort_order]
    );

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      testimonial: {
        id: result.insertId,
        name,
        role,
        avatar,
        quote,
        rating,
        sort_order
      }
    });

  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update testimonial
router.put('/admin/testimonials/:id', [
  authenticateToken,
  requireRole('admin', 'super_admin'),
  body('name').notEmpty().withMessage('Name is required'),
  body('quote').notEmpty().withMessage('Quote is required')
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
    const { name, role, avatar, quote, rating, sort_order, is_active } = req.body;

    await pool.execute(
      'UPDATE testimonials SET name = ?, role = ?, avatar = ?, quote = ?, rating = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [name, role, avatar, quote, rating, sort_order, is_active, id]
    );

    res.json({
      success: true,
      message: 'Testimonial updated successfully'
    });

  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete testimonial
router.delete('/admin/testimonials/:id', [
  authenticateToken,
  requireRole('admin', 'super_admin')
], async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM testimonials WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });

  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ================= SCHOOL STATS MANAGEMENT =================

// Get school stats
router.get('/stats', async (req, res) => {
  try {
    const [stats] = await pool.execute(
      'SELECT * FROM school_stats WHERE is_active = true ORDER BY sort_order ASC'
    );

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update school stat
router.put('/admin/stats/:stat_key', [
  authenticateToken,
  requireRole('admin', 'super_admin'),
  body('value').notEmpty().withMessage('Value is required'),
  body('label').notEmpty().withMessage('Label is required')
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

    const { stat_key } = req.params;
    const { value, label, icon, color, sort_order } = req.body;

    await pool.execute(
      'UPDATE school_stats SET value = ?, label = ?, icon = ?, color = ?, sort_order = ? WHERE stat_key = ?',
      [value, label, icon, color, sort_order, stat_key]
    );

    res.json({
      success: true,
      message: 'School stat updated successfully'
    });

  } catch (error) {
    console.error('Update stat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ================= ACHIEVEMENTS MANAGEMENT =================

// Get achievements
router.get('/achievements', async (req, res) => {
  try {
    const [achievements] = await pool.execute(
      'SELECT * FROM achievements WHERE is_active = true ORDER BY sort_order ASC'
    );

    res.json({
      success: true,
      achievements
    });

  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all achievements for admin
router.get('/admin/achievements', [
  authenticateToken,
  requireRole('admin', 'super_admin')
], async (req, res) => {
  try {
    const [achievements] = await pool.execute(
      'SELECT * FROM achievements ORDER BY sort_order ASC'
    );

    res.json({
      success: true,
      achievements
    });

  } catch (error) {
    console.error('Get admin achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create achievement
router.post('/admin/achievements', [
  authenticateToken,
  requireRole('admin', 'super_admin'),
  upload.single('image'),
  body('title').notEmpty().withMessage('Title is required')
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

    const { title, description, year, sort_order = 0 } = req.body;
    let image_url = req.body.image_url || '';

    if (req.file) {
      image_url = `/uploads/content/${req.file.filename}`;
    }

    const [result] = await pool.execute(
      'INSERT INTO achievements (title, description, year, image_url, sort_order) VALUES (?, ?, ?, ?, ?)',
      [title, description, year, image_url, sort_order]
    );

    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      achievement: {
        id: result.insertId,
        title,
        description,
        year,
        image_url,
        sort_order
      }
    });

  } catch (error) {
    console.error('Create achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update achievement
router.put('/admin/achievements/:id', [
  authenticateToken,
  requireRole('admin', 'super_admin'),
  upload.single('image'),
  body('title').notEmpty().withMessage('Title is required')
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
    const { title, description, year, sort_order, is_active } = req.body;
    let image_url = req.body.image_url || '';

    // Get current achievement
    const [currentAchievement] = await pool.execute('SELECT image_url FROM achievements WHERE id = ?', [id]);
    if (currentAchievement.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    if (req.file) {
      const oldImagePath = path.join(__dirname, '..', currentAchievement[0].image_url);
      if (fs.existsSync(oldImagePath) && currentAchievement[0].image_url.startsWith('/uploads/')) {
        fs.unlinkSync(oldImagePath);
      }
      image_url = `/uploads/content/${req.file.filename}`;
    } else if (!image_url) {
      image_url = currentAchievement[0].image_url;
    }

    await pool.execute(
      'UPDATE achievements SET title = ?, description = ?, year = ?, image_url = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [title, description, year, image_url, sort_order, is_active, id]
    );

    res.json({
      success: true,
      message: 'Achievement updated successfully'
    });

  } catch (error) {
    console.error('Update achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete achievement
router.delete('/admin/achievements/:id', [
  authenticateToken,
  requireRole('admin', 'super_admin')
], async (req, res) => {
  try {
    const { id } = req.params;

    const [achievement] = await pool.execute('SELECT image_url FROM achievements WHERE id = ?', [id]);
    if (achievement.length > 0 && achievement[0].image_url.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', achievement[0].image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await pool.execute('DELETE FROM achievements WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Achievement deleted successfully'
    });

  } catch (error) {
    console.error('Delete achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;