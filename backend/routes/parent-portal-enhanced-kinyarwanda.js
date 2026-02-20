const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ========================================
// ENHANCED PARENT PORTAL - FULL KINYARWANDA
// Real-time monitoring with advanced features
// ========================================

// Get student attendance with enhanced data
router.get('/student/:studentId/attendance', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.id;

    // Verify parent access
    const [access] = await db.query(`
      SELECT * FROM parent_student_links 
      WHERE student_id = ? AND parent_id = ? AND status = 'verified'
    `, [studentId, parentId]);

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Ntushobora kubona aya makuru' });
    }

    // Get attendance records with enhanced data
    const [attendance] = await db.query(`
      SELECT 
        id,
        date,
        status,
        remarks,
        time_in,
        time_out,
        created_at
      FROM student_attendance 
      WHERE student_id = ? 
      ORDER BY date DESC 
      LIMIT 50
    `, [studentId]);

    res.json({
      success: true,
      attendance: attendance || []
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: 'Ikibazo cyo gushaka imitsindire' });
  }
});

// Get student conduct records
router.get('/student/:studentId/conduct', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.id;

    // Verify parent access
    const [access] = await db.query(`
      SELECT * FROM parent_student_links 
      WHERE student_id = ? AND parent_id = ? AND status = 'verified'
    `, [studentId, parentId]);

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Ntushobora kubona aya makuru' });
    }

    // Get conduct records
    const [conduct] = await db.query(`
      SELECT 
        scr.*,
        CONCAT(u.first_name, ' ', u.last_name) as removed_by_name
      FROM student_conduct_records scr
      LEFT JOIN users u ON scr.removed_by = u.id
      WHERE scr.student_id = ? 
      ORDER BY scr.created_at DESC
    `, [studentId]);

    res.json({
      success: true,
      conduct: conduct || []
    });
  } catch (error) {
    console.error('Error fetching conduct:', error);
    res.status(500).json({ success: false, message: 'Ikibazo cyo gushaka imyitwarire' });
  }
});

// Get student grades/performance
router.get('/student/:studentId/grades', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.id;

    // Verify parent access
    const [access] = await db.query(`
      SELECT * FROM parent_student_links 
      WHERE student_id = ? AND parent_id = ? AND status = 'verified'
    `, [studentId, parentId]);

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Ntushobora kubona aya makuru' });
    }

    // Get grades from student_marks table
    const [grades] = await db.query(`
      SELECT 
        subject,
        marks,
        max_marks,
        ROUND((marks / max_marks) * 100, 2) as percentage,
        CASE 
          WHEN (marks / max_marks) * 100 >= 90 THEN 'A'
          WHEN (marks / max_marks) * 100 >= 80 THEN 'B'
          WHEN (marks / max_marks) * 100 >= 70 THEN 'C'
          WHEN (marks / max_marks) * 100 >= 60 THEN 'D'
          ELSE 'F'
        END as grade,
        term,
        created_at
      FROM student_marks 
      WHERE student_id = ? 
      ORDER BY created_at DESC
    `, [studentId]);

    res.json({
      success: true,
      grades: grades || []
    });
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ success: false, message: 'Ikibazo cyo gushaka amanota' });
  }
});

// Get teacher comments
router.get('/student/:studentId/comments', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.id;

    // Verify parent access
    const [access] = await db.query(`
      SELECT * FROM parent_student_links 
      WHERE student_id = ? AND parent_id = ? AND status = 'verified'
    `, [studentId, parentId]);

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Ntushobora kubona aya makuru' });
    }

    // Get teacher comments
    const [comments] = await db.query(`
      SELECT 
        tc.*,
        CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
        CASE 
          WHEN tc.comment LIKE '%good%' OR tc.comment LIKE '%excellent%' OR tc.comment LIKE '%great%' THEN 'positive'
          WHEN tc.comment LIKE '%poor%' OR tc.comment LIKE '%bad%' OR tc.comment LIKE '%needs improvement%' THEN 'negative'
          ELSE 'neutral'
        END as type
      FROM teacher_comments tc
      LEFT JOIN users u ON tc.teacher_id = u.id
      WHERE tc.student_id = ? 
      ORDER BY tc.created_at DESC
    `, [studentId]);

    res.json({
      success: true,
      comments: comments || []
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, message: 'Ikibazo cyo gushaka ibitekerezo' });
  }
});

