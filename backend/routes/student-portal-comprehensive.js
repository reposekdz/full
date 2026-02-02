const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ========================================
// COMPREHENSIVE STUDENT PORTAL SYSTEM
// Learning, attendance, grades, activities
// ========================================

// Student Dashboard - Personalized Overview
router.get('/dashboard', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.student_id || req.user.id;

    // Get student profile from global students
    const [student] = await db.query(`
      SELECT gs.*, tc.name as class_name
      FROM global_students gs
      LEFT JOIN trade_classes tc ON gs.current_class_id = tc.id
      WHERE gs.id = ? OR gs.student_id = ?
    `, [studentId, req.user.username]);

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const profile = student[0];

    // Get today's attendance
    const [todayAttendance] = await db.query(`
      SELECT * FROM student_attendance
      WHERE student_id = ? AND date = CURDATE()
    `, [profile.id]);

    // Get recent grades (last 5)
    const [recentGrades] = await db.query(`
      SELECT * FROM student_academic_records
      WHERE student_id = ?
      ORDER BY assessment_date DESC
      LIMIT 5
    `, [profile.id]);

    // Get unread notifications
    const [notifications] = await db.query(`
      SELECT COUNT(*) as unread_count
      FROM student_notifications
      WHERE student_id = ? AND is_read = false
    `, [profile.id]);

    // Get upcoming assignments/exams (from existing tables if available)
    const [upcomingTasks] = await db.query(`
      SELECT 'Assignment' as type, title, due_date as deadline
      FROM assignments
      WHERE trade_class_id = ? AND due_date >= CURDATE()
      ORDER BY due_date ASC
      LIMIT 5
    `, [profile.current_class_id]);

    // Get learning progress summary
    const [learningProgress] = await db.query(`
      SELECT 
        AVG(completion_percentage) as avg_completion,
        AVG(quiz_score_average) as avg_quiz_score,
        SUM(time_spent_minutes) as total_time_spent
      FROM student_learning_progress
      WHERE student_id = ?
    `, [profile.id]);

    // Get recent achievements
    const [achievements] = await db.query(`
      SELECT * FROM student_achievements
      WHERE student_id = ?
      ORDER BY awarded_date DESC
      LIMIT 3
    `, [profile.id]);

    // Get attendance summary (current month)
    const [attendanceSummary] = await db.query(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late_days
      FROM student_attendance
      WHERE student_id = ? AND MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())
    `, [profile.id]);

    res.json({
      success: true,
      profile: {
        name: profile.full_name,
        admission_number: profile.admission_number,
        class: profile.class_name,
        level: profile.current_level,
        trade: profile.current_trade,
        profile_image: profile.profile_image,
        gpa: profile.current_gpa,
        attendance_percentage: profile.overall_attendance_percentage
      },
      todayAttendance: todayAttendance.length > 0 ? todayAttendance[0] : null,
      recentGrades,
      unreadNotifications: notifications[0].unread_count,
      upcomingTasks,
      learningProgress: learningProgress[0] || {},
      recentAchievements: achievements,
      attendanceSummary: attendanceSummary[0]
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard', error: error.message });
  }
});

// Get student profile
router.get('/profile', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.student_id || req.user.id;

    const [student] = await db.query(`
      SELECT gs.*, tc.name as class_name
      FROM global_students gs
      LEFT JOIN trade_classes tc ON gs.current_class_id = tc.id
      WHERE gs.id = ? OR gs.student_id = ?
    `, [studentId, req.user.username]);

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Get parents
    const [parents] = await db.query(`
      SELECT * FROM student_parents
      WHERE student_id = ? AND is_active = true
    `, [student[0].id]);

    res.json({
      success: true,
      profile: student[0],
      parents
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile', error: error.message });
  }
});

// Get academic records
router.get('/academics', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.student_id || req.user.id;
    const { academic_year, term } = req.query;

    // Get student global ID
    const [student] = await db.query(`
      SELECT id FROM global_students WHERE id = ? OR student_id = ?
    `, [studentId, req.user.username]);

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const globalStudentId = student[0].id;

    let query = `
      SELECT * FROM student_academic_records
      WHERE student_id = ?
    `;
    const params = [globalStudentId];

    if (academic_year) {
      query += ` AND academic_year = ?`;
      params.push(academic_year);
    }

    if (term) {
      query += ` AND term = ?`;
      params.push(term);
    }

    query += ` ORDER BY assessment_date DESC`;

    const [records] = await db.query(query, params);

    // Calculate summary statistics
    const summary = {
      totalSubjects: records.length,
      averageGrade: records.length > 0 ? 
        (records.reduce((sum, r) => sum + parseFloat(r.points), 0) / records.length).toFixed(2) : 0,
      averagePercentage: records.length > 0 ? 
        (records.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / records.length).toFixed(2) : 0,
      strongestSubject: records.length > 0 ? 
        records.reduce((max, r) => r.percentage > max.percentage ? r : max, records[0]).subject_name : null,
      weakestSubject: records.length > 0 ? 
        records.reduce((min, r) => r.percentage < min.percentage ? r : min, records[0]).subject_name : null
    };

    res.json({
      success: true,
      records,
      summary
    });
  } catch (error) {
    console.error('Error fetching academic records:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch academic records', error: error.message });
  }
});

// Get attendance records
router.get('/attendance', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.student_id || req.user.id;
    const { start_date, end_date, subject_id } = req.query;

    const [student] = await db.query(`
      SELECT id FROM global_students WHERE id = ? OR student_id = ?
    `, [studentId, req.user.username]);

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const globalStudentId = student[0].id;

    let query = `
      SELECT sa.*, s.name as subject_name
      FROM student_attendance sa
      LEFT JOIN subjects s ON sa.subject_id = s.id
      WHERE sa.student_id = ?
    `;
    const params = [globalStudentId];

    if (start_date) {
      query += ` AND sa.date >= ?`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND sa.date <= ?`;
      params.push(end_date);
    }

    if (subject_id) {
      query += ` AND sa.subject_id = ?`;
      params.push(subject_id);
    }

    query += ` ORDER BY sa.date DESC, sa.period_number ASC`;

    const [attendance] = await db.query(query, params);

    // Calculate statistics
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'Present').length,
      absent: attendance.filter(a => a.status === 'Absent').length,
      late: attendance.filter(a => a.status === 'Late').length,
      excused: attendance.filter(a => a.status === 'Excused').length,
      attendanceRate: 0
    };

    stats.attendanceRate = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      attendance,
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance', error: error.message });
  }
});

