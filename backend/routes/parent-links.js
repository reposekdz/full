const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/parent-links/students - Get linked students for a parent (ADVANCED)
router.get('/students', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.id || req.user.userId;
    
    // Get linked students with full details from global_student_sheets
    const [students] = await pool.execute(`
      SELECT 
        gss.id,
        gss.student_id,
        gss.student_code,
        gss.first_name,
        gss.last_name,
        CONCAT(gss.first_name, ' ', gss.last_name) as full_name,
        gss.trade_code,
        gss.trade_name,
        gss.level_number,
        gss.level_suffix,
        gss.class_name,
        gss.gender,
        gss.phone,
        gss.email,
        gss.status,
        gss.gpa,
        gss.attendance_percentage,
        gss.conduct_score,
        gss.conduct_grade,
        gss.academic_year,
        psl.relationship_type,
        psl.linked_at,
        psl.approved_at,
        psl.can_view_marks,
        psl.can_view_attendance,
        psl.can_view_report_cards,
        psl.can_view_discipline
      FROM global_student_sheets gss
      JOIN parent_student_links psl ON gss.id = psl.student_id
      WHERE psl.parent_id = ? AND psl.status = 'approved'
      ORDER BY psl.linked_at DESC
    `, [parentId]);

    // Get statistics
    const stats = {
      total: students.length,
      avg_gpa: students.reduce((sum, s) => sum + (parseFloat(s.gpa) || 0), 0) / (students.length || 1),
      avg_attendance: students.reduce((sum, s) => sum + (parseFloat(s.attendance_percentage) || 0), 0) / (students.length || 1),
      avg_conduct: students.reduce((sum, s) => sum + (parseFloat(s.conduct_score) || 40), 0) / (students.length || 1)
    };
    
    res.json({ success: true, students, stats });
  } catch (error) {
    console.error('Error fetching linked students:', error);
    res.status(500).json({ success: false, message: error.message, students: [] });
  }
});

// POST /api/parent-links/link-student - Auto-link student to parent (no approval needed)
router.post('/link-student', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const parentId = req.user.id || req.user.userId;
    const { 
      student_name,
      student_first_name, 
      student_last_name, 
      student_trade,
      trade_code, 
      student_level,
      level, 
      relationship,
      relationship_type
    } = req.body;

    // Parse student name
    let firstName = student_first_name;
    let lastName = student_last_name;
    if (student_name && !firstName && !lastName) {
      const nameParts = student_name.trim().split(' ');
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ') || nameParts[0];
    }

    const tradeCode = trade_code || student_trade;
    const levelNum = parseInt(student_level || level || '0');
    const relationshipValue = relationship_type || relationship || 'Parent';

    if (!firstName || !lastName || !tradeCode || !levelNum) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Uzuza amakuru yose (izina, ishami, umwaka)'
      });
    }

    // Find student in global_student_sheets
    const [students] = await connection.execute(`
      SELECT id, first_name, last_name, trade_name, level_number, student_code
      FROM global_student_sheets
      WHERE LOWER(first_name) = LOWER(?) 
        AND LOWER(last_name) = LOWER(?)
        AND trade_code = ?
        AND level_number = ?
        AND status = 'active'
      LIMIT 1
    `, [firstName, lastName, tradeCode, levelNum]);

    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: `Umwana ${firstName} ${lastName} ntagaragara muri ${tradeCode} Level ${levelNum}. Reba neza amakuru.`
      });
    }

    const studentDbId = students[0].id;
    
    // Check if already linked
    const [existing] = await connection.execute(`
      SELECT id FROM parent_student_links 
      WHERE parent_id = ? AND student_id = ? AND status = 'approved'
    `, [parentId, studentDbId]);

    if (existing.length > 0) {
      await connection.rollback();
      return res.json({
        success: false,
        message: 'Umwana yarahuijwe kuri konte yawe'
      });
    }

    // Auto-approve link (no staff approval needed)
    await connection.execute(`
      INSERT INTO parent_student_links 
      (parent_id, student_id, relationship_type, status, linked_by, linked_at, approved_at)
      VALUES (?, ?, ?, 'approved', ?, NOW(), NOW())
    `, [parentId, studentDbId, relationshipValue, req.user.username || 'Parent']);

    await connection.commit();

    res.json({
      success: true,
      message: `${students[0].first_name} ${students[0].last_name} yahuijwe neza! 🎉`,
      student: {
        name: `${students[0].first_name} ${students[0].last_name}`,
        code: students[0].student_code,
        trade: students[0].trade_name,
        level: students[0].level_number
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error linking student:', error);
    res.status(500).json({ success: false, message: 'Ikibazo cyabaye. Ongera ugerageze.' });
  } finally {
    connection.release();
  }
});

// GET /api/parent-links/requests - Get link requests (for admin/dos/dod)
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const [requests] = await pool.execute(`
      SELECT * FROM parent_student_link_requests 
      WHERE status = 'pending' 
      ORDER BY created_at DESC
    `);

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ success: false, message: error.message, requests: [] });
  }
});

// PUT /api/parent-links/requests/:id/approve - Approve a link request
router.put('/requests/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, parent_id } = req.body;

    // Create the link
    await pool.execute(`
      INSERT INTO parent_student_links 
      (parent_id, student_id, can_view_marks, can_view_attendance, can_view_discipline, can_view_fees, can_receive_sms, status, linked_by, linked_at)
      VALUES (?, ?, 1, 1, 1, 1, 1, 'active', ?, NOW())
    `, [parent_id, student_id, req.user.name || 'Admin']);

    // Update request status
    await pool.execute(`
      UPDATE parent_student_link_requests SET status = 'approved', approved_by = ?, approved_at = NOW() WHERE id = ?
    `, [req.user.name || 'Admin', id]);

    res.json({ success: true, message: 'Link approved successfully!' });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/parent-links/notifications - Get conduct/leave notifications for parent
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.id || req.user.userId;
    
    // Get linked student IDs
    const [links] = await pool.execute(
      'SELECT student_id FROM parent_student_links WHERE parent_id = ? AND status = "active"',
      [parentId]
    );
    
    if (links.length === 0) {
      return res.json({ success: true, notifications: [] });
    }
    
    const studentIds = links.map(l => l.student_id);
    const placeholders = studentIds.map(() => '?').join(',');
    
    // Get conduct records
    const [conduct] = await pool.execute(`
      SELECT 
        'conduct' as type,
        dr.id,
        dr.student_id,
        dr.student_name,
        dr.conduct_type,
        dr.severity,
        dr.description,
        dr.action_taken,
        dr.conduct_points_deducted,
        dr.new_conduct_score,
        dr.removed_by_name,
        dr.created_at
      FROM discipline_records dr
      WHERE dr.student_id IN (${placeholders})
      ORDER BY dr.created_at DESC
      LIMIT 20
    `, studentIds);
    
    // Get leave records
    const [leaves] = await pool.execute(`
      SELECT 
        'leave' as type,
        sl.id,
        sl.student_id,
        sl.student_name,
        sl.leave_type,
        sl.reason,
        sl.start_time,
        sl.end_time,
        sl.approved_by_name,
        sl.status,
        sl.created_at
      FROM student_leaves sl
      WHERE sl.student_id IN (${placeholders})
      ORDER BY sl.created_at DESC
      LIMIT 20
    `, studentIds);
    
    // Combine and sort
    const notifications = [...conduct, ...leaves].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: error.message, notifications: [] });
  }
});

module.exports = router;
