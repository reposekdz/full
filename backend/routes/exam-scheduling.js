const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Create exam schedule
router.post('/schedule', async (req, res) => {
  try {
    const { exam_name, exam_type, academic_year, term, start_date, end_date, created_by } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO exam_schedules (exam_name, exam_type, academic_year, term, start_date, end_date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        exam_name || 'Exam', 
        exam_type || 'Regular', 
        academic_year || new Date().getFullYear(), 
        term || 1, 
        start_date || new Date().toISOString().split('T')[0], 
        end_date || new Date().toISOString().split('T')[0], 
        created_by || null
      ]
    );
    
    res.json({ success: true, schedule_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add exam session
router.post('/sessions', async (req, res) => {
  try {
    const { schedule_id, subject_id, exam_date, start_time, end_time, duration, room_id, max_students } = req.body;
    
    // Check for conflicts
    const [conflicts] = await pool.execute(
      `SELECT * FROM exam_sessions WHERE room_id = ? AND exam_date = ? 
       AND ((start_time BETWEEN ? AND ?) OR (end_time BETWEEN ? AND ?))`,
      [room_id, exam_date, start_time, end_time, start_time, end_time]
    );
    
    if (conflicts.length > 0) {
      return res.status(400).json({ success: false, message: 'Room conflict detected', conflicts });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO exam_sessions (schedule_id, subject_id, exam_date, start_time, end_time, duration, room_id, max_students) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [schedule_id, subject_id, exam_date, start_time, end_time, duration, room_id, max_students]
    );
    
    res.json({ success: true, session_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Assign invigilators
router.post('/sessions/:id/invigilators', async (req, res) => {
  try {
    const { teacher_ids } = req.body;
    
    // Check teacher availability
    const [session] = await pool.execute('SELECT exam_date, start_time, end_time FROM exam_sessions WHERE id = ?', [req.params.id]);
    
    for (const teacher_id of teacher_ids) {
      const [conflicts] = await pool.execute(
        `SELECT es.* FROM exam_invigilators ei 
         JOIN exam_sessions es ON ei.session_id = es.id 
         WHERE ei.teacher_id = ? AND es.exam_date = ? 
         AND ((es.start_time BETWEEN ? AND ?) OR (es.end_time BETWEEN ? AND ?))`,
        [teacher_id, session[0].exam_date, session[0].start_time, session[0].end_time, session[0].start_time, session[0].end_time]
      );
      
      if (conflicts.length > 0) {
        return res.status(400).json({ success: false, message: `Teacher ${teacher_id} has conflicting assignment` });
      }
      
      await pool.execute('INSERT INTO exam_invigilators (session_id, teacher_id) VALUES (?, ?)', [req.params.id, teacher_id]);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get exam schedule
router.get('/schedule/:id', async (req, res) => {
  try {
    const [schedule] = await pool.execute('SELECT * FROM exam_schedules WHERE id = ?', [req.params.id]);
    if (schedule.length === 0) return res.status(404).json({ success: false, message: 'Schedule not found' });
    
    const [sessions] = await pool.execute(
      `SELECT es.*, s.name as subject_name, r.name as room_name, r.capacity 
       FROM exam_sessions es 
       LEFT JOIN subjects s ON es.subject_id = s.id 
       LEFT JOIN rooms r ON es.room_id = r.id 
       WHERE es.schedule_id = ? 
       ORDER BY es.exam_date, es.start_time`,
      [req.params.id]
    );
    
    // Get invigilators for each session
    for (let session of sessions) {
      const [invigilators] = await pool.execute(
        `SELECT ei.*, t.first_name, t.last_name FROM exam_invigilators ei 
         JOIN teachers t ON ei.teacher_id = t.id 
         WHERE ei.session_id = ?`,
        [session.id]
      );
      session.invigilators = invigilators;
    }
    
    res.json({ success: true, schedule: schedule[0], sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student exam timetable
router.get('/student/:studentId/timetable', async (req, res) => {
  try {
    const { schedule_id } = req.query;
    
    const [sessions] = await pool.execute(
      `SELECT es.*, s.name as subject_name, r.name as room_name 
       FROM exam_sessions es 
       JOIN subjects s ON es.subject_id = s.id 
       JOIN rooms r ON es.room_id = r.id 
       JOIN student_subjects ss ON s.id = ss.subject_id 
       WHERE ss.student_id = ? AND es.schedule_id = ? 
       ORDER BY es.exam_date, es.start_time`,
      [req.params.studentId, schedule_id]
    );
    
    res.json({ success: true, timetable: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get teacher invigilation schedule
router.get('/teacher/:teacherId/invigilation', async (req, res) => {
  try {
    const { schedule_id } = req.query;
    
    const [sessions] = await pool.execute(
      `SELECT es.*, s.name as subject_name, r.name as room_name 
       FROM exam_invigilators ei 
       JOIN exam_sessions es ON ei.session_id = es.id 
       JOIN subjects s ON es.subject_id = s.id 
       JOIN rooms r ON es.room_id = r.id 
       WHERE ei.teacher_id = ? AND es.schedule_id = ? 
       ORDER BY es.exam_date, es.start_time`,
      [req.params.teacherId, schedule_id]
    );
    
    res.json({ success: true, schedule: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get available rooms
router.get('/rooms/available', async (req, res) => {
  try {
    const { exam_date, start_time, end_time } = req.query;
    
    const [rooms] = await pool.execute(
      `SELECT r.* FROM rooms r 
       WHERE r.id NOT IN (
         SELECT room_id FROM exam_sessions 
         WHERE exam_date = ? 
         AND ((start_time BETWEEN ? AND ?) OR (end_time BETWEEN ? AND ?))
       )`,
      [exam_date, start_time, end_time, start_time, end_time]
    );
    
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Publish schedule
router.put('/schedule/:id/publish', async (req, res) => {
  try {
    await pool.execute('UPDATE exam_schedules SET status = ?, published_at = NOW() WHERE id = ?', ['published', req.params.id]);
    
    // Notify all students and teachers
    if (global.io) {
      global.io.emit('exam_schedule_published', { schedule_id: req.params.id });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
