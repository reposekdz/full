// Universal Dashboard Enhancement - Rich Features for All Roles
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// ==================== UNIVERSAL DASHBOARD STATS ====================

router.get('/universal/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    const stats = {
      role: userRole,
      user_id: userId,
      timestamp: new Date().toISOString()
    };

    // Get role-specific statistics
    switch(userRole) {
      case 'student':
        stats.data = await getStudentStats(userId);
        break;
      case 'teacher':
        stats.data = await getTeacherStats(userId);
        break;
      case 'parent':
        stats.data = await getParentStats(userId);
        break;
      case 'dos':
      case 'director_study':
        stats.data = await getDOSStats(userId);
        break;
      case 'dod':
      case 'director_discipline':
      case 'patron':
      case 'matron':
        stats.data = await getDODStats(userId);
        break;
      case 'headmaster':
        stats.data = await getHeadmasterStats(userId);
        break;
      case 'accountant':
        stats.data = await getAccountantStats(userId);
        break;
      case 'stock_manager':
        stats.data = await getStockManagerStats(userId);
        break;
      case 'admin':
        stats.data = await getAdminStats(userId);
        break;
      default:
        stats.data = await getBasicStats(userId);
    }

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Universal stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ROLE-SPECIFIC STAT FUNCTIONS ====================

async function getStudentStats(userId) {
  const [[profile]] = await pool.execute(`
    SELECT gss.*, 
      CONCAT(u.first_name, ' ', u.last_name) as full_name,
      u.email, u.phone
    FROM global_student_sheets gss
    JOIN users u ON gss.student_id = u.id
    WHERE gss.student_id = ?
  `, [userId]);

  const [[attendance]] = await pool.execute(`
    SELECT 
      COUNT(*) as total_days,
      SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
      ROUND(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as attendance_rate
    FROM student_attendance
    WHERE student_id = ? AND attendance_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  `, [userId]);

  const [marks] = await pool.execute(`
    SELECT subject_code, subject_name, final_marks, term, academic_year
    FROM student_marks
    WHERE student_id = ?
    ORDER BY created_at DESC
    LIMIT 10
  `, [userId]);

  const [[conduct]] = await pool.execute(`
    SELECT 
      COUNT(*) as total_incidents,
      SUM(CASE WHEN severity = 'major' THEN 1 ELSE 0 END) as major_incidents,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_incidents
    FROM student_conduct_records
    WHERE student_id = ?
  `, [userId]);

  return {
    profile: profile || {},
    attendance: attendance || {},
    recent_marks: marks || [],
    conduct: conduct || {},
    gpa: profile?.gpa || 0,
    conduct_score: profile?.conduct_score || 100
  };
}

async function getTeacherStats(userId) {
  const [[profile]] = await pool.execute(`
    SELECT u.*, 
      CONCAT(u.first_name, ' ', u.last_name) as full_name
    FROM users u
    WHERE u.id = ?
  `, [userId]);

  const [classes] = await pool.execute(`
    SELECT COUNT(DISTINCT c.id) as total_classes
    FROM classes c
    WHERE c.teacher_id = ? AND c.is_active = 1
  `, [userId]);

  const [students] = await pool.execute(`
    SELECT COUNT(DISTINCT e.student_id) as total_students
    FROM classes c
    JOIN enrollments e ON c.id = e.class_id
    WHERE c.teacher_id = ?
  `, [userId]);

  const [[pendingGrading]] = await pool.execute(`
    SELECT COUNT(*) as pending_count
    FROM grades
    WHERE teacher_id = ? AND grade_letter IS NULL
  `, [userId]);

  const [todaySchedule] = await pool.execute(`
    SELECT COUNT(*) as classes_today
    FROM timetable_assignments
    WHERE teacher_id = ? AND day_of_week = DAYOFWEEK(NOW())
  `, [userId]);

  return {
    profile: profile || {},
    total_classes: classes[0]?.total_classes || 0,
    total_students: students[0]?.total_students || 0,
    pending_grading: pendingGrading?.pending_count || 0,
    classes_today: todaySchedule[0]?.classes_today || 0
  };
}

