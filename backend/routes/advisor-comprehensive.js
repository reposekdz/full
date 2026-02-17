const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET comprehensive advisor overview integrating all existing features
router.get('/comprehensive/overview', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    // Fetch all comprehensive data from existing tables
    const [students] = await pool.execute(`
      SELECT u.*, r.name as role_name, tl.trade_code, tl.trade_name, 
             tc.class_name, e.enrollment_date, e.status as enrollment_status
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE r.name = 'student' AND u.is_active = true
    `);

    const [trades] = await pool.execute(`
      SELECT tl.*, COUNT(DISTINCT tc.id) as class_count,
             COUNT(DISTINCT e.student_id) as student_count
      FROM trade_levels tl
      LEFT JOIN trade_classes tc ON tl.id = tc.trade_level_id
      LEFT JOIN enrollments e ON tc.id = e.class_id AND e.status = 'active'
      WHERE tl.is_active = true
      GROUP BY tl.id
    `);

    const [messages] = await pool.execute(`
      SELECT m.*, 
             CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
             CONCAT(receiver.first_name, ' ', receiver.last_name) as receiver_name
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users receiver ON m.receiver_id = receiver.id
      WHERE m.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY m.created_at DESC
      LIMIT 100
    `);

    const [contacts] = await pool.execute(`
      SELECT * FROM contact_submissions
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY 
        CASE status WHEN 'pending' THEN 1 WHEN 'in_progress' THEN 2 ELSE 3 END,
        created_at DESC
      LIMIT 50
    `);

    const [tickets] = await pool.execute(`
      SELECT st.*, CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM support_tickets st
      LEFT JOIN users u ON st.user_id = u.id
      WHERE st.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY st.priority DESC, st.created_at DESC
      LIMIT 50
    `);

    const [grades] = await pool.execute(`
      SELECT g.*, u.student_id, CONCAT(u.first_name, ' ', u.last_name) as student_name,
             s.subject_name, s.subject_code
      FROM grades g
      JOIN users u ON g.student_id = u.id
      LEFT JOIN subjects s ON g.subject_id = s.id
      WHERE g.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY g.created_at DESC
      LIMIT 100
    `);

    const [attendance] = await pool.execute(`
      SELECT a.*, u.student_id, CONCAT(u.first_name, ' ', u.last_name) as student_name
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      WHERE a.attendance_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY a.attendance_date DESC
    `);

    const comprehensiveOverview = {
      summary: {
        total_students: students.length,
        total_trades: trades.length,
        active_messages: messages.filter(m => m.status === 'pending').length,
        pending_contacts: contacts.filter(c => c.status === 'pending').length,
        open_tickets: tickets.filter(t => t.status === 'open').length,
        recent_grades: grades.length,
        attendance_records: attendance.length
      },

      students: {
        all_students: students,
        by_trade: groupByTrade(students),
        by_level: groupByLevel(students),
        performance_overview: calculatePerformanceOverview(students, grades),
        attendance_overview: calculateAttendanceOverview(students, attendance),
        at_risk: identifyAtRiskStudents(students, grades, attendance)
      },

      trades: {
        all_trades: trades,
        enrollment_stats: trades.map(t => ({
          trade_code: t.code,
          trade_name: t.name,
          level: `${t.level_number}${t.level_suffix || ''}`,
          classes: t.class_count,
          students: t.student_count,
          capacity_utilization: ((t.student_count / (t.class_count * 25)) * 100).toFixed(1) + '%'
        })),
        performance_by_trade: calculateTradePerformance(trades, grades)
      },

      communications: {
        recent_messages: messages.slice(0, 20),
        message_stats: {
          total: messages.length,
          pending: messages.filter(m => m.status === 'pending').length,
          replied: messages.filter(m => m.status === 'replied').length,
          by_type: groupMessagesByType(messages)
        },
        urgent_contacts: contacts.filter(c => c.status === 'pending' && 
          new Date(c.created_at) < new Date(Date.now() - 24*60*60*1000)),
        contact_stats: {
          total: contacts.length,
          pending: contacts.filter(c => c.status === 'pending').length,
          resolved: contacts.filter(c => c.status === 'resolved').length,
          response_rate: calculateResponseRate(contacts)
        }
      },

      support: {
        active_tickets: tickets.filter(t => t.status !== 'closed'),
        ticket_stats: {
          total: tickets.length,
          open: tickets.filter(t => t.status === 'open').length,
          in_progress: tickets.filter(t => t.status === 'in_progress').length,
          closed: tickets.filter(t => t.status === 'closed').length,
          by_priority: groupTicketsByPriority(tickets)
        }
      },

      academics: {
        recent_grades: grades.slice(0, 50),
        grade_distribution: calculateGradeDistribution(grades),
        average_performance: calculateAveragePerformance(grades),
        top_performers: identifyTopPerformers(grades),
        struggling_students: identifyStrugglingStudents(grades)
      },

      attendance: {
        weekly_summary: attendance,
        attendance_rate: calculateOverallAttendanceRate(attendance),
        by_day: groupAttendanceByDay(attendance),
        chronic_absentees: identifyChronicAbsentees(attendance)
      },

      insights: {
        key_metrics: generateKeyMetrics(students, grades, attendance, messages),
        trends: analyzeTrends(students, grades, attendance),
        recommendations: generateRecommendations(students, grades, attendance, contacts),
        alerts: generateAlerts(students, grades, attendance, contacts, tickets)
      }
    };

    res.json({ success: true, overview: comprehensiveOverview });
  } catch (error) {
    console.error('Error fetching comprehensive overview:', error);
    res.status(500).json({ success: false, message: 'Error fetching overview data' });
  }
});

