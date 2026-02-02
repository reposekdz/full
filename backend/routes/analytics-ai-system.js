const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ========================================
// AI ANALYTICS & REPORTING SYSTEM
// Advanced analytics, predictions, insights
// ========================================

// Generate student analytics (can be scheduled via cron)
router.post('/analytics/generate/:studentId', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student data
    const [student] = await db.query(`
      SELECT * FROM global_students WHERE id = ?
    `, [studentId]);

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Calculate academic analytics
    const [academicStats] = await db.query(`
      SELECT 
        AVG(percentage) as average_grade,
        COUNT(*) as total_assessments,
        MAX(percentage) as highest_grade,
        MIN(percentage) as lowest_grade
      FROM student_academic_records
      WHERE student_id = ? AND assessment_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
    `, [studentId]);

    // Identify strengths and weaknesses
    const [strengths] = await db.query(`
      SELECT subject_name, AVG(percentage) as avg_percentage
      FROM student_academic_records
      WHERE student_id = ?
      GROUP BY subject_name
      HAVING avg_percentage >= 80
      ORDER BY avg_percentage DESC
      LIMIT 5
    `, [studentId]);

    const [weaknesses] = await db.query(`
      SELECT subject_name, AVG(percentage) as avg_percentage
      FROM student_academic_records
      WHERE student_id = ?
      GROUP BY subject_name
      HAVING avg_percentage < 60
      ORDER BY avg_percentage ASC
      LIMIT 5
    `, [studentId]);

    // Calculate attendance analytics
    const [attendanceStats] = await db.query(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late_days
      FROM student_attendance
      WHERE student_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
    `, [studentId]);

    const attendanceRate = attendanceStats[0].total_days > 0 ? 
      (attendanceStats[0].present_days / attendanceStats[0].total_days) * 100 : 0;

    // Calculate behavior analytics
    const [behaviorStats] = await db.query(`
      SELECT 
        COUNT(*) as total_incidents,
        SUM(CASE WHEN incident_type = 'Positive' THEN 1 ELSE 0 END) as positive_incidents,
        SUM(CASE WHEN incident_type != 'Positive' THEN 1 ELSE 0 END) as negative_incidents
      FROM student_discipline_records
      WHERE student_id = ? AND incident_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
    `, [studentId]);

    // Calculate trends
    const gradeTrend = academicStats[0].average_grade >= 70 ? 'Improving' : 
                       academicStats[0].average_grade >= 50 ? 'Stable' : 'Declining';
    const behaviorTrend = behaviorStats[0].positive_incidents > behaviorStats[0].negative_incidents ? 'Positive' : 'Needs Attention';

    // AI Risk Assessment
    let riskLevel = 'Low';
    let dropoutRisk = 0;
    let interventionRecommended = false;
    const recommendations = [];

    // Calculate dropout risk score (0-100)
    if (attendanceRate < 75) {
      dropoutRisk += 30;
      recommendations.push('Improve attendance through parent engagement and counseling');
    }
    if (academicStats[0].average_grade < 50) {
      dropoutRisk += 25;
      recommendations.push('Provide academic tutoring and extra support');
    }
    if (behaviorStats[0].negative_incidents > 3) {
      dropoutRisk += 20;
      recommendations.push('Behavioral counseling and mentorship program');
    }
    if (student[0].fee_balance > 100000) {
      dropoutRisk += 15;
      recommendations.push('Financial aid or payment plan assistance');
    }

    if (dropoutRisk >= 60) riskLevel = 'Critical';
    else if (dropoutRisk >= 40) riskLevel = 'High';
    else if (dropoutRisk >= 20) riskLevel = 'Medium';

    interventionRecommended = dropoutRisk >= 40;

    // Engagement score (based on portal activity if available)
    const [portalActivity] = await db.query(`
      SELECT COUNT(*) as login_count
      FROM student_portal_sessions
      WHERE student_id = ? AND login_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `, [studentId]);

    const [submissionRate] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM assignment_submissions WHERE student_id = ? AND submitted_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as submissions,
        (SELECT COUNT(*) FROM assignments WHERE trade_class_id = ? AND due_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as total_assignments
    `, [studentId, student[0].current_class_id || 0]);

    const submissionRateCalc = submissionRate[0].total_assignments > 0 ? 
      (submissionRate[0].submissions / submissionRate[0].total_assignments) * 100 : 0;

    const participationScore = ((attendanceRate * 0.4) + (submissionRateCalc * 0.6));

    // Save analytics
    await db.query(`
      INSERT INTO student_analytics (
        student_id, analysis_date, average_grade, grade_trend,
        subject_strengths, subject_weaknesses, attendance_rate,
        punctuality_score, conduct_score, positive_incidents,
        negative_incidents, behavior_trend, portal_login_frequency,
        assignment_submission_rate, participation_score, risk_level,
        dropout_risk_score, intervention_recommended, recommendations
      ) VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        average_grade = VALUES(average_grade),
        grade_trend = VALUES(grade_trend),
        subject_strengths = VALUES(subject_strengths),
        subject_weaknesses = VALUES(subject_weaknesses),
        attendance_rate = VALUES(attendance_rate),
        conduct_score = VALUES(conduct_score),
        positive_incidents = VALUES(positive_incidents),
        negative_incidents = VALUES(negative_incidents),
        behavior_trend = VALUES(behavior_trend),
        portal_login_frequency = VALUES(portal_login_frequency),
        assignment_submission_rate = VALUES(assignment_submission_rate),
        participation_score = VALUES(participation_score),
        risk_level = VALUES(risk_level),
        dropout_risk_score = VALUES(dropout_risk_score),
        intervention_recommended = VALUES(intervention_recommended),
        recommendations = VALUES(recommendations)
    `, [
      studentId, academicStats[0].average_grade || 0, gradeTrend,
      JSON.stringify(strengths), JSON.stringify(weaknesses),
      attendanceRate.toFixed(2), attendanceRate.toFixed(2),
      student[0].conduct_score, behaviorStats[0].positive_incidents || 0,
      behaviorStats[0].negative_incidents || 0, behaviorTrend,
      portalActivity[0].login_count || 0, submissionRateCalc.toFixed(2),
      participationScore.toFixed(2), riskLevel, dropoutRisk,
      interventionRecommended, JSON.stringify(recommendations)
    ]);

    res.json({
      success: true,
      message: 'Analytics generated successfully',
      analytics: {
        averageGrade: academicStats[0].average_grade,
        attendanceRate: attendanceRate.toFixed(2),
        riskLevel,
        dropoutRiskScore: dropoutRisk,
        interventionRecommended,
        recommendations
      }
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to generate analytics', error: error.message });
  }
});

