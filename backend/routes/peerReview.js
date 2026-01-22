const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Submit peer review (Student)
router.post('/', authenticate, authorize(['student']), async (req, res) => {
  try {
    const { submission_id, submission_type, review_content, rating, criteria_ratings, is_anonymous } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO peer_reviews (submission_id, submission_type, reviewer_id, review_content, rating, criteria_ratings, is_anonymous) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [submission_id, submission_type, req.user.id, review_content, rating, JSON.stringify(criteria_ratings), is_anonymous]
    );
    
    res.status(201).json({ id: result.insertId, message: 'Peer review submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get peer reviews for submission
router.get('/submission/:type/:id', authenticate, async (req, res) => {
  try {
    const [reviews] = await db.query(
      `SELECT pr.*, u.name as reviewer_name 
       FROM peer_reviews pr 
       LEFT JOIN users u ON pr.reviewer_id = u.id 
       WHERE pr.submission_id = ? AND pr.submission_type = ? 
       ORDER BY pr.created_at DESC`,
      [req.params.id, req.params.type]
    );
    
    const sanitized = reviews.map(r => ({
      ...r,
      reviewer_name: r.is_anonymous ? 'Anonymous' : r.reviewer_name
    }));
    
    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create collaboration group
router.post('/groups', authenticate, async (req, res) => {
  try {
    const { name, description, subject_id, trade_class_id, max_members, collaboration_type, rules } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO collaboration_groups (name, description, creator_id, subject_id, trade_class_id, max_members, collaboration_type, rules) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, req.user.id, subject_id, trade_class_id, max_members, collaboration_type, rules]
    );
    
    await db.query(
      `INSERT INTO collaboration_group_members (group_id, user_id, role) VALUES (?, ?, 'leader')`,
      [result.insertId, req.user.id]
    );
    
    res.status(201).json({ id: result.insertId, message: 'Collaboration group created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join collaboration group
router.post('/groups/:id/join', authenticate, async (req, res) => {
  try {
    const [group] = await db.query('SELECT * FROM collaboration_groups WHERE id = ?', [req.params.id]);
    const [members] = await db.query('SELECT COUNT(*) as count FROM collaboration_group_members WHERE group_id = ? AND is_active = true', [req.params.id]);
    
    if (members[0].count >= group[0].max_members) {
      return res.status(400).json({ error: 'Group is full' });
    }
    
    await db.query(
      `INSERT INTO collaboration_group_members (group_id, user_id, role) VALUES (?, ?, 'member')`,
      [req.params.id, req.user.id]
    );
    
    res.json({ message: 'Joined group successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
