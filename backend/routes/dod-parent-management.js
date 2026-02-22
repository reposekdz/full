const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sendSMS } = require('../utils/smsService');
const { sendManualLinkSMS, sendAutoLinkNotificationSMS } = require('../services/parentNotificationService');

// ==================== LEVEL 4 SOD STUDENTS WITH LINKED PARENTS ====================

// GET Level 4 SOD students with linked parent information
router.get('/level4-sod-students', authenticateToken, async (req, res) => {
  try {
    const { search, gender, status = 'active', page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        l4s.*,
        (SELECT COUNT(*) FROM parent_student_links psl 
         WHERE psl.student_id = l4s.student_id AND psl.status = 'active') as total_parents,
        (SELECT GROUP_CONCAT(
          CONCAT(u.first_name, ' ', u.last_name, ' (', u.phone, ') - ', psl.relationship_type)
          SEPARATOR ' | '
        ) FROM parent_student_links psl
        JOIN users u ON psl.parent_id = u.id
        WHERE psl.student_id = l4s.student_id AND psl.status = 'active') as all_parents_info
      FROM level4_sod_students l4s
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim()) {
      query += ` AND (l4s.first_name LIKE ? OR l4s.last_name LIKE ? OR l4s.student_code LIKE ? OR l4s.linked_parent_name LIKE ?)`;
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (gender && gender !== 'all') {
      query += ` AND l4s.gender = ?`;
      params.push(gender);
    }

    if (status && status !== 'all') {
      query += ` AND l4s.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY l4s.last_name, l4s.first_name LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [students] = await pool.execute(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM level4_sod_students l4s WHERE 1=1`;
    const countParams = [];
    
    if (search && search.trim()) {
      countQuery += ` AND (l4s.first_name LIKE ? OR l4s.last_name LIKE ? OR l4s.student_code LIKE ? OR l4s.linked_parent_name LIKE ?)`;
      const searchParam = `%${search.trim()}%`;
      countParams.push(searchParam, searchParam, searchParam, searchParam);
    }
    if (gender && gender !== 'all') {
      countQuery += ` AND l4s.gender = ?`;
      countParams.push(gender);
    }
    if (status && status !== 'all') {
      countQuery += ` AND l4s.status = ?`;
      countParams.push(status);
    }

    const [[{ total }]] = await pool.execute(countQuery, countParams);

    res.json({
      success: true,
      students,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching Level 4 SOD students:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== PARENT MANAGEMENT ====================

// GET all registered parents with their linked students
router.get('/parents', authenticateToken, async (req, res) => {
  try {
    const { search, status = 'active', page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        u.id as parent_id,
        u.first_name,
        u.last_name,
        u.phone,
        u.email,
        u.gender,
        u.is_active,
        pi.national_id,
        pi.occupation,
        pi.address,
        pi.province,
        pi.district,
        pi.whatsapp_number,
        pi.preferred_contact_method,
        pi.preferred_language,
        pi.children_in_school,
        pi.is_verified,
        pi.last_contact_date,
        (SELECT COUNT(*) FROM parent_student_links psl 
         WHERE psl.parent_id = u.id AND psl.status = 'active') as total_linked_students,
        (SELECT GROUP_CONCAT(
          CONCAT(s.first_name, ' ', s.last_name, ' (', sp.admission_number, ')')
          SEPARATOR ', '
        ) FROM parent_student_links psl
        JOIN users s ON psl.student_id = s.id
        LEFT JOIN student_profiles sp ON s.id = sp.user_id
        WHERE psl.parent_id = u.id AND psl.status = 'active') as linked_students_names
      FROM users u
      LEFT JOIN parents_info pi ON u.id = pi.user_id
      WHERE u.role = 'parent'
    `;
    const params = [];

    if (search && search.trim()) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.phone LIKE ? OR u.email LIKE ?)`;
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (status === 'active') {
      query += ` AND u.is_active = 1`;
    } else if (status === 'inactive') {
      query += ` AND u.is_active = 0`;
    }

    query += ` ORDER BY u.last_name, u.first_name LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [parents] = await pool.execute(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM users u WHERE u.role = 'parent'`;
    const countParams = [];
    
    if (search && search.trim()) {
      countQuery += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.phone LIKE ? OR u.email LIKE ?)`;
      const searchParam = `%${search.trim()}%`;
      countParams.push(searchParam, searchParam, searchParam, searchParam);
    }
    if (status === 'active') {
      countQuery += ` AND u.is_active = 1`;
    } else if (status === 'inactive') {
      countQuery += ` AND u.is_active = 0`;
    }

    const [[{ total }]] = await pool.execute(countQuery, countParams);

    res.json({
      success: true,
      parents,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching parents:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET parent details with all linked students
router.get('/parents/:parent_id', authenticateToken, async (req, res) => {
  try {
    const { parent_id } = req.params;

    // Get parent info
    const [[parent]] = await pool.execute(`
      SELECT 
        u.*,
        pi.*
      FROM users u
      LEFT JOIN parents_info pi ON u.id = pi.user_id
      WHERE u.id = ? AND u.role = 'parent'
    `, [parent_id]);

    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    // Get linked students
    const [linkedStudents] = await pool.execute(`
      SELECT 
        psl.*,
        u.first_name,
        u.last_name,
        u.phone as student_phone,
        u.email as student_email,
        u.gender,
        sp.admission_number,
        e.trade_code,
        t.name as trade_name,
        e.level_number,
        l4s.conduct_score,
        l4s.attendance_percentage,
        l4s.average_grade
      FROM parent_student_links psl
      JOIN users u ON psl.student_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trades t ON e.trade_code = t.code
      LEFT JOIN level4_sod_students l4s ON u.id = l4s.student_id
      WHERE psl.parent_id = ? AND psl.status = 'active'
      ORDER BY psl.is_primary_contact DESC, u.last_name, u.first_name
    `, [parent_id]);

    // Get contact history
    const [contactHistory] = await pool.execute(`
      SELECT * FROM parent_contact_history
      WHERE parent_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [parent_id]);

    res.json({
      success: true,
      parent,
      linked_students: linkedStudents,
      contact_history: contactHistory
    });
  } catch (error) {
    console.error('Error fetching parent details:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST link parent to student (manual or automatic)
router.post('/link-parent-student', authenticateToken, requireRole('director_discipline', 'director_study', 'admin', 'headmaster'), async (req, res) => {
  try {
    const {
      parent_id,
      student_id,
      relationship_type = 'guardian',
      is_primary_contact = false,
      auto_linked = false
    } = req.body;

    if (!parent_id || !student_id) {
      return res.status(400).json({ success: false, message: 'parent_id and student_id are required' });
    }

    // Check if link already exists
    const [[existing]] = await pool.execute(
      'SELECT id, status FROM parent_student_links WHERE parent_id = ? AND student_id = ?',
      [parent_id, student_id]
    );

    if (existing) {
      if (existing.status === 'active') {
        return res.json({ success: false, message: 'Parent is already linked to this student' });
      }
      // Reactivate existing link
      await pool.execute(
        'UPDATE parent_student_links SET status = ?, updated_at = NOW() WHERE id = ?',
        ['active', existing.id]
      );
      
      // Send SMS notification for reactivated link
      try {
        await sendManualLinkSMS(parent_id, student_id, false);
        console.log('✅ Reactivation SMS sent to parent');
      } catch (smsError) {
        console.error('❌ SMS notification error:', smsError);
      }
      
      return res.json({ success: true, message: 'Parent link reactivated successfully' });
    }

    // Get student and parent info for SMS
    const [[student]] = await pool.execute(
      'SELECT u.first_name, u.last_name, sp.admission_number FROM users u LEFT JOIN student_profiles sp ON u.id = sp.user_id WHERE u.id = ?',
      [student_id]
    );
    
    const [[parent]] = await pool.execute(
      'SELECT phone, first_name, last_name FROM users WHERE id = ?',
      [parent_id]
    );

    // Create new link
    await pool.execute(`
      INSERT INTO parent_student_links (
        parent_id, student_id, student_code, relationship_type, is_primary_contact,
        status, linked_by, linked_by_role, auto_linked, linked_at
      ) VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, NOW())
    `, [
      parent_id,
      student_id,
      student?.admission_number || null,
      relationship_type,
      is_primary_contact ? 1 : 0,
      req.user?.name || 'System',
      req.user?.role || 'admin',
      auto_linked ? 1 : 0
    ]);

    // Send SMS notification to parent
    try {
      await sendManualLinkSMS(parent_id, student_id, false);
      console.log('✅ Manual link SMS sent to parent');
    } catch (smsError) {
      console.error('❌ SMS notification error:', smsError);
    }

    res.json({ 
      success: true, 
      message: 'Parent linked to student successfully! SMS notification sent.',
      sms_sent: parent && parent.phone ? true : false
    });
  } catch (error) {
    console.error('Error linking parent to student:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST auto-link parent to Level 4 SOD student
router.post('/auto-link-parent', authenticateToken, requireRole('director_discipline', 'director_study', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { student_id, parent_phone, parent_name, relationship_type = 'guardian' } = req.body;

    if (!student_id || !parent_phone) {
      return res.status(400).json({ success: false, message: 'student_id and parent_phone are required' });
    }

    // Get student info for SMS
    const [[studentInfo]] = await pool.execute(
      'SELECT first_name, last_name FROM users WHERE id = ?',
      [student_id]
    );

    // Find or create parent
    let [[parent]] = await pool.execute(
      'SELECT id, first_name, last_name FROM users WHERE phone = ? AND role = ?',
      [parent_phone, 'parent']
    );

    let isNewParent = false;
    if (!parent) {
      // Create parent account
      const names = (parent_name || 'Parent').split(' ');
      const firstName = names[0] || 'Parent';
      const lastName = names.slice(1).join(' ') || 'Guardian';
      
      const [result] = await pool.execute(`
        INSERT INTO users (
          username, phone, email, password_hash, role, first_name, last_name, is_active, created_at
        ) VALUES (?, ?, ?, ?, 'parent', ?, ?, 1, NOW())
      `, [
        parent_phone,
        parent_phone,
        `${parent_phone}@parent.local`,
        '$2b$10$defaultparenthash',
        firstName,
        lastName
      ]);

      const parentId = result.insertId;

      // Create parent info
      await pool.execute(`
        INSERT INTO parents_info (user_id, children_in_school, registration_date)
        VALUES (?, 1, NOW())
      `, [parentId]);

      parent = { id: parentId, first_name: firstName, last_name: lastName };
      isNewParent = true;
    }

    // Link parent to student
    await pool.execute(`
      INSERT INTO parent_student_links (
        parent_id, student_id, relationship_type, is_primary_contact,
        status, linked_by, linked_by_role, auto_linked, linked_at
      ) VALUES (?, ?, ?, 1, 'active', ?, ?, 1, NOW())
      ON DUPLICATE KEY UPDATE status = 'active', is_primary_contact = 1, updated_at = NOW()
    `, [parent.id, student_id, relationship_type, req.user?.name || 'System', req.user?.role || 'admin']);

    // Send SMS notification automatically
    try {
      await sendAutoLinkNotificationSMS(parent.id, student_id);
      console.log('✅ Auto-link SMS sent to parent');
    } catch (smsError) {
      console.error('❌ SMS notification error:', smsError);
    }

    res.json({ 
      success: true, 
      message: 'Parent auto-linked successfully! SMS notification sent.',
      parent_id: parent.id,
      sms_sent: true,
      is_new_parent: isNewParent
    });
  } catch (error) {
    console.error('Error auto-linking parent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET students linked to a parent
router.get('/parents/:parent_id/students', authenticateToken, async (req, res) => {
  try {
    const { parent_id } = req.params;

    const [students] = await pool.execute(`
      SELECT 
        psl.*,
        u.first_name,
        u.last_name,
        u.phone,
        u.email,
        u.gender,
        sp.admission_number,
        e.trade_code,
        t.name as trade_name,
        e.level_number,
        l4s.conduct_score,
        l4s.attendance_percentage,
        l4s.average_grade,
        l4s.linked_parent_phone
      FROM parent_student_links psl
      JOIN users u ON psl.student_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trades t ON e.trade_code = t.code
      LEFT JOIN level4_sod_students l4s ON u.id = l4s.student_id
      WHERE psl.parent_id = ? AND psl.status = 'active'
      ORDER BY psl.is_primary_contact DESC, u.last_name, u.first_name
    `, [parent_id]);

    res.json({ success: true, students });
  } catch (error) {
    console.error('Error fetching parent students:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CONTACT PARENT ====================

// POST contact parent (SMS/WhatsApp/Email)
router.post('/contact-parent', authenticateToken, requireRole('director_discipline', 'director_study', 'admin', 'headmaster', 'matron', 'patron'), async (req, res) => {
  try {
    const {
      parent_id,
      student_id,
      contact_type = 'sms',
      subject,
      message,
      category = 'general',
      priority = 'normal'
    } = req.body;

    if (!parent_id || !message) {
      return res.status(400).json({ success: false, message: 'parent_id and message are required' });
    }

    // Get parent contact info
    const [[parent]] = await pool.execute(`
      SELECT u.phone, u.email, pi.whatsapp_number, pi.preferred_contact_method
      FROM users u
      LEFT JOIN parents_info pi ON u.id = pi.user_id
      WHERE u.id = ?
    `, [parent_id]);

    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    // Log contact
    await pool.execute(`
      INSERT INTO parent_contact_history (
        parent_id, student_id, contact_type, subject, message, category,
        initiated_by, initiated_by_name, initiated_by_role, delivery_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'sent', NOW())
    `, [
      parent_id,
      student_id || null,
      contact_type,
      subject || 'Message from School',
      message,
      category,
      req.user?.id || null,
      req.user?.name || 'Staff',
      req.user?.role || 'staff'
    ]);

    // Queue notification
    const notificationId = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await pool.execute(`
      INSERT INTO parent_notifications_queue (
        notification_id, parent_id, student_id, notification_type, title, message,
        send_via, priority, scheduled_at, delivery_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'queued')
    `, [
      notificationId,
      parent_id,
      student_id || null,
      category,
      subject || 'Message from School',
      message,
      contact_type,
      priority
    ]);

    res.json({
      success: true,
      message: 'Message sent to parent successfully',
      notification_id: notificationId,
      contact_info: {
        phone: parent.phone,
        email: parent.email,
        whatsapp: parent.whatsapp_number
      }
    });
  } catch (error) {
    console.error('Error contacting parent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST contact all parents of a student
router.post('/contact-student-parents', authenticateToken, requireRole('director_discipline', 'director_study', 'admin', 'headmaster', 'matron', 'patron'), async (req, res) => {
  try {
    const { student_id, contact_type = 'sms', subject, message, category = 'general' } = req.body;

    if (!student_id || !message) {
      return res.status(400).json({ success: false, message: 'student_id and message are required' });
    }

    // Get all linked parents
    const [parents] = await pool.execute(`
      SELECT psl.parent_id, u.phone, u.email, pi.whatsapp_number, psl.can_receive_sms
      FROM parent_student_links psl
      JOIN users u ON psl.parent_id = u.id
      LEFT JOIN parents_info pi ON u.id = pi.user_id
      WHERE psl.student_id = ? AND psl.status = 'active' AND psl.can_receive_sms = 1
    `, [student_id]);

    if (parents.length === 0) {
      return res.json({ success: false, message: 'No parents linked to this student' });
    }

    const notificationIds = [];

    for (const parent of parents) {
      // Log contact
      await pool.execute(`
        INSERT INTO parent_contact_history (
          parent_id, student_id, contact_type, subject, message, category,
          initiated_by, initiated_by_name, initiated_by_role, delivery_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'sent', NOW())
      `, [
        parent.parent_id,
        student_id,
        contact_type,
        subject || 'Message from School',
        message,
        category,
        req.user?.id || null,
        req.user?.name || 'Staff',
        req.user?.role || 'staff'
      ]);

      // Queue notification
      const notificationId = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await pool.execute(`
        INSERT INTO parent_notifications_queue (
          notification_id, parent_id, student_id, notification_type, title, message,
          send_via, priority, scheduled_at, delivery_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'normal', NOW(), 'queued')
      `, [
        notificationId,
        parent.parent_id,
        student_id,
        category,
        subject || 'Message from School',
        message,
        contact_type
      ]);

      notificationIds.push(notificationId);
    }

    res.json({
      success: true,
      message: `Message sent to ${parents.length} parent(s) successfully`,
      parents_contacted: parents.length,
      notification_ids: notificationIds
    });
  } catch (error) {
    console.error('Error contacting student parents:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== STATISTICS ====================

// GET parent management statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [[stats]] = await pool.execute(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'parent' AND is_active = 1) as total_parents,
        (SELECT COUNT(*) FROM parent_student_links WHERE status = 'active') as total_links,
        (SELECT COUNT(*) FROM level4_sod_students WHERE status = 'active') as total_l4_sod_students,
        (SELECT COUNT(*) FROM level4_sod_students WHERE linked_parent_id IS NOT NULL AND status = 'active') as l4_sod_with_parents,
        (SELECT COUNT(*) FROM parent_linking_requests WHERE status = 'pending') as pending_requests,
        (SELECT COUNT(*) FROM parent_notifications_queue WHERE delivery_status = 'queued') as queued_notifications,
        (SELECT COUNT(*) FROM parent_contact_history WHERE DATE(created_at) = CURDATE()) as contacts_today
    `);

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
