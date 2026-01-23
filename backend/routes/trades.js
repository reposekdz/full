const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/trades/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Get all trades with details
router.get('/', async (req, res) => {
  try {
    const [trades] = await pool.execute(`
      SELECT t.*, 
             COUNT(DISTINCT tl.id) as level_count,
             COUNT(DISTINCT tc.id) as class_count,
             COUNT(DISTINCT e.student_id) as student_count
      FROM trades t
      LEFT JOIN trade_levels tl ON t.code = tl.trade_code
      LEFT JOIN trade_classes tc ON tl.id = tc.trade_level_id
      LEFT JOIN enrollments e ON tc.id = e.class_id
      GROUP BY t.id
      ORDER BY t.code
    `);
    res.json({ success: true, trades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get trade details
router.get('/:code', async (req, res) => {
  try {
    const [trades] = await pool.execute(`SELECT * FROM trades WHERE code = ?`, [req.params.code]);
    const [levels] = await pool.execute(`SELECT * FROM trade_levels WHERE trade_code = ? ORDER BY level_number`, [req.params.code]);
    const [courses] = await pool.execute(`
      SELECT c.* FROM courses c
      JOIN trade_levels tl ON c.trade_level_id = tl.id
      WHERE tl.trade_code = ?
    `, [req.params.code]);
    const [facilities] = await pool.execute(`SELECT * FROM trade_facilities WHERE trade_code = ?`, [req.params.code]);
    const [instructors] = await pool.execute(`
      SELECT DISTINCT u.* FROM users u
      JOIN courses c ON u.id = c.instructor_id
      JOIN trade_levels tl ON c.trade_level_id = tl.id
      WHERE tl.trade_code = ?
    `, [req.params.code]);
    
    res.json({ success: true, trade: trades[0], levels, courses, facilities, instructors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update trade (Admin/DOS)
router.put('/:code', authenticateToken, requireRole('admin', 'dos', 'headmaster'), upload.single('image'), async (req, res) => {
  try {
    const { name, description_rw, description_en, description_fr, duration, requirements_rw, requirements_en, requirements_fr, career_prospects_rw, career_prospects_en, career_prospects_fr } = req.body;
    let query = `UPDATE trades SET name = ?, description_rw = ?, description_en = ?, description_fr = ?, duration = ?, requirements_rw = ?, requirements_en = ?, requirements_fr = ?, career_prospects_rw = ?, career_prospects_en = ?, career_prospects_fr = ?`;
    const params = [name, description_rw, description_en, description_fr, duration, requirements_rw, requirements_en, requirements_fr, career_prospects_rw, career_prospects_en, career_prospects_fr];
    
    if (req.file) {
      query += `, image_url = ?`;
      params.push(`/uploads/trades/${req.file.filename}`);
    }
    
    query += ` WHERE code = ?`;
    params.push(req.params.code);
    
    await pool.execute(query, params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add facility
router.post('/:code/facilities', authenticateToken, requireRole('admin', 'dos', 'headmaster'), upload.single('image'), async (req, res) => {
  try {
    const { name_rw, name_en, name_fr, description_rw, description_en, description_fr } = req.body;
    const image = req.file ? `/uploads/trades/${req.file.filename}` : null;
    
    const [result] = await pool.execute(`
      INSERT INTO trade_facilities (trade_code, name_rw, name_en, name_fr, description_rw, description_en, description_fr, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.params.code, name_rw, name_en, name_fr, description_rw, description_en, description_fr, image]);
    
    res.json({ success: true, facilityId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
