const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/services/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Get all services
router.get('/', async (req, res) => {
  try {
    const [services] = await pool.execute(`
      SELECT s.*, COUNT(si.id) as item_count
      FROM services s
      LEFT JOIN service_items si ON s.id = si.service_id
      WHERE s.is_active = true
      GROUP BY s.id
      ORDER BY s.display_order ASC
    `);
    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get service details
router.get('/:id', async (req, res) => {
  try {
    const [services] = await pool.execute(`SELECT * FROM services WHERE id = ?`, [req.params.id]);
    const [items] = await pool.execute(`SELECT * FROM service_items WHERE service_id = ? ORDER BY display_order`, [req.params.id]);
    res.json({ success: true, service: services[0], items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create service (Admin/DOS)
router.post('/', authenticateToken, requireRole('admin', 'dos', 'headmaster'), upload.single('icon'), async (req, res) => {
  try {
    const { title_rw, title_en, title_fr, description_rw, description_en, description_fr, category, display_order } = req.body;
    const icon = req.file ? `/uploads/services/${req.file.filename}` : null;
    
    const [result] = await pool.execute(`
      INSERT INTO services (title_rw, title_en, title_fr, description_rw, description_en, description_fr, category, icon, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true)
    `, [title_rw, title_en, title_fr, description_rw, description_en, description_fr, category, icon, display_order || 0]);
    
    res.json({ success: true, serviceId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update service
router.put('/:id', authenticateToken, requireRole('admin', 'dos', 'headmaster'), upload.single('icon'), async (req, res) => {
  try {
    const { title_rw, title_en, title_fr, description_rw, description_en, description_fr, category, display_order, is_active } = req.body;
    let query = `UPDATE services SET title_rw = ?, title_en = ?, title_fr = ?, description_rw = ?, description_en = ?, description_fr = ?, category = ?, display_order = ?, is_active = ?`;
    const params = [title_rw, title_en, title_fr, description_rw, description_en, description_fr, category, display_order, is_active];
    
    if (req.file) {
      query += `, icon = ?`;
      params.push(`/uploads/services/${req.file.filename}`);
    }
    
    query += ` WHERE id = ?`;
    params.push(req.params.id);
    
    await pool.execute(query, params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete service
router.delete('/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    await pool.execute(`UPDATE services SET is_active = false WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add service item
router.post('/:id/items', authenticateToken, requireRole('admin', 'dos', 'headmaster'), async (req, res) => {
  try {
    const { title_rw, title_en, title_fr, description_rw, description_en, description_fr, display_order } = req.body;
    const [result] = await pool.execute(`
      INSERT INTO service_items (service_id, title_rw, title_en, title_fr, description_rw, description_en, description_fr, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.params.id, title_rw, title_en, title_fr, description_rw, description_en, description_fr, display_order || 0]);
    
    res.json({ success: true, itemId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
