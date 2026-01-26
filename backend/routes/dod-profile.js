const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `profile_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Gufata amafoto gusa'));
}});

// GET Profile with stats
router.get('/:userId', async (req, res) => {
  try {
    const [user] = await db.pool.query('SELECT id, first_name, last_name, email, phone, bio, photo, created_at, last_login FROM users WHERE id = ?', [req.params.userId]);
    const [activities] = await db.pool.query('SELECT * FROM dod_activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [req.params.userId]);
    const [stats] = await db.pool.query('SELECT COUNT(*) as total_actions FROM dod_activity_log WHERE user_id = ?', [req.params.userId]);
    res.json({ success: true, profile: user[0], activities, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT Update Profile
router.put('/:userId', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, bio } = req.body;
    await db.pool.query('UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, bio = ? WHERE id = ?', 
      [first_name, last_name, email, phone, bio, req.params.userId]);
    await db.pool.query('INSERT INTO dod_activity_log (user_id, action, module, created_at) VALUES (?, "Guhindura profil", "profil", NOW())', [req.params.userId]);
    res.json({ success: true, message: 'Profil yahinduwe' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST Upload Photo
router.post('/:userId/photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Nta foto yashyizweho' });
    const photoUrl = `/uploads/profiles/${req.file.filename}`;
    await db.pool.query('UPDATE users SET photo = ? WHERE id = ?', [photoUrl, req.params.userId]);
    await db.pool.query('INSERT INTO dod_activity_log (user_id, action, module, created_at) VALUES (?, "Gushyira ifoto", "profil", NOW())', [req.params.userId]);
    res.json({ success: true, message: 'Ifoto yashyizweho', photo: photoUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE Remove Photo
router.delete('/:userId/photo', async (req, res) => {
  try {
    const [user] = await db.pool.query('SELECT photo FROM users WHERE id = ?', [req.params.userId]);
    if (user[0]?.photo) {
      const filePath = path.join(__dirname, '..', user[0].photo);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await db.pool.query('UPDATE users SET photo = NULL WHERE id = ?', [req.params.userId]);
    res.json({ success: true, message: 'Ifoto yakuweho' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT Change Password
router.put('/:userId/password', async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    const [user] = await db.pool.query('SELECT password FROM users WHERE id = ?', [req.params.userId]);
    if (user[0].password !== old_password) return res.status(400).json({ success: false, error: 'Ijambo ryibanga ridakora' });
    await db.pool.query('UPDATE users SET password = ? WHERE id = ?', [new_password, req.params.userId]);
    await db.pool.query('INSERT INTO dod_activity_log (user_id, action, module, created_at) VALUES (?, "Guhindura ijambo ryibanga", "umutekano", NOW())', [req.params.userId]);
    res.json({ success: true, message: 'Ijambo ryibanga ryahinduwe' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET Activity Log
router.get('/:userId/activities', async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const [activities] = await db.pool.query('SELECT * FROM dod_activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', [req.params.userId, parseInt(limit)]);
    res.json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT Update Preferences
router.put('/:userId/preferences', async (req, res) => {
  try {
    const { theme, language, notifications_enabled, email_notifications } = req.body;
    const prefs = JSON.stringify({ theme, language, notifications_enabled, email_notifications });
    await db.pool.query('UPDATE users SET preferences = ? WHERE id = ?', [prefs, req.params.userId]);
    res.json({ success: true, message: 'Amahitamo yahinduwe' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