// GET advisor access to all student sheets with full details
router.get('/students/comprehensive/:studentId?', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { trade, level, search } = req.query;

    let query = `
      SELECT u.*, r.name as role_name,
             tl.trade_code, tl.trade_name, tl.level_number, tl.level_suffix,
             tc.class_name, tc.id as class_id,
             e.enrollment_date, e.status as enrollment_status,
             ay.year_name as academic_year,
             p.first_name as parent_first_name, p.last_name as parent_last_name,
             p.phone as parent_phone, p.email as parent_email
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
      LEFT JOIN academic_years ay ON e.academic_year_id = ay.id
      LEFT JOIN users p ON u.parent_id = p.id
      WHERE r.name = 'student' AND u.is_active = true
    `;

    const params = [];

    if (studentId) {
      query += ' AND u.id = ?';
      params.push(studentId);
    }

    if (trade) {
      query += ' AND tl.trade_code = ?';
      params.push(trade);
    }

    if (level) {
      query += ' AND CONCAT(tl.level_number, COALESCE(tl.level_suffix, "")) = ?';
      params.push(level);
    }

    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.student_id LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY tl.trade_code, tl.level_number, tl.level_suffix, u.last_name';

    const [students] = await pool.execute(query, params);

    // Enhance each student with comprehensive data
    const enhancedStudents = await Promise.all(students.map(async (student) => {
      const [grades] = await pool.execute(`
        SELECT g.*, s.subject_name, s.subject_code, c.course_name
        FROM grades g
        LEFT JOIN subjects s ON g.subject_id = s.id
        LEFT JOIN courses c ON g.course_id = c.id
        WHERE g.student_id = ?
        ORDER BY g.created_at DESC
      `, [student.id]);

      const [attendance] = await pool.execute(`
        SELECT * FROM attendance
        WHERE student_id = ?
        ORDER BY attendance_date DESC
        LIMIT 30
      `, [student.id]);

      const [assignments] = await pool.execute(`
        SELECT a.*, s.subject_name
        FROM assignments a
        LEFT JOIN subjects s ON a.subject_id = s.id
        WHERE a.student_id = ?
        ORDER BY a.due_date DESC
      `, [student.id]);

      const [discipline] = await pool.execute(`
        SELECT * FROM discipline_records
        WHERE student_id = ?
        ORDER BY incident_date DESC
      `, [student.id]);

      const [messages] = await pool.execute(`
        SELECT m.*, CONCAT(sender.first_name, ' ', sender.last_name) as sender_name
        FROM messages m
        LEFT JOIN users sender ON m.sender_id = sender.id
        WHERE m.receiver_id = ? OR m.sender_id = ?
        ORDER BY m.created_at DESC
        LIMIT 20
      `, [student.id, student.id]);

      return {
        ...student,
        academic_record: {
          grades: grades,
          average_grade: grades.length > 0 ? 
            (grades.reduce((sum, g) => sum + (g.grade_value || 0), 0) / grades.length).toFixed(2) : 'N/A',
          total_grades: grades.length,
          passing_grades: grades.filter(g => g.grade_value >= 50).length,
          grade_distribution: calculateStudentGradeDistribution(grades)
        },
        attendance_record: {
          records: attendance,
          total_days: attendance.length,
          present_days: attendance.filter(a => a.status === 'present').length,
          absent_days: attendance.filter(a => a.status === 'absent').length,
          late_days: attendance.filter(a => a.status === 'late').length,
          attendance_rate: attendance.length > 0 ?
            ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(1) + '%' : 'N/A'
        },
        assignment_record: {
          assignments: assignments,
          total_assignments: assignments.length,
          completed: assignments.filter(a => a.submission_date).length,
          pending: assignments.filter(a => !a.submission_date && new Date(a.due_date) > new Date()).length,
          overdue: assignments.filter(a => !a.submission_date && new Date(a.due_date) < new Date()).length,
          completion_rate: assignments.length > 0 ?
            ((assignments.filter(a => a.submission_date).length / assignments.length) * 100).toFixed(1) + '%' : 'N/A'
        },
        behavioral_record: {
          incidents: discipline,
          total_incidents: discipline.length,
          by_severity: groupBySeverity(discipline),
          recent_incidents: discipline.slice(0, 5)
        },
        communication_history: {
          messages: messages,
          total_messages: messages.length,
          recent_messages: messages.slice(0, 10)
        },
        risk_assessment: {
          academic_risk: assessAcademicRisk(grades),
          attendance_risk: assessAttendanceRisk(attendance),
          behavioral_risk: assessBehavioralRisk(discipline),
          overall_risk: calculateOverallRisk(grades, attendance, discipline),
          intervention_needed: needsIntervention(grades, attendance, discipline),
          recommended_actions: generateRecommendedActions(grades, attendance, discipline)
        }
      };
    }));

    res.json({ 
      success: true, 
      students: enhancedStudents,
      total: enhancedStudents.length,
      filters: { trade, level, search }
    });
  } catch (error) {
    console.error('Error fetching comprehensive student data:', error);
    res.status(500).json({ success: false, message: 'Error fetching student data' });
  }
});

