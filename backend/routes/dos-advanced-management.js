const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// ==================== SUBJECTS MANAGEMENT ====================

// Get all subjects
router.get('/subjects', authenticateToken, async (req, res) => {
  try {
    const { type, search } = req.query;
    let query = 'SELECT * FROM subjects WHERE is_active=1';
    const params = [];
    
    if (type) {
      query += ' AND subject_type=?';
      params.push(type);
    }
    
    if (search) {
      query += ' AND (subject_name LIKE ? OR subject_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY subject_type, subject_name';
    
    const [subjects] = await pool.execute(query, params);
    res.json({ success: true, subjects, total: subjects.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get subjects by trade and level
router.get('/subjects/trade/:tradeCode/level/:levelNumber', authenticateToken, async (req, res) => {
  try {
    const { tradeCode, levelNumber } = req.params;
    const { academic_year } = req.query;
    
    const [subjects] = await pool.execute(`
      SELECT s.*, sta.is_mandatory, sta.academic_year, sta.term,
        (SELECT COUNT(*) FROM teacher_subject_assignments 
         WHERE subject_code=s.subject_code AND trade_code=? AND level_number=? AND is_active=1) as assigned_teachers
      FROM subjects s
      JOIN subject_trade_assignments sta ON s.id=sta.subject_id
      WHERE sta.trade_code=? AND sta.level_number=? AND sta.academic_year=? AND s.is_active=1
      ORDER BY s.subject_type, s.subject_name
    `, [tradeCode, levelNumber, tradeCode, levelNumber, academic_year || '2025']);
    
    res.json({ success: true, subjects, total: subjects.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new subject
router.post('/subjects', authenticateToken, async (req, res) => {
  try {
    const { subject_code, subject_name, subject_type, description, credit_hours } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO subjects (subject_code, subject_name, subject_type, description, credit_hours, created_by) VALUES (?,?,?,?,?,?)',
      [subject_code, subject_name, subject_type, description, credit_hours || 0, req.user.userId]
    );
    
    await pool.execute(
      'INSERT INTO dos_action_logs (dos_id, dos_name, action_type, action_description, target_type, target_id) VALUES (?,?,?,?,?,?)',
      [req.user.userId, req.user.name, 'create_subject', `Created subject: ${subject_name}`, 'subject', result.insertId]
    );
    
    res.json({ success: true, message: 'Subject created', subject_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update subject
router.put('/subjects/:id', authenticateToken, async (req, res) => {
  try {
    const { subject_name, subject_type, description, credit_hours } = req.body;
    
    await pool.execute(
      'UPDATE subjects SET subject_name=?, subject_type=?, description=?, credit_hours=? WHERE id=?',
      [subject_name, subject_type, description, credit_hours, req.params.id]
    );
    
    await pool.execute(
      'INSERT INTO dos_action_logs (dos_id, dos_name, action_type, action_description, target_type, target_id) VALUES (?,?,?,?,?,?)',
      [req.user.userId, req.user.name, 'update_subject', `Updated subject: ${subject_name}`, 'subject', req.params.id]
    );
    
    res.json({ success: true, message: 'Subject updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete subject
router.delete('/subjects/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('UPDATE subjects SET is_active=0 WHERE id=?', [req.params.id]);
    
    await pool.execute(
      'INSERT INTO dos_action_logs (dos_id, dos_name, action_type, action_description, target_type, target_id) VALUES (?,?,?,?,?,?)',
      [req.user.userId, req.user.name, 'delete_subject', `Deleted subject ID: ${req.params.id}`, 'subject', req.params.id]
    );
    
    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== SUBJECT-TRADE ASSIGNMENTS ====================

// Assign subject to trade/level
router.post('/subjects/assign-to-trade', authenticateToken, async (req, res) => {
  try {
    const { subject_id, subject_code, subject_name, trade_code, level_number, is_mandatory, academic_year, term } = req.body;
    
    await pool.execute(
      `INSERT INTO subject_trade_assignments (subject_id, subject_code, subject_name, trade_code, level_number, is_mandatory, academic_year, term, assigned_by) 
       VALUES (?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE is_mandatory=VALUES(is_mandatory), term=VALUES(term)`,
      [subject_id, subject_code, subject_name, trade_code, level_number, is_mandatory, academic_year, term, req.user.userId]
    );
    
    res.json({ success: true, message: 'Subject assigned to trade/level' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk assign subjects to trade/level
router.post('/subjects/bulk-assign', authenticateToken, async (req, res) => {
  try {
    const { subject_ids, trade_code, level_number, academic_year } = req.body;
    
    let assigned = 0;
    for (const subject_id of subject_ids) {
      const [subject] = await pool.execute('SELECT subject_code, subject_name FROM subjects WHERE id=?', [subject_id]);
      if (subject[0]) {
        await pool.execute(
          `INSERT IGNORE INTO subject_trade_assignments (subject_id, subject_code, subject_name, trade_code, level_number, is_mandatory, academic_year, assigned_by) 
           VALUES (?,?,?,?,?,?,?,?)`,
          [subject_id, subject[0].subject_code, subject[0].subject_name, trade_code, level_number, true, academic_year, req.user.userId]
        );
        assigned++;
      }
    }
    
    res.json({ success: true, message: `${assigned} subjects assigned`, assigned });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove subject from trade/level
router.delete('/subjects/remove-from-trade/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM subject_trade_assignments WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Subject removed from trade/level' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== TEACHER-SUBJECT ASSIGNMENTS ====================

// Get all teachers
router.get('/teachers', authenticateToken, async (req, res) => {
  try {
    const [teachers] = await pool.execute(
      `SELECT id, CONCAT(first_name, ' ', last_name) as name, email, phone, 
       (SELECT COUNT(*) FROM teacher_subject_assignments WHERE teacher_id=users.id AND is_active=1) as assigned_subjects
       FROM users WHERE role='teacher' AND is_active=1 ORDER BY first_name`
    );
    
    res.json({ success: true, teachers, total: teachers.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get teacher assignments
router.get('/teachers/:teacherId/assignments', authenticateToken, async (req, res) => {
  try {
    const { academic_year } = req.query;
    
    const [assignments] = await pool.execute(
      `SELECT tsa.*, s.subject_type, s.credit_hours,
       (SELECT COUNT(*) FROM global_student_sheets WHERE trade_code=tsa.trade_code AND level_number=tsa.level_number AND enrollment_status='active') as student_count
       FROM teacher_subject_assignments tsa
       JOIN subjects s ON tsa.subject_id=s.id
       WHERE tsa.teacher_id=? AND tsa.academic_year=? AND tsa.is_active=1
       ORDER BY tsa.trade_code, tsa.level_number, s.subject_name`,
      [req.params.teacherId, academic_year || '2025']
    );
    
    res.json({ success: true, assignments, total: assignments.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Assign teacher to subject
router.post('/teachers/assign-subject', authenticateToken, async (req, res) => {
  try {
    const { teacher_id, teacher_name, subject_id, subject_code, subject_name, trade_code, level_number, academic_year, term } = req.body;
    
    await pool.execute(
      `INSERT INTO teacher_subject_assignments (teacher_id, teacher_name, subject_id, subject_code, subject_name, trade_code, level_number, academic_year, term, assigned_by) 
       VALUES (?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE is_active=1, term=VALUES(term)`,
      [teacher_id, teacher_name, subject_id, subject_code, subject_name, trade_code, level_number, academic_year, term, req.user.userId]
    );
    
    // Update teacher workload
    await updateTeacherWorkload(teacher_id, teacher_name, academic_year, term);
    
    await pool.execute(
      'INSERT INTO dos_action_logs (dos_id, dos_name, action_type, action_description, target_type, target_id) VALUES (?,?,?,?,?,?)',
      [req.user.userId, req.user.name, 'assign_teacher', `Assigned ${teacher_name} to ${subject_name} (${trade_code} L${level_number})`, 'teacher', teacher_id]
    );
    
    res.json({ success: true, message: 'Teacher assigned to subject' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk assign teacher to multiple subjects
router.post('/teachers/bulk-assign', authenticateToken, async (req, res) => {
  try {
    const { teacher_id, teacher_name, assignments, academic_year } = req.body;
    
    let assigned = 0;
    for (const assignment of assignments) {
      await pool.execute(
        `INSERT IGNORE INTO teacher_subject_assignments (teacher_id, teacher_name, subject_id, subject_code, subject_name, trade_code, level_number, academic_year, assigned_by) 
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [teacher_id, teacher_name, assignment.subject_id, assignment.subject_code, assignment.subject_name, assignment.trade_code, assignment.level_number, academic_year, req.user.userId]
      );
      assigned++;
    }
    
    await updateTeacherWorkload(teacher_id, teacher_name, academic_year);
    
    res.json({ success: true, message: `${assigned} subjects assigned to teacher`, assigned });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove teacher assignment
router.delete('/teachers/remove-assignment/:id', authenticateToken, async (req, res) => {
  try {
    const [assignment] = await pool.execute('SELECT teacher_id, teacher_name, academic_year FROM teacher_subject_assignments WHERE id=?', [req.params.id]);
    
    await pool.execute('UPDATE teacher_subject_assignments SET is_active=0 WHERE id=?', [req.params.id]);
    
    if (assignment[0]) {
      await updateTeacherWorkload(assignment[0].teacher_id, assignment[0].teacher_name, assignment[0].academic_year);
    }
    
    res.json({ success: true, message: 'Teacher assignment removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== TIMETABLE GENERATION ====================

// Generate timetable for trade/level
router.post('/timetable/generate', authenticateToken, async (req, res) => {
  try {
    const { trade_code, level_number, academic_year, term } = req.body;
    
    // Get all assigned subjects and teachers
    const [assignments] = await pool.execute(
      `SELECT tsa.*, s.credit_hours 
       FROM teacher_subject_assignments tsa
       JOIN subjects s ON tsa.subject_id=s.id
       WHERE tsa.trade_code=? AND tsa.level_number=? AND tsa.academic_year=? AND tsa.is_active=1
       ORDER BY s.credit_hours DESC`,
      [trade_code, level_number, academic_year]
    );
    
    if (assignments.length === 0) {
      return res.status(400).json({ success: false, message: 'No teacher assignments found for this class' });
    }
    
    // Delete existing timetable
    await pool.execute(
      'DELETE FROM class_subject_schedule WHERE trade_code=? AND level_number=? AND academic_year=? AND term=?',
      [trade_code, level_number, academic_year, term]
    );
    
    // 12 periods per day: 7:30-17:00
    const periods = [
      { num: 1, start: '07:30', end: '08:10' },
      { num: 2, start: '08:10', end: '08:50' },
      { num: 3, start: '08:50', end: '09:30' },
      { num: 4, start: '09:30', end: '10:10' },
      { num: 5, start: '10:25', end: '11:05' },
      { num: 6, start: '11:05', end: '11:45' },
      { num: 7, start: '11:45', end: '12:25' },
      { num: 8, start: '13:25', end: '14:05' },
      { num: 9, start: '14:05', end: '14:45' },
      { num: 10, start: '14:45', end: '15:25' },
      { num: 11, start: '15:40', end: '16:20' },
      { num: 12, start: '16:20', end: '17:00' }
    ];
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    let assignmentIndex = 0;
    let slotsCreated = 0;
    
    for (const day of days) {
      for (const period of periods) {
        if (assignmentIndex >= assignments.length) assignmentIndex = 0;
        
        const assignment = assignments[assignmentIndex];
        
        await pool.execute(
          `INSERT INTO class_subject_schedule (trade_code, level_number, subject_id, subject_code, subject_name, teacher_id, teacher_name, day_of_week, period_number, start_time, end_time, academic_year, term, created_by) 
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [trade_code, level_number, assignment.subject_id, assignment.subject_code, assignment.subject_name, assignment.teacher_id, assignment.teacher_name, day, period.num, period.start, period.end, academic_year, term, req.user.userId]
        );
        
        slotsCreated++;
        assignmentIndex++;
      }
    }
    
    res.json({ success: true, message: 'Timetable generated', slots_created: slotsCreated, total_periods: 60 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get timetable
router.get('/timetable/trade/:tradeCode/level/:levelNumber', authenticateToken, async (req, res) => {
  try {
    const { tradeCode, levelNumber } = req.params;
    const { academic_year, term } = req.query;
    
    const [schedule] = await pool.execute(
      `SELECT * FROM class_subject_schedule 
       WHERE trade_code=? AND level_number=? AND academic_year=? AND term=? AND is_active=1
       ORDER BY FIELD(day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday'), period_number`,
      [tradeCode, levelNumber, academic_year || '2025', term || 'Term 1']
    );
    
    res.json({ success: true, schedule, total: schedule.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ANALYTICS & REPORTS ====================

// Get DOS dashboard stats
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const { academic_year } = req.query;
    
    const [[subjectStats]] = await pool.execute(
      'SELECT COUNT(*) as total, SUM(CASE WHEN subject_type="general_studies" THEN 1 ELSE 0 END) as general, SUM(CASE WHEN subject_type="trade_specific" THEN 1 ELSE 0 END) as trade_specific FROM subjects WHERE is_active=1'
    );
    
    const [[teacherStats]] = await pool.execute(
      'SELECT COUNT(DISTINCT teacher_id) as total_teachers, COUNT(*) as total_assignments FROM teacher_subject_assignments WHERE academic_year=? AND is_active=1',
      [academic_year || '2025']
    );
    
    const [[studentStats]] = await pool.execute(
      'SELECT COUNT(*) as total, SUM(CASE WHEN enrollment_status="active" THEN 1 ELSE 0 END) as active FROM global_student_sheets'
    );
    
    const [tradeStats] = await pool.execute(
      `SELECT trade_code, level_number, COUNT(*) as student_count,
       (SELECT COUNT(*) FROM subject_trade_assignments WHERE trade_code=gss.trade_code AND level_number=gss.level_number AND academic_year=?) as subject_count,
       (SELECT COUNT(DISTINCT teacher_id) FROM teacher_subject_assignments WHERE trade_code=gss.trade_code AND level_number=gss.level_number AND academic_year=? AND is_active=1) as teacher_count
       FROM global_student_sheets gss
       WHERE enrollment_status='active'
       GROUP BY trade_code, level_number
       ORDER BY trade_code, level_number`,
      [academic_year || '2025', academic_year || '2025']
    );
    
    res.json({ 
      success: true, 
      stats: {
        subjects: subjectStats,
        teachers: teacherStats,
        students: studentStats,
        trades: tradeStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get teacher workload report
router.get('/reports/teacher-workload', authenticateToken, async (req, res) => {
  try {
    const { academic_year } = req.query;
    
    const [workload] = await pool.execute(
      `SELECT tw.*, 
       (SELECT GROUP_CONCAT(DISTINCT CONCAT(trade_code, ' L', level_number) SEPARATOR ', ') 
        FROM teacher_subject_assignments 
        WHERE teacher_id=tw.teacher_id AND academic_year=tw.academic_year AND is_active=1) as classes
       FROM teacher_workload tw
       WHERE tw.academic_year=?
       ORDER BY tw.workload_percentage DESC`,
      [academic_year || '2025']
    );
    
    res.json({ success: true, workload, total: workload.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get subject coverage report
router.get('/reports/subject-coverage', authenticateToken, async (req, res) => {
  try {
    const { trade_code, academic_year } = req.query;
    
    let query = `
      SELECT sta.trade_code, sta.level_number, sta.subject_code, sta.subject_name, sta.is_mandatory,
      (SELECT COUNT(*) FROM teacher_subject_assignments 
       WHERE subject_code=sta.subject_code AND trade_code=sta.trade_code AND level_number=sta.level_number AND academic_year=sta.academic_year AND is_active=1) as assigned_teachers,
      (SELECT teacher_name FROM teacher_subject_assignments 
       WHERE subject_code=sta.subject_code AND trade_code=sta.trade_code AND level_number=sta.level_number AND academic_year=sta.academic_year AND is_active=1 LIMIT 1) as teacher_name
      FROM subject_trade_assignments sta
      WHERE sta.academic_year=?
    `;
    const params = [academic_year || '2025'];
    
    if (trade_code) {
      query += ' AND sta.trade_code=?';
      params.push(trade_code);
    }
    
    query += ' ORDER BY sta.trade_code, sta.level_number, sta.subject_name';
    
    const [coverage] = await pool.execute(query, params);
    
    res.json({ success: true, coverage, total: coverage.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== HELPER FUNCTIONS ====================

async function updateTeacherWorkload(teacher_id, teacher_name, academic_year, term = null) {
  try {
    const [[stats]] = await pool.execute(
      `SELECT 
        COUNT(DISTINCT subject_id) as total_subjects,
        COUNT(DISTINCT CONCAT(trade_code, level_number)) as total_classes,
        SUM((SELECT COUNT(*) FROM global_student_sheets WHERE trade_code=tsa.trade_code AND level_number=tsa.level_number AND enrollment_status='active')) as total_students
       FROM teacher_subject_assignments tsa
       WHERE teacher_id=? AND academic_year=? AND is_active=1`,
      [teacher_id, academic_year]
    );
    
    const total_periods = stats.total_subjects * 5; // Assume 5 periods per subject per week
    const workload_percentage = (total_periods / 60) * 100; // 60 periods max per week
    const status = workload_percentage < 50 ? 'underloaded' : workload_percentage > 80 ? 'overloaded' : 'optimal';
    
    await pool.execute(
      `INSERT INTO teacher_workload (teacher_id, teacher_name, academic_year, term, total_subjects, total_classes, total_students, total_periods_per_week, workload_percentage, status) 
       VALUES (?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE total_subjects=VALUES(total_subjects), total_classes=VALUES(total_classes), total_students=VALUES(total_students), total_periods_per_week=VALUES(total_periods_per_week), workload_percentage=VALUES(workload_percentage), status=VALUES(status)`,
      [teacher_id, teacher_name, academic_year, term, stats.total_subjects, stats.total_classes, stats.total_students || 0, total_periods, workload_percentage, status]
    );
  } catch (error) {
    console.error('Error updating teacher workload:', error);
  }
}

module.exports = router;
