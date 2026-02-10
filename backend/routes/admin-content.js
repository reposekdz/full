const express = require('express');
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/admin-content');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all page content
router.get('/pages', async (req, res) => {
  try {
    const [pages] = await pool.execute(`
      SELECT * FROM admin_page_content 
      ORDER BY page_name, section_name
    `);
    
    res.json({ success: true, pages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific page content
router.get('/pages/:pageName', async (req, res) => {
  try {
    const { pageName } = req.params;
    
    const [content] = await pool.execute(`
      SELECT * FROM admin_page_content 
      WHERE page_name = ?
      ORDER BY section_name
    `, [pageName]);
    
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update page content
router.put('/pages/:pageName/:sectionName', upload.single('image'), async (req, res) => {
  try {
    const { pageName, sectionName } = req.params;
    const { content_text, content_html, title, subtitle } = req.body;
    
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/admin-content/${req.file.filename}`;
    }
    
    const updateData = {
      content_text,
      content_html,
      title,
      subtitle,
      updated_at: new Date()
    };
    
    if (imageUrl) {
      updateData.image_url = imageUrl;
    }
    
    await pool.execute(`
      INSERT INTO admin_page_content 
      (page_name, section_name, content_text, content_html, title, subtitle, image_url, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
      content_text = VALUES(content_text),
      content_html = VALUES(content_html),
      title = VALUES(title),
      subtitle = VALUES(subtitle),
      image_url = COALESCE(VALUES(image_url), image_url),
      updated_at = NOW()
    `, [pageName, sectionName, content_text, content_html, title, subtitle, imageUrl]);
    
    res.json({ success: true, message: 'Content updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk update multiple sections
router.put('/pages/:pageName/bulk', upload.array('images', 10), async (req, res) => {
  try {
    const { pageName } = req.params;
    const updates = JSON.parse(req.body.updates);
    
    for (const update of updates) {
      const { section_name, content_text, content_html, title, subtitle } = update;
      
      // Find matching uploaded file
      const imageFile = req.files?.find(file => file.fieldname === `image_${section_name}`);
      const imageUrl = imageFile ? `/uploads/admin-content/${imageFile.filename}` : null;
      
      await pool.execute(`
        INSERT INTO admin_page_content 
        (page_name, section_name, content_text, content_html, title, subtitle, image_url, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
        content_text = VALUES(content_text),
        content_html = VALUES(content_html),
        title = VALUES(title),
        subtitle = VALUES(subtitle),
        image_url = COALESCE(VALUES(image_url), image_url),
        updated_at = NOW()
      `, [pageName, section_name, content_text, content_html, title, subtitle, imageUrl]);
    }
    
    res.json({ success: true, message: 'Bulk update completed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete page content
router.delete('/pages/:pageName/:sectionName', async (req, res) => {
  try {
    const { pageName, sectionName } = req.params;
    
    // Get image URL before deletion to remove file
    const [existing] = await pool.execute(`
      SELECT image_url FROM admin_page_content 
      WHERE page_name = ? AND section_name = ?
    `, [pageName, sectionName]);
    
    if (existing.length > 0 && existing[0].image_url) {
      const imagePath = path.join(__dirname, '..', existing[0].image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await pool.execute(`
      DELETE FROM admin_page_content 
      WHERE page_name = ? AND section_name = ?
    `, [pageName, sectionName]);
    
    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all available pages for admin management
router.get('/available-pages', async (req, res) => {
  try {
    const availablePages = [
      'dashboard',
      'staff-management',
      'student-sheets',
      'headmaster-dashboard',
      'teacher-dashboard',
      'accountant-dashboard',
      'dos-dashboard',
      'dod-dashboard',
      'admin-dashboard',
      'login',
      'home',
      'about',
      'contact',
      'news',
      'gallery',
      'trades',
      'sports',
      'leadership'
    ];
    
    res.json({ success: true, pages: availablePages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize default content for a page
router.post('/pages/:pageName/initialize', async (req, res) => {
  try {
    const { pageName } = req.params;
    
    const defaultSections = [
      { section_name: 'header', title: 'Page Header', content_text: 'Default header content' },
      { section_name: 'hero', title: 'Hero Section', content_text: 'Default hero content' },
      { section_name: 'main', title: 'Main Content', content_text: 'Default main content' },
      { section_name: 'sidebar', title: 'Sidebar', content_text: 'Default sidebar content' },
      { section_name: 'footer', title: 'Footer', content_text: 'Default footer content' }
    ];
    
    for (const section of defaultSections) {
      await pool.execute(`
        INSERT IGNORE INTO admin_page_content 
        (page_name, section_name, title, content_text, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `, [pageName, section.section_name, section.title, section.content_text]);
    }
    
    res.json({ success: true, message: 'Default content initialized' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;