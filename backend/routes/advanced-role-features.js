const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==========================================
// TEACHER: AUTOMATED LESSON PLANNING
// ==========================================

/**
 * Generate a lesson plan structure based on topic and level
 */
router.post('/teacher/generate-lesson-plan', [authenticateToken, requireRole('teacher', 'admin', 'super_admin')], async (req, res) => {
  try {
    const { subject, topic, level, duration_minutes } = req.body;

    // Simulated AI Logic for Lesson Planning
    const lessonPlan = {
      title: topic,
      subject: subject,
      level: level,
      duration: `${duration_minutes} minutes`,
      objectives: [
        `Understand the core concepts of ${topic}`,
        `Apply ${topic} principles to real-world scenarios`,
        `Demonstrate proficiency in ${subject} related to ${topic}`
      ],
      materials: ['Whiteboard', 'Projector', 'Textbooks', 'Handouts'],
      structure: [
        { phase: 'Introduction', duration: '10 mins', activity: 'Recap previous lesson and introduce ' + topic },
        { phase: 'Core Concept', duration: '20 mins', activity: 'Explain ' + topic + ' using visual aids' },
        { phase: 'Activity', duration: '15 mins', activity: 'Group work on ' + topic + ' problems' },
        { phase: 'Conclusion', duration: '10 mins', activity: 'Q&A and summary of key points' }
      ],
      assessment: 'Short quiz or verbal questioning at the end of the lesson.'
    };

    // Save to database if requested
    if (req.body.save) {
      await pool.query(
        'INSERT INTO content_items (title, type, content, created_by) VALUES (?, ?, ?, ?)',
        [`Lesson Plan: ${topic}`, 'lesson_plan', JSON.stringify(lessonPlan), req.user.id]
      );
    }

    res.json({ success: true, lessonPlan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// ACCOUNTANT: FEE DEFAULTERS & REMINDERS
// ==========================================

/**
 * Get list of students with outstanding balances
 */
router.get('/accountant/fee-defaulters', [authenticateToken, requireRole('accountant', 'admin', 'super_admin')], async (req, res) => {
  try {
    const [defaulters] = await pool.query(`
      SELECT u.id, u.student_id, CONCAT(u.first_name, ' ', u.last_name) as full_name,
             c.name as class_name,
             fs.amount as total_due,
             IFNULL(SUM(fp.amount), 0) as amount_paid,
             (fs.amount - IFNULL(SUM(fp.amount), 0)) as balance
      FROM users u
      JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      JOIN classes c ON e.class_id = c.id
      JOIN fee_structures fs ON c.course_id = fs.course_id
      LEFT JOIN fee_payments fp ON u.id = fp.student_id
      GROUP BY u.id, c.id, fs.id
      HAVING balance > 0
      ORDER BY balance DESC
    `);

    res.json({ success: true, count: defaulters.length, defaulters });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Trigger automated reminders for defaulters (Simulated)
 */
router.post('/accountant/trigger-reminders', [authenticateToken, requireRole('accountant', 'admin', 'super_admin')], async (req, res) => {
  try {
    const { student_ids } = req.body;
    
    // In a real system, this would integrate with an SMS/Email service
    const results = student_ids.map(id => ({
      student_id: id,
      status: 'Sent',
      timestamp: new Date().toISOString()
    }));

    // Log the reminder activity
    for (const id of student_ids) {
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [id, 'Fee Payment Reminder', 'Dear Parent/Student, please settle your outstanding balance.', 'payment_reminder']
      );
    }

    res.json({ success: true, message: `Reminders triggered for ${student_ids.length} students.`, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// DOS: COMPREHENSIVE REPORT CARD DATA
// ==========================================

/**
 * Aggregate all student data for report card generation
 */
router.get('/dos/report-card-data/:studentId', [authenticateToken, requireRole('dos', 'admin', 'super_admin')], async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, academic_year_id } = req.query;

    // 1. Basic Info
    const [[student]] = await pool.query(`
      SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) as name, u.serial_code,
             c.name as class_name, c.level
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      JOIN classes c ON e.class_id = c.id
      WHERE u.id = ?
    `, [studentId]);

    // 2. Grades
    const [grades] = await pool.query(`
      SELECT s.name as subject, g.grade, g.assessment_type, g.assessment_date
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      WHERE g.student_id = ?
    `, [studentId]);

    // 3. Attendance Summary
    const [[attendance]] = await pool.query(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as days_present
      FROM attendance
      WHERE student_id = ?
    `, [studentId]);

    // 4. Conduct/Discipline
    const [conduct] = await pool.query(`
      SELECT incident_type, action_taken, created_at
      FROM punishments
      WHERE student_id = ?
      ORDER BY created_at DESC
    `, [studentId]);

    res.json({
      success: true,
      report: {
        student,
        grades,
        attendance_rate: attendance.total_days > 0 ? ((attendance.days_present / attendance.total_days) * 100).toFixed(2) + '%' : '100%',
        conduct_records: conduct.length,
        conduct_details: conduct,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// ADMIN: SYSTEM AUDIT TRAIL
// ==========================================

/**
 * Get system audit logs with filtering
 */
router.get('/admin/audit-trail', [authenticateToken, requireRole('admin', 'super_admin')], async (req, res) => {
  try {
    const { action, table_name, limit = 50 } = req.query;
    
    let query = `
      SELECT al.*, u.username, u.email
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (action) {
      query += ' AND al.action = ?';
      params.push(action);
    }
    if (table_name) {
      query += ' AND al.table_name = ?';
      params.push(table_name);
    }

    query += ' ORDER BY al.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [logs] = await pool.query(query, params);

    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