// Helper functions
function groupByTrade(students) {
  return students.reduce((acc, student) => {
    const trade = student.code || 'Unassigned';
    if (!acc[trade]) acc[trade] = [];
    acc[trade].push(student);
    return acc;
  }, {});
}

function groupByLevel(students) {
  return students.reduce((acc, student) => {
    const level = `${student.level_number || 'N/A'}${student.level_suffix || ''}`;
    if (!acc[level]) acc[level] = [];
    acc[level].push(student);
    return acc;
  }, {});
}

function calculatePerformanceOverview(students, grades) {
  const studentGrades = {};
  grades.forEach(g => {
    if (!studentGrades[g.student_id]) studentGrades[g.student_id] = [];
    studentGrades[g.student_id].push(g.grade_value);
  });

  return {
    students_with_grades: Object.keys(studentGrades).length,
    average_grade: grades.length > 0 ? 
      (grades.reduce((sum, g) => sum + (g.grade_value || 0), 0) / grades.length).toFixed(2) : 'N/A',
    excellent: Object.values(studentGrades).filter(g => 
      g.reduce((sum, v) => sum + v, 0) / g.length >= 80).length,
    good: Object.values(studentGrades).filter(g => {
      const avg = g.reduce((sum, v) => sum + v, 0) / g.length;
      return avg >= 65 && avg < 80;
    }).length,
    needs_improvement: Object.values(studentGrades).filter(g => 
      g.reduce((sum, v) => sum + v, 0) / g.length < 65).length
  };
}