async function getParentStats(userId) {
  const [children] = await pool.execute(`
    SELECT 
      u.id, u.first_name, u.last_name,
      gss.trade_name, gss.level_number, gss.gpa, gss.attendance_percentage, gss.conduct_score
    FROM parent_connections pc
    JOIN users u ON pc.student_id = u.id
    LEFT JOIN global_student_sheets gss ON u.id = gss.student_id
    WHERE pc.parent_id = ? AND pc.status = 'active'
  `, [userId]);

  const stats = {
    total_children: children.length,
    children: children || [],
    avg_gpa: children.reduce((sum, c) => sum + (c.gpa || 0), 0) / (children.length || 1),
    avg_attendance: children.reduce((sum, c) => sum + (c.attendance_percentage || 0), 0) / (children.length || 1)
  };

  return stats;
}

async function getDOSStats(userId) {
  const [[students]] = await pool.execute(`
    SELECT COUNT(*) as total FROM users WHERE role = 'student' AND status = 'active'
  `);

  const [[teachers]] = await pool.execute(`
    SELECT COUNT(*) as total FROM users WHERE role = 'teacher' AND status = 'active'
  `);

  const [[avgGPA]] = await pool.execute(`
    SELECT AVG(gpa) as avg_gpa FROM global_student_sheets WHERE status = 'active'
  `);

  const [[avgAttendance]] = await pool.execute(`
    SELECT AVG(attendance_percentage) as avg_attendance FROM global_student_sheets WHERE status = 'active'
  `);

  const [exams] = await pool.execute(`
    SELECT COUNT(*) as upcoming FROM exams WHERE exam_date >= CURDATE() AND status = 'scheduled'
  `);

  const [reports] = await pool.execute(`
    SELECT COUNT(*) as pending FROM report_cards WHERE status = 'draft'
  `);

  return {
    total_students: students?.total || 0,
    total_teachers: teachers?.total || 0,
    avg_gpa: parseFloat(avgGPA?.avg_gpa || 0).toFixed(2),
    avg_attendance: parseFloat(avgAttendance?.avg_attendance || 0).toFixed(2),
    upcoming_exams: exams[0]?.upcoming || 0,
    pending_reports: reports[0]?.pending || 0
  };
}

