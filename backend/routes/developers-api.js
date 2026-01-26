const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/developers/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// GET all developers
router.get('/', async (req, res) => {
  try {
    const [developers] = await pool.query('SELECT * FROM developers ORDER BY sort_order ASC, id DESC');
    res.json({ success: true, developers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET team developers (alias for main endpoint)
router.get('/team', async (req, res) => {
  try {
    const [developers] = await pool.query('SELECT * FROM developers WHERE is_active = true ORDER BY sort_order ASC');
    res.json({ success: true, developers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single developer
router.get('/:id', async (req, res) => {
  try {
    const [developers] = await pool.query('SELECT * FROM developers WHERE id = ?', [req.params.id]);
    if (developers.length === 0) {
      return res.status(404).json({ success: false, message: 'Developer not found' });
    }
    res.json({ success: true, developer: developers[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new developer
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, role, specialization, bio, email, phone, github_url, linkedin_url, portfolio_url, skills, experience_years, sort_order } = req.body;
    const image_url = req.file ? `/uploads/developers/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO developers (name, role, specialization, bio, email, phone, github, linkedin, portfolio, image_url, skills, experience_years, display_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, role, specialization, bio, email, phone, github_url, linkedin_url, portfolio_url, image_url, skills, experience_years || 0, sort_order || 0]
    );

    res.json({ success: true, id: result.insertId, message: 'Developer added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update developer
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, role, specialization, bio, email, phone, github_url, linkedin_url, portfolio_url, skills, experience_years, sort_order, is_active } = req.body;
    
    let updateQuery = `UPDATE developers SET name=?, role=?, specialization=?, bio=?, email=?, phone=?, github_url=?, linkedin_url=?, portfolio_url=?, skills=?, experience_years=?, sort_order=?, is_active=?`;
    let params = [name, role, specialization, bio, email, phone, github_url, linkedin_url, portfolio_url, skills, experience_years, sort_order, is_active !== undefined ? is_active : true];

    if (req.file) {
      updateQuery += ', image_url=?';
      params.push(`/uploads/developers/${req.file.filename}`);
    }

    updateQuery += ' WHERE id=?';
    params.push(req.params.id);

    await pool.query(updateQuery, params);
    res.json({ success: true, message: 'Developer updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE developer
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM developers WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Developer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET developers by role
router.get('/role/:role', async (req, res) => {
  try {
    const [developers] = await pool.query('SELECT * FROM developers WHERE role = ? AND is_active = true ORDER BY sort_order ASC', [req.params.role]);
    res.json({ success: true, developers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