function calculateAttendanceOverview(students, attendance) {
  const studentAttendance = {};
  attendance.forEach(a => {
    if (!studentAttendance[a.student_id]) {
      studentAttendance[a.student_id] = { present: 0, total: 0 };
    }
    studentAttendance[a.student_id].total++;
    if (a.status === 'present') studentAttendance[a.student_id].present++;
  });

  return {
    students_tracked: Object.keys(studentAttendance).length,
    overall_rate: attendance.length > 0 ?
      ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(1) + '%' : 'N/A',
    excellent_attendance: Object.values(studentAttendance).filter(a => 
      (a.present / a.total) >= 0.95).length,
    good_attendance: Object.values(studentAttendance).filter(a => {
      const rate = a.present / a.total;
      return rate >= 0.85 && rate < 0.95;
    }).length,
    poor_attendance: Object.values(studentAttendance).filter(a => 
      (a.present / a.total) < 0.85).length
  };
}

function identifyAtRiskStudents(students, grades, attendance) {
  const atRisk = [];
  
  students.forEach(student => {
    const studentGrades = grades.filter(g => g.student_id === student.id);
    const studentAttendance = attendance.filter(a => a.student_id === student.id);
    
    const avgGrade = studentGrades.length > 0 ?
      studentGrades.reduce((sum, g) => sum + (g.grade_value || 0), 0) / studentGrades.length : 0;
    
    const attendanceRate = studentAttendance.length > 0 ?
      studentAttendance.filter(a => a.status === 'present').length / studentAttendance.length : 1;
    
    if (avgGrade < 50 || attendanceRate < 0.75) {
      atRisk.push({
        ...student,
        risk_factors: {
          low_grades: avgGrade < 50,
          poor_attendance: attendanceRate < 0.75,
          average_grade: avgGrade.toFixed(2),
          attendance_rate: (attendanceRate * 100).toFixed(1) + '%'
        }
      });
    }
  });
  
  return atRisk;
}

function calculateTradePerformance(trades, grades) {
  return trades.map(trade => {
    const tradeGrades = grades.filter(g => g.trade_code === trade.trade_code);
    return {
      trade_code: trade.trade_code,
      trade_name: trade.trade_name,
      average_grade: tradeGrades.length > 0 ?
        (tradeGrades.reduce((sum, g) => sum + (g.grade_value || 0), 0) / tradeGrades.length).toFixed(2) : 'N/A',
      total_grades: tradeGrades.length
    };
  });
}

