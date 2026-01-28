const express = require('express');
const router = express.Router();
const db = require('../config/database');

// --- Student Endpoints ---

// Get all active competitions
router.get('/competitions', async (req, res) => {
  try {
    const [rows] = await db.pool.query('SELECT * FROM competitions WHERE status = "active" ORDER BY start_date ASC');
    res.json({ success: true, competitions: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Participate in competition
router.post('/competitions/participate', async (req, res) => {
  try {
    const { student_id, competition_id, submission_content } = req.body;
    
    // Check if already participating
    const [existing] = await db.pool.query('SELECT id FROM competition_participants WHERE student_id = ? AND competition_id = ?', [student_id, competition_id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Usanzwe uri mu bitabiriye iri rushanwa' });
    }

    await db.pool.query(`
      INSERT INTO competition_participants (student_id, competition_id, submission_content)
      VALUES (?, ?, ?)
    `, [student_id, competition_id, submission_content]);

    res.json({ success: true, message: 'Witabiriye irushanwa neza' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get study materials for student's class
router.get('/study-materials/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    
    const [materials] = await db.pool.query(`
      SELECT m.*, u.first_name, u.last_name as teacher_name
      FROM teacher_materials m
      JOIN users u ON m.teacher_id = u.id
      WHERE m.class_id = ?
      ORDER BY m.created_at DESC
    `, [classId]);

    const [links] = await db.pool.query(`
      SELECT l.*, u.first_name, u.last_name as teacher_name
      FROM study_links l
      JOIN users u ON l.teacher_id = u.id
      WHERE l.class_id = ?
      ORDER BY l.created_at DESC
    `, [classId]);

    res.json({ success: true, materials, links });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get student points and achievements
router.get('/achievements/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const [achievements] = await db.pool.query('SELECT * FROM student_achievements WHERE student_id = ? ORDER BY date_earned DESC', [studentId]);
    const [[{ total_points }]] = await db.pool.query('SELECT SUM(points) as total_points FROM student_achievements WHERE student_id = ?', [studentId]);
    
    res.json({ success: true, achievements, total_points: total_points || 0 });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Admin/Headmaster Endpoints ---

// Create Competition
router.post('/admin/competitions/create', async (req, res) => {
  try {
    const { title, description, start_date, end_date, category, points_reward, created_by } = req.body;
    const [result] = await db.pool.query(`
      INSERT INTO competitions (title, description, start_date, end_date, category, points_reward, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, description, start_date, end_date, category, points_reward, created_by]);
    
    res.json({ success: true, message: 'Irushanwa ryashyizweho neza', competition_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Score Competition Participant and reward points
router.post('/admin/competitions/score', async (req, res) => {
  const connection = await db.pool.getConnection();
  try {
    const { participant_id, score } = req.body;
    await connection.beginTransaction();

    // Get participant and competition details
    const [participant] = await connection.query(`
      SELECT p.*, c.points_reward, c.title as competition_title
      FROM competition_participants p
      JOIN competitions c ON p.competition_id = c.id
      WHERE p.id = ?
    `, [participant_id]);

    if (participant.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }

    const p = participant[0];
    const points_to_award = Math.floor((score / 100) * p.points_reward);

    // Update participant record
    await connection.query('UPDATE competition_participants SET score = ?, achieved_points = ?, status = "graded" WHERE id = ?', [score, points_to_award, participant_id]);

    // Award points to student_achievements
    await connection.query(`
      INSERT INTO student_achievements (student_id, achievement_type, points, description)
      VALUES (?, 'Competition', ?, ?)
    `, [p.student_id, points_to_award, `Yabonye amanota mu irushanwa: ${p.competition_title}`]);

    await connection.commit();
    res.json({ success: true, message: 'Amanota n\'ibihembo byashyizweho neza' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