// Get student fees
router.get('/student/:studentId/fees', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.id;

    // Verify parent access
    const [access] = await db.query(`
      SELECT * FROM parent_student_links 
      WHERE student_id = ? AND parent_id = ? AND status = 'verified'
    `, [studentId, parentId]);

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Ntushobora kubona aya makuru' });
    }

    // Get fee records
    const [fees] = await db.query(`
      SELECT 
        id,
        amount,
        paid_amount,
        (amount - paid_amount) as balance,
        due_date,
        description,
        CASE 
          WHEN paid_amount >= amount THEN 'paid'
          WHEN paid_amount > 0 THEN 'partial'
          WHEN due_date < CURDATE() THEN 'overdue'
          ELSE 'pending'
        END as status,
        created_at
      FROM student_fees 
      WHERE student_id = ? 
      ORDER BY due_date DESC
    `, [studentId]);

    res.json({
      success: true,
      fees: fees || []
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ success: false, message: 'Ikibazo cyo gushaka amafaranga' });
  }
});

// Get student assignments
router.get('/student/:studentId/assignments', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.id;

    // Verify parent access
    const [access] = await db.query(`
      SELECT * FROM parent_student_links 
      WHERE student_id = ? AND parent_id = ? AND status = 'verified'
    `, [studentId, parentId]);

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Ntushobora kubona aya makuru' });
    }

    // Get assignments
    const [assignments] = await db.query(`
      SELECT 
        a.*,
        CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
        sa.submitted_at,
        sa.grade,
        CASE 
          WHEN sa.grade IS NOT NULL THEN 'graded'
          WHEN sa.submitted_at IS NOT NULL THEN 'submitted'
          ELSE 'pending'
        END as status
      FROM assignments a
      LEFT JOIN student_assignments sa ON a.id = sa.assignment_id AND sa.student_id = ?
      LEFT JOIN users u ON a.teacher_id = u.id
      WHERE a.class_id IN (
        SELECT class_id FROM student_classes WHERE student_id = ?
      )
      ORDER BY a.due_date DESC
    `, [studentId, studentId]);

    res.json({
      success: true,
      assignments: assignments || []
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ success: false, message: 'Ikibazo cyo gushaka amakazi' });
  }
});

// Get parent messages
router.get('/messages', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.id;

    // Get messages sent to parent
    const [messages] = await db.query(`
      SELECT 
        pm.*,
        CONCAT(u.first_name, ' ', u.last_name) as from_name,
        u.role as from_role
      FROM parent_messages pm
      LEFT JOIN users u ON pm.from_user_id = u.id
      WHERE pm.parent_id = ?
      ORDER BY pm.created_at DESC
    `, [parentId]);

    res.json({
      success: true,
      messages: messages || []
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Ikibazo cyo gushaka ubutumwa' });
  }
});

// Send message to school staff
router.post('/send-message', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { to, subject, message, student_id } = req.body;
    const parentId = req.user.id;

    if (!to || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Uzuza amakuru yose' });
    }

    // Verify parent has access to student if student_id provided
    if (student_id) {
      const [access] = await db.query(`
        SELECT * FROM parent_student_links 
        WHERE student_id = ? AND parent_id = ? AND status = 'verified'
      `, [student_id, parentId]);

      if (access.length === 0) {
        return res.status(403).json({ success: false, message: 'Ntushobora kohereza ubutumwa kuri uyu mwana' });
      }
    }

    // Insert message
    const [result] = await db.query(`
      INSERT INTO parent_messages (
        parent_id, to_role, subject, message, student_id, 
        is_read, priority, created_at
      ) VALUES (?, ?, ?, ?, ?, false, 'medium', NOW())
    `, [parentId, to, subject, message, student_id || null]);

    res.json({
      success: true,
      message: 'Ubutumwa bwoherejwe neza!',
      messageId: result.insertId
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Ikibazo cyo kohereza ubutumwa' });
  }
});