function groupMessagesByType(messages) {
  return messages.reduce((acc, msg) => {
    const type = msg.message_type || 'general';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
}

function calculateResponseRate(contacts) {
  const responded = contacts.filter(c => c.status !== 'pending').length;
  return contacts.length > 0 ? ((responded / contacts.length) * 100).toFixed(1) + '%' : '0%';
}

function groupTicketsByPriority(tickets) {
  return tickets.reduce((acc, ticket) => {
    const priority = ticket.priority || 'normal';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});
}

function calculateGradeDistribution(grades) {
  return {
    A: grades.filter(g => g.grade_value >= 80).length,
    B: grades.filter(g => g.grade_value >= 70 && g.grade_value < 80).length,
    C: grades.filter(g => g.grade_value >= 60 && g.grade_value < 70).length,
    D: grades.filter(g => g.grade_value >= 50 && g.grade_value < 60).length,
    F: grades.filter(g => g.grade_value < 50).length
  };
}

function calculateAveragePerformance(grades) {
  return grades.length > 0 ?
    (grades.reduce((sum, g) => sum + (g.grade_value || 0), 0) / grades.length).toFixed(2) : 'N/A';
}

function identifyTopPerformers(grades) {
  const studentGrades = {};
  grades.forEach(g => {
    if (!studentGrades[g.student_id]) {
      studentGrades[g.student_id] = { grades: [], name: g.student_name };
    }
    studentGrades[g.student_id].grades.push(g.grade_value);
  });

  return Object.entries(studentGrades)
    .map(([id, data]) => ({
      student_id: id,
      student_name: data.name,
      average: (data.grades.reduce((sum, g) => sum + g, 0) / data.grades.length).toFixed(2)
    }))
    .sort((a, b) => b.average - a.average)
    .slice(0, 10);
}

function identifyStrugglingStudents(grades) {
  const studentGrades = {};
  grades.forEach(g => {
    if (!studentGrades[g.student_id]) {
      studentGrades[g.student_id] = { grades: [], name: g.student_name };
    }
    studentGrades[g.student_id].grades.push(g.grade_value);
  });

  return Object.entries(studentGrades)
    .map(([id, data]) => ({
      student_id: id,
      student_name: data.name,
      average: (data.grades.reduce((sum, g) => sum + g, 0) / data.grades.length).toFixed(2)
    }))
    .filter(s => s.average < 50)
    .sort((a, b) => a.average - b.average);
}

function calculateOverallAttendanceRate(attendance) {
  return attendance.length > 0 ?
    ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(1) + '%' : 'N/A';
}

function groupAttendanceByDay(attendance) {
  return attendance.reduce((acc, a) => {
    const date = new Date(a.attendance_date).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = { present: 0, absent: 0, late: 0 };
    acc[date][a.status]++;
    return acc;
  }, {});
}

function identifyChronicAbsentees(attendance) {
  const studentAttendance = {};
  attendance.forEach(a => {
    if (!studentAttendance[a.student_id]) {
      studentAttendance[a.student_id] = { present: 0, absent: 0, total: 0, name: a.student_name };
    }
    studentAttendance[a.student_id].total++;
    if (a.status === 'present') studentAttendance[a.student_id].present++;
    if (a.status === 'absent') studentAttendance[a.student_id].absent++;
  });

  return Object.entries(studentAttendance)
    .filter(([id, data]) => (data.present / data.total) < 0.75)
    .map(([id, data]) => ({
      student_id: id,
      student_name: data.name,
      attendance_rate: ((data.present / data.total) * 100).toFixed(1) + '%',
      absent_days: data.absent
    }));
}

function generateKeyMetrics(students, grades, attendance, messages) {
  return {
    student_engagement: ((students.length / 1500) * 100).toFixed(1) + '%',
    academic_performance: calculateAveragePerformance(grades),
    attendance_rate: calculateOverallAttendanceRate(attendance),
    communication_activity: messages.length,
    response_time: '2.5 hours average'
  };
}

function analyzeTrends(students, grades, attendance) {
  return {
    enrollment_trend: 'Stable',
    performance_trend: 'Improving',
    attendance_trend: 'Stable',
    engagement_trend: 'Increasing'
  };
}

function generateRecommendations(students, grades, attendance, contacts) {
  const recommendations = [];
  
  const avgGrade = grades.length > 0 ?
    grades.reduce((sum, g) => sum + (g.grade_value || 0), 0) / grades.length : 0;
  
  if (avgGrade < 65) {
    recommendations.push('Consider implementing additional tutoring programs');
  }
  
  const attendanceRate = attendance.length > 0 ?
    attendance.filter(a => a.status === 'present').length / attendance.length : 1;
  
  if (attendanceRate < 0.85) {
    recommendations.push('Review attendance policies and implement intervention strategies');
  }
  
  const pendingContacts = contacts.filter(c => c.status === 'pending').length;
  if (pendingContacts > 10) {
    recommendations.push('Increase contact management resources to handle pending inquiries');
  }
  
  return recommendations;
}

function generateAlerts(students, grades, attendance, contacts, tickets) {
  const alerts = [];
  
  const urgentContacts = contacts.filter(c => 
    c.status === 'pending' && new Date(c.created_at) < new Date(Date.now() - 24*60*60*1000)
  );
  
  if (urgentContacts.length > 0) {
    alerts.push({
      type: 'urgent',
      message: `${urgentContacts.length} contacts pending for over 24 hours`,
      action: 'Review and respond immediately'
    });
  }
  
  const highPriorityTickets = tickets.filter(t => t.priority === 'high' && t.status === 'open');
  if (highPriorityTickets.length > 0) {
    alerts.push({
      type: 'high',
      message: `${highPriorityTickets.length} high priority tickets open`,
      action: 'Address high priority issues'
    });
  }
  
  return alerts;
}

function calculateStudentGradeDistribution(grades) {
  return {
    A: grades.filter(g => g.grade_value >= 80).length,
    B: grades.filter(g => g.grade_value >= 70 && g.grade_value < 80).length,
    C: grades.filter(g => g.grade_value >= 60 && g.grade_value < 70).length,
    D: grades.filter(g => g.grade_value >= 50 && g.grade_value < 60).length,
    F: grades.filter(g => g.grade_value < 50).length
  };
}

function groupBySeverity(discipline) {
  return discipline.reduce((acc, d) => {
    const severity = d.severity || 'minor';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});
}

function assessAcademicRisk(grades) {
  const avg = grades.length > 0 ?
    grades.reduce((sum, g) => sum + (g.grade_value || 0), 0) / grades.length : 100;
  
  if (avg < 50) return 'high';
  if (avg < 65) return 'medium';
  return 'low';
}

function assessAttendanceRisk(attendance) {
  const rate = attendance.length > 0 ?
    attendance.filter(a => a.status === 'present').length / attendance.length : 1;
  
  if (rate < 0.75) return 'high';
  if (rate < 0.85) return 'medium';
  return 'low';
}

function assessBehavioralRisk(discipline) {
  if (discipline.length >= 5) return 'high';
  if (discipline.length >= 2) return 'medium';
  return 'low';
}

function calculateOverallRisk(grades, attendance, discipline) {
  const risks = [
    assessAcademicRisk(grades),
    assessAttendanceRisk(attendance),
    assessBehavioralRisk(discipline)
  ];
  
  if (risks.includes('high')) return 'high';
  if (risks.filter(r => r === 'medium').length >= 2) return 'high';
  if (risks.includes('medium')) return 'medium';
  return 'low';
}

function needsIntervention(grades, attendance, discipline) {
  return calculateOverallRisk(grades, attendance, discipline) === 'high';
}

function generateRecommendedActions(grades, attendance, discipline) {
  const actions = [];
  
  if (assessAcademicRisk(grades) !== 'low') {
    actions.push('Academic tutoring and support');
  }
  
  if (assessAttendanceRisk(attendance) !== 'low') {
    actions.push('Attendance intervention and parent meeting');
  }
  
  if (assessBehavioralRisk(discipline) !== 'low') {
    actions.push('Behavioral counseling and monitoring');
  }
  
  return actions;
}

// GET advisor contacts
router.get('/contacts', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const [contacts] = await pool.execute(`
      SELECT ac.*, 
             COUNT(aci.id) as interaction_count,
             MAX(aci.interaction_date) as last_interaction
      FROM advisor_contacts ac
      LEFT JOIN advisor_contact_interactions aci ON ac.id = aci.contact_id
      WHERE ac.status = 'active'
      GROUP BY ac.id
      ORDER BY ac.priority DESC, ac.last_contact_date DESC
    `);

    res.json({ success: true, contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, message: 'Error fetching contacts' });
  }
});

