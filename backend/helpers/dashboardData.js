/**
 * Dashboard data helpers - real DB queries for all role dashboards.
 * Used by /api/comprehensive/dashboard/overview
 */
const { pool } = require('../config/database');

async function getAdminDashboardData() {
  let stats = { total_students: 0, total_staff: 0, total_classes: 0, total_courses: 0, total_parents: 0 };
  try {
    const [rows] = await pool.execute(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'student') AND is_active = 1) as total_students,
        (SELECT COUNT(*) FROM users WHERE role_id IN (SELECT id FROM roles WHERE name IN ('teacher','director_study','director_discipline','headmaster','admin')) AND is_active = 1) as total_staff,
        (SELECT COUNT(*) FROM classes WHERE is_active = 1) as total_classes,
        (SELECT COUNT(*) FROM courses WHERE is_active = 1) as total_courses,
        (SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'parent') AND is_active = 1) as total_parents
    `);
    if (rows && rows[0]) stats = rows[0];
  } catch (e) { /* use defaults */ }
  let recentUsers = [];
  try {
    const [rows] = await pool.execute(`
    SELECT u.id, u.first_name, u.last_name, u.email, r.name as role, u.created_at
    FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.is_active = 1 ORDER BY u.created_at DESC LIMIT 10
    `);
    recentUsers = rows || [];
  } catch (e) { /* use [] */ }
  return { stats, recent_users: recentUsers };
}

async function getHeadmasterDashboardData() {
  let stats = { total_students: 0, total_staff: 0, total_classes: 0, average_performance: 0 };
  let recentActivities = [];
  try {
    const [rows] = await pool.execute(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'student') AND is_active = 1) as total_students,
        (SELECT COUNT(*) FROM users WHERE role_id IN (SELECT id FROM roles WHERE name IN ('teacher','director_study','director_discipline')) AND is_active = 1) as total_staff,
        (SELECT COUNT(*) FROM classes WHERE is_active = 1) as total_classes,
        (SELECT COALESCE(AVG(average_grade),0) FROM student_performance_metrics spm JOIN academic_years ay ON spm.academic_year_id = ay.id WHERE ay.is_active = 1) as average_performance
    `);
    if (rows && rows[0]) stats = rows[0];
  } catch (e) { /* defaults */ }
  try {
    const [rows] = await pool.execute(`
      SELECT 'grade' as type, CONCAT('Grade posted') as description, g.created_at as timestamp
      FROM grades g WHERE g.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      UNION ALL SELECT 'payment' as type, CONCAT('Payment received') as description, fp.created_at FROM fee_payments fp WHERE fp.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY timestamp DESC LIMIT 10
    `);
    recentActivities = rows || [];
  } catch (e) { /* [] */ }
  return { stats, recent_activities: recentActivities };
}

async function getDirectorStudyDashboardData() {
  let stats = { total_students: 0, total_teachers: 0, total_classes: 0, total_courses: 0 };
  let classes = [];
  try {
    const [rows] = await pool.execute(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'student') AND is_active = 1) as total_students,
        (SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'teacher') AND is_active = 1) as total_teachers,
        (SELECT COUNT(*) FROM classes WHERE is_active = 1) as total_classes,
        (SELECT COUNT(*) FROM courses WHERE is_active = 1) as total_courses
    `);
    if (rows && rows[0]) stats = rows[0];
  } catch (e) { /* defaults */ }
  try {
    const [rows] = await pool.execute(`
      SELECT c.*, co.name as course_name, (SELECT COUNT(*) FROM enrollments e WHERE e.class_id = c.id AND e.status = 'active') as student_count
      FROM classes c LEFT JOIN courses co ON c.course_id = co.id WHERE c.is_active = 1 LIMIT 20
    `);
    classes = rows || [];
  } catch (e) { /* [] */ }
  return { stats, classes };
}

async function getDirectorDisciplineDashboardData() {
  let stats = { pending_cases: 0, resolved_30d: 0, total_students: 0 };
  let recentCases = [];
  try {
    const [rows] = await pool.execute(`
      SELECT
        (SELECT COUNT(*) FROM discipline_cases WHERE status IN ('pending','in_progress')) as pending_cases,
        (SELECT COUNT(*) FROM discipline_cases WHERE resolved_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as resolved_30d,
        (SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'student') AND is_active = 1) as total_students
    `);
    if (rows && rows[0]) stats = rows[0];
  } catch (e) { /* defaults */ }
  try {
    const [rows] = await pool.execute(`
      SELECT dc.*, u.first_name, u.last_name FROM discipline_cases dc
      JOIN users u ON dc.student_id = u.id ORDER BY dc.created_at DESC LIMIT 15
    `);
    recentCases = rows || [];
  } catch (e) { /* [] */ }
  return { stats, recent_cases: recentCases };
}

async function getTeacherDashboardData(userId) {
  let stats = { my_students: 0, my_classes: 0, grades_posted_30d: 0 };
  let myClasses = [];
  try {
    const [rows] = await pool.execute(`
      SELECT
        (SELECT COUNT(DISTINCT e.student_id) FROM enrollments e JOIN classes c ON e.class_id = c.id WHERE c.teacher_id = ? AND e.status = 'active') as my_students,
        (SELECT COUNT(*) FROM classes WHERE teacher_id = ? AND is_active = 1) as my_classes,
        (SELECT COUNT(*) FROM grades WHERE teacher_id = ? AND assessment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as grades_posted_30d
    `, [userId, userId, userId]);
    if (rows && rows[0]) stats = rows[0];
  } catch (e) { /* defaults */ }
  try {
    const [rows] = await pool.execute(`
      SELECT c.*, co.name as course_name, (SELECT COUNT(*) FROM enrollments e WHERE e.class_id = c.id AND e.status = 'active') as student_count
      FROM classes c LEFT JOIN courses co ON c.course_id = co.id WHERE c.teacher_id = ? AND c.is_active = 1
    `, [userId]);
    myClasses = rows || [];
  } catch (e) { /* [] */ }
  return { stats, my_classes: myClasses };
}

async function getStudentDashboardData(userId) {
  let stats = { average_grade: 0, enrolled_classes: 0, present_days: 0, total_days: 0 };
  let recentGrades = [];
  try {
    const [rows] = await pool.execute(`
      SELECT
        (SELECT COALESCE(AVG(obtained_marks/max_marks*100),0) FROM grades WHERE student_id = ?) as average_grade,
        (SELECT COUNT(*) FROM enrollments WHERE student_id = ? AND status = 'active') as enrolled_classes,
        (SELECT SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) FROM attendance WHERE student_id = ?) as present_days,
        (SELECT COUNT(*) FROM attendance WHERE student_id = ?) as total_days
    `, [userId, userId, userId, userId]);
    if (rows && rows[0]) stats = rows[0];
  } catch (e) { /* defaults */ }
  try {
    const [rows] = await pool.execute(`
      SELECT g.*, s.subject_name FROM grades g LEFT JOIN subjects s ON g.subject_id = s.id WHERE g.student_id = ? ORDER BY g.assessment_date DESC LIMIT 10
    `, [userId]);
    recentGrades = rows || [];
  } catch (e) { /* [] */ }
  return { stats, recent_grades: recentGrades };
}

async function getParentDashboardData(userId) {
  let children = [];
  try {
    const [rows] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.student_id, u.email,
        (SELECT COALESCE(AVG(obtained_marks/max_marks*100),0) FROM grades WHERE student_id = u.id) as avg_grade,
        (SELECT COUNT(*) FROM attendance WHERE student_id = u.id AND status = 'present') as present_days
      FROM users u
      WHERE u.parent_id = ?
      LIMIT 20
    `, [userId]);
    children = rows || [];
  } catch (e) { /* [] */ }
  return { stats: { total_children: children.length }, children };
}