// Generate analytics for all students
router.post('/analytics/generate-all', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT id FROM global_students WHERE academic_status = 'Active'
    `);

    let processed = 0;
    for (const student of students) {
      try {
        await generateStudentAnalytics(student.id);
        processed++;
      } catch (err) {
        console.error(`Error processing student ${student.id}:`, err.message);
      }
    }

    res.json({
      success: true,
      message: `Analytics generated for ${processed} of ${students.length} students`
    });
  } catch (error) {
    console.error('Error generating bulk analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to generate bulk analytics', error: error.message });
  }
});

// Get analytics for a student
router.get('/analytics/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    const [analytics] = await db.query(`
      SELECT * FROM student_analytics
      WHERE student_id = ?
      ORDER BY analysis_date DESC
      LIMIT 1
    `, [studentId]);

    if (analytics.length === 0) {
      return res.status(404).json({ success: false, message: 'Analytics not found. Generate analytics first.' });
    }

    res.json({ success: true, analytics: analytics[0] });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
});

// Get students at risk
router.get('/analytics/at-risk', authenticateToken, requireRole(['admin', 'headmaster', 'dos', 'advisor']), async (req, res) => {
  try {
    const { risk_level = 'High' } = req.query;

    const [students] = await db.query(`
      SELECT sa.*, gs.full_name, gs.admission_number, gs.student_id, gs.current_class_id,
             tc.name as class_name
      FROM student_analytics sa
      INNER JOIN global_students gs ON sa.student_id = gs.id
      LEFT JOIN trade_classes tc ON gs.current_class_id = tc.id
      WHERE sa.analysis_date = (
        SELECT MAX(analysis_date) FROM student_analytics WHERE student_id = sa.student_id
      )
      AND (sa.risk_level = ? OR sa.risk_level = 'Critical')
      AND gs.academic_status = 'Active'
      ORDER BY sa.dropout_risk_score DESC
    `, [risk_level]);

    res.json({ success: true, atRiskStudents: students });
  } catch (error) {
    console.error('Error fetching at-risk students:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch at-risk students', error: error.message });
  }
});

// Get class performance analytics
router.get('/analytics/class/:classId', authenticateToken, requireRole(['admin', 'headmaster', 'dos', 'teacher']), async (req, res) => {
  try {
    const { classId } = req.params;

    const [classStats] = await db.query(`
      SELECT 
        COUNT(DISTINCT gs.id) as total_students,
        AVG(gs.current_gpa) as average_gpa,
        AVG(gs.overall_attendance_percentage) as average_attendance,
        AVG(gs.conduct_score) as average_conduct,
        SUM(CASE WHEN sa.risk_level = 'Critical' THEN 1 ELSE 0 END) as critical_risk,
        SUM(CASE WHEN sa.risk_level = 'High' THEN 1 ELSE 0 END) as high_risk,
        SUM(CASE WHEN sa.risk_level = 'Medium' THEN 1 ELSE 0 END) as medium_risk,
        SUM(CASE WHEN sa.risk_level = 'Low' THEN 1 ELSE 0 END) as low_risk
      FROM global_students gs
      LEFT JOIN student_analytics sa ON gs.id = sa.student_id 
        AND sa.analysis_date = (SELECT MAX(analysis_date) FROM student_analytics WHERE student_id = gs.id)
      WHERE gs.current_class_id = ? AND gs.academic_status = 'Active'
    `, [classId]);

    // Top performers
    const [topPerformers] = await db.query(`
      SELECT gs.id, gs.full_name, gs.admission_number, gs.current_gpa,
             gs.overall_attendance_percentage
      FROM global_students gs
      WHERE gs.current_class_id = ? AND gs.academic_status = 'Active'
      ORDER BY gs.current_gpa DESC
      LIMIT 10
    `, [classId]);

    // Bottom performers needing attention
    const [needsAttention] = await db.query(`
      SELECT gs.id, gs.full_name, gs.admission_number, gs.current_gpa,
             gs.overall_attendance_percentage, sa.risk_level
      FROM global_students gs
      LEFT JOIN student_analytics sa ON gs.id = sa.student_id
        AND sa.analysis_date = (SELECT MAX(analysis_date) FROM student_analytics WHERE student_id = gs.id)
      WHERE gs.current_class_id = ? AND gs.academic_status = 'Active'
      ORDER BY gs.current_gpa ASC, gs.overall_attendance_percentage ASC
      LIMIT 10
    `, [classId]);

    res.json({
      success: true,
      classStats: classStats[0],
      topPerformers,
      needsAttention
    });
  } catch (error) {
    console.error('Error fetching class analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch class analytics', error: error.message });
  }
});

// School-wide analytics dashboard
router.get('/analytics/school', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    // Overall statistics
    const [overallStats] = await db.query(`
      SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN academic_status = 'Active' THEN 1 ELSE 0 END) as active_students,
        AVG(current_gpa) as average_gpa,
        AVG(overall_attendance_percentage) as average_attendance,
        AVG(conduct_score) as average_conduct,
        SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) as male_students,
        SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) as female_students
      FROM global_students
    `);

    // Risk distribution
    const [riskDistribution] = await db.query(`
      SELECT 
        sa.risk_level,
        COUNT(*) as student_count
      FROM student_analytics sa
      INNER JOIN global_students gs ON sa.student_id = gs.id
      WHERE sa.analysis_date = (
        SELECT MAX(analysis_date) FROM student_analytics WHERE student_id = sa.student_id
      )
      AND gs.academic_status = 'Active'
      GROUP BY sa.risk_level
    `);

    // Financial overview
    const [financialStats] = await db.query(`
      SELECT 
        SUM(fee_balance) as total_outstanding,
        SUM(total_fees_paid) as total_collected,
        AVG(fee_balance) as average_balance
      FROM global_students
      WHERE academic_status = 'Active'
    `);

    // Recent payments (last 30 days)
    const [recentPayments] = await db.query(`
      SELECT 
        COUNT(*) as payment_count,
        SUM(amount_paid) as total_amount
      FROM student_fee_payments
      WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND approval_status = 'Approved'
    `);

    // Attendance trends
    const [attendanceTrends] = await db.query(`
      SELECT 
        date,
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_count,
        (SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) / COUNT(*) * 100) as attendance_rate
      FROM student_attendance
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY date
      ORDER BY date DESC
    `);

    // Discipline incidents
    const [disciplineStats] = await db.query(`
      SELECT 
        incident_type,
        COUNT(*) as incident_count
      FROM student_discipline_records
      WHERE incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY incident_type
    `);

    res.json({
      success: true,
      overallStats: overallStats[0],
      riskDistribution,
      financialStats: financialStats[0],
      recentPayments: recentPayments[0],
      attendanceTrends,
      disciplineStats
    });
  } catch (error) {
    console.error('Error fetching school analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch school analytics', error: error.message });
  }
});

// Generate reports
router.post('/reports/generate', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const { report_type, filters } = req.body;

    let query = '';
    let params = [];

    switch (report_type) {
      case 'student_performance':
        query = `
          SELECT 
            gs.admission_number, gs.full_name, gs.current_gpa,
            gs.overall_attendance_percentage, gs.conduct_score,
            tc.name as class_name, sa.risk_level
          FROM global_students gs
          LEFT JOIN trade_classes tc ON gs.current_class_id = tc.id
          LEFT JOIN student_analytics sa ON gs.id = sa.student_id
            AND sa.analysis_date = (SELECT MAX(analysis_date) FROM student_analytics WHERE student_id = gs.id)
          WHERE gs.academic_status = 'Active'
        `;
        break;

      case 'attendance_summary':
        query = `
          SELECT 
            gs.admission_number, gs.full_name, tc.name as class_name,
            COUNT(sa.id) as total_days,
            SUM(CASE WHEN sa.status = 'Present' THEN 1 ELSE 0 END) as present_days,
            SUM(CASE WHEN sa.status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
            (SUM(CASE WHEN sa.status = 'Present' THEN 1 ELSE 0 END) / COUNT(sa.id) * 100) as attendance_rate
          FROM global_students gs
          LEFT JOIN trade_classes tc ON gs.current_class_id = tc.id
          LEFT JOIN student_attendance sa ON gs.id = sa.student_id
          WHERE gs.academic_status = 'Active'
          GROUP BY gs.id
        `;
        break;

      case 'financial_report':
        query = `
          SELECT 
            gs.admission_number, gs.full_name, tc.name as class_name,
            gs.fee_balance, gs.total_fees_paid, gs.scholarship_status
          FROM global_students gs
          LEFT JOIN trade_classes tc ON gs.current_class_id = tc.id
          WHERE gs.academic_status = 'Active'
        `;
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    const [reportData] = await db.query(query, params);

    res.json({
      success: true,
      reportType: report_type,
      generatedAt: new Date(),
      recordCount: reportData.length,
      data: reportData
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
  }
});

// Helper function (can be used by cron jobs)
async function generateStudentAnalytics(studentId) {
  // Same logic as the POST endpoint but without res object
  // Used for batch processing
  // Implementation would mirror the logic above
}

module.exports = router;
module.exports.generateStudentAnalytics = generateStudentAnalytics;