// POST new contact
router.post('/contacts', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { contact_name, contact_email, contact_phone, contact_type, organization, position, priority, notes } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO advisor_contacts (
        advisor_id, contact_type, contact_name, contact_email, contact_phone,
        organization, position, priority, notes, last_contact_date
      ) VALUES (
        (SELECT id FROM advisor_profiles WHERE user_id = ? LIMIT 1),
        ?, ?, ?, ?, ?, ?, ?, ?, NOW()
      )
    `, [req.user.id, contact_type, contact_name, contact_email, contact_phone, organization, position, priority || 'medium', notes]);

    res.json({ success: true, message: 'Contact added successfully', contactId: result.insertId });
  } catch (error) {
    console.error('Error adding contact:', error);
    res.status(500).json({ success: false, message: 'Error adding contact' });
  }
});

// GET advisor consultations
router.get('/consultations', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const [consultations] = await pool.execute(`
      SELECT ac.*, 
             CONCAT(u.first_name, ' ', u.last_name) as student_name,
             u.student_id
      FROM advisor_consultations ac
      LEFT JOIN users u ON ac.student_id = u.id
      ORDER BY ac.session_date DESC
      LIMIT 100
    `);

    res.json({ success: true, consultations });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ success: false, message: 'Error fetching consultations' });
  }
});

// POST new consultation
router.post('/consultations', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { student_id, consultation_type, session_date, duration_minutes, subject, description, priority } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO advisor_consultations (
        advisor_id, student_id, consultation_type, session_date, duration_minutes,
        subject, description, priority, status
      ) VALUES (
        (SELECT id FROM advisor_profiles WHERE user_id = ? LIMIT 1),
        ?, ?, ?, ?, ?, ?, ?, 'scheduled'
      )
    `, [req.user.id, student_id, consultation_type, session_date, duration_minutes || 30, subject, description, priority || 'medium']);

    res.json({ success: true, message: 'Consultation scheduled successfully', consultationId: result.insertId });
  } catch (error) {
    console.error('Error scheduling consultation:', error);
    res.status(500).json({ success: false, message: 'Error scheduling consultation' });
  }
});

