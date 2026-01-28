const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET comprehensive school analytics for advisor
router.get('/analytics/school-overview', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    // Get comprehensive school statistics from database
    const [studentStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN gender = 'Male' THEN 1 END) as male_students,
        COUNT(CASE WHEN gender = 'Female' THEN 1 END) as female_students,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_students,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_students_month
      FROM students
      WHERE deleted_at IS NULL
    `);

    const [tradeStats] = await pool.execute(`
      SELECT 
        t.trade_name,
        t.trade_id,
        COUNT(DISTINCT e.student_id) as enrolled_students,
        t.capacity,
        ROUND((COUNT(DISTINCT e.student_id) / t.capacity * 100), 2) as utilization_rate
      FROM trades t
      LEFT JOIN enrollments e ON t.trade_id = e.trade_id AND e.status = 'active'
      GROUP BY t.trade_id, t.trade_name, t.capacity
      ORDER BY enrolled_students DESC
    `);

    const [levelStats] = await pool.execute(`
      SELECT 
        tl.level_name,
        tl.level_code,
        COUNT(DISTINCT e.student_id) as student_count,
        AVG(CAST(sg.average_score AS DECIMAL(5,2))) as average_performance
      FROM trade_levels tl
      LEFT JOIN enrollments e ON tl.id = e.level_id AND e.status = 'active'
      LEFT JOIN student_grades sg ON e.student_id = sg.student_id
      GROUP BY tl.id, tl.level_name, tl.level_code
      ORDER BY tl.level_code
    `);

    const [performanceStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_records,
        AVG(CAST(average_score AS DECIMAL(5,2))) as school_average,
        MAX(CAST(average_score AS DECIMAL(5,2))) as highest_average,
        MIN(CAST(average_score AS DECIMAL(5,2))) as lowest_average,
        COUNT(CASE WHEN CAST(average_score AS DECIMAL(5,2)) >= 70 THEN 1 END) as excellent_students,
        COUNT(CASE WHEN CAST(average_score AS DECIMAL(5,2)) >= 50 AND CAST(average_score AS DECIMAL(5,2)) < 70 THEN 1 END) as good_students,
        COUNT(CASE WHEN CAST(average_score AS DECIMAL(5,2)) < 50 THEN 1 END) as struggling_students
      FROM student_grades
      WHERE academic_year = (SELECT MAX(academic_year) FROM student_grades)
    `);

    const [attendanceStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_count,
        COUNT(CASE WHEN status = 'excused' THEN 1 END) as excused_count,
        ROUND((COUNT(CASE WHEN status = 'present' THEN 1 END) / COUNT(*) * 100), 2) as attendance_rate
      FROM attendance
      WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    const [parentContactStats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT u.id) as total_parents,
        COUNT(DISTINCT CASE WHEN m.id IS NOT NULL THEN u.id END) as active_parents,
        COUNT(DISTINCT m.id) as total_messages,
        COUNT(DISTINCT CASE WHEN m.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN m.id END) as recent_messages
      FROM users u
      LEFT JOIN messages m ON u.id = m.sender_id OR u.id = m.receiver_id
      WHERE u.role = 'parent'
    `);

    const [staffStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_staff,
        COUNT(CASE WHEN role = 'teacher' THEN 1 END) as teachers,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_staff,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_staff
      FROM admin_users
    `);

    const [recentEnrollments] = await pool.execute(`
      SELECT 
        DATE(e.enrollment_date) as date,
        COUNT(*) as enrollments
      FROM enrollments e
      WHERE e.enrollment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(e.enrollment_date)
      ORDER BY date DESC
    `);

    const [behaviorStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_incidents,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_severity,
        COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_severity,
        COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_severity,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_incidents,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_incidents
      FROM discipline_records
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    `);

    res.json({
      success: true,
      analytics: {
        students: studentStats[0],
        trades: tradeStats,
        levels: levelStats,
        performance: performanceStats[0],
        attendance: attendanceStats[0],
        parent_engagement: parentContactStats[0],
        staff: staffStats[0],
        enrollment_trends: recentEnrollments,
        behavior: behaviorStats[0],
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching school analytics:', error);
    res.status(500).json({ success: false, message: 'Error fetching analytics', error: error.message });
  }
});

// GET student performance trends
router.get('/analytics/performance-trends', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { period = '6months', trade_id, level_id } = req.query;

    let dateFilter = 'DATE_SUB(NOW(), INTERVAL 6 MONTH)';
    if (period === '1year') dateFilter = 'DATE_SUB(NOW(), INTERVAL 1 YEAR)';
    if (period === '3months') dateFilter = 'DATE_SUB(NOW(), INTERVAL 3 MONTH)';

    let tradeFilter = '';
    let levelFilter = '';
    const params = [];

    if (trade_id) {
      tradeFilter = ' AND e.trade_id = ?';
      params.push(trade_id);
    }
    if (level_id) {
      levelFilter = ' AND e.level_id = ?';
      params.push(level_id);
    }

    const [trends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(sg.created_at, '%Y-%m') as month,
        AVG(CAST(sg.average_score AS DECIMAL(5,2))) as avg_score,
        COUNT(DISTINCT sg.student_id) as student_count,
        t.trade_name,
        tl.level_name
      FROM student_grades sg
      JOIN enrollments e ON sg.student_id = e.student_id
      JOIN trades t ON e.trade_id = t.trade_id
      JOIN trade_levels tl ON e.level_id = tl.id
      WHERE sg.created_at >= ${dateFilter} ${tradeFilter} ${levelFilter}
      GROUP BY DATE_FORMAT(sg.created_at, '%Y-%m'), t.trade_name, tl.level_name
      ORDER BY month DESC
    `, params);

    const [comparisonData] = await pool.execute(`
      SELECT 
        t.trade_name,
        AVG(CAST(sg.average_score AS DECIMAL(5,2))) as avg_score,
        COUNT(DISTINCT sg.student_id) as student_count
      FROM student_grades sg
      JOIN enrollments e ON sg.student_id = e.student_id
      JOIN trades t ON e.trade_id = t.trade_id
      WHERE sg.created_at >= ${dateFilter}
      GROUP BY t.trade_name
      ORDER BY avg_score DESC
    `, []);

    res.json({
      success: true,
      trends: trends,
      comparison: comparisonData,
      period: period
    });
  } catch (error) {
    console.error('Error fetching performance trends:', error);
    res.status(500).json({ success: false, message: 'Error fetching trends', error: error.message });
  }
});

