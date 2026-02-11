const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const crypto = require('crypto');

/**
 * ENHANCED PARENT PORTAL API
 * Complete parent portal with children monitoring, payments, communications
 */

// ============================================
// UTILITY FUNCTIONS
// ============================================

const generateParentId = () => {
  return 'PAR-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

const generateMessageId = () => {
  return 'MSG-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex');
};

// ============================================
// PARENT AUTH & REGISTRATION
// ============================================

// Register parent
router.post('/register', async (req, res) => {
  try {
    const {
      email, password, first_name, last_name, phone, whatsapp_number,
      id_number, id_type, occupation, employer, relationship_to_student,
      preferred_language, communication_preference
    } = req.body;
    
    // Check if phone exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }
    
    // Get parent role
    const [roles] = await pool.execute("SELECT id FROM roles WHERE name = 'parent'");
    if (roles.length === 0) {
      return res.status(500).json({ success: false, message: 'Parent role not found' });
    }
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    const parentId = generateParentId();
    
    // Create user
    const [userResult] = await pool.execute(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [`${parentId}_user`, email, hashedPassword, first_name, last_name, phone, roles[0].id]);
    
    // Create parent profile
    await pool.execute(`
      INSERT INTO parent_profiles 
      (user_id, parent_id, first_name, last_name, email, phone, whatsapp_number, 
       id_number, id_type, occupation, employer, relationship_to_student, 
       preferred_language, communication_preference)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userResult.insertId, parentId, first_name, last_name, email, phone, whatsapp_number,
      id_number, id_type || 'national_id', occupation, employer, relationship_to_student || 'guardian',
      preferred_language || 'en', communication_preference || 'sms'
    ]);
    
    // Create notification settings
    await pool.execute(`
      INSERT INTO parent_notification_settings (parent_id) VALUES (?)
    `, [parentId]);
    
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: userResult.insertId, parentId, role: 'parent' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    res.status(201).json({
      success: true,
      message: 'Parent account created successfully',
      token,
      parent: { parent_id: parentId, first_name, last_name, phone, email }
    });
  } catch (error) {
    console.error('Parent Registration Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PARENT DASHBOARD
// ============================================

router.get('/dashboard', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.parentId || req.user.username;
    
    // Get parent profile
    const [parents] = await pool.execute(
      'SELECT * FROM parent_profiles WHERE parent_id = ?',
      [parentId]
    );
    
    if (parents.length === 0) {
      return res.status(404).json({ success: false, message: 'Parent profile not found' });
    }
    
    const parent = parents[0];
    
    // Get linked children
    const [children] = await pool.execute(`
      SELECT gs.*, 
             spl.relationship_type, spl.is_primary, spl.can_view_grades,
             spl.can_view_attendance, spl.can_view_discipline, spl.can_view_fees
      FROM student_parent_links spl
      JOIN global_student_sheets gs ON spl.student_id = gs.student_id
      WHERE spl.parent_id = ? AND spl.link_status = 'active'
      ORDER BY spl.is_primary DESC
    `, [parentId]);
    
    // Get children details
    const childrenData = await Promise.all(children.map(async (child) => {
      const [attendance] = await pool.execute(`
        SELECT 
          COUNT(*) as total_days,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days
        FROM student_attendance_records 
        WHERE student_id = ? AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      `, [child.student_id]);
      
      const [grades] = await pool.execute(`
        SELECT AVG(percentage) as avg_percentage
        FROM student_subject_performance 
        WHERE student_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `, [child.student_id]);
      
      const [finance] = await pool.execute(`
        SELECT total_fees, paid_amount, balance, payment_status
        FROM global_student_sheets 
        WHERE student_id = ?
      `, [child.student_id]);
      
      const [discipline] = await pool.execute(`
        SELECT COUNT(*) as incidents
        FROM student_discipline_records 
        WHERE student_id = ? AND status = 'active'
        AND incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      `, [child.student_id]);
      
      const [recentAchievements] = await pool.execute(`
        SELECT * FROM student_achievements 
        WHERE student_id = ?
        ORDER BY date_awarded DESC
        LIMIT 3
      `, [child.student_id]);
      
      return {
        student: {
          id: child.student_id,
          code: child.student_code,
          name: `${child.first_name} ${child.last_name}`,
          trade: child.trade_code,
          level: child.level_number,
          profile_image: child.profile_image
        },
        attendance: {
          total_days: attendance[0]?.total_days || 0,
          present_days: attendance[0]?.present_days || 0,
          absent_days: attendance[0]?.absent_days || 0,
          rate: attendance[0]?.total_days > 0 
            ? ((attendance[0].present_days / attendance[0].total_days) * 100).toFixed(1)
            : 0
        },
        academics: {
          average_grade: grades[0]?.avg_percentage || 0,
          gpa: child.gpa || 0,
          overall_grade: child.overall_grade || 'N/A'
        },
        finance: {
          total_fees: parseFloat(finance[0]?.total_fees || 0),
          paid_amount: parseFloat(finance[0]?.paid_amount || 0),
          balance: parseFloat(finance[0]?.balance || 0),
          status: finance[0]?.payment_status || 'unknown'
        },
        discipline: {
          incidents_this_month: discipline[0]?.incidents || 0,
          conduct_score: child.conduct_score || 100
        },
        achievements: recentAchievements,
        permissions: {
          view_grades: child.can_view_grades,
          view_attendance: child.can_view_attendance,
          view_discipline: child.can_view_discipline,
          view_fees: child.can_view_fees
        }
      };
    }));
    
    // Get notifications
    const [notifications] = await pool.execute(`
      SELECT * FROM parent_notifications 
      WHERE parent_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [parentId]);
    
    // Get unread count
    const [[{ unreadCount }]] = await pool.execute(`
      SELECT COUNT(*) as unreadCount FROM parent_notifications 
      WHERE parent_id = ? AND is_read = false
    `, [parentId]);
    
    res.json({
      success: true,
      parent: {
        id: parent.parent_id,
        name: `${parent.first_name} ${parent.last_name}`,
        phone: parent.phone,
        email: parent.email,
        preferred_language: parent.preferred_language
      },
      summary: {
        total_children: childrenData.length,
        unread_notifications: unreadCount
      },
      children: childrenData,
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        priority: n.priority,
        is_read: n.is_read,
        created_at: n.created_at
      }))
    });
  } catch (error) {
    console.error('Parent Dashboard Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// CHILD ACADEMICS
// ============================================

router.get('/children/:studentId/grades', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.parentId || req.user.username;
    
    // Check authorization
    const [links] = await pool.execute(
      'SELECT id FROM student_parent_links WHERE parent_id = ? AND student_id = ? AND link_status = ? AND can_view_grades = ?',
      [parentId, studentId, 'active', true]
    );
    
    if (links.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied to this student\'s grades' });
    }
    
    const { academic_year, term } = req.query;
    
    let query = 'SELECT * FROM student_subject_performance WHERE student_id = ?';
    const params = [studentId];
    
    if (academic_year) { query += ' AND academic_year = ?'; params.push(academic_year); }
    if (term) { query += ' AND term = ?'; params.push(term); }
    
    query += ' ORDER BY term DESC, updated_at DESC';
    
    const [subjects] = await pool.execute(query, params);
    
    // Calculate performance
    const performance = {
      by_term: {},
      overall: {
        total_subjects: subjects.length,
        average_percentage: subjects.length > 0
          ? (subjects.reduce((sum, s) => sum + parseFloat(s.percentage || 0), 0) / subjects.length).toFixed(2)
          : 0,
        subjects_passed: subjects.filter(s => parseFloat(s.percentage) >= 50).length,
        subjects_failed: subjects.filter(s => parseFloat(s.percentage) < 50).length
      }
    };
    
    subjects.forEach(subject => {
      if (!performance.by_term[subject.term]) {
        performance.by_term[subject.term] = [];
      }
      performance.by_term[subject.term].push(subject);
    });
    
    res.json({ success: true, performance, subjects });
  } catch (error) {
    console.error('Get Grades Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// CHILD ATTENDANCE
// ============================================

router.get('/children/:studentId/attendance', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.parentId || req.user.username;
    const { month, year } = req.query;
    
    // Check authorization
    const [links] = await pool.execute(
      'SELECT id FROM student_parent_links WHERE parent_id = ? AND student_id = ? AND link_status = ? AND can_view_attendance = ?',
      [parentId, studentId, 'active', true]
    );
    
    if (links.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied to this student\'s attendance' });
    }
    
    let query = 'SELECT * FROM student_attendance_records WHERE student_id = ?';
    const params = [studentId];
    
    if (month && year) {
      query += ' AND MONTH(attendance_date) = ? AND YEAR(attendance_date) = ?';
      params.push(month, year);
    } else {
      query += ' AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    }
    
    query += ' ORDER BY attendance_date DESC';
    
    const [records] = await pool.execute(query, params);
    
    const summary = {
      total_days: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      excused: records.filter(r => r.status === 'excused').length,
      attendance_rate: records.length > 0
        ? ((records.filter(r => r.status === 'present').length / records.length) * 100).toFixed(2)
        : 0
    };
    
    res.json({ success: true, summary, records });
  } catch (error) {
    console.error('Get Attendance Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// CHILD FINANCE
// ============================================

router.get('/children/:studentId/finances', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.parentId || req.user.username;
    
    // Check authorization
    const [links] = await pool.execute(
      'SELECT id FROM student_parent_links WHERE parent_id = ? AND student_id = ? AND link_status = ? AND can_view_fees = ?',
      [parentId, studentId, 'active', true]
    );
    
    if (links.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied to this student\'s finances' });
    }
    
    const [student] = await pool.execute(
      'SELECT student_id, first_name, last_name, total_fees, paid_amount, balance, payment_status, last_payment_date FROM global_student_sheets WHERE student_id = ?',
      [studentId]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const [payments] = await pool.execute(`
      SELECT * FROM student_payment_records 
      WHERE student_id = ?
      ORDER BY payment_date DESC
      LIMIT 20
    `, [studentId]);
    
    const [feeStructure] = await pool.execute(`
      SELECT * FROM fee_items 
      WHERE student_id = ? OR student_id IS NULL
      ORDER BY category, item_name
    `, [studentId]);
    
    const summary = {
      total_fees: parseFloat(student[0].total_fees || 0),
      paid_amount: parseFloat(student[0].paid_amount || 0),
      balance: parseFloat(student[0].balance || 0),
      payment_status: student[0].payment_status,
      last_payment_date: student[0].last_payment_date,
      payment_percentage: student[0].total_fees > 0
        ? ((student[0].paid_amount / student[0].total_fees) * 100).toFixed(2)
        : 0
    };
    
    res.json({
      success: true,
      student: {
        id: student[0].student_id,
        name: `${student[0].first_name} ${student[0].last_name}`
      },
      summary,
      payment_history: payments,
      fee_structure: feeStructure
    });
  } catch (error) {
    console.error('Get Finances Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// CHILD DISCIPLINE
// ============================================

router.get('/children/:studentId/discipline', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.parentId || req.user.username;
    
    // Check authorization
    const [links] = await pool.execute(
      'SELECT id FROM student_parent_links WHERE parent_id = ? AND student_id = ? AND link_status = ? AND can_view_discipline = ?',
      [parentId, studentId, 'active', true]
    );
    
    if (links.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied to this student\'s discipline records' });
    }
    
    const [student] = await pool.execute(
      'SELECT conduct_score, conduct_grade, total_incidents, critical_incidents, high_incidents, medium_incidents, low_incidents FROM global_student_sheets WHERE student_id = ?',
      [studentId]
    );
    
    const [incidents] = await pool.execute(`
      SELECT * FROM student_discipline_records 
      WHERE student_id = ?
      ORDER BY incident_date DESC
      LIMIT 50
    `, [studentId]);
    
    const summary = {
      conduct_score: student[0]?.conduct_score || 100,
      conduct_grade: student[0]?.conduct_grade || 'A',
      total_incidents: student[0]?.total_incidents || 0,
      by_severity: {
        critical: student[0]?.critical_incidents || 0,
        high: student[0]?.high_incidents || 0,
        medium: student[0]?.medium_incidents || 0,
        low: student[0]?.low_incidents || 0
      }
    };
    
    res.json({ success: true, summary, incidents });
  } catch (error) {
    console.error('Get Discipline Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PARENT MESSAGES
// ============================================

router.post('/messages', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.parentId || req.user.username;
    const { student_id, recipient_type, recipient_id, subject, message, message_type, priority } = req.body;
    
    const messageId = generateMessageId();
    
    const [result] = await pool.execute(`
      INSERT INTO parent_messages 
      (message_id, parent_id, student_id, recipient_type, recipient_id, subject, message, message_type, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [messageId, parentId, student_id || null, recipient_type, recipient_id || null, subject, message, message_type || 'inquiry', priority || 'normal']);
    
    // Log activity
    await pool.execute(`
      INSERT INTO parent_activity_log (parent_id, student_id, activity_type, activity_details)
      VALUES (?, ?, 'contact_teacher', ?)
    `, [parentId, student_id, JSON.stringify({ message_id: messageId, subject })]);
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      message_id: messageId
    });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/messages', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.parentId || req.user.username;
    const { status } = req.query;
    
    let query = 'SELECT * FROM parent_messages WHERE parent_id = ?';
    const params = [parentId];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 50';
    
    const [messages] = await pool.execute(query, params);
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PAYMENT PROOF SUBMISSION
// ============================================

router.post('/children/:studentId/submit-payment', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.parentId || req.user.username;
    const { amount, payment_method, reference_number, payment_date, notes, proof_image } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO payment_proofs 
      (student_id, parent_id, parent_name, amount, payment_method, reference_number, payment_date, notes, proof_image, status, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [
      studentId, parentId, 
      `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
      amount, payment_method, reference_number, payment_date, notes, proof_image
    ]);
    
    // Log activity
    await pool.execute(`
      INSERT INTO parent_activity_log (parent_id, student_id, activity_type, activity_details)
      VALUES (?, ?, 'submit_payment', ?)
    `, [parentId, studentId, JSON.stringify({ proof_id: result.insertId, amount })]);
    
    res.status(201).json({
      success: true,
      message: 'Payment proof submitted successfully. It will be verified by the accountant.',
      proof_id: result.insertId
    });
  } catch (error) {
    console.error('Submit Payment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// NOTIFICATION SETTINGS
// ============================================

router.get('/settings/notifications', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.parentId || req.user.username;
    
    const [settings] = await pool.execute(
      'SELECT * FROM parent_notification_settings WHERE parent_id = ?',
      [parentId]
    );
    
    res.json({ success: true, settings: settings[0] || {} });
  } catch (error) {
    console.error('Get Notification Settings Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/settings/notifications', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.parentId || req.user.username;
    const settings = req.body;
    
    await pool.execute(`
      UPDATE parent_notification_settings 
      SET notify_on_grades = ?, notify_on_attendance = ?, notify_on_discipline = ?,
          notify_on_fees = ?, notify_on_events = ?, notify_on_announcements = ?,
          notify_on_assignments = ?, notify_on_exams = ?, notify_on_achievements = ?,
          notify_on_absences = ?, notify_on_late_arrivals = ?, notify_on_low_grades = ?,
          sms_enabled = ?, email_enabled = ?, whatsapp_enabled = ?
      WHERE parent_id = ?
    `, [
      settings.notify_on_grades !== false, settings.notify_on_attendance !== false,
      settings.notify_on_discipline !== false, settings.notify_on_fees !== false,
      settings.notify_on_events !== false, settings.notify_on_announcements !== false,
      settings.notify_on_assignments !== false, settings.notify_on_exams !== false,
      settings.notify_on_achievements !== false, settings.notify_on_absences !== false,
      settings.notify_on_late_arrivals !== false, settings.notify_on_low_grades !== false,
      settings.sms_enabled !== false, settings.email_enabled !== false, settings.whatsapp_enabled === true,
      parentId
    ]);
    
    res.json({ success: true, message: 'Notification settings updated' });
  } catch (error) {
    console.error('Update Notification Settings Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PARENT PROFILE
// ============================================

router.put('/profile', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.parentId || req.user.username;
    const { first_name, last_name, email, phone, whatsapp_number, alternate_phone, home_address, preferred_language, communication_preference } = req.body;
    
    await pool.execute(`
      UPDATE parent_profiles 
      SET first_name = ?, last_name = ?, email = ?, phone = ?, whatsapp_number = ?,
          alternate_phone = ?, home_address = ?, preferred_language = ?, communication_preference = ?
      WHERE parent_id = ?
    `, [first_name, last_name, email, phone, whatsapp_number, alternate_phone, home_address, preferred_language, communication_preference, parentId]);
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/profile', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.parentId || req.user.username;
    
    const [parents] = await pool.execute(
      'SELECT * FROM parent_profiles WHERE parent_id = ?',
      [parentId]
    );
    
    if (parents.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    res.json({ success: true, profile: parents[0] });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ACTIVITY LOG
// ============================================

router.get('/activity', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.parentId || req.user.username;
    const { limit = 50 } = req.query;
    
    const [activities] = await pool.execute(`
      SELECT * FROM parent_activity_log 
      WHERE parent_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `, [parentId, parseInt(limit)]);
    
    res.json({ success: true, activities });
  } catch (error) {
    console.error('Get Activity Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
