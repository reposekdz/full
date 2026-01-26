const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/clubs/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Get all clubs
router.get('/', async (req, res) => {
  try {
    const { category, is_active } = req.query;
    let query = `
      SELECT c.*,
             (SELECT COUNT(*) FROM club_members WHERE club_id = c.id) as member_count
      FROM clubs c
      WHERE 1=1
    `;
    const params = [];
    
    if (category) {
      query += ' AND c.category = ?';
      params.push(category);
    }
    
    if (is_active !== undefined) {
      query += ' AND c.is_active = ?';
      params.push(is_active);
    }
    
    query += ' ORDER BY c.name ASC';
    
    const [clubs] = await pool.execute(query, params);
    
    res.json({ success: true, data: clubs });
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch clubs' });
  }
});

// Get club by ID
router.get('/:id', async (req, res) => {
  try {
    const [club] = await pool.execute(`
      SELECT c.*,
             t.name as teacher_name,
             (SELECT COUNT(*) FROM club_members WHERE club_id = c.id) as member_count
      FROM clubs c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      WHERE c.id = ?
    `, [req.params.id]);
    
    if (club.length === 0) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    
    // Get members
    const [members] = await pool.execute(`
      SELECT cm.*, 
             s.first_name, s.last_name, s.student_code, s.class_id,
             cl.name as class_name
      FROM club_members cm
      JOIN students s ON cm.student_id = s.id
      LEFT JOIN classes cl ON s.class_id = cl.id
      WHERE cm.club_id = ?
      ORDER BY cm.joined_at DESC
    `, [req.params.id]);
    
    res.json({ 
      success: true, 
      data: { 
        ...club[0], 
        members 
      } 
    });
  } catch (error) {
    console.error('Error fetching club:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch club' });
  }
});

// Get student's clubs
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const [clubs] = await pool.execute(`
      SELECT c.*, cm.role, cm.joined_at
      FROM club_members cm
      JOIN clubs c ON cm.club_id = c.id
      WHERE cm.student_id = ?
      AND c.is_active = 1
      ORDER BY c.name ASC
    `, [req.params.studentId]);
    
    res.json({ success: true, data: clubs });
  } catch (error) {
    console.error('Error fetching student clubs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student clubs' });
  }
});

// Create club
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, teacher_id, meeting_schedule, meeting_location, max_members, is_active } = req.body;
    const image_url = req.file ? `/uploads/clubs/${req.file.filename}` : null;
    
    const [result] = await pool.execute(`
      INSERT INTO clubs 
      (name, description, category, teacher_id, meeting_schedule, meeting_location, max_members, is_active, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, description, category, teacher_id, meeting_schedule, meeting_location, max_members || 50, is_active ?? 1, image_url]);
    
    res.json({ success: true, message: 'Club created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating club:', error);
    res.status(500).json({ success: false, message: 'Failed to create club' });
  }
});

// Add member to club
router.post('/:id/members', authenticateToken, async (req, res) => {
  try {
    const { student_id, role } = req.body;
    
    // Check if club is full
    const [club] = await pool.execute(`
      SELECT max_members,
             (SELECT COUNT(*) FROM club_members WHERE club_id = ?) as current_members
      FROM clubs WHERE id = ?
    `, [req.params.id, req.params.id]);
    
    if (club.length === 0) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    
    if (club[0].current_members >= club[0].max_members) {
      return res.status(400).json({ success: false, message: 'Club is full' });
    }
    
    // Check if already a member
    const [existing] = await pool.execute(
      'SELECT id FROM club_members WHERE club_id = ? AND student_id = ?',
      [req.params.id, student_id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Student is already a member' });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO club_members (club_id, student_id, role, joined_at)
      VALUES (?, ?, ?, NOW())
    `, [req.params.id, student_id, role || 'member']);
    
    res.json({ success: true, message: 'Member added successfully', id: result.insertId });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ success: false, message: 'Failed to add member' });
  }
});

// Update member role
router.put('/:id/members/:memberId', authenticateToken, async (req, res) => {
  try {
    const { role } = req.body;
    
    await pool.execute(
      'UPDATE club_members SET role = ? WHERE id = ?',
      [role, req.params.memberId]
    );
    
    res.json({ success: true, message: 'Member role updated successfully' });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ success: false, message: 'Failed to update member' });
  }
});

// Remove member from club
router.delete('/:id/members/:memberId', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM club_members WHERE id = ?', [req.params.memberId]);
    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ success: false, message: 'Failed to remove member' });
  }
});

// Update club
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, teacher_id, meeting_schedule, meeting_location, max_members, is_active } = req.body;
    
    let query = `
      UPDATE clubs 
      SET name = ?, description = ?, category = ?, teacher_id = ?, 
          meeting_schedule = ?, meeting_location = ?, max_members = ?, is_active = ?
    `;
    const params = [name, description, category, teacher_id, meeting_schedule, meeting_location, max_members, is_active];
    
    if (req.file) {
      query += ', image_url = ?';
      params.push(`/uploads/clubs/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    
    res.json({ success: true, message: 'Club updated successfully' });
  } catch (error) {
    console.error('Error updating club:', error);
    res.status(500).json({ success: false, message: 'Failed to update club' });
  }
});

// Delete club
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM club_members WHERE club_id = ?', [req.params.id]);
    await pool.execute('DELETE FROM clubs WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Club deleted successfully' });
  } catch (error) {
    console.error('Error deleting club:', error);
    res.status(500).json({ success: false, message: 'Failed to delete club' });
  }
});

module.exports = router;
