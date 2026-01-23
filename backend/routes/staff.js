const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/staff/'),
  filename: (req, file, cb) => cb(null, `staff_${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Get all staff
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [staff] = await pool.execute(
      'SELECT * FROM staff_management ORDER BY display_order ASC'
    );
    res.json({ success: true, staff });
  } catch (error) {
    console.error('Fetch staff error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff' });
  }
});

// Update staff member
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, title_rw, name, email, phone, description, description_rw, responsibilities, responsibilities_rw } = req.body;
    await pool.execute(
      `UPDATE staff_management SET 
        title = ?, title_rw = ?, name = ?, email = ?, phone = ?,
        description = ?, description_rw = ?, responsibilities = ?, responsibilities_rw = ?
      WHERE id = ?`,
      [title, title_rw, name, email, phone, description, description_rw, responsibilities, responsibilities_rw, req.params.id]
    );
    res.json({ success: true, message: 'Staff member updated' });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ success: false, message: 'Failed to update staff' });
  }
});

// Upload staff image
router.post('/:id/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = `/uploads/staff/${req.file.filename}`;
    await pool.execute('UPDATE staff_management SET image = ? WHERE id = ?', [imageUrl, req.params.id]);
    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
});

module.exports = router;