// Get learning progress
router.get('/learning/progress', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.student_id || req.user.id;

    const [student] = await db.query(`
      SELECT id FROM global_students WHERE id = ? OR student_id = ?
    `, [studentId, req.user.username]);

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const globalStudentId = student[0].id;

    const [progress] = await db.query(`
      SELECT * FROM student_learning_progress
      WHERE student_id = ?
      ORDER BY last_accessed DESC
    `, [globalStudentId]);

    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error fetching learning progress:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch learning progress', error: error.message });
  }
});

// Update learning progress
router.post('/learning/progress', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.student_id || req.user.id;
    const { subject_id, subject_name, topic, completion_percentage, time_spent_minutes } = req.body;

    const [student] = await db.query(`
      SELECT id FROM global_students WHERE id = ? OR student_id = ?
    `, [studentId, req.user.username]);

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const globalStudentId = student[0].id;

    await db.query(`
      INSERT INTO student_learning_progress (
        student_id, subject_id, subject_name, topic,
        completion_percentage, time_spent_minutes, last_accessed, access_count
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), 1)
      ON DUPLICATE KEY UPDATE
        completion_percentage = VALUES(completion_percentage),
        time_spent_minutes = time_spent_minutes + VALUES(time_spent_minutes),
        last_accessed = NOW(),
        access_count = access_count + 1
    `, [globalStudentId, subject_id, subject_name, topic, completion_percentage, time_spent_minutes]);

    res.json({ success: true, message: 'Learning progress updated' });
  } catch (error) {
    console.error('Error updating learning progress:', error);
    res.status(500).json({ success: false, message: 'Failed to update learning progress', error: error.message });
  }
});

// Get achievements and badges
router.get('/achievements', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.student_id || req.user.id;

    const [student] = await db.query(`
      SELECT id FROM global_students WHERE id = ? OR student_id = ?
    `, [studentId, req.user.username]);

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const globalStudentId = student[0].id;

    const [achievements] = await db.query(`
      SELECT * FROM student_achievements
      WHERE student_id = ?
      ORDER BY awarded_date DESC
    `, [globalStudentId]);

    // Group by type
    const grouped = {
      academic: achievements.filter(a => a.achievement_type === 'Academic'),
      sports: achievements.filter(a => a.achievement_type === 'Sports'),
      leadership: achievements.filter(a => a.achievement_type === 'Leadership'),
      behavior: achievements.filter(a => a.achievement_type === 'Behavior'),
      other: achievements.filter(a => !['Academic', 'Sports', 'Leadership', 'Behavior'].includes(a.achievement_type))
    };

    const totalPoints = achievements.reduce((sum, a) => sum + parseFloat(a.points_awarded || 0), 0);

    res.json({
      success: true,
      achievements,
      grouped,
      totalPoints,
      totalAchievements: achievements.length
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch achievements', error: error.message });
  }
});

