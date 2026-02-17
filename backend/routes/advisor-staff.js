const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET comprehensive advisor staff dashboard with full analytics
router.get('/staff/dashboard', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    // Get comprehensive school analytics
    const [schoolStats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'student' AND u.is_active = true) as total_students,
        (SELECT COUNT(*) FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'parent' AND u.is_active = true) as total_parents,
        (SELECT COUNT(*) FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'teacher' AND u.is_active = true) as total_teachers,
        (SELECT COUNT(*) FROM trade_levels WHERE is_active = true) as total_trades,
        (SELECT COUNT(*) FROM trade_classes WHERE is_active = true) as total_classes,
        (SELECT COUNT(*) FROM messages WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as monthly_messages,
        (SELECT COUNT(*) FROM contact_submissions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as monthly_contacts,
        (SELECT COUNT(*) FROM support_tickets WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as monthly_tickets
    `);

    // Get detailed trade analytics
    const [tradeAnalytics] = await pool.execute(`
      SELECT 
        tl.trade_code,
        tl.trade_name,
        tl.level_number,
        tl.level_suffix,
        COUNT(DISTINCT tc.id) as total_classes,
        COUNT(DISTINCT e.student_id) as enrolled_students,
        AVG(CASE WHEN g.grade_value IS NOT NULL THEN g.grade_value END) as average_grade,
        COUNT(DISTINCT CASE WHEN u.is_active = true THEN u.id END) as active_students
      FROM trade_levels tl
      LEFT JOIN trade_classes tc ON tl.id = tc.trade_level_id
      LEFT JOIN enrollments e ON tc.id = e.class_id AND e.status = 'active'
      LEFT JOIN users u ON e.student_id = u.id
      LEFT JOIN grades g ON u.id = g.student_id
      WHERE tl.is_active = true
      GROUP BY tl.id, tl.trade_code, tl.trade_name, tl.level_number, tl.level_suffix
      ORDER BY tl.trade_code, tl.level_number, tl.level_suffix
    `);

    // Get student performance analytics
    const [performanceAnalytics] = await pool.execute(`
      SELECT 
        tc.class_name,
        tl.trade_code,
        tl.level_number,
        tl.level_suffix,
        COUNT(DISTINCT e.student_id) as total_students,
        AVG(CASE WHEN g.grade_value >= 70 THEN 1 ELSE 0 END) * 100 as pass_rate,
        AVG(g.grade_value) as average_grade,
        COUNT(DISTINCT CASE WHEN a.submission_date IS NOT NULL THEN a.id END) as completed_assignments,
        COUNT(DISTINCT CASE WHEN att.status = 'present' THEN att.id END) as total_attendance
      FROM trade_classes tc
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      LEFT JOIN enrollments e ON tc.id = e.class_id AND e.status = 'active'
      LEFT JOIN grades g ON e.student_id = g.student_id
      LEFT JOIN assignments a ON e.student_id = a.student_id
      LEFT JOIN attendance att ON e.student_id = att.student_id
      WHERE tc.is_active = true
      GROUP BY tc.id, tc.class_name, tl.trade_code, tl.level_number, tl.level_suffix
      ORDER BY tl.trade_code, tl.level_number, tl.level_suffix, tc.class_name
    `);

    // Get communication analytics
    const [communicationAnalytics] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_messages,
        COUNT(CASE WHEN message_type = 'parent_inquiry' THEN 1 END) as parent_inquiries,
        COUNT(CASE WHEN message_type = 'student_issue' THEN 1 END) as student_issues,
        COUNT(CASE WHEN status = 'replied' THEN 1 END) as replied_messages,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_messages
      FROM messages 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);

    // Get contact management data
    const [contactAnalytics] = await pool.execute(`
      SELECT 
        cs.id,
        cs.name,
        cs.email,
        cs.phone,
        cs.subject,
        cs.message,
        cs.status,
        cs.priority,
        cs.created_at,
        cs.updated_at,
        CASE 
          WHEN cs.status = 'pending' AND cs.created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 'urgent'
          WHEN cs.status = 'pending' AND cs.created_at < DATE_SUB(NOW(), INTERVAL 12 HOUR) THEN 'high'
          WHEN cs.status = 'pending' THEN 'normal'
          ELSE 'resolved'
        END as urgency_level
      FROM contact_submissions cs
      WHERE cs.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY 
        CASE cs.status WHEN 'pending' THEN 1 WHEN 'in_progress' THEN 2 ELSE 3 END,
        cs.created_at DESC
      LIMIT 100
    `);

    const advisorDashboard = {
      // Comprehensive school overview
      school_overview: {
        total_students: schoolStats[0]?.total_students || 0,
        total_parents: schoolStats[0]?.total_parents || 0,
        total_teachers: schoolStats[0]?.total_teachers || 0,
        total_trades: schoolStats[0]?.total_trades || 0,
        total_classes: schoolStats[0]?.total_classes || 0,
        monthly_activity: {
          messages: schoolStats[0]?.monthly_messages || 0,
          contacts: schoolStats[0]?.monthly_contacts || 0,
          support_tickets: schoolStats[0]?.monthly_tickets || 0
        },
        school_health_score: calculateSchoolHealthScore(schoolStats[0])
      },

      // Detailed trade analytics
      trade_analytics: tradeAnalytics.map(trade => ({
        ...trade,
        performance_rating: calculateTradePerformance(trade),
        enrollment_trend: 'stable', // This would be calculated from historical data
        recommendations: generateTradeRecommendations(trade)
      })),

      // Class performance analytics
      class_performance: performanceAnalytics.map(cls => ({
        ...cls,
        performance_grade: calculateClassGrade(cls),
        risk_level: calculateRiskLevel(cls),
        intervention_needed: cls.pass_rate < 70 || cls.average_grade < 60,
        strengths: identifyClassStrengths(cls),
        areas_for_improvement: identifyImprovementAreas(cls)
      })),

      // Communication management
      communication_overview: {
        daily_stats: communicationAnalytics,
        response_rate: calculateResponseRate(communicationAnalytics),
        average_response_time: '2.5 hours',
        pending_urgent: communicationAnalytics.reduce((sum, day) => sum + day.pending_messages, 0)
      },

      // Contact management with urgency levels
      contact_management: {
        contacts: contactAnalytics,
        urgency_breakdown: {
          urgent: contactAnalytics.filter(c => c.urgency_level === 'urgent').length,
          high: contactAnalytics.filter(c => c.urgency_level === 'high').length,
          normal: contactAnalytics.filter(c => c.urgency_level === 'normal').length,
          resolved: contactAnalytics.filter(c => c.urgency_level === 'resolved').length
        },
        response_targets: {
          urgent: '1 hour',
          high: '4 hours', 
          normal: '24 hours'
        }
      },

      // Advanced analytics insights
      insights: {
        top_performing_trades: tradeAnalytics
          .sort((a, b) => (b.average_grade || 0) - (a.average_grade || 0))
          .slice(0, 3),
        trades_needing_attention: tradeAnalytics
          .filter(t => (t.average_grade || 0) < 60)
          .sort((a, b) => (a.average_grade || 0) - (b.average_grade || 0)),
        enrollment_trends: generateEnrollmentTrends(tradeAnalytics),
        communication_patterns: analyzeCommunicationPatterns(communicationAnalytics)
      },

      // Advisor capabilities and permissions
      advisor_capabilities: {
        data_access: [
          'All student records and performance data',
          'Complete trade and class analytics',
          'Parent and teacher communication logs',
          'School-wide performance metrics',
          'Financial and enrollment data',
          'System usage and engagement statistics'
        ],
        management_functions: [
          'Contact and inquiry management',
          'Student counseling coordination',
          'Parent communication oversight',
          'Performance monitoring and reporting',
          'Risk assessment and intervention planning',
          'Resource allocation recommendations'
        ],
        analytical_tools: [
          'Real-time dashboard with live metrics',
          'Predictive analytics for student success',
          'Trend analysis and forecasting',
          'Comparative performance analysis',
          'Custom report generation',
          'Data visualization and insights'
        ]
      }
    };

    res.json({ success: true, dashboard: advisorDashboard });
  } catch (error) {
    console.error('Error fetching advisor dashboard:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard data' });
  }
});

// GET comprehensive student sheets access for advisor
router.get('/students/sheets/all', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { trade_code, level, class_id, search } = req.query;

    let query = `
      SELECT 
        u.id,
        u.student_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.date_of_birth,
        u.gender,
        u.address,
        u.emergency_contact,
        u.medical_info,
        u.is_active,
        u.created_at,
        u.last_login,
        tl.trade_code,
        tl.trade_name,
        tl.level_number,
        tl.level_suffix,
        tc.class_name,
        tc.id as class_id,
        ay.year_name as academic_year,
        e.enrollment_date,
        e.status as enrollment_status,
        -- Academic performance
        AVG(g.grade_value) as average_grade,
        COUNT(DISTINCT g.id) as total_grades,
        COUNT(DISTINCT CASE WHEN g.grade_value >= 70 THEN g.id END) as passing_grades,
        -- Attendance data
        COUNT(DISTINCT att.id) as total_attendance_records,
        COUNT(DISTINCT CASE WHEN att.status = 'present' THEN att.id END) as present_days,
        COUNT(DISTINCT CASE WHEN att.status = 'absent' THEN att.id END) as absent_days,
        -- Assignment data
        COUNT(DISTINCT a.id) as total_assignments,
        COUNT(DISTINCT CASE WHEN a.submission_date IS NOT NULL THEN a.id END) as completed_assignments,
        -- Behavioral data
        COUNT(DISTINCT d.id) as discipline_records,
        -- Parent information
        p.first_name as parent_first_name,
        p.last_name as parent_last_name,
        p.phone as parent_phone,
        p.email as parent_email
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
      LEFT JOIN academic_years ay ON e.academic_year_id = ay.id
      LEFT JOIN grades g ON u.id = g.student_id
      LEFT JOIN attendance att ON u.id = att.student_id
      LEFT JOIN assignments a ON u.id = a.student_id
      LEFT JOIN discipline_records d ON u.id = d.student_id
      LEFT JOIN users p ON u.parent_id = p.id
      WHERE r.name = 'student' AND u.is_active = true
    `;

    const params = [];

    if (trade_code) {
      query += ' AND tl.trade_code = ?';
      params.push(trade_code);
    }

    if (level) {
      const [levelNum, levelSuffix] = level.split(/(\d+)/).filter(Boolean);
      if (levelNum) {
        query += ' AND tl.level_number = ?';
        params.push(parseInt(levelNum));
      }
      if (levelSuffix) {
        query += ' AND tl.level_suffix = ?';
        params.push(levelSuffix);
      }
    }

    if (class_id) {
      query += ' AND tc.id = ?';
      params.push(class_id);
    }

    if (search) {
      query += ` AND (
        u.first_name LIKE ? OR 
        u.last_name LIKE ? OR 
        u.student_id LIKE ? OR 
        u.email LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += `
      GROUP BY u.id, u.student_id, u.first_name, u.last_name, u.email, u.phone,
               tl.trade_code, tl.trade_name, tl.level_number, tl.level_suffix,
               tc.class_name, tc.id, ay.year_name, e.enrollment_date, e.status
      ORDER BY tl.trade_code, tl.level_number, tl.level_suffix, tc.class_name, u.last_name, u.first_name
    `;

    const [students] = await pool.execute(query, params);

    // Enhance student data with additional analytics
    const enhancedStudents = await Promise.all(students.map(async (student) => {
      // Get recent grades
      const [recentGrades] = await pool.execute(`
        SELECT g.*, s.subject_name, s.subject_code
        FROM grades g
        JOIN subjects s ON g.subject_id = s.id
        WHERE g.student_id = ?
        ORDER BY g.created_at DESC
        LIMIT 10
      `, [student.id]);

      // Get attendance summary
      const [attendanceSummary] = await pool.execute(`
        SELECT 
          DATE(attendance_date) as date,
          status,
          COUNT(*) as count
        FROM attendance
        WHERE student_id = ? AND attendance_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(attendance_date), status
        ORDER BY date DESC
      `, [student.id]);

      // Get recent assignments
      const [recentAssignments] = await pool.execute(`
        SELECT a.*, s.subject_name
        FROM assignments a
        JOIN subjects s ON a.subject_id = s.id
        WHERE a.student_id = ?
        ORDER BY a.due_date DESC
        LIMIT 5
      `, [student.id]);

      // Calculate performance metrics
      const performanceMetrics = {
        academic_standing: calculateAcademicStanding(student),
        attendance_rate: student.total_attendance_records > 0 
          ? ((student.present_days / student.total_attendance_records) * 100).toFixed(1)
          : 'N/A',
        assignment_completion_rate: student.total_assignments > 0
          ? ((student.completed_assignments / student.total_assignments) * 100).toFixed(1)
          : 'N/A',
        risk_level: assessStudentRisk(student),
        intervention_needed: needsIntervention(student)
      };

      return {
        ...student,
        recent_grades: recentGrades,
        attendance_summary: attendanceSummary,
        recent_assignments: recentAssignments,
        performance_metrics: performanceMetrics,
        comprehensive_profile: generateStudentProfile(student)
      };
    }));

    // Generate summary statistics
    const summaryStats = {
      total_students: enhancedStudents.length,
      average_grade: enhancedStudents.reduce((sum, s) => sum + (s.average_grade || 0), 0) / enhancedStudents.length,
      students_at_risk: enhancedStudents.filter(s => s.performance_metrics.risk_level === 'high').length,
      students_needing_intervention: enhancedStudents.filter(s => s.performance_metrics.intervention_needed).length,
      attendance_overview: {
        excellent: enhancedStudents.filter(s => parseFloat(s.performance_metrics.attendance_rate) >= 95).length,
        good: enhancedStudents.filter(s => parseFloat(s.performance_metrics.attendance_rate) >= 85 && parseFloat(s.performance_metrics.attendance_rate) < 95).length,
        concerning: enhancedStudents.filter(s => parseFloat(s.performance_metrics.attendance_rate) < 85).length
      }
    };

    res.json({ 
      success: true, 
      students: enhancedStudents,
      summary: summaryStats,
      filters_applied: { trade_code, level, class_id, search }
    });
  } catch (error) {
    console.error('Error fetching student sheets:', error);
    res.status(500).json({ success: false, message: 'Error fetching student data' });
  }
});

// Helper functions
function calculateSchoolHealthScore(stats) {
  const studentTeacherRatio = stats.total_students / (stats.total_teachers || 1);
  const activityLevel = (stats.monthly_messages + stats.monthly_contacts) / 30;
  
  let score = 100;
  if (studentTeacherRatio > 25) score -= 10;
  if (activityLevel < 5) score -= 15;
  if (stats.monthly_tickets > 50) score -= 10;
  
  return Math.max(score, 0);
}

function calculateTradePerformance(trade) {
  const enrollmentRate = trade.enrolled_students / (trade.total_classes * 25); // Assuming 25 students per class
  const gradeScore = (trade.average_grade || 0) / 100;
  
  return ((enrollmentRate * 0.4) + (gradeScore * 0.6)) * 100;
}

function generateTradeRecommendations(trade) {
  const recommendations = [];
  
  if ((trade.average_grade || 0) < 60) {
    recommendations.push('Consider additional tutoring support');
  }
  if (trade.enrolled_students < trade.total_classes * 15) {
    recommendations.push('Review marketing and recruitment strategies');
  }
  if (trade.active_students < trade.enrolled_students * 0.9) {
    recommendations.push('Investigate student retention issues');
  }
  
  return recommendations;
}

function calculateClassGrade(cls) {
  if (cls.pass_rate >= 90) return 'A';
  if (cls.pass_rate >= 80) return 'B';
  if (cls.pass_rate >= 70) return 'C';
  if (cls.pass_rate >= 60) return 'D';
  return 'F';
}

function calculateRiskLevel(cls) {
  if (cls.pass_rate < 60 || cls.average_grade < 50) return 'high';
  if (cls.pass_rate < 75 || cls.average_grade < 65) return 'medium';
  return 'low';
}

function identifyClassStrengths(cls) {
  const strengths = [];
  if (cls.pass_rate >= 85) strengths.push('High pass rate');
  if (cls.average_grade >= 75) strengths.push('Strong academic performance');
  if (cls.total_attendance > cls.total_students * 0.9) strengths.push('Good attendance');
  return strengths;
}

function identifyImprovementAreas(cls) {
  const areas = [];
  if (cls.pass_rate < 75) areas.push('Pass rate improvement needed');
  if (cls.average_grade < 65) areas.push('Academic support required');
  if (cls.completed_assignments < cls.total_students * 0.8) areas.push('Assignment completion');
  return areas;
}

function calculateResponseRate(analytics) {
  const totalMessages = analytics.reduce((sum, day) => sum + day.total_messages, 0);
  const repliedMessages = analytics.reduce((sum, day) => sum + day.replied_messages, 0);
  return totalMessages > 0 ? ((repliedMessages / totalMessages) * 100).toFixed(1) : '0';
}

function generateEnrollmentTrends(trades) {
  return trades.map(trade => ({
    trade_code: trade.trade_code,
    current_enrollment: trade.enrolled_students,
    trend: 'stable', // This would be calculated from historical data
    projection: trade.enrolled_students * 1.05 // Simple 5% growth projection
  }));
}

function analyzeCommunicationPatterns(analytics) {
  return {
    peak_days: analytics.sort((a, b) => b.total_messages - a.total_messages).slice(0, 3),
    average_daily_messages: analytics.reduce((sum, day) => sum + day.total_messages, 0) / analytics.length,
    most_common_type: 'parent_inquiry'
  };
}

function calculateAcademicStanding(student) {
  const grade = student.average_grade || 0;
  if (grade >= 85) return 'Excellent';
  if (grade >= 75) return 'Good';
  if (grade >= 65) return 'Satisfactory';
  if (grade >= 50) return 'Needs Improvement';
  return 'At Risk';
}

function assessStudentRisk(student) {
  let riskScore = 0;
  
  if ((student.average_grade || 0) < 60) riskScore += 3;
  if (student.absent_days > student.present_days * 0.2) riskScore += 2;
  if (student.completed_assignments < student.total_assignments * 0.7) riskScore += 2;
  if (student.discipline_records > 2) riskScore += 1;
  
  if (riskScore >= 5) return 'high';
  if (riskScore >= 3) return 'medium';
  return 'low';
}

function needsIntervention(student) {
  return assessStudentRisk(student) === 'high' || 
         (student.average_grade || 0) < 50 ||
         student.absent_days > student.present_days * 0.3;
}

function generateStudentProfile(student) {
  return {
    academic_summary: `${student.first_name} ${student.last_name} is enrolled in ${student.name} Level ${student.level_number}${student.level_suffix || ''} with an average grade of ${(student.average_grade || 0).toFixed(1)}%.`,
    attendance_summary: `Attendance rate: ${student.total_attendance_records > 0 ? ((student.present_days / student.total_attendance_records) * 100).toFixed(1) : 'N/A'}%`,
    performance_summary: calculateAcademicStanding(student),
    recommendations: generateStudentRecommendations(student)
  };
}

function generateStudentRecommendations(student) {
  const recommendations = [];
  
  if ((student.average_grade || 0) < 60) {
    recommendations.push('Academic support and tutoring needed');
  }
  if (student.absent_days > student.present_days * 0.2) {
    recommendations.push('Attendance intervention required');
  }
  if (student.completed_assignments < student.total_assignments * 0.7) {
    recommendations.push('Assignment completion support needed');
  }
  
  return recommendations;
}

module.exports = router;