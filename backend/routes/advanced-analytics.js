const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/student-performance-trends', async (req, res) => {
  try {
    const { student_id, year } = req.query;
    const [trends] = await pool.execute(`
      SELECT 
        s.subject_name,
        AVG(g.grade_value) as average_grade,
        MAX(g.grade_value) as highest_grade,
        MIN(g.grade_value) as lowest_grade,
        COUNT(*) as total_assessments
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      WHERE g.student_id = ? AND g.academic_year = ?
      GROUP BY s.id, s.subject_name
      ORDER BY average_grade DESC
    `, [student_id, year || new Date().getFullYear()]);
    
    res.json({ success: true, trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/class-performance-comparison', async (req, res) => {
  try {
    const [comparison] = await pool.execute(`
      SELECT 
        tc.class_name,
        tl.trade_name,
        AVG(g.grade_value) as average_grade,
        COUNT(DISTINCT e.student_id) as total_students,
        COUNT(g.id) as total_assessments
      FROM trade_classes tc
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      LEFT JOIN enrollments e ON tc.id = e.class_id AND e.status = 'active'
      LEFT JOIN grades g ON e.student_id = g.student_id AND g.academic_year = YEAR(NOW())
      GROUP BY tc.id, tc.class_name, tl.trade_name
      ORDER BY average_grade DESC
    `);
    
    res.json({ success: true, comparison });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/attendance-analytics', async (req, res) => {
  try {
    const { class_id, start_date, end_date } = req.query;
    
    const [analytics] = await pool.execute(`
      SELECT 
        DATE(a.attendance_date) as date,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
        COUNT(*) as total_records
      FROM attendance a
      JOIN enrollments e ON a.student_id = e.student_id
      WHERE e.class_id = ?
        AND a.attendance_date BETWEEN ? AND ?
      GROUP BY DATE(a.attendance_date)
      ORDER BY date ASC
    `, [class_id, start_date || new Date(new Date().setMonth(new Date().getMonth() - 1)), end_date || new Date()]);
    
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/fee-collection-analytics', async (req, res) => {
  try {
    const { year } = req.query;
    
    const [analytics] = await pool.execute(`
      SELECT 
        MONTH(fp.payment_date) as month,
        SUM(fp.amount_paid) as total_collected,
        COUNT(DISTINCT fp.student_id) as students_paid,
        COUNT(*) as total_payments
      FROM fee_payments fp
      WHERE YEAR(fp.payment_date) = ?
      GROUP BY MONTH(fp.payment_date)
      ORDER BY month ASC
    `, [year || new Date().getFullYear()]);
    
    const [summary] = await pool.execute(`
      SELECT 
        SUM(fs.amount) as total_expected,
        SUM(CASE WHEN fs.status = 'paid' THEN fs.amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN fs.status = 'pending' THEN fs.amount ELSE 0 END) as total_pending,
        SUM(CASE WHEN fs.status = 'overdue' THEN fs.amount ELSE 0 END) as total_overdue
      FROM fee_structures fs
      WHERE fs.academic_year = ?
    `, [year || new Date().getFullYear()]);
    
    res.json({ success: true, analytics, summary: summary[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/teacher-workload-analytics', async (req, res) => {
  try {
    const [workload] = await pool.execute(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        COUNT(DISTINCT te.class_id) as classes_assigned,
        COUNT(DISTINCT g.id) as assessments_graded,
        COUNT(DISTINCT a.id) as assignments_created,
        AVG(g.grade_value) as average_grade_given
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN timetable_entries te ON u.id = te.teacher_id
      LEFT JOIN grades g ON u.id = g.teacher_id
      LEFT JOIN assignments a ON u.id = a.teacher_id
      WHERE r.name = 'teacher' AND u.is_active = true
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY classes_assigned DESC
    `);
    
    res.json({ success: true, workload });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/subject-difficulty-analysis', async (req, res) => {
  try {
    const [analysis] = await pool.execute(`
      SELECT 
        s.subject_name,
        s.subject_code,
        AVG(g.grade_value) as average_score,
        STDDEV(g.grade_value) as score_deviation,
        COUNT(CASE WHEN g.grade_value < 50 THEN 1 END) as failing_count,
        COUNT(CASE WHEN g.grade_value >= 80 THEN 1 END) as excellent_count,
        COUNT(*) as total_assessments
      FROM subjects s
      LEFT JOIN grades g ON s.id = g.subject_id AND g.academic_year = YEAR(NOW())
      WHERE s.is_active = true
      GROUP BY s.id, s.subject_name, s.subject_code
      ORDER BY average_score ASC
    `);
    
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/student-engagement-metrics', async (req, res) => {
  try {
    const [metrics] = await pool.execute(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        COUNT(DISTINCT ar.id) as assignments_submitted,
        COUNT(DISTINCT fc.id) as forum_contributions,
        COUNT(DISTINCT ca.id) as club_activities,
        (SELECT AVG(grade_value) FROM grades WHERE student_id = u.id AND academic_year = YEAR(NOW())) as average_grade,
        (SELECT COUNT(*) FROM attendance WHERE student_id = u.id AND status = 'present' AND YEAR(attendance_date) = YEAR(NOW())) as attendance_count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN assignment_responses ar ON u.id = ar.student_id
      LEFT JOIN forum_replies fc ON u.id = fc.user_id
      LEFT JOIN club_members ca ON u.id = ca.student_id
      WHERE r.name = 'student' AND u.is_active = true
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY assignments_submitted DESC
      LIMIT 100
    `);
    
    res.json({ success: true, metrics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/dropout-risk-prediction', async (req, res) => {
  try {
    const [riskStudents] = await pool.execute(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        (SELECT AVG(grade_value) FROM grades WHERE student_id = u.id AND academic_year = YEAR(NOW())) as average_grade,
        (SELECT COUNT(*) FROM attendance WHERE student_id = u.id AND status = 'absent' AND YEAR(attendance_date) = YEAR(NOW())) as absent_days,
        (SELECT COUNT(*) FROM fee_structures WHERE student_id = u.id AND status = 'overdue') as overdue_fees,
        CASE 
          WHEN (SELECT AVG(grade_value) FROM grades WHERE student_id = u.id) < 50 
            AND (SELECT COUNT(*) FROM attendance WHERE student_id = u.id AND status = 'absent' AND YEAR(attendance_date) = YEAR(NOW())) > 10 
          THEN 'high'
          WHEN (SELECT AVG(grade_value) FROM grades WHERE student_id = u.id) < 60 
            OR (SELECT COUNT(*) FROM attendance WHERE student_id = u.id AND status = 'absent' AND YEAR(attendance_date) = YEAR(NOW())) > 5 
          THEN 'medium'
          ELSE 'low'
        END as risk_level
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'student' AND u.is_active = true
      HAVING risk_level IN ('high', 'medium')
      ORDER BY risk_level DESC, average_grade ASC
    `);
    
    res.json({ success: true, riskStudents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/resource-utilization', async (req, res) => {
  try {
    const [resources] = await pool.execute(`
      SELECT 
        'Classrooms' as resource_type,
        COUNT(DISTINCT te.venue) as total_resources,
        COUNT(DISTINCT CONCAT(te.venue, '-', te.day_of_week, '-', te.period)) as utilized_slots,
        ROUND((COUNT(DISTINCT CONCAT(te.venue, '-', te.day_of_week, '-', te.period)) / (COUNT(DISTINCT te.venue) * 40)) * 100, 2) as utilization_percentage
      FROM timetable_entries te
      UNION ALL
      SELECT 
        'Laboratory Equipment' as resource_type,
        COUNT(*) as total_resources,
        SUM(CASE WHEN status = 'in_use' THEN 1 ELSE 0 END) as utilized_slots,
        ROUND((SUM(CASE WHEN status = 'in_use' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as utilization_percentage
      FROM lab_equipment
      UNION ALL
      SELECT 
        'Library Books' as resource_type,
        COUNT(*) as total_resources,
        SUM(CASE WHEN status = 'borrowed' THEN 1 ELSE 0 END) as utilized_slots,
        ROUND((SUM(CASE WHEN status = 'borrowed' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as utilization_percentage
      FROM library_books
    `);
    
    res.json({ success: true, resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/grade-distribution', async (req, res) => {
  try {
    const { subject_id, class_id } = req.query;
    
    let query = `
      SELECT 
        CASE 
          WHEN g.grade_value >= 90 THEN 'A+'
          WHEN g.grade_value >= 85 THEN 'A'
          WHEN g.grade_value >= 80 THEN 'A-'
          WHEN g.grade_value >= 75 THEN 'B+'
          WHEN g.grade_value >= 70 THEN 'B'
          WHEN g.grade_value >= 65 THEN 'B-'
          WHEN g.grade_value >= 60 THEN 'C+'
          WHEN g.grade_value >= 55 THEN 'C'
          WHEN g.grade_value >= 50 THEN 'C-'
          ELSE 'F'
        END as grade_letter,
        COUNT(*) as student_count
      FROM grades g
      JOIN enrollments e ON g.student_id = e.student_id
      WHERE g.academic_year = YEAR(NOW())
    `;
    
    const params = [];
    if (subject_id) {
      query += ' AND g.subject_id = ?';
      params.push(subject_id);
    }
    if (class_id) {
      query += ' AND e.class_id = ?';
      params.push(class_id);
    }
    
    query += ' GROUP BY grade_letter ORDER BY MIN(g.grade_value) DESC';
    
    const [distribution] = await pool.execute(query, params);
    
    res.json({ success: true, distribution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/enrollment-trends', async (req, res) => {
  try {
    const [trends] = await pool.execute(`
      SELECT 
        e.academic_year,
        tl.trade_name,
        COUNT(DISTINCT e.student_id) as student_count,
        COUNT(CASE WHEN e.status = 'active' THEN 1 END) as active_count,
        COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN e.status = 'dropped' THEN 1 END) as dropped_count
      FROM enrollments e
      JOIN trade_classes tc ON e.class_id = tc.id
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      GROUP BY e.academic_year, tl.trade_name
      ORDER BY e.academic_year DESC, student_count DESC
    `);
    
    res.json({ success: true, trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/library-usage-stats', async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT lb.id) as total_books,
        COUNT(DISTINCT CASE WHEN lb.status = 'borrowed' THEN lb.id END) as borrowed_books,
        COUNT(DISTINCT lt.id) as total_transactions,
        COUNT(DISTINCT lt.user_id) as active_borrowers,
        AVG(DATEDIFF(lt.return_date, lt.borrow_date)) as average_borrow_duration
      FROM library_books lb
      LEFT JOIN library_transactions lt ON lb.id = lt.book_id
      WHERE YEAR(lt.borrow_date) = YEAR(NOW())
    `);
    
    const [topBooks] = await pool.execute(`
      SELECT 
        lb.title,
        lb.author,
        COUNT(lt.id) as borrow_count
      FROM library_books lb
      JOIN library_transactions lt ON lb.id = lt.book_id
      WHERE YEAR(lt.borrow_date) = YEAR(NOW())
      GROUP BY lb.id, lb.title, lb.author
      ORDER BY borrow_count DESC
      LIMIT 10
    `);
    
    res.json({ success: true, stats: stats[0], topBooks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/cafeteria-analytics', async (req, res) => {
  try {
    const [analytics] = await pool.execute(`
      SELECT 
        DATE(co.order_date) as date,
        COUNT(*) as total_orders,
        SUM(co.total_amount) as total_revenue,
        AVG(co.total_amount) as average_order_value
      FROM cafeteria_orders co
      WHERE co.order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(co.order_date)
      ORDER BY date DESC
    `);
    
    const [popularItems] = await pool.execute(`
      SELECT 
        cm.item_name,
        cm.category,
        COUNT(co.id) as order_count,
        SUM(co.total_amount) as total_revenue
      FROM cafeteria_menu cm
      JOIN cafeteria_orders co ON cm.id = co.item_id
      WHERE co.order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY cm.id, cm.item_name, cm.category
      ORDER BY order_count DESC
      LIMIT 10
    `);
    
    res.json({ success: true, analytics, popularItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sports-performance', async (req, res) => {
  try {
    const [performance] = await pool.execute(`
      SELECT 
        t.name as team_name,
        t.sport_type,
        COUNT(m.id) as matches_played,
        SUM(CASE 
          WHEN (m.home_team_id = t.id AND m.home_score > m.away_score) 
            OR (m.away_team_id = t.id AND m.away_score > m.home_score) 
          THEN 1 ELSE 0 END) as wins,
        SUM(CASE 
          WHEN (m.home_team_id = t.id AND m.home_score < m.away_score) 
            OR (m.away_team_id = t.id AND m.away_score < m.home_score) 
          THEN 1 ELSE 0 END) as losses,
        SUM(CASE WHEN m.home_score = m.away_score THEN 1 ELSE 0 END) as draws
      FROM teams t
      LEFT JOIN matches m ON (t.id = m.home_team_id OR t.id = m.away_team_id) 
        AND m.status = 'completed'
      WHERE t.status = 'active'
      GROUP BY t.id, t.name, t.sport_type
      ORDER BY wins DESC
    `);
    
    res.json({ success: true, performance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/financial-overview', async (req, res) => {
  try {
    const { year, month } = req.query;
    
    const [income] = await pool.execute(`
      SELECT 
        SUM(amount_paid) as total_fee_income
      FROM fee_payments
      WHERE YEAR(payment_date) = ? ${month ? 'AND MONTH(payment_date) = ?' : ''}
    `, month ? [year || new Date().getFullYear(), month] : [year || new Date().getFullYear()]);
    
    const [expenses] = await pool.execute(`
      SELECT 
        SUM(amount) as total_expenses
      FROM expenses
      WHERE YEAR(expense_date) = ? ${month ? 'AND MONTH(expense_date) = ?' : ''}
    `, month ? [year || new Date().getFullYear(), month] : [year || new Date().getFullYear()]);
    
    const [categoryExpenses] = await pool.execute(`
      SELECT 
        category,
        SUM(amount) as total
      FROM expenses
      WHERE YEAR(expense_date) = ? ${month ? 'AND MONTH(expense_date) = ?' : ''}
      GROUP BY category
      ORDER BY total DESC
    `, month ? [year || new Date().getFullYear(), month] : [year || new Date().getFullYear()]);
    
    res.json({ 
      success: true, 
      income: income[0].total_fee_income || 0,
      expenses: expenses[0].total_expenses || 0,
      netIncome: (income[0].total_fee_income || 0) - (expenses[0].total_expenses || 0),
      categoryExpenses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/assignment-completion-rate', async (req, res) => {
  try {
    const [rates] = await pool.execute(`
      SELECT 
        a.title,
        a.due_date,
        s.subject_name,
        COUNT(DISTINCT e.student_id) as total_students,
        COUNT(DISTINCT ar.student_id) as submitted_count,
        ROUND((COUNT(DISTINCT ar.student_id) / COUNT(DISTINCT e.student_id)) * 100, 2) as completion_rate
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      JOIN enrollments e ON s.id IN (
        SELECT subject_id FROM grades WHERE student_id = e.student_id
      )
      LEFT JOIN assignment_responses ar ON a.id = ar.assignment_id
      WHERE a.created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
      GROUP BY a.id, a.title, a.due_date, s.subject_name
      ORDER BY a.due_date DESC
    `);
    
    res.json({ success: true, rates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/alumni-career-tracking', async (req, res) => {
  try {
    const [careers] = await pool.execute(`
      SELECT 
        a.current_employment_status,
        COUNT(*) as count,
        AVG(a.current_salary) as average_salary
      FROM alumni a
      WHERE a.graduation_year >= YEAR(NOW()) - 5
      GROUP BY a.current_employment_status
    `);
    
    const [industries] = await pool.execute(`
      SELECT 
        a.industry,
        COUNT(*) as alumni_count
      FROM alumni a
      WHERE a.graduation_year >= YEAR(NOW()) - 5
      GROUP BY a.industry
      ORDER BY alumni_count DESC
      LIMIT 10
    `);
    
    res.json({ success: true, careers, industries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/exam-performance-comparison', async (req, res) => {
  try {
    const { exam_id } = req.query;
    
    const [comparison] = await pool.execute(`
      SELECT 
        tc.class_name,
        AVG(er.score) as average_score,
        MAX(er.score) as highest_score,
        MIN(er.score) as lowest_score,
        COUNT(*) as students_count
      FROM exam_results er
      JOIN enrollments e ON er.student_id = e.student_id
      JOIN trade_classes tc ON e.class_id = tc.id
      WHERE er.exam_id = ?
      GROUP BY tc.id, tc.class_name
      ORDER BY average_score DESC
    `, [exam_id]);
    
    res.json({ success: true, comparison });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/student-retention-rate', async (req, res) => {
  try {
    const [retention] = await pool.execute(`
      SELECT 
        e.academic_year,
        tl.trade_name,
        COUNT(DISTINCT CASE WHEN e.status = 'active' OR e.status = 'completed' THEN e.student_id END) as retained_students,
        COUNT(DISTINCT CASE WHEN e.status = 'dropped' THEN e.student_id END) as dropped_students,
        COUNT(DISTINCT e.student_id) as total_students,
        ROUND((COUNT(DISTINCT CASE WHEN e.status = 'active' OR e.status = 'completed' THEN e.student_id END) / COUNT(DISTINCT e.student_id)) * 100, 2) as retention_rate
      FROM enrollments e
      JOIN trade_classes tc ON e.class_id = tc.id
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      GROUP BY e.academic_year, tl.trade_name
      ORDER BY e.academic_year DESC
    `);
    
    res.json({ success: true, retention });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/communication-analytics', async (req, res) => {
  try {
    const [messages] = await pool.execute(`
      SELECT 
        DATE(sent_at) as date,
        COUNT(*) as total_messages,
        COUNT(CASE WHEN read_at IS NOT NULL THEN 1 END) as read_messages,
        ROUND((COUNT(CASE WHEN read_at IS NOT NULL THEN 1 END) / COUNT(*)) * 100, 2) as read_rate
      FROM messages
      WHERE sent_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(sent_at)
      ORDER BY date DESC
    `);
    
    const [smsStats] = await pool.execute(`
      SELECT 
        status,
        COUNT(*) as count
      FROM sms_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY status
    `);
    
    res.json({ success: true, messages, smsStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
