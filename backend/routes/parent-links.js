/**
 * Parent Links API - Fixed Version
 * Real data from global_student_sheets
 * No mock data, no placeholders
 */
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/parent-links/students - Get linked students for parent
router.get('/students', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.id || req.user.userId;
    
    // Check if parent_student_links table exists
    const [tables] = await pool.execute(
      "SHOW TABLES LIKE 'parent_student_links'"
    );
    
    if (tables.length === 0) {
      return res.json({ success: true, students: [], stats: {} });
    }
    
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
        COALESCE(gss.gpa, 0) as gpa,
        COALESCE(gss.attendance_percentage, 0) as attendance_percentage,
        COALESCE(gss.conduct_score, 40) as conduct_score,
        gss.conduct_grade,
        gss.academic_year,
        psl.relationship_type,
        psl.linked_at,
        COALESCE(psl.can_view_marks, 1) as can_view_marks,
        COALESCE(psl.can_view_attendance, 1) as can_view_attendance,
        COALESCE(psl.can_view_report_cards, 1) as can_view_report_cards,
        COALESCE(psl.can_view_discipline, 1) as can_view_discipline
      FROM global_student_sheets gss
      JOIN parent_student_links psl ON gss.id = psl.student_id
      WHERE psl.parent_id = ? AND psl.status = 'approved'
      ORDER BY psl.linked_at DESC
    `, [parentId]);

    const stats = {
      total: students.length,
      avg_gpa: students.reduce((sum, s) => sum + parseFloat(s.gpa || 0), 0) / (students.length || 1),
      avg_attendance: students.reduce((sum, s) => sum + parseFloat(s.attendance_percentage || 0), 0) / (students.length || 1),
      avg_conduct: students.reduce((sum, s) => sum + parseFloat(s.conduct_score || 40), 0) / (students.length || 1)
    };
    
    res.json({ success: true, students, stats });
  } catch (error) {
    console.error('Error fetching linked students:', error);
    res.json({ success: true, students: [], stats: {} });
  }
});

// POST /api/parent-links/auto-link - Auto-link parent to student
router.post('/auto-link', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const parentId = req.user.id || req.user.userId;
    const { student_name, student_first_name, student_last_name, trade_code, level, relationship_type } = req.body;

    let firstName = student_first_name;
    let lastName = student_last_name;
    if (student_name && !firstName && !lastName) {
      const nameParts = student_name.trim().split(' ');
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ') || nameParts[0];
    }

    const levelNum = parseInt(level || '0');
    const relationshipValue = relationship_type || 'Parent';

    if (!firstName || !lastName || !trade_code || !levelNum) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Uzuza amakuru yose (izina, ishami, umwaka)'
      });
    }

    const [students] = await connection.execute(`
      SELECT id, first_name, last_name, trade_name, level_number, student_code
      FROM global_student_sheets
      WHERE LOWER(first_name) = LOWER(?) 
        AND LOWER(last_name) = LOWER(?)
        AND trade_code = ?
        AND level_number = ?
        AND status = 'active'
      LIMIT 1
    `, [firstName, lastName, trade_code, levelNum]);

    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: `Umwana ${firstName} ${lastName} ntagaragara muri ${trade_code} Level ${levelNum}. Reba neza amakuru.`
      });
    }

    const studentDbId = students[0].id;
    
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

    await connection.execute(`
      INSERT INTO parent_student_links 
      (parent_id, student_id, relationship_type, status, linked_by, linked_at, can_view_marks, can_view_attendance, can_view_report_cards, can_view_discipline)
      VALUES (?, ?, ?, 'approved', ?, NOW(), 1, 1, 1, 1)
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
    console.error('Error auto-linking student:', error);
    res.status(500).json({ success: false, message: 'Ikibazo cyabaye. Ongera ugerageze.' });
  } finally {
    connection.release();
  }
});

