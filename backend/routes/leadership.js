const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
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

// ============================================
// STAFF ALIAS ROUTES (for AdminStaffManagement)
// All staff routes require authentication
// ============================================

// GET all staff (alias for / but returns as 'staff')
router.get('/staff', authenticateToken, async (req, res) => {
  try {
    const [leaders] = await pool.execute(
      'SELECT * FROM leadership WHERE status = "active" ORDER BY display_order ASC'
    );
    // Map leadership fields to staff fields
    const staff = leaders.map(leader => ({
      id: leader.id,
      title: leader.role,
      title_rw: leader.role,
      name: leader.name,
      image: leader.image_url,
      description: leader.biography_en,
      description_rw: leader.biography_rw,
      email: leader.email,
      phone: leader.phone,
      responsibilities: leader.responsibilities,
      responsibilities_rw: leader.achievements
    }));
    res.json({ success: true, staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ success: false, message: 'Error fetching staff' });
  }
});

// GET single staff by ID
router.get('/staff/:id', authenticateToken, async (req, res) => {
  try {
    const [leaders] = await pool.execute('SELECT * FROM leadership WHERE id = ?', [req.params.id]);
    if (leaders.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    const leader = leaders[0];
    const staff = {
      id: leader.id,
      title: leader.role,
      title_rw: leader.role,
      name: leader.name,
      image: leader.image_url,
      description: leader.biography_en,
      description_rw: leader.biography_rw,
      email: leader.email,
      phone: leader.phone,
      responsibilities: leader.responsibilities,
      responsibilities_rw: leader.achievements
    };
    res.json({ success: true, staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ success: false, message: 'Error fetching staff' });
  }
});

// PUT update staff
router.put('/staff/:id', authenticateToken, async (req, res) => {
  try {
    const { title, title_rw, name, description, description_rw, email, phone, responsibilities, responsibilities_rw } = req.body;
    
    await pool.execute(
      `UPDATE leadership SET 
        name = ?, 
        role = COALESCE(?, role),
        biography_en = ?, 
        biography_rw = ?, 
        email = ?, 
        phone = ?, 
        responsibilities = ?, 
        achievements = ?, 
        updated_at = NOW()
       WHERE id = ?`,
      [name, title || title_rw, description, description_rw, email, phone, responsibilities, responsibilities_rw, req.params.id]
    );
    res.json({ success: true, message: 'Staff updated successfully' });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ success: false, message: 'Error updating staff' });
  }
});

// POST upload staff image
router.post('/staff/:id/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }
    
    const imageUrl = `/uploads/leadership/${req.file.filename}`;
    await pool.execute(
      'UPDATE leadership SET image_url = ?, updated_at = NOW() WHERE id = ?',
      [imageUrl, req.params.id]
    );
    res.json({ success: true, message: 'Image uploaded successfully', image: imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, message: 'Error uploading image' });
  }
});

// GET leader by ID (must be after /staff routes)
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

// ============================================
// STAFF ALIAS ROUTES (for AdminStaffManagement)
// All staff routes require authentication
// ============================================

// GET all staff (alias for / but returns as 'staff')
router.get('/staff', authenticateToken, async (req, res) => {
  try {
    const [leaders] = await pool.execute(
      'SELECT * FROM leadership WHERE status = "active" ORDER BY display_order ASC'
    );
    // Map leadership fields to staff fields
    const staff = leaders.map(leader => ({
      id: leader.id,
      title: leader.role,
      title_rw: leader.role,
      name: leader.name,
      image: leader.image_url,
      description: leader.biography_en,
      description_rw: leader.biography_rw,
      email: leader.email,
      phone: leader.phone,
      responsibilities: leader.responsibilities,
      responsibilities_rw: leader.achievements
    }));
    res.json({ success: true, staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ success: false, message: 'Error fetching staff' });
  }
});

// GET single staff by ID
router.get('/staff/:id', authenticateToken, async (req, res) => {
  try {
    const [leaders] = await pool.execute('SELECT * FROM leadership WHERE id = ?', [req.params.id]);
    if (leaders.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    const leader = leaders[0];
    const staff = {
      id: leader.id,
      title: leader.role,
      title_rw: leader.role,
      name: leader.name,
      image: leader.image_url,
      description: leader.biography_en,
      description_rw: leader.biography_rw,
      email: leader.email,
      phone: leader.phone,
      responsibilities: leader.responsibilities,
      responsibilities_rw: leader.achievements
    };
    res.json({ success: true, staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ success: false, message: 'Error fetching staff' });
  }
});

// PUT update staff
router.put('/staff/:id', authenticateToken, async (req, res) => {
  try {
    const { title, title_rw, name, description, description_rw, email, phone, responsibilities, responsibilities_rw } = req.body;
    
    await pool.execute(
      `UPDATE leadership SET 
        name = ?, 
        role = COALESCE(?, role),
        biography_en = ?, 
        biography_rw = ?, 
        email = ?, 
        phone = ?, 
        responsibilities = ?, 
        achievements = ?, 
        updated_at = NOW()
       WHERE id = ?`,
      [name, title || title_rw, description, description_rw, email, phone, responsibilities, responsibilities_rw, req.params.id]
    );
    res.json({ success: true, message: 'Staff updated successfully' });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ success: false, message: 'Error updating staff' });
  }
});

// POST upload staff image
router.post('/staff/:id/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }
    
    const imageUrl = `/uploads/leadership/${req.file.filename}`;
    await pool.execute(
      'UPDATE leadership SET image_url = ?, updated_at = NOW() WHERE id = ?',
      [imageUrl, req.params.id]
    );
    res.json({ success: true, message: 'Image uploaded successfully', image: imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, message: 'Error uploading image' });
  }
});

module.exports = router;
