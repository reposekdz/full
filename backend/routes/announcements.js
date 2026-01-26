const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/announcements/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Get all announcements
router.get('/', async (req, res) => {
  try {
    const { target_audience, priority, status } = req.query;
    let query = `
      SELECT a.*, 
             u.username as published_by_name,
             (SELECT COUNT(*) FROM announcement_attachments WHERE announcement_id = a.id) as attachment_count
      FROM announcements a
      LEFT JOIN users u ON a.published_by = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (target_audience) {
      query += ' AND a.target_audience = ?';
      params.push(target_audience);
    }
    
    if (priority) {
      query += ' AND a.priority = ?';
      params.push(priority);
    }
    
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    } else {
      query += ' AND a.status = "published"';
    }
    
    query += ' ORDER BY a.priority DESC, a.published_at DESC';
    
    const [announcements] = await pool.execute(query, params);
    
    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
  }
});

// Get announcement by ID
router.get('/:id', async (req, res) => {
  try {
    const [announcement] = await pool.execute(`
      SELECT a.*, 
             u.username as published_by_name
      FROM announcements a
      LEFT JOIN users u ON a.published_by = u.id
      WHERE a.id = ?
    `, [req.params.id]);
    
    if (announcement.length === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    
    // Get attachments
    const [attachments] = await pool.execute(
      'SELECT * FROM announcement_attachments WHERE announcement_id = ?',
      [req.params.id]
    );
    
    res.json({ 
      success: true, 
      data: { 
        ...announcement[0], 
        attachments 
      } 
    });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch announcement' });
  }
});

// Get active announcements for user role
router.get('/active/:role', async (req, res) => {
  try {
    const { role } = req.params;
    
    const [announcements] = await pool.execute(`
      SELECT a.*, 
             u.username as published_by_name
      FROM announcements a
      LEFT JOIN users u ON a.published_by = u.id
      WHERE a.status = 'published'
      AND (a.target_audience = ? OR a.target_audience = 'all')
      AND (a.expires_at IS NULL OR a.expires_at > NOW())
      ORDER BY a.priority DESC, a.published_at DESC
      LIMIT 10
    `, [role]);
    
    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error('Error fetching active announcements:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active announcements' });
  }
});

// Create announcement
router.post('/', authenticateToken, upload.single('attachment'), async (req, res) => {
  try {
    const { title, content, target_audience, priority, expires_at, status } = req.body;
    const attachment_url = req.file ? `/uploads/announcements/${req.file.filename}` : null;
    
    const [result] = await pool.execute(`
      INSERT INTO announcements 
      (title, content, target_audience, priority, published_by, published_at, expires_at, status, attachment_url)
      VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?)
    `, [title, content, target_audience || 'all', priority || 'normal', 
        req.user.id, expires_at, status || 'draft', attachment_url]);
    
    res.json({ success: true, message: 'Announcement created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: 'Failed to create announcement' });
  }
});

// Add attachment to announcement
router.post('/:id/attachments', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO announcement_attachments (announcement_id, file_url, file_name, file_type)
      VALUES (?, ?, ?, ?)
    `, [
      req.params.id,
      `/uploads/announcements/${req.file.filename}`,
      req.file.originalname,
      req.file.mimetype
    ]);
    
    res.json({ success: true, message: 'Attachment added successfully', id: result.insertId });
  } catch (error) {
    console.error('Error adding attachment:', error);
    res.status(500).json({ success: false, message: 'Failed to add attachment' });
  }
});

// Update announcement
router.put('/:id', authenticateToken, upload.single('attachment'), async (req, res) => {
  try {
    const { title, content, target_audience, priority, expires_at, status } = req.body;
    
    let query = `
      UPDATE announcements 
      SET title = ?, content = ?, target_audience = ?, priority = ?, expires_at = ?, status = ?
    `;
    const params = [title, content, target_audience, priority, expires_at, status];
    
    if (req.file) {
      query += ', attachment_url = ?';
      params.push(`/uploads/announcements/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    
    res.json({ success: true, message: 'Announcement updated successfully' });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ success: false, message: 'Failed to update announcement' });
  }
});

// Publish announcement
router.patch('/:id/publish', authenticateToken, async (req, res) => {
  try {
    await pool.execute(`
      UPDATE announcements 
      SET status = 'published', published_at = NOW()
      WHERE id = ?
    `, [req.params.id]);
    
    res.json({ success: true, message: 'Announcement published successfully' });
  } catch (error) {
    console.error('Error publishing announcement:', error);
    res.status(500).json({ success: false, message: 'Failed to publish announcement' });
  }
});

// Archive announcement
router.patch('/:id/archive', authenticateToken, async (req, res) => {
  try {
    await pool.execute('UPDATE announcements SET status = "archived" WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Announcement archived successfully' });
  } catch (error) {
    console.error('Error archiving announcement:', error);
    res.status(500).json({ success: false, message: 'Failed to archive announcement' });
  }
});

// Delete announcement
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM announcement_attachments WHERE announcement_id = ?', [req.params.id]);
    await pool.execute('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ success: false, message: 'Failed to delete announcement' });
  }
});

module.exports = router;
