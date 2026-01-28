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
    const [leaders] = await pool.execute('SELECT * FROM leadership WHERE status = "active" ORDER BY display_order, role, id ASC');
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
      'SELECT * FROM leadership WHERE role = "advisor" AND status = "active" ORDER BY id ASC'
    );
    
    if (advisors.length > 0) {
      const advisor = advisors[0];
      // Add additional details for advisor
      advisor.services = [
        'Academic Guidance',
        'Career Counseling', 
        'Personal Development',
        'Study Planning',
        'Goal Setting',
        'Student Support'
      ];
      advisor.availability = {
        monday: '8:00 AM - 5:00 PM',
        tuesday: '8:00 AM - 5:00 PM',
        wednesday: '8:00 AM - 5:00 PM',
        thursday: '8:00 AM - 5:00 PM',
        friday: '8:00 AM - 4:00 PM'
      };
      advisor.contact_methods = [
        { type: 'email', value: advisor.email, label: 'Email' },
        { type: 'phone', value: advisor.phone, label: 'Phone' },
        { type: 'office', value: advisor.office_location || 'Student Affairs Office', label: 'Office' }
      ];
    }
    
    res.json({ success: true, advisor: advisors[0] || null });
  } catch (error) {
    console.error('Error fetching advisor:', error);
    res.status(500).json({ success: false, message: 'Error fetching advisor' });
  }
});

// GET single leader with detailed info
router.get('/:id', async (req, res) => {
  try {
    const [leaders] = await pool.execute('SELECT * FROM leadership WHERE id = ?', [req.params.id]);
    if (leaders.length === 0) {
      return res.status(404).json({ success: false, message: 'Leader not found' });
    }
    
    const leader = leaders[0];
    // Add additional details for advisor
    if (leader.position === 'advisor') {
      leader.services = [
        'Academic Guidance',
        'Career Counseling', 
        'Personal Development',
        'Study Planning',
        'Goal Setting'
      ];
      leader.availability = {
        monday: '8:00 AM - 5:00 PM',
        tuesday: '8:00 AM - 5:00 PM',
        wednesday: '8:00 AM - 5:00 PM',
        thursday: '8:00 AM - 5:00 PM',
        friday: '8:00 AM - 4:00 PM'
      };
    }
    
    res.json({ success: true, leader });
  } catch (error) {
    console.error('Error fetching leader:', error);
    res.status(500).json({ success: false, message: 'Error fetching leader' });
  }
});

// POST new leader
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      first_name, last_name, position, department, bio, email, phone,
      office_location, qualifications, experience_years,
      specialization, achievements, responsibilities
    } = req.body;

    const image_url = req.file ? `/uploads/leadership/${req.file.filename}` : null;

    const [result] = await pool.execute(
      `INSERT INTO leadership (first_name, last_name, position, department, bio, email, phone, 
       office_location, image_url, qualifications, experience_years, specialization, 
       achievements, responsibilities, is_active, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, NOW())`,
      [first_name, last_name, position, department, bio, email, phone, office_location, image_url,
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
      first_name, last_name, position, department, bio, email, phone,
      office_location, qualifications, experience_years,
      specialization, achievements, responsibilities
    } = req.body;

    let updateQuery = `UPDATE leadership SET first_name=?, last_name=?, position=?, department=?, bio=?, 
                       email=?, phone=?, office_location=?, qualifications=?, experience_years=?, 
                       specialization=?, achievements=?, responsibilities=?, updated_at=NOW()`;
    let params = [first_name, last_name, position, department, bio, email, phone, office_location,
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
    await pool.execute('UPDATE leadership SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Leader removed successfully' });
  } catch (error) {
    console.error('Error removing leader:', error);
    res.status(500).json({ success: false, message: 'Error removing leader' });
  }
});

module.exports = router;