async function getDODStats(userId) {
  const [[totalStudents]] = await pool.execute(`
    SELECT COUNT(*) as total FROM users WHERE role = 'student' AND status = 'active'
  `);

  const [[conductIncidents]] = await pool.execute(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN severity = 'major' THEN 1 ELSE 0 END) as major
    FROM student_conduct_records
    WHERE incident_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  `);

  const [[avgConduct]] = await pool.execute(`
    SELECT AVG(conduct_score) as avg_score FROM global_student_sheets WHERE status = 'active'
  `);

  const [lowConduct] = await pool.execute(`
    SELECT COUNT(*) as count FROM global_student_sheets WHERE conduct_score < 70 AND status = 'active'
  `);

  const [leaveRequests] = await pool.execute(`
    SELECT COUNT(*) as pending FROM leave_requests WHERE status = 'pending'
  `);

  return {
    total_students: totalStudents?.total || 0,
    total_incidents: conductIncidents?.total || 0,
    pending_incidents: conductIncidents?.pending || 0,
    major_incidents: conductIncidents?.major || 0,
    avg_conduct_score: parseFloat(avgConduct?.avg_score || 100).toFixed(2),
    low_conduct_students: lowConduct[0]?.count || 0,
    pending_leave_requests: leaveRequests[0]?.pending || 0
  };
}

async function getHeadmasterStats(userId) {
  const [[students]] = await pool.execute(`
    SELECT COUNT(*) as total FROM users WHERE role = 'student' AND status = 'active'
  `);

  const [[staff]] = await pool.execute(`
    SELECT COUNT(*) as total FROM users WHERE role IN ('teacher', 'dos', 'dod', 'accountant', 'stock_manager') AND status = 'active'
  `);

  const [[financial]] = await pool.execute(`
    SELECT 
      SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as collected,
      SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending
    FROM fee_payments
    WHERE payment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  `);

  const [[attendance]] = await pool.execute(`
    SELECT AVG(attendance_percentage) as avg FROM global_student_sheets WHERE status = 'active'
  `);

  const [applications] = await pool.execute(`
    SELECT COUNT(*) as pending FROM student_applications WHERE status = 'pending_headmaster'
  `);

  return {
    total_students: students?.total || 0,
    total_staff: staff?.total || 0,
    revenue_this_month: financial?.collected || 0,
    pending_payments: financial?.pending || 0,
    avg_attendance: parseFloat(attendance?.avg || 0).toFixed(2),
    pending_applications: applications[0]?.pending || 0
  };
}

async function getAccountantStats(userId) {
  const [[payments]] = await pool.execute(`
    SELECT 
      SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_collected,
      SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending,
      SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as total_overdue,
      COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count
    FROM fee_payments
  `);

  const [[thisMonth]] = await pool.execute(`
    SELECT SUM(amount) as collected
    FROM fee_payments
    WHERE status = 'paid' AND payment_date >= DATE_FORMAT(NOW(), '%Y-%m-01')
  `);

  const [recentPayments] = await pool.execute(`
    SELECT COUNT(*) as count
    FROM fee_payments
    WHERE status = 'paid' AND payment_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  `);

  return {
    total_collected: payments?.total_collected || 0,
    total_pending: payments?.total_pending || 0,
    total_overdue: payments?.total_overdue || 0,
    paid_count: payments?.paid_count || 0,
    collected_this_month: thisMonth?.collected || 0,
    recent_payments: recentPayments[0]?.count || 0
  };
}

async function getStockManagerStats(userId) {
  const [[inventory]] = await pool.execute(`
    SELECT 
      COUNT(*) as total_items,
      SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
      SUM(CASE WHEN quantity <= reorder_level AND quantity > 0 THEN 1 ELSE 0 END) as low_stock,
      SUM(quantity * unit_price) as total_value
    FROM stock_items
  `);

  const [recentTransactions] = await pool.execute(`
    SELECT COUNT(*) as count
    FROM stock_transactions
    WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  `);

  const [pendingOrders] = await pool.execute(`
    SELECT COUNT(*) as count
    FROM stock_orders
    WHERE status = 'pending'
  `);

  return {
    total_items: inventory?.total_items || 0,
    out_of_stock: inventory?.out_of_stock || 0,
    low_stock: inventory?.low_stock || 0,
    total_value: inventory?.total_value || 0,
    recent_transactions: recentTransactions[0]?.count || 0,
    pending_orders: pendingOrders[0]?.count || 0
  };
}

async function getAdminStats(userId) {
  const [[users]] = await pool.execute(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as active_this_week
    FROM users
  `);

  const [[students]] = await pool.execute(`
    SELECT COUNT(*) as total FROM users WHERE role = 'student' AND status = 'active'
  `);

  const [[staff]] = await pool.execute(`
    SELECT COUNT(*) as total FROM users WHERE role != 'student' AND role != 'parent' AND status = 'active'
  `);

  const [systemLogs] = await pool.execute(`
    SELECT COUNT(*) as count FROM activity_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
  `);

  return {
    total_users: users?.total || 0,
    active_users: users?.active || 0,
    active_this_week: users?.active_this_week || 0,
    total_students: students?.total || 0,
    total_staff: staff?.total || 0,
    system_logs_24h: systemLogs[0]?.count || 0
  };
}

async function getBasicStats(userId) {
  return {
    message: 'Basic stats for unrecognized role',
    user_id: userId
  };
}

// ==================== UNIVERSAL NOTIFICATIONS ====================

