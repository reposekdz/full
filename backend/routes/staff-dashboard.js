const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==========================================
// ADVISOR DASHBOARD
// ==========================================

router.get('/advisor/overview', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const advisorId = req.user.id;
    
    const [advisedStudents] = await pool.execute(`
      SELECT COUNT(*) as total FROM student_advisor_assignments 
      WHERE advisor_id = ? AND is_active = TRUE
    `, [advisorId]);
    
    const [activeCases] = await pool.execute(`
      SELECT COUNT(*) as total FROM student_cases 
      WHERE advisor_id = ? AND status = 'active'
    `, [advisorId]);
    
    const [pendingMeetings] = await pool.execute(`
      SELECT COUNT(*) as total FROM advisor_meetings 
      WHERE advisor_id = ? AND meeting_date >= CURDATE() AND status = 'scheduled'
    `, [advisorId]);
    
    const [recentActivity] = await pool.execute(`
      SELECT sc.*, u.first_name, u.last_name, u.student_id 
      FROM student_cases sc
      JOIN users u ON sc.student_id = u.id
      WHERE sc.advisor_id = ?
      ORDER BY sc.created_at DESC
      LIMIT 10
    `, [advisorId]);
    
    res.json({
      success: true,
      data: {
        total_students: advisedStudents[0].total,
        active_cases: activeCases[0].total,
        pending_meetings: pendingMeetings[0].total,
        recent_activity: recentActivity
      }
    });
  } catch (error) {
    console.error('Advisor overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/advisor/students', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const advisorId = req.user.id;
    
    const [students] = await pool.execute(`
      SELECT u.*, tc.class_name, tl.trade_name, tl.level_number,
        (SELECT AVG(percentage) FROM student_subject_performance WHERE student_id = u.id) as avg_grade,
        (SELECT COUNT(*) FROM student_discipline_records WHERE student_id = u.id AND DATE(incident_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as recent_incidents
      FROM student_advisor_assignments saa
      JOIN users u ON saa.student_id = u.id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE saa.advisor_id = ? AND saa.is_active = TRUE
      ORDER BY u.last_name, u.first_name
    `, [advisorId]);
    
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/advisor/cases/create', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { student_id, case_type, title, description, priority } = req.body;
    const advisorId = req.user.id;
    
    const [result] = await pool.execute(`
      INSERT INTO student_cases (student_id, advisor_id, case_type, title, description, priority, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())
    `, [student_id, advisorId, case_type, title, description, priority || 'medium']);
    
    res.json({ success: true, message: 'Case created successfully', case_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/advisor/meetings', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const advisorId = req.user.id;
    
    const [meetings] = await pool.execute(`
      SELECT am.*, u.first_name, u.last_name, u.student_id, u.email, u.phone
      FROM advisor_meetings am
      JOIN users u ON am.student_id = u.id
      WHERE am.advisor_id = ?
      ORDER BY am.meeting_date DESC
    `, [advisorId]);
    
    res.json({ success: true, meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/advisor/meetings/schedule', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { student_id, meeting_date, meeting_time, purpose, location } = req.body;
    const advisorId = req.user.id;
    
    const [result] = await pool.execute(`
      INSERT INTO advisor_meetings (advisor_id, student_id, meeting_date, meeting_time, purpose, location, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'scheduled', NOW())
    `, [advisorId, student_id, meeting_date, meeting_time, purpose, location || 'Advisor Office']);
    
    res.json({ success: true, message: 'Meeting scheduled successfully', meeting_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// ACCOUNTANT DASHBOARD
// ==========================================

router.get('/accountant/overview', authenticateToken, requireRole('accountant', 'admin'), async (req, res) => {
  try {
    const [totalFees] = await pool.execute(`
      SELECT SUM(total_amount) as total FROM student_fees WHERE academic_year = (SELECT name FROM academic_years WHERE is_current = TRUE LIMIT 1)
    `);
    
    const [totalPaid] = await pool.execute(`
      SELECT SUM(amount) as total FROM fee_payments WHERE payment_date >= (SELECT start_date FROM academic_years WHERE is_current = TRUE LIMIT 1)
    `);
    
    const [pendingPayments] = await pool.execute(`
      SELECT COUNT(*) as total FROM student_fees WHERE balance > 0
    `);
    
    const [recentTransactions] = await pool.execute(`
      SELECT fp.*, u.first_name, u.last_name, u.student_id
      FROM fee_payments fp
      JOIN users u ON fp.student_id = u.id
      ORDER BY fp.payment_date DESC
      LIMIT 20
    `);
    
    const balance = (totalPaid[0]?.total || 0);
    const expectedTotal = (totalFees[0]?.total || 0);
    const outstanding = expectedTotal - balance;
    
    res.json({
      success: true,
      data: {
        total_expected: expectedTotal,
        total_collected: balance,
        outstanding_balance: outstanding,
        pending_payments: pendingPayments[0].total,
        recent_transactions: recentTransactions
      }
    });
  } catch (error) {
    console.error('Accountant overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/accountant/students', authenticateToken, requireRole('accountant', 'admin'), async (req, res) => {
  try {
    const [students] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.student_id, u.phone, u.email,
        sf.total_amount, sf.paid_amount, sf.balance, sf.payment_status,
        tc.class_name, tl.trade_name, tl.level_number
      FROM users u
      LEFT JOIN student_fees sf ON u.id = sf.student_id AND sf.academic_year = (SELECT name FROM academic_years WHERE is_current = TRUE LIMIT 1)
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE u.role = 'student' AND u.is_active = TRUE
      ORDER BY sf.balance DESC, u.last_name
    `);
    
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/accountant/payments/record', authenticateToken, requireRole('accountant', 'admin'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { student_id, amount, payment_method, transaction_ref, payment_date, notes } = req.body;
    const accountantId = req.user.id;
    
    const [result] = await connection.execute(`
      INSERT INTO fee_payments (student_id, amount, payment_method, transaction_ref, payment_date, recorded_by, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [student_id, amount, payment_method, transaction_ref, payment_date || new Date(), accountantId, notes || null]);
    
    await connection.execute(`
      UPDATE student_fees 
      SET paid_amount = paid_amount + ?, balance = balance - ?, 
          payment_status = CASE WHEN balance - ? <= 0 THEN 'paid' ELSE 'partial' END,
          last_payment_date = ?
      WHERE student_id = ? AND academic_year = (SELECT name FROM academic_years WHERE is_current = TRUE LIMIT 1)
    `, [amount, amount, amount, payment_date || new Date(), student_id]);
    
    await connection.commit();
    res.json({ success: true, message: 'Payment recorded successfully', payment_id: result.insertId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

router.get('/accountant/reports/summary', authenticateToken, requireRole('accountant', 'admin'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const [summary] = await pool.execute(`
      SELECT 
        DATE(payment_date) as date,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        payment_method
      FROM fee_payments
      WHERE payment_date BETWEEN ? AND ?
      GROUP BY DATE(payment_date), payment_method
      ORDER BY date DESC
    `, [start_date || '2024-01-01', end_date || new Date()]);
    
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// DOD (Director of Discipline) DASHBOARD - ENHANCED
// ==========================================

router.get('/dod/overview', authenticateToken, requireRole('dod', 'matron', 'patron', 'admin'), async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const [totalIncidents] = await pool.execute(`
      SELECT COUNT(*) as total FROM student_conduct_records 
      WHERE DATE(incident_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);
    
    const [activeWarnings] = await pool.execute(`
      SELECT COUNT(*) as total FROM student_conduct_records 
      WHERE status = 'active' AND severity IN ('minor', 'moderate')
    `);
    
    const [suspensions] = await pool.execute(`
      SELECT COUNT(*) as total FROM student_conduct_records scr
      JOIN discipline_actions da ON scr.action_id = da.id
      WHERE da.action_type = 'suspension' AND scr.status = 'active'
    `);
    
    const [pendingFollowUps] = await pool.execute(`
      SELECT COUNT(*) as total FROM student_conduct_records 
      WHERE follow_up_required = TRUE AND follow_up_date <= CURDATE() AND status = 'active'
    `);
    
    const [myHandledCases] = await pool.execute(`
      SELECT COUNT(*) as total FROM student_conduct_records WHERE handled_by = ?
    `, [userId]);
    
    const [dormitoryInspections] = await pool.execute(`
      SELECT COUNT(*) as total FROM dormitory_inspections 
      WHERE inspection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);
    
    const [counselingSessions] = await pool.execute(`
      SELECT COUNT(*) as total FROM student_counseling_sessions 
      WHERE session_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);
    
    const [recentIncidents] = await pool.execute(`
      SELECT scr.*, u.first_name, u.last_name, u.student_id, 
        tc.class_name, dc.name as category_name, da.name as action_name,
        reporter.first_name as reporter_first, reporter.last_name as reporter_last
      FROM student_conduct_records scr
      JOIN users u ON scr.student_id = u.id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN discipline_categories dc ON scr.category_id = dc.id
      LEFT JOIN discipline_actions da ON scr.action_id = da.id
      LEFT JOIN users reporter ON scr.reported_by = reporter.id
      ORDER BY scr.incident_date DESC
      LIMIT 20
    `);
    
    const [severityStats] = await pool.execute(`
      SELECT severity, COUNT(*) as count
      FROM student_conduct_records
      WHERE DATE(incident_date) >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      GROUP BY severity
    `);
    
    const [categoryStats] = await pool.execute(`
      SELECT dc.name, COUNT(*) as count
      FROM student_conduct_records scr
      JOIN discipline_categories dc ON scr.category_id = dc.id
      WHERE DATE(scr.incident_date) >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      GROUP BY dc.id
      ORDER BY count DESC
      LIMIT 10
    `);
    
    const [monthlyTrend] = await pool.execute(`
      SELECT DATE_FORMAT(incident_date, '%Y-%m') as month, COUNT(*) as count
      FROM student_conduct_records
      WHERE DATE(incident_date) >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month
    `);
    
    const [topOffenders] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.student_id, tc.class_name,
        COUNT(*) as incident_count
      FROM student_conduct_records scr
      JOIN users u ON scr.student_id = u.id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      WHERE DATE(scr.incident_date) >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      GROUP BY u.id
      ORDER BY incident_count DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: {
        total_incidents_30days: totalIncidents[0].total,
        active_warnings: activeWarnings[0].total,
        active_suspensions: suspensions[0].total,
        pending_followups: pendingFollowUps[0].total,
        my_handled_cases: myHandledCases[0].total,
        dormitory_inspections_30days: dormitoryInspections[0].total,
        counseling_sessions_30days: counselingSessions[0].total,
        recent_incidents: recentIncidents,
        severity_stats: severityStats,
        category_stats: categoryStats,
        monthly_trend: monthlyTrend,
        top_offenders: topOffenders,
        user_role: userRole
      }
    });
  } catch (error) {
    console.error('DOD overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/dod/profile', authenticateToken, requireRole('dod', 'matron', 'patron', 'admin'), async (req, res) => {
  try {
    const [user] = await pool.execute(`
      SELECT id, first_name, last_name, email, phone, role, profile_image, 
        bio, department, office_location, created_at
      FROM users WHERE id = ?
    `, [req.user.id]);
    
    if (!user.length) return res.status(404).json({ success: false, message: 'User not found' });
    
    const [stats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM student_conduct_records WHERE handled_by = ?) as total_cases,
        (SELECT COUNT(*) FROM student_conduct_records WHERE handled_by = ? AND status = 'active') as active_cases,
        (SELECT COUNT(*) FROM dormitory_inspections WHERE inspector_id = ?) as total_inspections,
        (SELECT COUNT(*) FROM student_counseling_sessions WHERE counselor_id = ?) as total_sessions
    `, [req.user.id, req.user.id, req.user.id, req.user.id]);
    
    res.json({ success: true, profile: user[0], stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/dod/profile', authenticateToken, requireRole('dod', 'matron', 'patron', 'admin'), async (req, res) => {
  try {
    const { first_name, last_name, phone, bio, department, office_location } = req.body;
    
    await pool.execute(`
      UPDATE users 
      SET first_name = ?, last_name = ?, phone = ?, bio = ?, department = ?, office_location = ?
      WHERE id = ?
    `, [first_name, last_name, phone, bio, department, office_location, req.user.id]);
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/dod/students', authenticateToken, requireRole('dod', 'matron', 'patron', 'admin'), async (req, res) => {
  try {
    const { class_id, severity, has_incidents } = req.query;
    
    let query = `
      SELECT u.id, u.first_name, u.last_name, u.student_id, u.phone,
        tc.class_name, tl.trade_name, tl.level_number,
        (SELECT COUNT(*) FROM student_conduct_records WHERE student_id = u.id) as total_incidents,
        (SELECT COUNT(*) FROM student_conduct_records WHERE student_id = u.id AND DATE(incident_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as recent_incidents,
        (SELECT SUM(points) FROM student_behavior_points WHERE student_id = u.id AND point_type = 'negative') as negative_points,
        (SELECT SUM(points) FROM student_behavior_points WHERE student_id = u.id AND point_type = 'positive') as positive_points,
        (SELECT incident_date FROM student_conduct_records WHERE student_id = u.id ORDER BY incident_date DESC LIMIT 1) as last_incident
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE u.role = 'student' AND u.is_active = TRUE
    `;
    
    const params = [];
    if (class_id) {
      query += ' AND tc.id = ?';
      params.push(class_id);
    }
    if (has_incidents === 'true') {
      query += ' HAVING total_incidents > 0';
    }
    
    query += ' ORDER BY recent_incidents DESC, total_incidents DESC';
    
    const [students] = await pool.execute(query, params);
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/dod/incidents/create', authenticateToken, requireRole('dod', 'matron', 'patron', 'admin'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { 
      student_id, incident_type, category_id, description, location, 
      severity, action_id, action_taken, action_start_date, action_end_date,
      parent_notified, follow_up_required, follow_up_date, reported_by 
    } = req.body;
    
    const handlerId = req.user.id;
    
    const [result] = await connection.execute(`
      INSERT INTO student_conduct_records (
        student_id, incident_type, category_id, description, location, severity,
        reported_by, handled_by, action_id, action_taken, action_start_date, action_end_date,
        parent_notified, follow_up_required, follow_up_date, status, incident_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
    `, [
      student_id, incident_type, category_id, description, location, severity || 'moderate',
      reported_by || handlerId, handlerId, action_id, action_taken, action_start_date, action_end_date,
      parent_notified || false, follow_up_required || false, follow_up_date
    ]);
    
    const pointsMap = { minor: 5, moderate: 10, major: 20, severe: 30 };
    await connection.execute(`
      INSERT INTO student_behavior_points (student_id, points, point_type, reason, awarded_by, conduct_record_id)
      VALUES (?, ?, 'negative', ?, ?, ?)
    `, [student_id, pointsMap[severity] || 10, `Incident: ${incident_type}`, handlerId, result.insertId]);
    
    if (parent_notified) {
      const [student] = await connection.execute('SELECT first_name, last_name FROM users WHERE id = ?', [student_id]);
      const studentName = `${student[0].first_name} ${student[0].last_name}`;
      
      await connection.execute(`
        INSERT INTO parent_notifications (student_id, notification_type, subject, message, sent_by, conduct_record_id)
        VALUES (?, 'discipline', ?, ?, ?, ?)
      `, [
        student_id, 
        `Discipline Notice - ${incident_type}`,
        `Dear Parent, ${studentName} was involved in a ${severity} incident: ${description}. Action taken: ${action_taken}`,
        handlerId,
        result.insertId
      ]);
    }
    
    await connection.commit();
    res.json({ success: true, message: 'Incident recorded successfully', incident_id: result.insertId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

router.get('/dod/reports/statistics', authenticateToken, requireRole('dod', 'matron', 'patron', 'admin'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const [byCategory] = await pool.execute(`
      SELECT dc.name, dc.severity_level, COUNT(*) as count
      FROM student_conduct_records scr
      JOIN discipline_categories dc ON scr.category_id = dc.id
      WHERE scr.incident_date BETWEEN ? AND ?
      GROUP BY dc.id
      ORDER BY count DESC
    `, [start_date || '2024-01-01', end_date || new Date()]);
    
    const [byAction] = await pool.execute(`
      SELECT da.name, da.action_type, COUNT(*) as count
      FROM student_conduct_records scr
      JOIN discipline_actions da ON scr.action_id = da.id
      WHERE scr.incident_date BETWEEN ? AND ?
      GROUP BY da.id
      ORDER BY count DESC
    `, [start_date || '2024-01-01', end_date || new Date()]);
    
    const [bySeverity] = await pool.execute(`
      SELECT severity, COUNT(*) as count
      FROM student_conduct_records
      WHERE incident_date BETWEEN ? AND ?
      GROUP BY severity
    `, [start_date || '2024-01-01', end_date || new Date()]);
    
    const [byClass] = await pool.execute(`
      SELECT tc.class_name, tl.trade_name, COUNT(*) as count
      FROM student_conduct_records scr
      JOIN users u ON scr.student_id = u.id
      JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      JOIN trade_classes tc ON e.class_id = tc.id
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE scr.incident_date BETWEEN ? AND ?
      GROUP BY tc.id
      ORDER BY count DESC
    `, [start_date || '2024-01-01', end_date || new Date()]);
    
    const [repeatOffenders] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.student_id, tc.class_name,
        COUNT(*) as total_incidents,
        SUM(CASE WHEN scr.severity = 'severe' THEN 1 ELSE 0 END) as severe_incidents
      FROM student_conduct_records scr
      JOIN users u ON scr.student_id = u.id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      WHERE scr.incident_date BETWEEN ? AND ?
      GROUP BY u.id
      HAVING total_incidents >= 3
      ORDER BY total_incidents DESC
      LIMIT 20
    `, [start_date || '2024-01-01', end_date || new Date()]);
    
    res.json({ 
      success: true, 
      statistics: { 
        by_category: byCategory, 
        by_action: byAction, 
        by_severity: bySeverity,
        by_class: byClass,
        repeat_offenders: repeatOffenders
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// DOS (Director of Studies) DASHBOARD
// ==========================================

router.get('/dos/overview', authenticateToken, requireRole('dos', 'admin'), async (req, res) => {
  try {
    const [totalStudents] = await pool.execute(`
      SELECT COUNT(*) as total FROM users WHERE role = 'student' AND is_active = TRUE
    `);
    
    const [totalTeachers] = await pool.execute(`
      SELECT COUNT(*) as total FROM users WHERE role = 'teacher' AND is_active = TRUE
    `);
    
    const [averagePerformance] = await pool.execute(`
      SELECT AVG(average_marks) as avg FROM global_student_sheets WHERE academic_year = (SELECT name FROM academic_years WHERE is_current = TRUE LIMIT 1)
    `);
    
    const [classPerformance] = await pool.execute(`
      SELECT tc.class_name, tl.trade_name, tl.level_number,
        AVG(gss.average_marks) as avg_marks,
        COUNT(DISTINCT gss.student_id) as student_count
      FROM trade_classes tc
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      LEFT JOIN enrollments e ON tc.id = e.class_id AND e.status = 'active'
      LEFT JOIN global_student_sheets gss ON e.student_id = gss.student_id
      GROUP BY tc.id
      ORDER BY avg_marks DESC
    `);
    
    res.json({
      success: true,
      data: {
        total_students: totalStudents[0].total,
        total_teachers: totalTeachers[0].total,
        average_performance: averagePerformance[0]?.avg || 0,
        class_performance: classPerformance
      }
    });
  } catch (error) {
    console.error('DOS overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/dos/performance/subjects', authenticateToken, requireRole('dos', 'admin'), async (req, res) => {
  try {
    const [subjects] = await pool.execute(`
      SELECT s.name, s.code,
        AVG(ssp.percentage) as avg_percentage,
        COUNT(DISTINCT ssp.student_id) as student_count,
        COUNT(DISTINCT ssp.teacher_id) as teacher_count
      FROM subjects s
      LEFT JOIN student_subject_performance ssp ON s.id = ssp.subject_id
      WHERE s.is_active = TRUE
      GROUP BY s.id
      ORDER BY avg_percentage DESC
    `);
    
    res.json({ success: true, subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/dos/teachers', authenticateToken, requireRole('dos', 'admin'), async (req, res) => {
  try {
    const [teachers] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone,
        COUNT(DISTINCT tsa.subject_id) as subjects_taught,
        COUNT(DISTINCT tsa.trade_class_id) as classes_taught,
        SUM(tsa.weekly_periods) as total_periods
      FROM users u
      LEFT JOIN teacher_subject_assignments tsa ON u.id = tsa.teacher_id AND tsa.is_active = TRUE
      WHERE u.role = 'teacher' AND u.is_active = TRUE
      GROUP BY u.id
      ORDER BY u.last_name
    `);
    
    res.json({ success: true, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/dos/assignments/assign-teacher', authenticateToken, requireRole('dos', 'admin'), async (req, res) => {
  try {
    const { teacher_id, subject_id, trade_class_id, academic_year_id, weekly_periods } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO teacher_subject_assignments (teacher_id, subject_id, trade_class_id, academic_year_id, weekly_periods, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, TRUE, NOW())
      ON DUPLICATE KEY UPDATE weekly_periods = ?, is_active = TRUE
    `, [teacher_id, subject_id, trade_class_id, academic_year_id, weekly_periods || 4, weekly_periods || 4]);
    
    res.json({ success: true, message: 'Teacher assigned successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// HEADMASTER DASHBOARD
// ==========================================

router.get('/headmaster/overview', authenticateToken, requireRole('headmaster', 'admin'), async (req, res) => {
  try {
    const [students] = await pool.execute(`SELECT COUNT(*) as total FROM users WHERE role = 'student' AND is_active = TRUE`);
    const [teachers] = await pool.execute(`SELECT COUNT(*) as total FROM users WHERE role = 'teacher' AND is_active = TRUE`);
    const [staff] = await pool.execute(`SELECT COUNT(*) as total FROM users WHERE role IN ('advisor', 'accountant', 'dos', 'dod', 'stock_manager') AND is_active = TRUE`);
    
    const [academicPerformance] = await pool.execute(`
      SELECT AVG(average_marks) as avg FROM global_student_sheets 
      WHERE academic_year = (SELECT name FROM academic_years WHERE is_current = TRUE LIMIT 1)
    `);
    
    const [financialStatus] = await pool.execute(`
      SELECT SUM(total_amount) as expected, SUM(paid_amount) as collected, SUM(balance) as outstanding
      FROM student_fees
      WHERE academic_year = (SELECT name FROM academic_years WHERE is_current = TRUE LIMIT 1)
    `);
    
    const [disciplineStats] = await pool.execute(`
      SELECT COUNT(*) as incidents FROM student_discipline_records 
      WHERE DATE(incident_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);
    
    const [attendanceStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent
      FROM student_attendance_records
      WHERE DATE(attendance_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);
    
    res.json({
      success: true,
      data: {
        total_students: students[0].total,
        total_teachers: teachers[0].total,
        total_staff: staff[0].total,
        academic_avg: academicPerformance[0]?.avg || 0,
        financial: financialStatus[0],
        discipline_incidents: disciplineStats[0].incidents,
        attendance: attendanceStats[0]
      }
    });
  } catch (error) {
    console.error('Headmaster overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/headmaster/reports/comprehensive', authenticateToken, requireRole('headmaster', 'admin'), async (req, res) => {
  try {
    const { report_type, start_date, end_date } = req.query;
    
    let reportData = {};
    
    if (report_type === 'academic' || !report_type) {
      const [academic] = await pool.execute(`
        SELECT tc.class_name, tl.trade_name, tl.level_number,
          COUNT(DISTINCT e.student_id) as students,
          AVG(gss.average_marks) as avg_marks
        FROM trade_classes tc
        JOIN trade_levels tl ON tc.trade_level_id = tl.id
        LEFT JOIN enrollments e ON tc.id = e.class_id AND e.status = 'active'
        LEFT JOIN global_student_sheets gss ON e.student_id = gss.student_id
        GROUP BY tc.id
      `);
      reportData.academic = academic;
    }
    
    if (report_type === 'financial' || !report_type) {
      const [financial] = await pool.execute(`
        SELECT 
          DATE_FORMAT(payment_date, '%Y-%m') as month,
          COUNT(*) as transactions,
          SUM(amount) as total_amount
        FROM fee_payments
        WHERE payment_date BETWEEN ? AND ?
        GROUP BY month
      `, [start_date || '2024-01-01', end_date || new Date()]);
      reportData.financial = financial;
    }
    
    res.json({ success: true, report: reportData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// STOCK MANAGER DASHBOARD
// ==========================================

router.get('/stock/overview', authenticateToken, requireRole('stock_manager', 'admin'), async (req, res) => {
  try {
    const [totalItems] = await pool.execute(`SELECT COUNT(*) as total FROM inventory_items WHERE is_active = TRUE`);
    const [lowStock] = await pool.execute(`SELECT COUNT(*) as total FROM inventory_items WHERE current_quantity <= reorder_level AND is_active = TRUE`);
    const [totalValue] = await pool.execute(`SELECT SUM(current_quantity * unit_price) as total FROM inventory_items WHERE is_active = TRUE`);
    
    const [recentTransactions] = await pool.execute(`
      SELECT it.*, ii.name as item_name, u.first_name, u.last_name
      FROM inventory_transactions it
      JOIN inventory_items ii ON it.item_id = ii.id
      LEFT JOIN users u ON it.performed_by = u.id
      ORDER BY it.transaction_date DESC
      LIMIT 20
    `);
    
    const [categories] = await pool.execute(`
      SELECT category, COUNT(*) as item_count, SUM(current_quantity * unit_price) as category_value
      FROM inventory_items
      WHERE is_active = TRUE
      GROUP BY category
    `);
    
    res.json({
      success: true,
      data: {
        total_items: totalItems[0].total,
        low_stock_items: lowStock[0].total,
        total_inventory_value: totalValue[0]?.total || 0,
        recent_transactions: recentTransactions,
        categories: categories
      }
    });
  } catch (error) {
    console.error('Stock overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stock/items', authenticateToken, requireRole('stock_manager', 'admin'), async (req, res) => {
  try {
    const { category, low_stock } = req.query;
    
    let query = 'SELECT * FROM inventory_items WHERE is_active = TRUE';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (low_stock === 'true') {
      query += ' AND current_quantity <= reorder_level';
    }
    
    query += ' ORDER BY name';
    
    const [items] = await pool.execute(query, params);
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/stock/items/add', authenticateToken, requireRole('stock_manager', 'admin'), async (req, res) => {
  try {
    const { name, category, description, unit_price, current_quantity, reorder_level, supplier } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO inventory_items (name, category, description, unit_price, current_quantity, reorder_level, supplier, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW())
    `, [name, category, description, unit_price, current_quantity, reorder_level || 10, supplier]);
    
    res.json({ success: true, message: 'Item added successfully', item_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/stock/transactions/record', authenticateToken, requireRole('stock_manager', 'admin'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { item_id, transaction_type, quantity, unit_price, notes } = req.body;
    const managerId = req.user.id;
    
    const [result] = await connection.execute(`
      INSERT INTO inventory_transactions (item_id, transaction_type, quantity, unit_price, performed_by, transaction_date, notes, created_at)
      VALUES (?, ?, ?, ?, ?, NOW(), ?, NOW())
    `, [item_id, transaction_type, quantity, unit_price, managerId, notes || null]);
    
    if (transaction_type === 'in' || transaction_type === 'purchase') {
      await connection.execute(`
        UPDATE inventory_items SET current_quantity = current_quantity + ? WHERE id = ?
      `, [quantity, item_id]);
    } else if (transaction_type === 'out' || transaction_type === 'issue') {
      await connection.execute(`
        UPDATE inventory_items SET current_quantity = current_quantity - ? WHERE id = ?
      `, [quantity, item_id]);
    }
    
    await connection.commit();
    res.json({ success: true, message: 'Transaction recorded successfully', transaction_id: result.insertId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