// GET student risk analysis
router.get('/analytics/student-risk-analysis', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    // Students at risk based on multiple factors
    const [atRiskStudents] = await pool.execute(`
      SELECT 
        s.student_id,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        t.trade_name,
        tl.level_name,
        AVG(CAST(sg.average_score AS DECIMAL(5,2))) as avg_score,
        COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.date END) as absent_days,
        COUNT(DISTINCT dr.id) as discipline_incidents,
        CASE 
          WHEN AVG(CAST(sg.average_score AS DECIMAL(5,2))) < 40 THEN 'critical'
          WHEN AVG(CAST(sg.average_score AS DECIMAL(5,2))) < 50 THEN 'high'
          WHEN COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.date END) > 10 THEN 'medium'
          ELSE 'low'
        END as risk_level,
        CONCAT_WS(', ',
          CASE WHEN AVG(CAST(sg.average_score AS DECIMAL(5,2))) < 50 THEN 'Low Performance' END,
          CASE WHEN COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.date END) > 10 THEN 'High Absenteeism' END,
          CASE WHEN COUNT(DISTINCT dr.id) > 3 THEN 'Behavioral Issues' END
        ) as risk_factors
      FROM students s
      JOIN enrollments e ON s.student_id = e.student_id
      JOIN trades t ON e.trade_id = t.trade_id
      JOIN trade_levels tl ON e.level_id = tl.id
      LEFT JOIN student_grades sg ON s.student_id = sg.student_id
      LEFT JOIN attendance a ON s.student_id = a.student_id AND a.date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      LEFT JOIN discipline_records dr ON s.student_id = dr.student_id AND dr.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      WHERE s.status = 'active' AND e.status = 'active'
      GROUP BY s.student_id, s.first_name, s.last_name, t.trade_name, tl.level_name
      HAVING avg_score < 50 OR absent_days > 10 OR discipline_incidents > 3
      ORDER BY risk_level DESC, avg_score ASC
      LIMIT 100
    `);

    // Risk category summary
    const [riskSummary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_at_risk,
        COUNT(CASE WHEN avg_score < 40 THEN 1 END) as critical_risk,
        COUNT(CASE WHEN avg_score >= 40 AND avg_score < 50 THEN 1 END) as high_risk,
        COUNT(CASE WHEN absent_days > 10 THEN 1 END) as attendance_risk,
        COUNT(CASE WHEN discipline_incidents > 3 THEN 1 END) as behavior_risk
      FROM (
        SELECT 
          s.student_id,
          AVG(CAST(sg.average_score AS DECIMAL(5,2))) as avg_score,
          COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.date END) as absent_days,
          COUNT(DISTINCT dr.id) as discipline_incidents
        FROM students s
        JOIN enrollments e ON s.student_id = e.student_id
        LEFT JOIN student_grades sg ON s.student_id = sg.student_id
        LEFT JOIN attendance a ON s.student_id = a.student_id AND a.date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        LEFT JOIN discipline_records dr ON s.student_id = dr.student_id AND dr.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
        WHERE s.status = 'active' AND e.status = 'active'
        GROUP BY s.student_id
        HAVING avg_score < 50 OR absent_days > 10 OR discipline_incidents > 3
      ) as risk_data
    `);

    res.json({
      success: true,
      at_risk_students: atRiskStudents,
      risk_summary: riskSummary[0],
      recommendations: generateRiskRecommendations(atRiskStudents)
    });
  } catch (error) {
    console.error('Error fetching risk analysis:', error);
    res.status(500).json({ success: false, message: 'Error fetching risk analysis', error: error.message });
  }
});

// GET comprehensive contact management data
router.get('/contacts/all', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { search, type, status } = req.query;
    
    let whereConditions = ['1=1'];
    const params = [];

    if (search) {
      whereConditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (type) {
      whereConditions.push('u.role = ?');
      params.push(type);
    }

    const [contacts] = await pool.execute(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.role,
        u.created_at,
        COUNT(DISTINCT m.id) as total_messages,
        COUNT(DISTINCT CASE WHEN m.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN m.id END) as recent_messages,
        MAX(m.created_at) as last_contact,
        GROUP_CONCAT(DISTINCT s.student_id) as related_students
      FROM users u
      LEFT JOIN messages m ON u.id = m.sender_id OR u.id = m.receiver_id
      LEFT JOIN students s ON u.id = s.parent_id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY u.id
      ORDER BY last_contact DESC NULLS LAST
      LIMIT 500
    `, params);

    const [contactStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_contacts,
        COUNT(CASE WHEN role = 'parent' THEN 1 END) as parents,
        COUNT(CASE WHEN role = 'teacher' THEN 1 END) as teachers,
        COUNT(DISTINCT CASE WHEN m.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN u.id END) as active_this_week,
        COUNT(DISTINCT CASE WHEN m.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN u.id END) as active_this_month
      FROM users u
      LEFT JOIN messages m ON u.id = m.sender_id OR u.id = m.receiver_id
      WHERE u.role IN ('parent', 'teacher', 'student')
    `);

    res.json({
      success: true,
      contacts: contacts,
      stats: contactStats[0]
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, message: 'Error fetching contacts', error: error.message });
  }
});

// GET communication history
router.get('/communications/history', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { contact_id, days = 30, type } = req.query;
    
    const params = [days];
    let contactFilter = '';
    let typeFilter = '';

    if (contact_id) {
      contactFilter = ' AND (m.sender_id = ? OR m.receiver_id = ?)';
      params.push(contact_id, contact_id);
    }

    if (type) {
      typeFilter = ' AND m.message_type = ?';
      params.push(type);
    }

    const [communications] = await pool.execute(`
      SELECT 
        m.*,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        sender.role as sender_role,
        CONCAT(receiver.first_name, ' ', receiver.last_name) as receiver_name,
        receiver.role as receiver_role,
        m.subject,
        m.content,
        m.status,
        m.priority,
        m.created_at
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users receiver ON m.receiver_id = receiver.id
      WHERE m.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) ${contactFilter} ${typeFilter}
      ORDER BY m.created_at DESC
      LIMIT 200
    `, params);

    const [commStats] = await pool.execute(`
      SELECT 
        message_type,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'read' THEN 1 END) as read_count,
        COUNT(CASE WHEN status = 'unread' THEN 1 END) as unread_count
      FROM messages
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) ${contactFilter}
      GROUP BY message_type
    `, params);

    res.json({
      success: true,
      communications: communications,
      statistics: commStats
    });
  } catch (error) {
    console.error('Error fetching communication history:', error);
    res.status(500).json({ success: false, message: 'Error fetching communications', error: error.message });
  }
});

// Helper function to generate risk recommendations
function generateRiskRecommendations(atRiskStudents) {
  const recommendations = {
    critical: [],
    high: [],
    medium: [],
    general: []
  };

  atRiskStudents.forEach(student => {
    const rec = {
      student_id: student.student_id,
      student_name: student.student_name,
      actions: []
    };

    if (student.avg_score < 40) {
      rec.actions.push('Immediate academic intervention required');
      rec.actions.push('Schedule parent meeting urgently');
      rec.actions.push('Assign peer tutor');
      recommendations.critical.push(rec);
    } else if (student.avg_score < 50) {
      rec.actions.push('Academic support program enrollment');
      rec.actions.push('Weekly progress monitoring');
      recommendations.high.push(rec);
    }

    if (student.absent_days > 15) {
      rec.actions.push('Home visit required');
      rec.actions.push('Attendance intervention plan');
      recommendations.high.push(rec);
    } else if (student.absent_days > 10) {
      rec.actions.push('Contact parents about attendance');
      recommendations.medium.push(rec);
    }

    if (student.discipline_incidents > 5) {
      rec.actions.push('Behavioral counseling sessions');
      rec.actions.push('Parent conference required');
      recommendations.high.push(rec);
    }
  });

  recommendations.general = [
    'Regular monitoring of at-risk students',
    'Monthly review of student progress',
    'Coordination with teachers and parents',
    'Implementation of early warning system'
  ];

  return recommendations;
}

module.exports = router;