// Get activities
router.get('/activities', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.student_id || req.user.id;
    const { activity_type } = req.query;

    const [student] = await db.query(`
      SELECT id FROM global_students WHERE id = ? OR student_id = ?
    `, [studentId, req.user.username]);

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const globalStudentId = student[0].id;

    let query = `
      SELECT sa.*, u.name as supervisor_name
      FROM student_activities sa
      LEFT JOIN users u ON sa.supervisor_id = u.id
      WHERE sa.student_id = ?
    `;
    const params = [globalStudentId];

    if (activity_type) {
      query += ` AND sa.activity_type = ?`;
      params.push(activity_type);
    }

    query += ` ORDER BY sa.start_date DESC`;

    const [activities] = await db.query(query, params);

    res.json({ success: true, activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activities', error: error.message });
  }
});

// Get notifications
router.get('/notifications', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.student_id || req.user.id;
    const { is_read, notification_type, page = 1, limit = 20 } = req.query;

    const [student] = await db.query(`
      SELECT id FROM global_students WHERE id = ? OR student_id = ?
    `, [studentId, req.user.username]);

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const globalStudentId = student[0].id;

    let query = `
      SELECT * FROM student_notifications
      WHERE student_id = ?
    `;
    const params = [globalStudentId];

    if (is_read !== undefined) {
      query += ` AND is_read = ?`;
      params.push(is_read === 'true');
    }

    if (notification_type) {
      query += ` AND notification_type = ?`;
      params.push(notification_type);
    }

    query += ` ORDER BY created_at DESC`;
    
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [notifications] = await db.query(query, params);

    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.student_id || req.user.id;

    const [student] = await db.query(`
      SELECT id FROM global_students WHERE id = ? OR student_id = ?
    `, [studentId, req.user.username]);

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await db.query(`
      UPDATE student_notifications
      SET is_read = true, read_at = NOW()
      WHERE id = ? AND student_id = ?
    `, [id, student[0].id]);

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification', error: error.message });
  }
});

// Get fee information
router.get('/fees', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.student_id || req.user.id;

    const [student] = await db.query(`
      SELECT id, fee_balance, total_fees_paid, scholarship_status, scholarship_percentage
      FROM global_students 
      WHERE id = ? OR student_id = ?
    `, [studentId, req.user.username]);

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const globalStudentId = student[0].id;

    // Get payment history
    const [payments] = await db.query(`
      SELECT * FROM student_fee_payments
      WHERE student_id = ? AND approval_status = 'Approved'
      ORDER BY payment_date DESC
      LIMIT 10
    `, [globalStudentId]);

    res.json({
      success: true,
      feeBalance: student[0].fee_balance,
      totalPaid: student[0].total_fees_paid,
      scholarshipStatus: student[0].scholarship_status,
      scholarshipPercentage: student[0].scholarship_percentage,
      recentPayments: payments
    });
  } catch (error) {
    console.error('Error fetching fee information:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fee information', error: error.message });
  }
});

// Get timetable
router.get('/timetable', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.student_id || req.user.id;

    const [student] = await db.query(`
      SELECT current_class_id FROM global_students WHERE id = ? OR student_id = ?
    `, [studentId, req.user.username]);

    if (student.length === 0 || !student[0].current_class_id) {
      return res.status(404).json({ success: false, message: 'Student class not found' });
    }

    // Get timetable from existing table if available
    const [timetable] = await db.query(`
      SELECT * FROM timetable
      WHERE class_id = ?
      ORDER BY day_of_week, period
    `, [student[0].current_class_id]);

    res.json({ success: true, timetable });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch timetable', error: error.message });
  }
});

// Get analytics (personalized insights)
router.get('/analytics', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.student_id || req.user.id;

    const [student] = await db.query(`
      SELECT id FROM global_students WHERE id = ? OR student_id = ?
    `, [studentId, req.user.username]);

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const globalStudentId = student[0].id;

    const [analytics] = await db.query(`
      SELECT * FROM student_analytics
      WHERE student_id = ?
      ORDER BY analysis_date DESC
      LIMIT 1
    `, [globalStudentId]);

    res.json({
      success: true,
      analytics: analytics.length > 0 ? analytics[0] : null
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
});

// Get health records (with privacy controls)
router.get('/health', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.student_id || req.user.id;

    const [student] = await db.query(`
      SELECT id FROM global_students WHERE id = ? OR student_id = ?
    `, [studentId, req.user.username]);

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const globalStudentId = student[0].id;

    const [healthRecords] = await db.query(`
      SELECT 
        id, visit_date, visit_time, visit_type, symptoms,
        diagnosis, treatment_given, medication_prescribed,
        follow_up_required, follow_up_date
      FROM student_health_records
      WHERE student_id = ?
      ORDER BY visit_date DESC
      LIMIT 10
    `, [globalStudentId]);

    res.json({ success: true, healthRecords });
  } catch (error) {
    console.error('Error fetching health records:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch health records', error: error.message });
  }
});

module.exports = router;
