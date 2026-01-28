const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/academic-report/:studentId', async (req, res) => {
  try {
    const { year, term } = req.query;
    
    const [student] = await pool.execute(`
      SELECT u.*, tc.class_name, tl.trade_name
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      JOIN trade_classes tc ON e.class_id = tc.id
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE u.id = ?
    `, [req.params.studentId]);
    
    const [grades] = await pool.execute(`
      SELECT g.*, s.subject_name, s.subject_code
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      WHERE g.student_id = ? AND g.academic_year = ?
    `, [req.params.studentId, year || new Date().getFullYear()]);
    
    const [attendance] = await pool.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days
      FROM attendance
      WHERE student_id = ? AND YEAR(attendance_date) = ?
    `, [req.params.studentId, year || new Date().getFullYear()]);
    
    const avgGrade = grades.reduce((sum, g) => sum + g.grade_value, 0) / grades.length || 0;
    
    res.json({
      success: true,
      student: student[0],
      grades,
      attendance: attendance[0],
      average_grade: avgGrade.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/class-performance-report/:classId', async (req, res) => {
  try {
    const { year } = req.query;
    
    const [students] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name,
        AVG(g.grade_value) as average_grade,
        COUNT(DISTINCT g.subject_id) as subjects_taken
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      LEFT JOIN grades g ON u.id = g.student_id AND g.academic_year = ?
      WHERE e.class_id = ? AND e.status = 'active'
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY average_grade DESC
    `, [year || new Date().getFullYear(), req.params.classId]);
    
    const [classInfo] = await pool.execute(`
      SELECT tc.*, tl.trade_name
      FROM trade_classes tc
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE tc.id = ?
    `, [req.params.classId]);
    
    res.json({
      success: true,
      class: classInfo[0],
      students,
      total_students: students.length,
      class_average: (students.reduce((sum, s) => sum + (s.average_grade || 0), 0) / students.length).toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/attendance-report', async (req, res) => {
  try {
    const { class_id, start_date, end_date } = req.query;
    
    const [report] = await pool.execute(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        COUNT(*) as total_days,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_days,
        ROUND((SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendance_percentage
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      LEFT JOIN attendance a ON u.id = a.student_id 
        AND a.attendance_date BETWEEN ? AND ?
      WHERE e.class_id = ?
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY attendance_percentage DESC
    `, [start_date, end_date, class_id]);
    
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/financial-report', async (req, res) => {
  try {
    const { year, month } = req.query;
    
    let dateFilter = 'YEAR(payment_date) = ?';
    let params = [year || new Date().getFullYear()];
    
    if (month) {
      dateFilter += ' AND MONTH(payment_date) = ?';
      params.push(month);
    }
    
    const [income] = await pool.execute(`
      SELECT 
        SUM(amount_paid) as total_income,
        COUNT(*) as total_transactions,
        AVG(amount_paid) as average_transaction
      FROM fee_payments
      WHERE ${dateFilter}
    `, params);
    
    const [expenses] = await pool.execute(`
      SELECT 
        category,
        SUM(amount) as total_amount
      FROM expenses
      WHERE ${dateFilter}
      GROUP BY category
      ORDER BY total_amount DESC
    `, params);
    
    const [feeStatus] = await pool.execute(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM fee_structures
      WHERE academic_year = ?
      GROUP BY status
    `, [year || new Date().getFullYear()]);
    
    res.json({
      success: true,
      income: income[0],
      expenses,
      feeStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/teacher-performance-report/:teacherId', async (req, res) => {
  try {
    const [classes] = await pool.execute(`
      SELECT COUNT(DISTINCT class_id) as classes_taught
      FROM timetable_entries
      WHERE teacher_id = ?
    `, [req.params.teacherId]);
    
    const [gradeStats] = await pool.execute(`
      SELECT 
        AVG(grade_value) as average_grade,
        COUNT(*) as total_grades,
        COUNT(DISTINCT student_id) as students_graded
      FROM grades
      WHERE teacher_id = ?
    `, [req.params.teacherId]);
    
    const [assignments] = await pool.execute(`
      SELECT 
        COUNT(*) as total_assignments,
        AVG((SELECT COUNT(*) FROM assignment_responses WHERE assignment_id = a.id)) as average_submissions
      FROM assignments a
      WHERE a.teacher_id = ?
    `, [req.params.teacherId]);
    
    res.json({
      success: true,
      classes: classes[0],
      gradeStats: gradeStats[0],
      assignments: assignments[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/subject-analysis-report/:subjectId', async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        AVG(grade_value) as average_grade,
        MAX(grade_value) as highest_grade,
        MIN(grade_value) as lowest_grade,
        STDDEV(grade_value) as standard_deviation,
        COUNT(*) as total_assessments,
        COUNT(DISTINCT student_id) as students_assessed
      FROM grades
      WHERE subject_id = ? AND academic_year = YEAR(NOW())
    `, [req.params.subjectId]);
    
    const [distribution] = await pool.execute(`
      SELECT 
        CASE 
          WHEN grade_value >= 90 THEN 'A+ (90-100)'
          WHEN grade_value >= 80 THEN 'A (80-89)'
          WHEN grade_value >= 70 THEN 'B (70-79)'
          WHEN grade_value >= 60 THEN 'C (60-69)'
          WHEN grade_value >= 50 THEN 'D (50-59)'
          ELSE 'F (0-49)'
        END as grade_range,
        COUNT(*) as student_count
      FROM grades
      WHERE subject_id = ? AND academic_year = YEAR(NOW())
      GROUP BY grade_range
      ORDER BY MIN(grade_value) DESC
    `, [req.params.subjectId]);
    
    res.json({ success: true, stats: stats[0], distribution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/enrollment-report', async (req, res) => {
  try {
    const [byTrade] = await pool.execute(`
      SELECT 
        tl.trade_name,
        tc.class_name,
        COUNT(e.id) as total_enrolled,
        COUNT(CASE WHEN e.status = 'active' THEN 1 END) as active_students,
        COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN e.status = 'dropped' THEN 1 END) as dropped
      FROM trade_classes tc
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      LEFT JOIN enrollments e ON tc.id = e.class_id
      GROUP BY tl.trade_name, tc.class_name
      ORDER BY total_enrolled DESC
    `);
    
    const [byYear] = await pool.execute(`
      SELECT 
        academic_year,
        COUNT(*) as total_enrollments,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM enrollments
      GROUP BY academic_year
      ORDER BY academic_year DESC
    `);
    
    res.json({ success: true, byTrade, byYear });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/library-report', async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_books,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_books,
        COUNT(CASE WHEN status = 'borrowed' THEN 1 END) as borrowed_books,
        COUNT(CASE WHEN status = 'reserved' THEN 1 END) as reserved_books
      FROM library_books
    `);
    
    const [transactions] = await pool.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        AVG(DATEDIFF(return_date, borrow_date)) as average_borrow_duration
      FROM library_transactions
      WHERE YEAR(borrow_date) = YEAR(NOW())
    `);
    
    const [topBorrowers] = await pool.execute(`
      SELECT 
        u.first_name,
        u.last_name,
        COUNT(lt.id) as borrow_count
      FROM library_transactions lt
      JOIN users u ON lt.user_id = u.id
      WHERE YEAR(lt.borrow_date) = YEAR(NOW())
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY borrow_count DESC
      LIMIT 10
    `);
    
    res.json({ success: true, stats: stats[0], transactions: transactions[0], topBorrowers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/disciplinary-report', async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        incident_type,
        COUNT(*) as incident_count,
        AVG(severity_level) as average_severity
      FROM disciplinary_records
      WHERE YEAR(incident_date) = YEAR(NOW())
      GROUP BY incident_type
      ORDER BY incident_count DESC
    `);
    
    const [byMonth] = await pool.execute(`
      SELECT 
        MONTH(incident_date) as month,
        COUNT(*) as total_incidents
      FROM disciplinary_records
      WHERE YEAR(incident_date) = YEAR(NOW())
      GROUP BY MONTH(incident_date)
      ORDER BY month
    `);
    
    res.json({ success: true, stats, byMonth });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/exam-results-report/:examId', async (req, res) => {
  try {
    const [results] = await pool.execute(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        er.score,
        er.grade,
        er.rank
      FROM exam_results er
      JOIN users u ON er.student_id = u.id
      WHERE er.exam_id = ?
      ORDER BY er.score DESC
    `, [req.params.examId]);
    
    const [stats] = await pool.execute(`
      SELECT 
        AVG(score) as average_score,
        MAX(score) as highest_score,
        MIN(score) as lowest_score,
        STDDEV(score) as standard_deviation
      FROM exam_results
      WHERE exam_id = ?
    `, [req.params.examId]);
    
    res.json({ success: true, results, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/cafeteria-sales-report', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const [sales] = await pool.execute(`
      SELECT 
        DATE(order_date) as date,
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue
      FROM cafeteria_orders
      WHERE order_date BETWEEN ? AND ?
      GROUP BY DATE(order_date)
      ORDER BY date DESC
    `, [start_date, end_date]);
    
    const [popularItems] = await pool.execute(`
      SELECT 
        cm.item_name,
        COUNT(co.id) as order_count,
        SUM(co.total_amount) as revenue
      FROM cafeteria_menu cm
      JOIN cafeteria_orders co ON cm.id = co.item_id
      WHERE co.order_date BETWEEN ? AND ?
      GROUP BY cm.id, cm.item_name
      ORDER BY order_count DESC
      LIMIT 10
    `, [start_date, end_date]);
    
    res.json({ success: true, sales, popularItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/inventory-report', async (req, res) => {
  try {
    const [summary] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        SUM(quantity * unit_price) as total_value
      FROM inventory
      GROUP BY category
    `);
    
    const [lowStock] = await pool.execute(`
      SELECT * FROM inventory
      WHERE quantity <= reorder_level
      ORDER BY (quantity / reorder_level) ASC
    `);
    
    const [recentTransactions] = await pool.execute(`
      SELECT it.*, i.item_name
      FROM inventory_transactions it
      JOIN inventory i ON it.item_id = i.id
      ORDER BY it.transaction_date DESC
      LIMIT 20
    `);
    
    res.json({ success: true, summary, lowStock, recentTransactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sports-performance-report', async (req, res) => {
  try {
    const [teamStats] = await pool.execute(`
      SELECT 
        t.name,
        t.sport_type,
        COUNT(m.id) as matches_played,
        SUM(CASE 
          WHEN (m.home_team_id = t.id AND m.home_score > m.away_score) 
            OR (m.away_team_id = t.id AND m.away_score > m.home_score) 
          THEN 1 ELSE 0 END) as wins,
        SUM(CASE 
          WHEN (m.home_team_id = t.id AND m.home_score < m.away_score) 
            OR (m.away_team_id = t.id AND m.away_score < m.home_score) 
          THEN 1 ELSE 0 END) as losses
      FROM teams t
      LEFT JOIN matches m ON (t.id = m.home_team_id OR t.id = m.away_team_id) 
        AND m.status = 'completed'
      GROUP BY t.id, t.name, t.sport_type
    `);
    
    res.json({ success: true, teamStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/alumni-report', async (req, res) => {
  try {
    const [employment] = await pool.execute(`
      SELECT 
        current_employment_status,
        COUNT(*) as count
      FROM alumni
      GROUP BY current_employment_status
    `);
    
    const [industries] = await pool.execute(`
      SELECT 
        industry,
        COUNT(*) as count,
        AVG(current_salary) as average_salary
      FROM alumni
      WHERE industry IS NOT NULL
      GROUP BY industry
      ORDER BY count DESC
    `);
    
    const [byYear] = await pool.execute(`
      SELECT 
        graduation_year,
        COUNT(*) as alumni_count
      FROM alumni
      GROUP BY graduation_year
      ORDER BY graduation_year DESC
    `);
    
    res.json({ success: true, employment, industries, byYear });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/custom-report', async (req, res) => {
  try {
    const { report_type, filters } = req.query;
    
    res.json({ 
      success: true, 
      message: 'Custom report endpoint - implement based on report_type',
      report_type,
      filters: JSON.parse(filters || '{}')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/generate-pdf-report', async (req, res) => {
  try {
    const { report_type, data } = req.body;
    
    res.json({ 
      success: true, 
      message: 'PDF generation endpoint',
      pdf_url: '/reports/generated-report.pdf'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/schedule-report', async (req, res) => {
  try {
    const { report_type, schedule, recipients } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO scheduled_reports (report_type, schedule, recipients, status, created_at)
       VALUES (?, ?, ?, 'active', NOW())`,
      [report_type, schedule, JSON.stringify(recipients)]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/scheduled-reports', async (req, res) => {
  try {
    const [reports] = await pool.execute(
      'SELECT * FROM scheduled_reports WHERE status = "active" ORDER BY created_at DESC'
    );
    
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/dashboard-summary', async (req, res) => {
  try {
    const [studentCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = "student" AND u.is_active = true'
    );
    
    const [teacherCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = "teacher" AND u.is_active = true'
    );
    
    const [todayAttendance] = await pool.execute(
      'SELECT COUNT(CASE WHEN status = "present" THEN 1 END) as present, COUNT(*) as total FROM attendance WHERE DATE(attendance_date) = CURDATE()'
    );
    
    const [pendingFees] = await pool.execute(
      'SELECT SUM(amount) as total FROM fee_structures WHERE status = "pending"'
    );
    
    res.json({
      success: true,
      students: studentCount[0].count,
      teachers: teacherCount[0].count,
      attendance: todayAttendance[0],
      pendingFees: pendingFees[0].total || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
