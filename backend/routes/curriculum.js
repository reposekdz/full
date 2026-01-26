const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all curriculum
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [curricula] = await pool.execute(`
      SELECT c.*, 
             sub.name as subject_name,
             cls.name as class_name
      FROM curriculum c
      LEFT JOIN subjects sub ON c.subject_id = sub.id
      LEFT JOIN classes cls ON c.class_id = cls.id
      ORDER BY c.created_at DESC
    `);
    
    res.json({ success: true, data: curricula });
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch curriculum' });
  }
});

// Get curriculum by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [curriculum] = await pool.execute(`
      SELECT c.*, 
             sub.name as subject_name,
             cls.name as class_name
      FROM curriculum c
      LEFT JOIN subjects sub ON c.subject_id = sub.id
      LEFT JOIN classes cls ON c.class_id = cls.id
      WHERE c.id = ?
    `, [req.params.id]);
    
    if (curriculum.length === 0) {
      return res.status(404).json({ success: false, message: 'Curriculum not found' });
    }
    
    res.json({ success: true, data: curriculum[0] });
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch curriculum' });
  }
});

// Get curriculum by class
router.get('/class/:classId', authenticateToken, async (req, res) => {
  try {
    const [curricula] = await pool.execute(`
      SELECT c.*, 
             sub.name as subject_name
      FROM curriculum c
      LEFT JOIN subjects sub ON c.subject_id = sub.id
      WHERE c.class_id = ?
      ORDER BY c.created_at DESC
    `, [req.params.classId]);
    
    res.json({ success: true, data: curricula });
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch curriculum' });
  }
});

// Get curriculum by subject
router.get('/subject/:subjectId', authenticateToken, async (req, res) => {
  try {
    const [curricula] = await pool.execute(`
      SELECT c.*, 
             cls.name as class_name
      FROM curriculum c
      LEFT JOIN classes cls ON c.class_id = cls.id
      WHERE c.subject_id = ?
      ORDER BY c.created_at DESC
    `, [req.params.subjectId]);
    
    res.json({ success: true, data: curricula });
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch curriculum' });
  }
});

// Create curriculum
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { subject_id, class_id, topic, description, duration_weeks, learning_objectives, teaching_methods, assessment_methods, resources, is_active } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO curriculum 
      (subject_id, class_id, topic, description, duration_weeks, learning_objectives, teaching_methods, assessment_methods, resources, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [subject_id, class_id, topic, description, duration_weeks, 
        JSON.stringify(learning_objectives), JSON.stringify(teaching_methods), 
        JSON.stringify(assessment_methods), JSON.stringify(resources), is_active ?? 1]);
    
    res.json({ success: true, message: 'Curriculum created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating curriculum:', error);
    res.status(500).json({ success: false, message: 'Failed to create curriculum' });
  }
});

// Update curriculum
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { subject_id, class_id, topic, description, duration_weeks, learning_objectives, teaching_methods, assessment_methods, resources, is_active } = req.body;
    
    await pool.execute(`
      UPDATE curriculum 
      SET subject_id = ?, class_id = ?, topic = ?, description = ?, duration_weeks = ?, 
          learning_objectives = ?, teaching_methods = ?, assessment_methods = ?, resources = ?, is_active = ?
      WHERE id = ?
    `, [subject_id, class_id, topic, description, duration_weeks, 
        JSON.stringify(learning_objectives), JSON.stringify(teaching_methods), 
        JSON.stringify(assessment_methods), JSON.stringify(resources), is_active, req.params.id]);
    
    res.json({ success: true, message: 'Curriculum updated successfully' });
  } catch (error) {
    console.error('Error updating curriculum:', error);
    res.status(500).json({ success: false, message: 'Failed to update curriculum' });
  }
});

// Delete curriculum
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM curriculum WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Curriculum deleted successfully' });
  } catch (error) {
    console.error('Error deleting curriculum:', error);
    res.status(500).json({ success: false, message: 'Failed to delete curriculum' });
  }
});

module.exports = router;
