const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/testimonials/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Get all testimonials
router.get('/', async (req, res) => {
  try {
    const { is_featured, status } = req.query;
    let query = 'SELECT * FROM testimonials WHERE 1=1';
    const params = [];
    
    if (is_featured !== undefined) {
      query += ' AND is_featured = ?';
      params.push(is_featured);
    }
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY is_featured DESC, created_at DESC';
    
    const [testimonials] = await pool.execute(query, params);
    
    res.json({ success: true, data: testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch testimonials' });
  }
});

// Get featured testimonials
router.get('/featured', async (req, res) => {
  try {
    const [testimonials] = await pool.execute(`
      SELECT * FROM testimonials 
      WHERE is_featured = 1 AND status = 'approved'
      ORDER BY display_order ASC, created_at DESC
      LIMIT 10
    `);
    
    res.json({ success: true, data: testimonials });
  } catch (error) {
    console.error('Error fetching featured testimonials:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch featured testimonials' });
  }
});

// Get testimonial by ID
router.get('/:id', async (req, res) => {
  try {
    const [testimonial] = await pool.execute('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
    
    if (testimonial.length === 0) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    
    res.json({ success: true, data: testimonial[0] });
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch testimonial' });
  }
});

// Create testimonial
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, position, company, content, rating, status, is_featured, display_order } = req.body;
    const image_url = req.file ? `/uploads/testimonials/${req.file.filename}` : null;
    
    const [result] = await pool.execute(`
      INSERT INTO testimonials 
      (name, position, company, content, rating, image_url, status, is_featured, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, position, company, content, rating || 5, image_url, status || 'pending', is_featured ?? 0, display_order || 0]);
    
    res.json({ success: true, message: 'Testimonial created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ success: false, message: 'Failed to create testimonial' });
  }
});

// Update testimonial
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { name, position, company, content, rating, status, is_featured, display_order } = req.body;
    
    let query = `
      UPDATE testimonials 
      SET name = ?, position = ?, company = ?, content = ?, rating = ?, 
          status = ?, is_featured = ?, display_order = ?
    `;
    const params = [name, position, company, content, rating, status, is_featured, display_order];
    
    if (req.file) {
      query += ', image_url = ?';
      params.push(`/uploads/testimonials/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    
    res.json({ success: true, message: 'Testimonial updated successfully' });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ success: false, message: 'Failed to update testimonial' });
  }
});

// Approve testimonial
router.patch('/:id/approve', authenticateToken, async (req, res) => {
  try {
    await pool.execute('UPDATE testimonials SET status = "approved" WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Testimonial approved successfully' });
  } catch (error) {
    console.error('Error approving testimonial:', error);
    res.status(500).json({ success: false, message: 'Failed to approve testimonial' });
  }
});

// Feature testimonial
router.patch('/:id/feature', authenticateToken, async (req, res) => {
  try {
    const { is_featured } = req.body;
    await pool.execute('UPDATE testimonials SET is_featured = ? WHERE id = ?', [is_featured ? 1 : 0, req.params.id]);
    res.json({ success: true, message: 'Testimonial updated successfully' });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ success: false, message: 'Failed to update testimonial' });
  }
});

// Delete testimonial
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ success: false, message: 'Failed to delete testimonial' });
  }
});

module.exports = router;
