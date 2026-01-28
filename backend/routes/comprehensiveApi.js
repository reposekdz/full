const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// ============================== DASHBOARD APIs (10 APIs) ===============================
router.get('/dashboard/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let data = {};

    switch (userRole) {
      case 'super_admin':
      case 'admin':
        data = await getAdminDashboardData();
        break;
      case 'headmaster':
        data = await getHeadmasterDashboardData();
        break;
      case 'director_study':
        data = await getDirectorStudyDashboardData();
        break;
      case 'director_discipline':
        data = await getDirectorDisciplineDashboardData();
        break;
      case 'teacher':
        data = await getTeacherDashboardData(userId);
        break;
      case 'student':
        data = await getStudentDashboardData(userId);
        break;
      case 'parent':
        data = await getParentDashboardData(userId);
        break;
      case 'accountant':
        data = await getAccountantDashboardData();
        break;
      case 'stock_manager':
        data = await getStockManagerDashboardData();
        break;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'student') AND is_active = true) as total_students,
        (SELECT COUNT(*) FROM users WHERE role_id IN (SELECT id FROM roles WHERE name IN ('teacher', 'director_study', 'director_discipline', 'headmaster')) AND is_active = true) as total_staff,
        (SELECT COUNT(*) FROM classes WHERE is_active = true) as total_classes,
        (SELECT COUNT(*) FROM courses WHERE is_active = true) as total_courses,
        (SELECT AVG(average_grade) FROM student_performance_metrics spm JOIN academic_years ay ON spm.academic_year_id = ay.id WHERE ay.is_active = true) as average_performance
    `);

    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/dashboard/recent-activities', authenticateToken, async (req, res) => {
  try {
    const [activities] = await pool.execute(`
      SELECT 'user_registered' as type, CONCAT(u.first_name, ' ', u.last_name, ' registered') as description, u.created_at as timestamp
      FROM users u WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      UNION ALL
      SELECT 'grade_posted' as type, CONCAT('Grade posted for ', s.subject_name) as description, g.created_at as timestamp
      FROM grades g JOIN subjects s ON g.subject_id = s.id WHERE g.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      UNION ALL
      SELECT 'payment_made' as type, CONCAT('Payment of ', fp.amount, ' RWF received') as description, fp.created_at as timestamp
      FROM fee_payments fp WHERE fp.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY timestamp DESC LIMIT 20
    `);

    res.json({ success: true, activities });
  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/dashboard/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [notifications] = await pool.execute(`
      SELECT n.*, u.first_name, u.last_name,
             CASE WHEN nr.id IS NULL THEN false ELSE true END as is_read
      FROM notifications n
      JOIN users u ON n.sent_by = u.id
      LEFT JOIN notification_reads nr ON n.id = nr.notification_id AND nr.user_id = ?
      WHERE n.expires_at > NOW()
      ORDER BY n.created_at DESC LIMIT 10
    `, [userId]);

    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/dashboard/mark-notification-read/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.execute(
      'INSERT IGNORE INTO notification_reads (notification_id, user_id) VALUES (?, ?)',
      [id, userId]
    );

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================== USER MANAGEMENT APIs (15 APIs) ===============================
router.get('/users/search', authenticateToken, async (req, res) => {
  try {
    const { query, role, status } = req.query;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (query) {
      whereClause += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.username LIKE ?)';
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (role) {
      whereClause += ' AND r.name = ?';
      params.push(role);
    }

    if (status !== undefined) {
      whereClause += ' AND u.is_active = ?';
      params.push(status === 'active' ? 1 : 0);
    }

    const [users] = await pool.execute(`
      SELECT u.*, r.name as role_name, r.description as role_description
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ${whereClause}
      ORDER BY u.created_at DESC LIMIT 50
    `, params);

    res.json({ success: true, users: users.map(u => ({ ...u, password_hash: undefined })) });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/users/:id/profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await pool.execute(`
      SELECT u.*, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    delete user.password_hash;

    res.json({ success: true, user });
  } catch (error) {
    console.error('User profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/users/:id/profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, address, avatar } = req.body;

    await pool.execute(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ?, avatar = ?, updated_at = NOW() WHERE id = ?',
      [first_name, last_name, phone, address, avatar, id]
    );

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/users/:id/change-password', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { current_password, new_password } = req.body;
    const bcrypt = require('bcryptjs');

    // Verify current password
    const [users] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isValid = await bcrypt.compare(current_password, users[0].password_hash);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, id]);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/users/:id/reset-password', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const bcrypt = require('bcryptjs');
    const defaultPassword = await bcrypt.hash('password123', 10);

    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [defaultPassword, id]);

    res.json({ success: true, message: 'Password reset to default' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/users/:id/status', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    await pool.execute('UPDATE users SET is_active = ? WHERE id = ?', [is_active, id]);

    res.json({ success: true, message: `User ${is_active ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/users/:id', authenticateToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM users WHERE id = ?', [id]);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================== STUDENT MANAGEMENT APIs (20 APIs) ===============================
router.get('/students/list', authenticateToken, async (req, res) => {
  try {
    const { class_id, course_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE u.role_id = (SELECT id FROM roles WHERE name = "student")';
    const params = [];

    if (class_id) {
      whereClause += ' AND e.class_id = ?';
      params.push(class_id);
    }

    if (course_id) {
      whereClause += ' AND cl.course_id = ?';
      params.push(course_id);
    }

    const [students] = await pool.execute(`
      SELECT u.*, cl.name as class_name, c.name as course_name,
             spm.average_grade, spm.attendance_rate, spm.conduct_rating
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id
      LEFT JOIN classes cl ON e.class_id = cl.id
      LEFT JOIN courses c ON cl.course_id = c.id
      LEFT JOIN student_performance_metrics spm ON u.id = spm.student_id
      ${whereClause}
      ORDER BY u.last_name, u.first_name
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id
      LEFT JOIN classes cl ON e.class_id = cl.id
      ${whereClause}
    `, params);

    res.json({
      success: true,
      students: students.map(s => ({ ...s, password_hash: undefined })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Students list error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/students/:id/performance', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [performance] = await pool.execute(`
      SELECT spm.*, ay.name as academic_year
      FROM student_performance_metrics spm
      JOIN academic_years ay ON spm.academic_year_id = ay.id
      WHERE spm.student_id = ?
      ORDER BY ay.start_date DESC
    `, [id]);

    const [grades] = await pool.execute(`
      SELECT g.*, s.subject_name, s.subject_code
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      WHERE g.student_id = ?
      ORDER BY g.assessment_date DESC LIMIT 50
    `, [id]);

    const [attendance] = await pool.execute(`
      SELECT a.*, cl.name as class_name, s.subject_name
      FROM attendance a
      JOIN classes cl ON a.class_id = cl.id
      JOIN subjects s ON a.subject_id = s.id
      WHERE a.student_id = ?
      ORDER BY a.date DESC LIMIT 100
    `, [id]);

    res.json({
      success: true,
      performance: performance,
      grades: grades,
      attendance: attendance
    });
  } catch (error) {
    console.error('Student performance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/students/:id/discipline', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [cases] = await pool.execute(`
      SELECT dc.*, dcc.category_name, dcc.severity_level,
             u.first_name, u.last_name as reported_by_name
      FROM discipline_cases dc
      JOIN discipline_categories dcc ON dc.category_id = dcc.id
      JOIN users u ON dc.reported_by = u.id
      WHERE dc.student_id = ?
      ORDER BY dc.created_at DESC
    `, [id]);

    res.json({ success: true, disciplineCases: cases });
  } catch (error) {
    console.error('Student discipline error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/students/:id/grades', authenticateToken, requireRole('teacher', 'director_study'), async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_id, obtained_marks, max_marks, assessment_type, assessment_date } = req.body;

    await pool.execute(`
      INSERT INTO grades (student_id, subject_id, obtained_marks, max_marks, assessment_type, assessment_date, teacher_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, subject_id, obtained_marks, max_marks, assessment_type, assessment_date, req.user.id]);

    res.json({ success: true, message: 'Grade added successfully' });
  } catch (error) {
    console.error('Add grade error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/students/:id/grades/:gradeId', authenticateToken, requireRole('teacher', 'director_study'), async (req, res) => {
  try {
    const { gradeId } = req.params;
    const { obtained_marks, max_marks, assessment_type } = req.body;

    await pool.execute(
      'UPDATE grades SET obtained_marks = ?, max_marks = ?, assessment_type = ? WHERE id = ?',
      [obtained_marks, max_marks, assessment_type, gradeId]
    );

    res.json({ success: true, message: 'Grade updated successfully' });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/students/:id/attendance', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const { class_id, subject_id, date, status } = req.body;

    await pool.execute(`
      INSERT INTO attendance (student_id, class_id, subject_id, date, status, marked_by)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by)
    `, [id, class_id, subject_id, date, status, req.user.id]);

    res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/students/:id/discipline-case', authenticateToken, requireRole('teacher', 'director_discipline'), async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, description, severity_level, action_taken } = req.body;

    await pool.execute(`
      INSERT INTO discipline_cases (student_id, category_id, description, severity_level, action_taken, reported_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, category_id, description, severity_level, action_taken, req.user.id]);

    res.json({ success: true, message: 'Discipline case recorded successfully' });
  } catch (error) {
    console.error('Add discipline case error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================== TEACHER MANAGEMENT APIs (15 APIs) ===============================
router.get('/teachers/list', authenticateToken, async (req, res) => {
  try {
    const [teachers] = await pool.execute(`
      SELECT u.*, r.name as role_name,
             COUNT(DISTINCT c.id) as classes_count,
             COUNT(DISTINCT e.student_id) as students_count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN classes c ON c.teacher_id = u.id
      LEFT JOIN enrollments e ON c.id = e.class_id
      WHERE r.name IN ('teacher', 'director_study', 'director_discipline', 'headmaster')
      AND u.is_active = true
      GROUP BY u.id
      ORDER BY u.last_name, u.first_name
    `);

    res.json({ success: true, teachers: teachers.map(t => ({ ...t, password_hash: undefined })) });
  } catch (error) {
    console.error('Teachers list error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/teachers/:id/classes', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [classes] = await pool.execute(`
      SELECT c.*, co.name as course_name, co.code as course_code,
             COUNT(e.student_id) as student_count,
             AVG(spm.average_grade) as average_performance
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      LEFT JOIN enrollments e ON c.id = e.class_id
      LEFT JOIN student_performance_metrics spm ON e.student_id = spm.student_id
      WHERE c.teacher_id = ?
      GROUP BY c.id
      ORDER BY c.name
    `, [id]);

    res.json({ success: true, classes });
  } catch (error) {
    console.error('Teacher classes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/teachers/:id/schedule', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { week_start } = req.query;

    const [schedule] = await pool.execute(`
      SELECT s.*, c.name as class_name, co.name as course_name,
             r.room_name, sub.subject_name
      FROM schedules s
      JOIN classes c ON s.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      JOIN rooms r ON s.room_id = r.id
      JOIN subjects sub ON s.subject_id = sub.id
      WHERE c.teacher_id = ?
      ORDER BY s.day_of_week, s.start_time
    `, [id]);

    res.json({ success: true, schedule });
  } catch (error) {
    console.error('Teacher schedule error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/teachers/:id/assign-class', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { class_id } = req.body;

    await pool.execute('UPDATE classes SET teacher_id = ? WHERE id = ?', [id, class_id]);

    res.json({ success: true, message: 'Class assigned successfully' });
  } catch (error) {
    console.error('Assign class error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================== CLASS MANAGEMENT APIs (10 APIs) ===============================
router.get('/classes/list', authenticateToken, async (req, res) => {
  try {
    const { course_id, academic_year_id } = req.query;

    let whereClause = 'WHERE c.is_active = true';
    const params = [];

    if (course_id) {
      whereClause += ' AND c.course_id = ?';
      params.push(course_id);
    }

    if (academic_year_id) {
      whereClause += ' AND c.academic_year_id = ?';
      params.push(academic_year_id);
    }

    const [classes] = await pool.execute(`
      SELECT c.*, co.name as course_name, co.code as course_code,
             ay.name as academic_year, u.first_name, u.last_name as teacher_name,
             COUNT(e.student_id) as student_count
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      JOIN academic_years ay ON c.academic_year_id = ay.id
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN enrollments e ON c.id = e.class_id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.name
    `, params);

    res.json({ success: true, classes });
  } catch (error) {
    console.error('Classes list error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/classes/:id/students', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [students] = await pool.execute(`
      SELECT u.*, e.enrollment_date,
             spm.average_grade, spm.attendance_rate, spm.conduct_rating
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      LEFT JOIN student_performance_metrics spm ON u.id = spm.student_id
      WHERE e.class_id = ? AND e.status = 'active'
      ORDER BY u.last_name, u.first_name
    `, [id]);

    res.json({ success: true, students: students.map(s => ({ ...s, password_hash: undefined })) });
  } catch (error) {
    console.error('Class students error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/classes/:id/enroll-student', authenticateToken, requireRole('admin', 'headmaster', 'director_study'), async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id } = req.body;

    await pool.execute(`
      INSERT INTO enrollments (student_id, class_id, enrollment_date, status)
      VALUES (?, ?, CURDATE(), 'active')
      ON DUPLICATE KEY UPDATE status = 'active'
    `, [student_id, id]);

    res.json({ success: true, message: 'Student enrolled successfully' });
  } catch (error) {
    console.error('Enroll student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================== COURSE MANAGEMENT APIs (10 APIs) ===============================
router.get('/courses/list', authenticateToken, async (req, res) => {
  try {
    const [courses] = await pool.execute(`
      SELECT c.*, COUNT(cl.id) as classes_count,
             COUNT(DISTINCT e.student_id) as total_students
      FROM courses c
      LEFT JOIN classes cl ON c.id = cl.course_id
      LEFT JOIN enrollments e ON cl.id = e.class_id
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.name
    `);

    res.json({ success: true, courses });
  } catch (error) {
    console.error('Courses list error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/courses/:id/subjects', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [subjects] = await pool.execute(`
      SELECT s.*, u.first_name, u.last_name as teacher_name
      FROM subjects s
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE s.course_id = ? AND s.is_active = true
      ORDER BY s.subject_name
    `, [id]);

    res.json({ success: true, subjects });
  } catch (error) {
    console.error('Course subjects error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================== ACADEMIC MANAGEMENT APIs (10 APIs) ===============================
router.get('/academic/years', authenticateToken, async (req, res) => {
  try {
    const [years] = await pool.execute(`
      SELECT ay.*, COUNT(c.id) as classes_count,
             COUNT(DISTINCT e.student_id) as students_count
      FROM academic_years ay
      LEFT JOIN classes c ON ay.id = c.academic_year_id
      LEFT JOIN enrollments e ON c.id = e.class_id
      GROUP BY ay.id
      ORDER BY ay.start_date DESC
    `);

    res.json({ success: true, academicYears: years });
  } catch (error) {
    console.error('Academic years error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/academic/subjects', authenticateToken, async (req, res) => {
  try {
    const [subjects] = await pool.execute(`
      SELECT s.*, c.name as course_name, u.first_name, u.last_name as teacher_name
      FROM subjects s
      JOIN courses c ON s.course_id = c.id
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE s.is_active = true
      ORDER BY c.name, s.subject_name
    `);

    res.json({ success: true, subjects });
  } catch (error) {
    console.error('Subjects error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================== DISCIPLINE MANAGEMENT APIs (10 APIs) ===============================
router.get('/discipline/cases', authenticateToken, async (req, res) => {
  try {
    const { status, category_id, student_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND dc.status = ?';
      params.push(status);
    }

    if (category_id) {
      whereClause += ' AND dc.category_id = ?';
      params.push(category_id);
    }

    if (student_id) {
      whereClause += ' AND dc.student_id = ?';
      params.push(student_id);
    }

    const [cases] = await pool.execute(`
      SELECT dc.*, dcc.category_name, dcc.severity_level,
             u.first_name, u.last_name as student_name,
             r.first_name, r.last_name as reported_by_name
      FROM discipline_cases dc
      JOIN discipline_categories dcc ON dc.category_id = dcc.id
      JOIN users u ON dc.student_id = u.id
      JOIN users r ON dc.reported_by = r.id
      ${whereClause}
      ORDER BY dc.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total FROM discipline_cases dc ${whereClause}
    `, params);

    res.json({
      success: true,
      cases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Discipline cases error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/discipline/categories', authenticateToken, async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT dc.*, COUNT(d.case_id) as cases_count
      FROM discipline_categories dc
      LEFT JOIN discipline_cases d ON dc.id = d.category_id
      GROUP BY dc.id
      ORDER BY dc.category_name
    `);

    res.json({ success: true, categories });
  } catch (error) {
    console.error('Discipline categories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/discipline/cases', authenticateToken, requireRole('teacher', 'director_discipline'), async (req, res) => {
  try {
    const { student_id, category_id, description, severity_level, action_taken } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO discipline_cases (student_id, category_id, description, severity_level, action_taken, reported_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [student_id, category_id, description, severity_level, action_taken, req.user.id]);

    res.status(201).json({ success: true, message: 'Discipline case created successfully', caseId: result.insertId });
  } catch (error) {
    console.error('Create discipline case error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/discipline/cases/:id', authenticateToken, requireRole('director_discipline', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, action_taken, resolution_notes } = req.body;

    await pool.execute(
      'UPDATE discipline_cases SET status = ?, action_taken = ?, resolution_notes = ?, resolved_by = ?, resolved_at = NOW() WHERE id = ?',
      [status, action_taken, resolution_notes, req.user.id, id]
    );

    res.json({ success: true, message: 'Discipline case updated successfully' });
  } catch (error) {
    console.error('Update discipline case error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================== FINANCE MANAGEMENT APIs (10 APIs) ===============================
router.get('/finance/fees', authenticateToken, async (req, res) => {
  try {
    const { status, student_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND fp.status = ?';
      params.push(status);
    }

    if (student_id) {
      whereClause += ' AND fp.student_id = ?';
      params.push(student_id);
    }

    const [fees] = await pool.execute(`
      SELECT fp.*, u.first_name, u.last_name as student_name,
             u.student_id as student_number
      FROM fee_payments fp
      JOIN users u ON fp.student_id = u.id
      ${whereClause}
      ORDER BY fp.due_date DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total FROM fee_payments fp ${whereClause}
    `, params);

    res.json({
      success: true,
      fees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Fees error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/finance/record-payment', authenticateToken, requireRole('accountant', 'admin'), async (req, res) => {
  try {
    const { student_id, amount, payment_method, transaction_id, notes } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO fee_payments (student_id, amount, payment_method, transaction_id, status, payment_date, recorded_by, notes)
      VALUES (?, ?, ?, ?, 'paid', CURDATE(), ?, ?)
    `, [student_id, amount, payment_method, transaction_id, req.user.id, notes]);

    res.status(201).json({ success: true, message: 'Payment recorded', paymentId: result.insertId });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;