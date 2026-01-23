const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/services/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

// GET all services with categories
router.get('/services', async (req, res) => {
  try {
    const [services] = await pool.query(`
      SELECT * FROM school_services 
      WHERE is_active = true 
      ORDER BY category, sort_order
    `);
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET service by ID
router.get('/services/:id', async (req, res) => {
  try {
    const [services] = await pool.query('SELECT * FROM school_services WHERE id = ?', [req.params.id]);
    if (services.length === 0) return res.status(404).json({ error: 'Service not found' });
    res.json(services[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create service (admin)
router.post('/services', upload.single('image'), async (req, res) => {
  try {
    const { title_rw, title_en, description_rw, description_en, category, icon, features, requirements, contact_info } = req.body;
    const image_url = req.file ? `/uploads/services/${req.file.filename}` : null;

    const [result] = await pool.query(`
      INSERT INTO school_services (title_rw, title_en, description_rw, description_en, category, icon, image_url, features, requirements, contact_info)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title_rw, title_en, description_rw, description_en, category, icon, image_url, features, requirements, contact_info]);

    res.json({ id: result.insertId, message: 'Service created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update service (admin)
router.put('/services/:id', upload.single('image'), async (req, res) => {
  try {
    const { title_rw, title_en, description_rw, description_en, category, icon, features, requirements, contact_info } = req.body;
    let updateQuery = `
      UPDATE school_services 
      SET title_rw = ?, title_en = ?, description_rw = ?, description_en = ?, category = ?, icon = ?, features = ?, requirements = ?, contact_info = ?
    `;
    let params = [title_rw, title_en, description_rw, description_en, category, icon, features, requirements, contact_info];

    if (req.file) {
      updateQuery += ', image_url = ?';
      params.push(`/uploads/services/${req.file.filename}`);
    }

    updateQuery += ' WHERE id = ?';
    params.push(req.params.id);

    await pool.query(updateQuery, params);
    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE service (admin)
router.delete('/services/:id', async (req, res) => {
  try {
    await pool.query('UPDATE school_services SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all coaches
router.get('/coaches', async (req, res) => {
  try {
    const [coaches] = await pool.query('SELECT * FROM sports_coaches WHERE is_active = true ORDER BY name');
    res.json(coaches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET coach by ID
router.get('/coaches/:id', async (req, res) => {
  try {
    const [coaches] = await pool.query('SELECT * FROM sports_coaches WHERE id = ?', [req.params.id]);
    if (coaches.length === 0) return res.status(404).json({ error: 'Coach not found' });
    res.json(coaches[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create coach (admin)
router.post('/coaches', upload.single('image'), async (req, res) => {
  try {
    const { name, sport, title, bio_rw, bio_en, experience_years, qualifications, achievements, specializations, email, phone, office_location } = req.body;
    const image_url = req.file ? `/uploads/services/${req.file.filename}` : null;

    const [result] = await pool.query(`
      INSERT INTO sports_coaches (name, sport, title, bio_rw, bio_en, experience_years, qualifications, achievements, specializations, image_url, email, phone, office_location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, sport, title, bio_rw, bio_en, experience_years, qualifications, achievements, specializations, image_url, email, phone, office_location]);

    res.json({ id: result.insertId, message: 'Coach created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update coach (admin)
router.put('/coaches/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, sport, title, bio_rw, bio_en, experience_years, qualifications, achievements, specializations, email, phone, office_location } = req.body;
    let updateQuery = `
      UPDATE sports_coaches 
      SET name = ?, sport = ?, title = ?, bio_rw = ?, bio_en = ?, experience_years = ?, qualifications = ?, achievements = ?, specializations = ?, email = ?, phone = ?, office_location = ?
    `;
    let params = [name, sport, title, bio_rw, bio_en, experience_years, qualifications, achievements, specializations, email, phone, office_location];

    if (req.file) {
      updateQuery += ', image_url = ?';
      params.push(`/uploads/services/${req.file.filename}`);
    }

    updateQuery += ' WHERE id = ?';
    params.push(req.params.id);

    await pool.query(updateQuery, params);
    res.json({ message: 'Coach updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
