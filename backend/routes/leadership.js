const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/leadership/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// GET all leaders
router.get('/', async (req, res) => {
  try {
    const [leaders] = await pool.query('SELECT * FROM leadership ORDER BY id ASC');
    res.json(leaders);
  } catch (error) {
    console.error('Error fetching leaders:', error);
    res.status(500).json({ success: false, message: 'Error fetching leaders' });
  }
});

// GET single leader
router.get('/:id', async (req, res) => {
  try {
    const [leaders] = await pool.query('SELECT * FROM leadership WHERE id = ?', [req.params.id]);
    if (leaders.length === 0) {
      return res.status(404).json({ success: false, message: 'Leader not found' });
    }
    res.json(leaders[0]);
  } catch (error) {
    console.error('Error fetching leader:', error);
    res.status(500).json({ success: false, message: 'Error fetching leader' });
  }
});

// POST new leader
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      name, role, department, biography_rw, email, phone,
      office_location, qualifications, experience_years,
      specialization, achievements, responsibilities, office_hours
    } = req.body;

    const image_url = req.file ? `/uploads/leadership/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO leadership (name, role, department, biography_rw, email, phone, 
       office_location, image_url, qualifications, experience_years, specialization, 
       achievements, responsibilities, office_hours) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, role, department, biography_rw, email, phone, office_location, image_url,
       qualifications, experience_years, specialization, achievements, responsibilities, office_hours]
    );

    res.json({ success: true, id: result.insertId, message: 'Leader added successfully' });
  } catch (error) {
    console.error('Error adding leader:', error);
    res.status(500).json({ success: false, message: 'Error adding leader' });
  }
});

// PUT update leader
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const {
      name, role, department, biography_rw, email, phone,
      office_location, qualifications, experience_years,
      specialization, achievements, responsibilities, office_hours
    } = req.body;

    let updateQuery = `UPDATE leadership SET name=?, role=?, department=?, biography_rw=?, 
                       email=?, phone=?, office_location=?, qualifications=?, experience_years=?, 
                       specialization=?, achievements=?, responsibilities=?, office_hours=?`;
    let params = [name, role, department, biography_rw, email, phone, office_location,
                  qualifications, experience_years, specialization, achievements, responsibilities, office_hours];

    if (req.file) {
      updateQuery += ', image_url=?';
      params.push(`/uploads/leadership/${req.file.filename}`);
    }

    updateQuery += ' WHERE id=?';
    params.push(req.params.id);

    await pool.query(updateQuery, params);
    res.json({ success: true, message: 'Leader updated successfully' });
  } catch (error) {
    console.error('Error updating leader:', error);
    res.status(500).json({ success: false, message: 'Error updating leader' });
  }
});

// DELETE leader
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM leadership WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Leader deleted successfully' });
  } catch (error) {
    console.error('Error deleting leader:', error);
    res.status(500).json({ success: false, message: 'Error deleting leader' });
  }
});

module.exports = router;
