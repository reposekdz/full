const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/leadership/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Get all leadership members
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM leadership WHERE status = ? ORDER BY display_order ASC, created_at DESC',
      ['active']
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single leadership member
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM leadership WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Leadership member not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create leadership member
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      name, role, department, biography_rw, biography_en,
      email, phone, office_location, qualifications,
      experience_years, specialization, achievements,
      responsibilities, social_media, office_hours, display_order
    } = req.body;

    const image_url = req.file ? `/uploads/leadership/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO leadership (
        name, role, department, biography_rw, biography_en,
        email, phone, office_location, image_url,
        qualifications, experience_years, specialization,
        achievements, responsibilities, social_media,
        office_hours, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, role, department, biography_rw, biography_en,
        email, phone, office_location, image_url,
        qualifications, experience_years, specialization,
        achievements, responsibilities, social_media,
        office_hours, display_order || 0
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Leadership member created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update leadership member
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const {
      name, role, department, biography_rw, biography_en,
      email, phone, office_location, qualifications,
      experience_years, specialization, achievements,
      responsibilities, social_media, office_hours, display_order
    } = req.body;

    let updateQuery = `
      UPDATE leadership SET
        name = ?, role = ?, department = ?, biography_rw = ?, biography_en = ?,
        email = ?, phone = ?, office_location = ?,
        qualifications = ?, experience_years = ?, specialization = ?,
        achievements = ?, responsibilities = ?, social_media = ?,
        office_hours = ?, display_order = ?
    `;

    const params = [
      name, role, department, biography_rw, biography_en,
      email, phone, office_location,
      qualifications, experience_years, specialization,
      achievements, responsibilities, social_media,
      office_hours, display_order || 0
    ];

    if (req.file) {
      updateQuery += ', image_url = ?';
      params.push(`/uploads/leadership/${req.file.filename}`);
    }

    updateQuery += ' WHERE id = ?';
    params.push(req.params.id);

    await pool.query(updateQuery, params);
    res.json({ message: 'Leadership member updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete leadership member
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE leadership SET status = ? WHERE id = ?', ['inactive', req.params.id]);
    res.json({ message: 'Leadership member deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leadership by department
router.get('/department/:dept', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM leadership WHERE department = ? AND status = ? ORDER BY display_order ASC',
      [req.params.dept, 'active']
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
