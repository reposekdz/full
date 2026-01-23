const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ============= TEACHER-CLASS ASSIGNMENTS =============

// Get all teacher assignments
router.get('/teacher-assignments', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const [assignments] = await db.query(`
      SELECT ta.*, u.first_name, u.last_name, u.email,
             c.name as class_name, co.name as course_name, co.code as trade_code,
             s.name as subject_name
      FROM teacher_assignments ta
      JOIN users u ON ta.teacher_id = u.id
      JOIN classes c ON ta.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      LEFT JOIN subjects s ON ta.subject_id = s.id
      WHERE ta.is_active = true
      ORDER BY c.name, s.name
    `);
    res.json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Assign teacher to class
router.post('/assign-teacher', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const { teacher_id, class_id, subject_id, academic_year_id } = req.body;

    // Check if assignment already exists
    const [existing] = await db.query(
      'SELECT id FROM teacher_assignments WHERE teacher_id=? AND class_id=? AND subject_id=? AND is_active=true',
      [teacher_id, class_id, subject_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Teacher already assigned to this class and subject' });
    }

    const [result] = await db.query(
      `INSERT INTO teacher_assignments (teacher_id, class_id, subject_id, academic_year_id, assigned_date) 
       VALUES (?, ?, ?, ?, CURDATE())`,
      [teacher_id, class_id, subject_id, academic_year_id]
    );

    res.json({ success: true, message: 'Teacher assigned successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove teacher assignment
router.delete('/teacher-assignments/:id', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    await db.query('UPDATE teacher_assignments SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Assignment removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============= TIMETABLE GENERATION =============

// Generate timetable for a class
router.post('/generate-timetable', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const { class_id, academic_year_id, schedule } = req.body;
    // schedule: [{ day, start_time, end_time, subject_id, teacher_id, room }]

    if (!schedule || schedule.length === 0) {
      return res.status(400).json({ success: false, message: 'Schedule data required' });
    }

    // Delete existing timetable for this class
    await db.query('DELETE FROM timetables WHERE class_id = ? AND academic_year_id = ?', [class_id, academic_year_id]);

    // Insert new timetable entries
    for (const entry of schedule) {
      await db.query(
        `INSERT INTO timetables (class_id, subject_id, teacher_id, academic_year_id, day_of_week, start_time, end_time, room) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [class_id, entry.subject_id, entry.teacher_id, academic_year_id, entry.day, entry.start_time, entry.end_time, entry.room]
      );
    }

    res.json({ success: true, message: 'Timetable generated successfully', entries: schedule.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get timetable for a class
router.get('/timetable/:classId', authenticateToken, async (req, res) => {
  try {
    const [timetable] = await db.query(`
      SELECT t.*, s.name as subject_name, s.code as subject_code,
             u.first_name as teacher_first_name, u.last_name as teacher_last_name,
             c.name as class_name, co.name as course_name
      FROM timetables t
      JOIN subjects s ON t.subject_id = s.id
      JOIN users u ON t.teacher_id = u.id
      JOIN classes c ON t.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      WHERE t.class_id = ? AND t.is_active = true
      ORDER BY 
        FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        t.start_time
    `, [req.params.classId]);

    res.json({ success: true, timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update timetable entry
router.put('/timetable/:id', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const { subject_id, teacher_id, day_of_week, start_time, end_time, room } = req.body;

    await db.query(
      `UPDATE timetables 
       SET subject_id=?, teacher_id=?, day_of_week=?, start_time=?, end_time=?, room=?
       WHERE id=?`,
      [subject_id, teacher_id, day_of_week, start_time, end_time, room, req.params.id]
    );

    res.json({ success: true, message: 'Timetable updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete timetable entry
router.delete('/timetable/:id', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    await db.query('DELETE FROM timetables WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Timetable entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============= COURSE-TEACHER ASSIGNMENTS =============

// Get teacher's courses
router.get('/teacher-courses/:teacherId', authenticateToken, async (req, res) => {
  try {
    const [courses] = await db.query(`
      SELECT DISTINCT c.id, c.name, c.code, c.description,
             COUNT(DISTINCT ta.class_id) as class_count,
             COUNT(DISTINCT ta.subject_id) as subject_count
      FROM courses c
      JOIN classes cl ON c.id = cl.course_id
      JOIN teacher_assignments ta ON cl.id = ta.class_id
      WHERE ta.teacher_id = ? AND ta.is_active = true
      GROUP BY c.id
    `, [req.params.teacherId]);

    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all teachers with their assignments
router.get('/teachers-overview', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const [teachers] = await db.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone,
             COUNT(DISTINCT ta.class_id) as classes_count,
             COUNT(DISTINCT ta.subject_id) as subjects_count,
             GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') as classes
      FROM users u
      LEFT JOIN teacher_assignments ta ON u.id = ta.teacher_id AND ta.is_active = true
      LEFT JOIN classes c ON ta.class_id = c.id
      WHERE u.role_id = (SELECT id FROM roles WHERE name = 'teacher') AND u.is_active = true
      GROUP BY u.id
      ORDER BY u.last_name, u.first_name
    `);

    res.json({ success: true, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get available teachers for a subject
router.get('/available-teachers/:subjectId', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const [teachers] = await db.query(`
      SELECT u.id, u.first_name, u.last_name, u.email,
             COUNT(ta.id) as current_assignments
      FROM users u
      LEFT JOIN teacher_assignments ta ON u.id = ta.teacher_id AND ta.is_active = true
      WHERE u.role_id = (SELECT id FROM roles WHERE name = 'teacher') 
      AND u.is_active = true
      GROUP BY u.id
      ORDER BY current_assignments ASC, u.last_name
    `);

    res.json({ success: true, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============= DASHBOARD STATISTICS =============

router.get('/dashboard-stats', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const [classes] = await db.query('SELECT COUNT(*) as count FROM classes WHERE is_active = true');
    const [teachers] = await db.query('SELECT COUNT(*) as count FROM users WHERE role_id = (SELECT id FROM roles WHERE name = "teacher") AND is_active = true');
    const [students] = await db.query('SELECT COUNT(*) as count FROM users WHERE role_id = (SELECT id FROM roles WHERE name = "student") AND is_active = true');
    const [assignments] = await db.query('SELECT COUNT(*) as count FROM teacher_assignments WHERE is_active = true');
    const [timetables] = await db.query('SELECT COUNT(DISTINCT class_id) as count FROM timetables WHERE is_active = true');

    res.json({
      success: true,
      stats: {
        total_classes: classes[0].count,
        total_teachers: teachers[0].count,
        total_students: students[0].count,
        teacher_assignments: assignments[0].count,
        classes_with_timetable: timetables[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============= BULK OPERATIONS =============

// Bulk assign teacher to multiple classes
router.post('/bulk-assign-teacher', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const { teacher_id, assignments, academic_year_id } = req.body;
    // assignments: [{ class_id, subject_id }]

    let added = 0;
    for (const assignment of assignments) {
      const [existing] = await db.query(
        'SELECT id FROM teacher_assignments WHERE teacher_id=? AND class_id=? AND subject_id=? AND is_active=true',
        [teacher_id, assignment.class_id, assignment.subject_id]
      );

      if (existing.length === 0) {
        await db.query(
          `INSERT INTO teacher_assignments (teacher_id, class_id, subject_id, academic_year_id, assigned_date) 
           VALUES (?, ?, ?, ?, CURDATE())`,
          [teacher_id, assignment.class_id, assignment.subject_id, academic_year_id]
        );
        added++;
      }
    }

    res.json({ success: true, message: `${added} assignments created`, total: assignments.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
