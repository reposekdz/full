const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const multer = require('multer');
const bcrypt = require('bcryptjs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/profiles/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const DISCIPLINE_ROLES = ['dod', 'matron', 'patron', 'admin'];

// Get Profile
router.get('/profile', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const [user] = await pool.execute(`
      SELECT id, first_name, last_name, email, phone, role, profile_image, 
        bio, department, office_location, created_at
      FROM users WHERE id = ?
    `, [req.user.id]);
    
    if (!user.length) return res.status(404).json({ success: false, message: 'User not found' });
    
    const [stats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM student_conduct_records WHERE handled_by = ?) as total_cases,
        (SELECT COUNT(*) FROM student_conduct_records WHERE handled_by = ? AND status = 'active') as active_cases,
        (SELECT COUNT(*) FROM dormitory_inspections WHERE inspector_id = ?) as total_inspections,
        (SELECT COUNT(*) FROM student_counseling_sessions WHERE counselor_id = ?) as total_sessions
    `, [req.user.id, req.user.id, req.user.id, req.user.id]);
    
    res.json({ success: true, profile: user[0], stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Profile
router.put('/profile', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const { first_name, last_name, phone, bio, department, office_location } = req.body;
    
    await pool.execute(`
      UPDATE users 
      SET first_name = ?, last_name = ?, phone = ?, bio = ?, department = ?, office_location = ?
      WHERE id = ?
    `, [first_name, last_name, phone, bio, department, office_location, req.user.id]);
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload Profile Image
router.post('/profile/image', authenticateToken, requireRole(...DISCIPLINE_ROLES), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image provided' });
    
    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    await pool.execute('UPDATE users SET profile_image = ? WHERE id = ?', [imageUrl, req.user.id]);
    
    res.json({ success: true, message: 'Profile image updated', image_url: imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Change Password
router.post('/profile/password', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    
    const [user] = await pool.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (!user.length) return res.status(404).json({ success: false, message: 'User not found' });
    
    const validPassword = await bcrypt.compare(current_password, user[0].password);
    if (!validPassword) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