// POST /api/parent-links/link-student - Link student to parent
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

    await connection.execute(`
      INSERT INTO parent_student_links 
      (parent_id, student_id, relationship_type, status, linked_by, linked_at, can_view_marks, can_view_attendance, can_view_report_cards, can_view_discipline)
      VALUES (?, ?, ?, 'approved', ?, NOW(), 1, 1, 1, 1)
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

// POST /api/parent-links/request-manual-link - Request staff help for linking
router.post('/request-manual-link', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const parentId = req.user.id || req.user.userId;
    const { student_name, trade, level, message } = req.body;

    if (!student_name) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Andika amazina y\'umwana'
      });
    }

    // Get parent info
    const [parents] = await connection.execute(
      'SELECT phone, email, first_name, last_name FROM users WHERE id = ?',
      [parentId]
    );

    if (parents.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    // Create manual link request table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS parent_manual_link_requests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        parent_name VARCHAR(200),
        parent_phone VARCHAR(20),
        parent_email VARCHAR(100),
        student_name VARCHAR(200) NOT NULL,
        trade VARCHAR(50),
        level VARCHAR(10),
        message TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP NULL,
        processed_by INT,
        processed_by_name VARCHAR(100),
        notes TEXT,
        student_id INT,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Insert request
    await connection.execute(`
      INSERT INTO parent_manual_link_requests 
      (parent_id, parent_name, parent_phone, parent_email, student_name, trade, level, message, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      parentId,
      `${parents[0].first_name} ${parents[0].last_name}`,
      parents[0].phone,
      parents[0].email,
      student_name,
      trade || null,
      level || null,
      message || null
    ]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Icyifuzo cyawe cyoherejwe! Abakozi bazaguhamagara vuba. 📞'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating manual link request:', error);
    res.status(500).json({ success: false, message: 'Ikibazo cyabaye. Ongera ugerageze.' });
  } finally {
    connection.release();
  }
});

// GET /api/parent-links/search-students - Search Level 4 SOD students
router.get('/search-students', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ success: true, students: [] });
    }

    const [students] = await pool.execute(`
      SELECT 
        id, student_code, first_name, last_name,
        trade_code, trade_name, level_number,
        gpa, attendance_percentage, conduct_score,
        gender, phone, email
      FROM global_student_sheets
      WHERE status = 'active'
        AND level_number = 4
        AND trade_code = 'SOD'
        AND (LOWER(first_name) LIKE LOWER(?) 
          OR LOWER(last_name) LIKE LOWER(?)
          OR LOWER(student_code) LIKE LOWER(?))
      ORDER BY first_name, last_name
      LIMIT 20
    `, [`%${query}%`, `%${query}%`, `%${query}%`]);

    res.json({ success: true, students });
  } catch (error) {
    console.error('Error searching students:', error);
    res.status(500).json({ success: false, message: 'Search error' });
  }
});