// Mark message as read
router.put('/message/:messageId/read', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { messageId } = req.params;
    const parentId = req.user.id;

    await db.query(`
      UPDATE parent_messages 
      SET is_read = true, read_at = NOW() 
      WHERE id = ? AND parent_id = ?
    `, [messageId, parentId]);

    res.json({
      success: true,
      message: 'Ubutumwa bwasomwe'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ success: false, message: 'Ikibazo cyo guhindura ubutumwa' });
  }
});

// Auto-link parent with students based on phone/name matching
router.post('/auto-link', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { parent_phone, parent_name } = req.body;
    const parentId = req.user.id;

    // Search for students with matching parent phone in emergency contacts or student info
    const [students] = await db.query(`
      SELECT DISTINCT u.id, u.first_name, u.last_name, u.student_code, u.trade_code, 
             t.name as trade_name, u.level_number, u.gender, u.status
      FROM users u
      LEFT JOIN trades t ON u.trade_code = t.code
      WHERE u.role = 'student' 
      AND (u.parent_phone = ? OR u.emergency_contact = ? OR u.guardian_phone = ?)
      AND u.id NOT IN (
        SELECT student_id FROM parent_student_links WHERE parent_id = ?
      )
    `, [parent_phone, parent_phone, parent_phone, parentId]);

    let linkedCount = 0;
    
    for (const student of students) {
      // Create parent-student link
      await db.query(`
        INSERT INTO parent_student_links (
          parent_id, student_id, relationship, status, linked_at
        ) VALUES (?, ?, 'Parent', 'verified', NOW())
      `, [parentId, student.id]);
      
      linkedCount++;
    }

    res.json({
      success: true,
      message: linkedCount > 0 ? `Twabashije guhuza abana ${linkedCount}` : 'Nta mwana wabonetse',
      linked_students: linkedCount,
      students: students
    });
  } catch (error) {
    console.error('Auto-link error:', error);
    res.status(500).json({ success: false, message: 'Ikibazo cyo guhuza abana' });
  }
});

// Manual link request for staff assistance
router.post('/manual-request', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const {
      student_name, student_code, trade, level, phone, reason, additional_info,
      parent_name, parent_phone, parent_email
    } = req.body;
    const parentId = req.user.id;

    // Insert manual link request
    const [result] = await db.query(`
      INSERT INTO parent_link_requests (
        parent_id, parent_name, parent_phone, parent_email,
        student_name, student_code, trade, level, student_phone,
        reason, additional_info, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [
      parentId, parent_name, parent_phone, parent_email,
      student_name, student_code, trade, level, phone,
      reason, additional_info
    ]);

    // Notify staff about the request
    await db.query(`
      INSERT INTO staff_notifications (
        title, message, type, priority, created_at
      ) VALUES (
        'Ubusabe bwo Guhuza Umubyeyi n\'Umwana',
        'Umubyeyi ${parent_name} asaba ubufasha bwo guhuza umwana ${student_name}. Reba ubusabe #${result.insertId}',
        'parent_link_request', 'medium', NOW()
      )
    `);

    res.json({
      success: true,
      message: 'Ubusabe bwawe bwoherejwe ku buyobozi. Bazaguhamagara vuba.',
      request_id: result.insertId
    });
  } catch (error) {
    console.error('Manual request error:', error);
    res.status(500).json({ success: false, message: 'Ikibazo cyo kohereza ubusabe' });
  }
});

module.exports = router;