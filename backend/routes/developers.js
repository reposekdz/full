const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Configure multer for developer images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/developers';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `dev-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  }
});

// Get all developers
router.get('/team', async (req, res) => {
  try {
    const [developers] = await pool.query(`
      SELECT * FROM developer_team 
      WHERE is_active = true 
      ORDER BY sort_order ASC
    `);
    res.json({ success: true, developers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single developer
router.get('/team/:id', async (req, res) => {
  try {
    const [developers] = await pool.query(
      'SELECT * FROM developer_team WHERE id = ? AND is_active = true',
      [req.params.id]
    );
    
    if (developers.length === 0) {
      return res.status(404).json({ success: false, message: 'Developer not found' });
    }
    
    res.json({ success: true, developer: developers[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Upload developer image
router.post('/admin/upload', authenticateToken, requireRole(['admin']), upload.single('image'), async (req, res) => {
  try {
    const image_url = `/uploads/developers/${req.file.filename}`;
    res.json({ success: true, image_url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update developer
router.put('/admin/team/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, name_rw, role, role_rw, description, description_rw, image_url, email, phone, github_url, linkedin_url, skills, achievements, sort_order, is_active } = req.body;
    
    await pool.query(
      'UPDATE developer_team SET name=?, name_rw=?, role=?, role_rw=?, description=?, description_rw=?, image_url=?, email=?, phone=?, github_url=?, linkedin_url=?, skills=?, achievements=?, sort_order=?, is_active=? WHERE id=?',
      [name, name_rw, role, role_rw, description, description_rw, image_url, email, phone, github_url, linkedin_url, JSON.stringify(skills), JSON.stringify(achievements), sort_order, is_active, req.params.id]
    );
    
    res.json({ success: true, message: 'Developer updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
