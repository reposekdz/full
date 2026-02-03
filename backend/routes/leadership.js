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
    const [leaders] = await pool.execute(
      'SELECT * FROM leadership WHERE status = "active" AND image_url IS NOT NULL ORDER BY display_order ASC'
    );
    
    res.json({ success: true, leaders });
  } catch (error) {
    console.error('Error fetching leaders:', error);
    res.status(500).json({ success: false, message: 'Error fetching leaders' });
  }
});

// GET advisor specifically
router.get('/advisor', async (req, res) => {
  try {
    const [advisors] = await pool.execute(
      'SELECT * FROM leadership WHERE role = "Advisor" AND status = "active" ORDER BY id ASC'
    );
    
    if (advisors.length > 0) {
      res.json({ success: true, advisor: advisors[0] });
    } else {
      res.json({ success: true, advisor: null });
    }
  } catch (error) {
    console.error('Error fetching advisor:', error);
    res.status(500).json({ success: false, message: 'Error fetching advisor' });
  }
});

// GET accountant specifically
router.get('/accountant', async (req, res) => {
  try {
    const [accountants] = await pool.execute(
      'SELECT * FROM leadership WHERE role = "Accountant" AND status = "active" ORDER BY id ASC'
    );
    
    res.json({ success: true, accountant: accountants[0] || null });
  } catch (error) {
    console.error('Error fetching accountant:', error);
    res.status(500).json({ success: false, message: 'Error fetching accountant' });
  }
});

// GET school owner specifically
router.get('/owner', async (req, res) => {
  try {
    const [owners] = await pool.execute(
      'SELECT * FROM leadership WHERE role = "School Owner" AND status = "active" ORDER BY id ASC'
    );
    
    res.json({ success: true, owner: owners[0] || null });
  } catch (error) {
    console.error('Error fetching owner:', error);
    res.status(500).json({ success: false, message: 'Error fetching owner' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const [leaders] = await pool.execute('SELECT * FROM leadership WHERE id = ?', [req.params.id]);
    if (leaders.length === 0) {
      return res.status(404).json({ success: false, message: 'Leader not found' });
    }
    
    res.json({ success: true, leader: leaders[0] });
  } catch (error) {
    console.error('Error fetching leader:', error);
    res.status(500).json({ success: false, message: 'Error fetching leader' });
  }
});

// POST new leader
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      name, role, department, biography_rw, biography_en, email, phone,
      office_location, qualifications, experience_years,
      specialization, achievements, responsibilities
    } = req.body;

    const image_url = req.file ? `/uploads/leadership/${req.file.filename}` : null;

    const [result] = await pool.execute(
      `INSERT INTO leadership (name, role, department, biography_rw, biography_en, email, phone, 
       office_location, image_url, qualifications, experience_years, specialization, 
       achievements, responsibilities, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [name, role, department, biography_rw, biography_en, email, phone, office_location, image_url,
       qualifications, experience_years, specialization, achievements, responsibilities]
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
      name, role, department, biography_rw, biography_en, email, phone,
      office_location, qualifications, experience_years,
      specialization, achievements, responsibilities
    } = req.body;

    let updateQuery = `UPDATE leadership SET name=?, role=?, department=?, biography_rw=?, biography_en=?, 
                       email=?, phone=?, office_location=?, qualifications=?, experience_years=?, 
                       specialization=?, achievements=?, responsibilities=?, updated_at=NOW()`;
    let params = [name, role, department, biography_rw, biography_en, email, phone, office_location,
                  qualifications, experience_years, specialization, achievements, responsibilities];

    if (req.file) {
      updateQuery += ', image_url=?';
      params.push(`/uploads/leadership/${req.file.filename}`);
    }

    updateQuery += ' WHERE id=?';
    params.push(req.params.id);

    await pool.execute(updateQuery, params);
    res.json({ success: true, message: 'Leader updated successfully' });
  } catch (error) {
    console.error('Error updating leader:', error);
    res.status(500).json({ success: false, message: 'Error updating leader' });
  }
});

// DELETE leader (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('UPDATE leadership SET status = "inactive" WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Leader removed successfully' });
  } catch (error) {
    console.error('Error removing leader:', error);
    res.status(500).json({ success: false, message: 'Error removing leader' });
  }
});

module.exports = router;
