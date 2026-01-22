const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get timetable entries
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { class_id, teacher_id, subject_id, day_of_week, academic_year_id } = req.query;
    
    let query = `
      SELECT t.*, 
        c.class_name, c.trade, c.level,
        s.name as subject_name, s.code as subject_code,
        u.first_name as teacher_first_name, u.last_name as teacher_last_name,
        ay.year_name
      FROM timetable_entries t
      JOIN classes c ON t.class_id = c.id
      JOIN subjects s ON t.subject_id = s.id
      JOIN users u ON t.teacher_id = u.id
      JOIN academic_years ay ON t.academic_year_id = ay.id
      WHERE 1=1
    `;
    const params = [];

    if (class_id) {
      query += ' AND t.class_id = ?';
      params.push(class_id);
    }
    if (teacher_id) {
      query += ' AND t.teacher_id = ?';
      params.push(teacher_id);
    }
    if (subject_id) {
      query += ' AND t.subject_id = ?';
      params.push(subject_id);
    }
    if (day_of_week) {
      query += ' AND t.day_of_week = ?';
      params.push(day_of_week);
    }
    if (academic_year_id) {
      query += ' AND t.academic_year_id = ?';
      params.push(academic_year_id);
    }

    query += ' ORDER BY FIELD(t.day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"), t.start_time';

    const [timetable] = await pool.query(query, params);
    res.json({ success: true, timetable });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch timetable' });
  }
});

// Get student timetable
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Get student's current class
    const [enrollments] = await pool.query(`
      SELECT class_id FROM enrollments 
      WHERE student_id = ? AND status = 'active'
      ORDER BY enrollment_date DESC LIMIT 1
    `, [studentId]);

    if (enrollments.length === 0) {
      return res.json({ success: true, timetable: [] });
    }

    const classId = enrollments[0].class_id;

    const [timetable] = await pool.query(`
      SELECT t.*, 
        c.class_name,
        s.name as subject_name, s.code as subject_code,
        u.first_name as teacher_first_name, u.last_name as teacher_last_name
      FROM timetable_entries t
      JOIN classes c ON t.class_id = c.id
      JOIN subjects s ON t.subject_id = s.id
      JOIN users u ON t.teacher_id = u.id
      WHERE t.class_id = ?
      ORDER BY FIELD(t.day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"), t.start_time
    `, [classId]);

    res.json({ success: true, timetable });
  } catch (error) {
    console.error('Error fetching student timetable:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch timetable' });
  }
});

// Get teacher timetable
router.get('/teacher/:teacherId', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.params.teacherId;

    const [timetable] = await pool.query(`
      SELECT t.*, 
        c.class_name, c.trade, c.level,
        s.name as subject_name, s.code as subject_code
      FROM timetable_entries t
      JOIN classes c ON t.class_id = c.id
      JOIN subjects s ON t.subject_id = s.id
      WHERE t.teacher_id = ?
      ORDER BY FIELD(t.day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"), t.start_time
    `, [teacherId]);

    res.json({ success: true, timetable });
  } catch (error) {
    console.error('Error fetching teacher timetable:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch timetable' });
  }
});

// Create timetable entry
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room, academic_year_id } = req.body;

    // Check for conflicts
    const [conflicts] = await pool.query(`
      SELECT * FROM timetable_entries
      WHERE (class_id = ? OR teacher_id = ? OR room = ?)
      AND day_of_week = ?
      AND academic_year_id = ?
      AND (
        (start_time <= ? AND end_time > ?)
        OR (start_time < ? AND end_time >= ?)
        OR (start_time >= ? AND end_time <= ?)
      )
    `, [class_id, teacher_id, room, day_of_week, academic_year_id, start_time, start_time, end_time, end_time, start_time, end_time]);

    if (conflicts.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Time slot conflict detected',
        conflicts 
      });
    }

    const [result] = await pool.query(`
      INSERT INTO timetable_entries (class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room, academic_year_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room, academic_year_id]);

    res.json({ success: true, message: 'Timetable entry created successfully', entryId: result.insertId });
  } catch (error) {
    console.error('Error creating timetable entry:', error);
    res.status(500).json({ success: false, message: 'Failed to create timetable entry' });
  }
});

// Update timetable entry
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updates = [];
    const values = [];

    const allowedFields = ['class_id', 'subject_id', 'teacher_id', 'day_of_week', 'start_time', 'end_time', 'room'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(req.params.id);
    await pool.query(`UPDATE timetable_entries SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'Timetable entry updated successfully' });
  } catch (error) {
    console.error('Error updating timetable entry:', error);
    res.status(500).json({ success: false, message: 'Failed to update timetable entry' });
  }
});

// Delete timetable entry
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM timetable_entries WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Timetable entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting timetable entry:', error);
    res.status(500).json({ success: false, message: 'Failed to delete timetable entry' });
  }
});

// Get timetable conflicts
router.get('/conflicts', authenticateToken, async (req, res) => {
  try {
    const { academic_year_id } = req.query;

    const [conflicts] = await pool.query(`
      SELECT t1.*, t2.id as conflict_id,
        c1.class_name as class1, c2.class_name as class2,
        s1.name as subject1, s2.name as subject2,
        u1.first_name as teacher1_first, u1.last_name as teacher1_last,
        u2.first_name as teacher2_first, u2.last_name as teacher2_last
      FROM timetable_entries t1
      JOIN timetable_entries t2 ON t1.id < t2.id
      JOIN classes c1 ON t1.class_id = c1.id
      JOIN classes c2 ON t2.class_id = c2.id
      JOIN subjects s1 ON t1.subject_id = s1.id
      JOIN subjects s2 ON t2.subject_id = s2.id
      JOIN users u1 ON t1.teacher_id = u1.id
      JOIN users u2 ON t2.teacher_id = u2.id
      WHERE t1.day_of_week = t2.day_of_week
      AND t1.academic_year_id = t2.academic_year_id
      ${academic_year_id ? 'AND t1.academic_year_id = ?' : ''}
      AND (
        (t1.teacher_id = t2.teacher_id)
        OR (t1.class_id = t2.class_id)
        OR (t1.room = t2.room AND t1.room IS NOT NULL)
      )
      AND (
        (t1.start_time <= t2.start_time AND t1.end_time > t2.start_time)
        OR (t1.start_time < t2.end_time AND t1.end_time >= t2.end_time)
        OR (t1.start_time >= t2.start_time AND t1.end_time <= t2.end_time)
      )
    `, academic_year_id ? [academic_year_id] : []);

    res.json({ success: true, conflicts });
  } catch (error) {
    console.error('Error fetching conflicts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conflicts' });
  }
});

module.exports = router;