router.get('/universal/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, unread_only = false } = req.query;

    let query = `
      SELECT * FROM notifications
      WHERE user_id = ?
    `;
    const params = [userId];

    if (unread_only === 'true') {
      query += ` AND is_read = 0`;
    }

    query += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(parseInt(limit));

    const [notifications] = await pool.execute(query, params);

    const [[unreadCount]] = await pool.execute(`
      SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0
    `, [userId]);

    res.json({
      success: true,
      notifications,
      unread_count: unreadCount?.count || 0
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark notification as read
router.put('/universal/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await pool.execute(`
      UPDATE notifications SET is_read = 1, read_at = NOW()
      WHERE id = ? AND user_id = ?
    `, [id, userId]);

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== UNIVERSAL RECENT ACTIVITIES ====================

router.get('/universal/activities', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { limit = 15 } = req.query;

    let activities = [];

    // Get role-specific activities
    if (userRole === 'student') {
      const [marks] = await pool.execute(`
        SELECT 'mark_added' as type, CONCAT('New mark: ', subject_name, ' - ', final_marks) as description, created_at
        FROM student_marks WHERE student_id = ? ORDER BY created_at DESC LIMIT ?
      `, [userId, parseInt(limit)]);
      activities = marks;
    } else if (userRole === 'teacher') {
      const [grading] = await pool.execute(`
        SELECT 'grading' as type, CONCAT('Graded ', subject_name) as description, created_at
        FROM grades WHERE teacher_id = ? ORDER BY created_at DESC LIMIT ?
      `, [userId, parseInt(limit)]);
      activities = grading;
    } else if (['dos', 'dod', 'headmaster', 'admin'].includes(userRole)) {
      const [logs] = await pool.execute(`
        SELECT action as type, description, created_at
        FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
      `, [userId, parseInt(limit)]);
      activities = logs;
    }

    res.json({ success: true, activities });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== UNIVERSAL QUICK ACTIONS ====================

router.get('/universal/quick-actions', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    
    const actions = getQuickActionsForRole(userRole);
    
    res.json({ success: true, actions });
  } catch (error) {
    console.error('Get quick actions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

function getQuickActionsForRole(role) {
  const actionMap = {
    student: [
      { id: 'view_marks', label: 'View Marks', icon: 'grade', route: '/student/marks' },
      { id: 'view_attendance', label: 'View Attendance', icon: 'calendar', route: '/student/attendance' },
      { id: 'view_timetable', label: 'View Timetable', icon: 'schedule', route: '/student/timetable' }
    ],
    teacher: [
      { id: 'mark_attendance', label: 'Mark Attendance', icon: 'check', route: '/teacher/attendance' },
      { id: 'enter_marks', label: 'Enter Marks', icon: 'edit', route: '/teacher/marks' },
      { id: 'view_classes', label: 'View Classes', icon: 'class', route: '/teacher/classes' }
    ],
    parent: [
      { id: 'view_children', label: 'View Children', icon: 'people', route: '/parent/children' },
      { id: 'view_reports', label: 'View Reports', icon: 'description', route: '/parent/reports' },
      { id: 'contact_school', label: 'Contact School', icon: 'message', route: '/parent/contact' }
    ],
    dos: [
      { id: 'manage_students', label: 'Manage Students', icon: 'people', route: '/dos/students' },
      { id: 'schedule_exams', label: 'Schedule Exams', icon: 'event', route: '/dos/exams' },
      { id: 'generate_reports', label: 'Generate Reports', icon: 'assessment', route: '/dos/reports' }
    ],
    dod: [
      { id: 'view_conduct', label: 'View Conduct', icon: 'gavel', route: '/dod/conduct' },
      { id: 'approve_leave', label: 'Approve Leave', icon: 'check_circle', route: '/dod/leave' },
      { id: 'send_sms', label: 'Send SMS', icon: 'sms', route: '/dod/sms' }
    ],
    headmaster: [
      { id: 'view_overview', label: 'School Overview', icon: 'dashboard', route: '/headmaster/overview' },
      { id: 'approve_applications', label: 'Approve Applications', icon: 'assignment', route: '/headmaster/applications' },
      { id: 'view_reports', label: 'View Reports', icon: 'bar_chart', route: '/headmaster/reports' }
    ],
    accountant: [
      { id: 'record_payment', label: 'Record Payment', icon: 'payment', route: '/accountant/payments' },
      { id: 'view_reports', label: 'Financial Reports', icon: 'account_balance', route: '/accountant/reports' },
      { id: 'manage_fees', label: 'Manage Fees', icon: 'money', route: '/accountant/fees' }
    ],
    stock_manager: [
      { id: 'add_item', label: 'Add Item', icon: 'add_box', route: '/stock/add' },
      { id: 'view_inventory', label: 'View Inventory', icon: 'inventory', route: '/stock/inventory' },
      { id: 'create_order', label: 'Create Order', icon: 'shopping_cart', route: '/stock/orders' }
    ],
    admin: [
      { id: 'manage_users', label: 'Manage Users', icon: 'people', route: '/admin/users' },
      { id: 'system_settings', label: 'System Settings', icon: 'settings', route: '/admin/settings' },
      { id: 'view_logs', label: 'View Logs', icon: 'history', route: '/admin/logs' }
    ]
  };

  return actionMap[role] || [];
}

module.exports = router;