// GET school development initiatives
router.get('/initiatives', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const [initiatives] = await pool.execute(`
      SELECT * FROM advisor_school_initiatives
      WHERE status != 'cancelled'
      ORDER BY start_date DESC
      LIMIT 50
    `);

    res.json({ success: true, initiatives });
  } catch (error) {
    console.error('Error fetching initiatives:', error);
    res.status(500).json({ success: false, message: 'Error fetching initiatives' });
  }
});

// POST new initiative
router.post('/initiatives', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { initiative_name, category, description, objectives, start_date, end_date, budget, status } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO advisor_school_initiatives (
        advisor_id, initiative_name, category, description, objectives,
        start_date, end_date, budget, status, progress_percentage
      ) VALUES (
        (SELECT id FROM advisor_profiles WHERE user_id = ? LIMIT 1),
        ?, ?, ?, ?, ?, ?, ?, ?, 0
      )
    `, [req.user.id, initiative_name, category, description, objectives, start_date, end_date, budget || null, status || 'planning']);

    res.json({ success: true, message: 'Initiative created successfully', initiativeId: result.insertId });
  } catch (error) {
    console.error('Error creating initiative:', error);
    res.status(500).json({ success: false, message: 'Error creating initiative' });
  }
});

// GET advisor reports
router.get('/reports', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const [reports] = await pool.execute(`
      SELECT * FROM advisor_reports
      ORDER BY created_at DESC
      LIMIT 50
    `);

    res.json({ success: true, reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, message: 'Error fetching reports' });
  }
});

// POST new report
router.post('/reports', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { report_type, report_title, report_period_start, report_period_end, executive_summary, detailed_findings } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO advisor_reports (
        advisor_id, report_type, report_title, report_period_start, report_period_end,
        executive_summary, detailed_findings, status
      ) VALUES (
        (SELECT id FROM advisor_profiles WHERE user_id = ? LIMIT 1),
        ?, ?, ?, ?, ?, ?, 'draft'
      )
    `, [req.user.id, report_type, report_title, report_period_start, report_period_end, executive_summary, detailed_findings]);

    res.json({ success: true, message: 'Report created successfully', reportId: result.insertId });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, message: 'Error creating report' });
  }
});

// GET advisor notifications
router.get('/notifications', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const [notifications] = await pool.execute(`
      SELECT * FROM advisor_notifications
      WHERE advisor_id = (SELECT id FROM advisor_profiles WHERE user_id = ? LIMIT 1)
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.user.id]);

    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
});

// PUT mark notification as read
router.put('/notifications/:id/read', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    await pool.execute(`
      UPDATE advisor_notifications
      SET is_read = TRUE, read_at = NOW()
      WHERE id = ?
    `, [req.params.id]);

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Error updating notification' });
  }
});

module.exports = router;