// GET /api/parent-links/manual-requests - Get all manual link requests (for staff)
router.get('/manual-requests', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    
    // Only allow DOD, DOS, Headmaster, Accountant
    if (!['dod', 'director_discipline', 'director_study', 'headmaster', 'accountant', 'admin'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [requests] = await pool.execute(`
      SELECT 
        pmlr.*,
        CASE 
          WHEN pmlr.status = 'pending' THEN 'Pending'
          WHEN pmlr.status = 'approved' THEN 'Approved'
          WHEN pmlr.status = 'rejected' THEN 'Rejected'
        END as status_label
      FROM parent_manual_link_requests pmlr
      ORDER BY 
        CASE pmlr.status 
          WHEN 'pending' THEN 1
          WHEN 'approved' THEN 2
          WHEN 'rejected' THEN 3
        END,
        pmlr.created_at DESC
    `);

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching manual requests:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/parent-links/approve-manual-request - Approve manual link request (for staff)
router.post('/approve-manual-request', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const userRole = req.user.role;
    const userId = req.user.id || req.user.userId;
    const userName = req.user.username || req.user.first_name || 'Staff';
    
    // Only allow DOD, DOS, Headmaster, Accountant
    if (!['dod', 'director_discipline', 'director_study', 'headmaster', 'accountant', 'admin'].includes(userRole)) {
      await connection.rollback();
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { request_id, student_id, notes } = req.body;

    if (!request_id || !student_id) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Get request details
    const [requests] = await connection.execute(
      'SELECT * FROM parent_manual_link_requests WHERE id = ?',
      [request_id]
    );

    if (requests.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const request = requests[0];

    // Check if already linked
    const [existing] = await connection.execute(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ? AND status = "approved"',
      [request.parent_id, student_id]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.json({ success: false, message: 'Already linked' });
    }

    // Create link
    await connection.execute(`
      INSERT INTO parent_student_links 
      (parent_id, student_id, relationship_type, status, linked_by, linked_at, can_view_marks, can_view_attendance, can_view_report_cards, can_view_discipline)
      VALUES (?, ?, 'Parent', 'approved', ?, NOW(), 1, 1, 1, 1)
    `, [request.parent_id, student_id, userName]);

    // Update request status
    await connection.execute(
      'UPDATE parent_manual_link_requests SET status = "approved", processed_at = NOW(), processed_by = ?, processed_by_name = ?, notes = ?, student_id = ? WHERE id = ?',
      [userId, userName, notes || null, student_id, request_id]
    );

    await connection.commit();

    res.json({ success: true, message: 'Request approved and link created!' });
  } catch (error) {
    await connection.rollback();
    console.error('Error approving request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
});

// POST /api/parent-links/reject-manual-request - Reject manual link request (for staff)
router.post('/reject-manual-request', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const userRole = req.user.role;
    const userId = req.user.id || req.user.userId;
    const userName = req.user.username || req.user.first_name || 'Staff';
    
    // Only allow DOD, DOS, Headmaster, Accountant
    if (!['dod', 'director_discipline', 'director_study', 'headmaster', 'accountant', 'admin'].includes(userRole)) {
      await connection.rollback();
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { request_id, notes } = req.body;

    if (!request_id) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Missing request ID' });
    }

    // Update request status
    await connection.execute(
      'UPDATE parent_manual_link_requests SET status = "rejected", processed_at = NOW(), processed_by = ?, processed_by_name = ?, notes = ? WHERE id = ?',
      [userId, userName, notes || 'Rejected by staff', request_id]
    );

    await connection.commit();

    res.json({ success: true, message: 'Request rejected' });
  } catch (error) {
    await connection.rollback();
    console.error('Error rejecting request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
});

// GET /api/parent-links/notifications - Get conduct/leave notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.id || req.user.userId;
    
    const [links] = await pool.execute(
      'SELECT student_id FROM parent_student_links WHERE parent_id = ? AND status = "approved"',
      [parentId]
    );
    
    if (links.length === 0) {
      return res.json({ success: true, notifications: [] });
    }
    
    const studentIds = links.map(l => l.student_id);
    const placeholders = studentIds.map(() => '?').join(',');
    
    const [conduct] = await pool.execute(`
      SELECT 
        'conduct' as type,
        scr.id,
        scr.student_id,
        gss.first_name,
        gss.last_name,
        CONCAT(gss.first_name, ' ', gss.last_name) as student_name,
        scr.incident_type as conduct_type,
        scr.severity,
        scr.description,
        scr.action_taken,
        scr.points_deducted as conduct_points_deducted,
        scr.new_conduct_score,
        scr.recorded_by_name as removed_by_name,
        scr.created_at
      FROM student_conduct_records scr
      JOIN global_student_sheets gss ON scr.student_id = gss.id
      WHERE scr.student_id IN (${placeholders})
      ORDER BY scr.created_at DESC
      LIMIT 20
    `, studentIds);
    
    const [leaves] = await pool.execute(`
      SELECT 
        'leave' as type,
        sl.id,
        sl.student_id,
        gss.first_name,
        gss.last_name,
        CONCAT(gss.first_name, ' ', gss.last_name) as student_name,
        sl.leave_type,
        sl.reason,
        sl.start_time,
        sl.end_time,
        sl.approved_by_name,
        sl.status,
        sl.created_at
      FROM student_leaves sl
      JOIN global_student_sheets gss ON sl.student_id = gss.id
      WHERE sl.student_id IN (${placeholders})
      ORDER BY sl.created_at DESC
      LIMIT 20
    `, studentIds);
    
    const notifications = [...conduct, ...leaves].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.json({ success: true, notifications: [] });
  }
});

module.exports = router;