async function getAccountantDashboardData() {
  let stats = { total_collected: 0, transactions_30d: 0, students_paid: 0 };
  let recentPayments = [];
  try {
    const [rows] = await pool.execute(`
      SELECT
        COALESCE(SUM(amount),0) as total_collected,
        (SELECT COUNT(*) FROM fee_payments WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as transactions_30d,
        (SELECT COUNT(DISTINCT student_id) FROM fee_payments WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)) as students_paid
      FROM fee_payments WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
    `);
    if (rows && rows[0]) stats = rows[0];
  } catch (e) { /* defaults */ }
  try {
    const [rows] = await pool.execute(`
      SELECT fp.*, u.first_name, u.last_name FROM fee_payments fp
      JOIN users u ON fp.student_id = u.id ORDER BY fp.payment_date DESC, fp.created_at DESC LIMIT 15
    `);
    recentPayments = rows || [];
  } catch (e) { /* [] */ }
  return { stats, recent_payments: recentPayments };
}

async function getStockManagerDashboardData() {
  let items = [];
  let stats = { total_quantity: 0, total_items: 0, low_stock_count: 0 };
  try {
    const [rows] = await pool.execute(`
      SELECT * FROM stock_items WHERE is_active = 1 ORDER BY quantity ASC LIMIT 20
    `);
    items = rows || [];
  } catch (e) { /* [] */ }
  try {
    const [rows] = await pool.execute(`
      SELECT
        COALESCE(SUM(quantity),0) as total_quantity,
        COUNT(*) as total_items,
        (SELECT COUNT(*) FROM stock_items WHERE quantity <= min_threshold AND is_active = 1) as low_stock_count
      FROM stock_items WHERE is_active = 1
    `);
    if (rows && rows[0]) stats = rows[0];
  } catch (e) { /* defaults */ }
  return { stats, items };
}

async function getAdvisorDashboardData(userId) {
  let stats = { total_students: 0, active_cases: 0, pending_meetings: 0 };
  let students = [];
  let recentActivity = [];
  try {
    const [rows] = await pool.execute(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'student') AND is_active = 1) as total_students,
        (SELECT COUNT(*) FROM discipline_cases WHERE status IN ('pending','in_progress')) as active_cases,
        0 as pending_meetings
    `);
    if (rows && rows[0]) stats = rows[0];
  } catch (e) { /* defaults */ }
  try {
    const [rows] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.student_id, u.email
      FROM users u WHERE u.role_id = (SELECT id FROM roles WHERE name = 'student') AND u.is_active = 1 ORDER BY u.last_name LIMIT 30
    `);
    students = rows || [];
  } catch (e) { /* [] */ }
  try {
    const [rows] = await pool.execute(`
      SELECT dc.*, u.first_name, u.last_name FROM discipline_cases dc
      JOIN users u ON dc.student_id = u.id ORDER BY dc.created_at DESC LIMIT 10
    `);
    recentActivity = rows || [];
  } catch (e) { /* [] */ }
  return { stats, students, recent_activity: recentActivity };
}

module.exports = {
  getAdminDashboardData,
  getHeadmasterDashboardData,
  getDirectorStudyDashboardData,
  getDirectorDisciplineDashboardData,
  getTeacherDashboardData,
  getStudentDashboardData,
  getParentDashboardData,
  getAccountantDashboardData,
  getStockManagerDashboardData,
  getAdvisorDashboardData
};
