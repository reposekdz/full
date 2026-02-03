const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * ====================================
 * ULTRA-ADVANCED DOD/MATRON/PATRON MANAGEMENT
 * ====================================
 * Comprehensive discipline and student welfare management
 * - Full global student sheet integration with drill-down views
 * - Discipline management with parent notifications
 * - Leave management with tracking
 * - Conduct removal system with history
 * - Location tracking and reports
 * - Auto parent notifications via SMS
 */

// =====================================
// DASHBOARD - Comprehensive Overview
// =====================================

router.get('/dashboard', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [studentStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_students,
        COUNT(CASE WHEN gender = 'Male' THEN 1 END) as male_students,
        COUNT(CASE WHEN gender = 'Female' THEN 1 END) as female_students,
        AVG(CASE WHEN attendance_percentage > 0 THEN attendance_percentage END) as avg_attendance
      FROM global_student_sheets
    `);
    
    const [disciplineStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_incidents,
        COUNT(CASE WHEN incident_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as recent_incidents,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_severity,
        COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_severity,
        COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_severity
      FROM student_discipline_records
      WHERE incident_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    const [leaveStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_leaves,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_leaves,
        COUNT(CASE WHEN leave_type = 'sick' THEN 1 END) as sick_leaves,
        COUNT(CASE WHEN leave_type = 'family' THEN 1 END) as family_leaves
      FROM student_leave_records
      WHERE start_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    const [recentDiscipline] = await pool.execute(`
      SELECT 
        sdr.*,
        gss.first_name,
        gss.last_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number,
        gss.level_suffix,
        gss.guardian_name,
        gss.guardian_phone
      FROM student_discipline_records sdr
      JOIN global_student_sheets gss ON sdr.student_id = gss.student_id
      WHERE gss.status = 'active'
      ORDER BY sdr.incident_date DESC, sdr.created_at DESC
      LIMIT 20
    `);
    
    const [activeLeaves] = await pool.execute(`
      SELECT 
        slr.*,
        gss.first_name,
        gss.last_name,
        gss.student_code,
        gss.trade_code,
        gss.guardian_phone
      FROM student_leave_records slr
      JOIN global_student_sheets gss ON slr.student_id = gss.student_id
      WHERE slr.status = 'active'
      ORDER BY slr.start_time DESC
      LIMIT 20
    `);
    
    res.json({
      success: true,
      dashboard: {
        students: studentStats[0],
        discipline: disciplineStats[0],
        leaves: leaveStats[0],
        recent_discipline: recentDiscipline,
        active_leaves: activeLeaves
      }
    });
  } catch (error) {
    console.error('DOD dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// GLOBAL STUDENT SHEET - Full Access
// =====================================

router.get('/students', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { search, trade_code, level_number, level_suffix, gender, has_discipline } = req.query;
    
    let query = `
      SELECT 
        gss.*,
        COUNT(DISTINCT sdr.id) as discipline_count,
        COUNT(DISTINCT slr.id) as leave_count,
        MAX(sdr.incident_date) as last_incident_date
      FROM global_student_sheets gss
      LEFT JOIN student_discipline_records sdr ON gss.student_id = sdr.student_id
      LEFT JOIN student_leave_records slr ON gss.student_id = slr.student_id
      WHERE gss.status = 'active'
    `;
    const params = [];
    
    if (search) {
      query += ` AND (gss.first_name LIKE ? OR gss.last_name LIKE ? OR gss.student_code LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (trade_code) {
      query += ` AND gss.trade_code = ?`;
      params.push(trade_code);
    }
    
    if (level_number) {
      query += ` AND gss.level_number = ?`;
      params.push(level_number);
    }
    
    if (level_suffix) {
      query += ` AND gss.level_suffix = ?`;
      params.push(level_suffix);
    }
    
    if (gender) {
      query += ` AND gss.gender = ?`;
      params.push(gender);
    }
    
    query += ` GROUP BY gss.student_id ORDER BY gss.first_name, gss.last_name`;
    
    const [students] = await pool.execute(query, params);
    
    if (has_discipline === 'true') {
      const filteredStudents = students.filter(s => s.discipline_count > 0);
      return res.json({ success: true, students: filteredStudents, total: filteredStudents.length });
    }
    
    res.json({ success: true, students: students, total: students.length });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single student with full details including linked children
router.get('/students/:student_id', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [student] = await pool.execute(`
      SELECT * FROM global_student_sheets WHERE student_id = ?
    `, [req.params.student_id]);
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const [discipline] = await pool.execute(`
      SELECT * FROM student_discipline_records WHERE student_id = ? ORDER BY incident_date DESC
    `, [req.params.student_id]);
    
    const [leaves] = await pool.execute(`
      SELECT * FROM student_leave_records WHERE student_id = ? ORDER BY start_time DESC
    `, [req.params.student_id]);
    
    const [attendance] = await pool.execute(`
      SELECT * FROM student_attendance_records WHERE student_id = ? ORDER BY attendance_date DESC LIMIT 50
    `, [req.params.student_id]);
    
    let linkedParent = null;
    if (student[0].guardian_phone) {
      const [parent] = await pool.execute(`
        SELECT id, first_name, last_name, email, phone, district, province, guardian_type
        FROM users
        WHERE role = 'parent' AND phone = ?
        LIMIT 1
      `, [student[0].guardian_phone]);
      
      if (parent.length > 0) {
        linkedParent = parent[0];
        
        const [linkedChildren] = await pool.execute(`
          SELECT student_id, first_name, last_name, student_code, trade_code, level_number, level_suffix, gender, date_of_birth
          FROM global_student_sheets
          WHERE guardian_phone = ? AND status = 'active'
        `, [student[0].guardian_phone]);
        
        linkedParent.linked_children = linkedChildren;
      }
    }
    
    res.json({
      success: true,
      student: {
        ...student[0],
        discipline_records: discipline,
        leave_records: leaves,
        attendance_records: attendance,
        linked_parent: linkedParent
      }
    });
  } catch (error) {
    console.error('Get student details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// DISCIPLINE MANAGEMENT
// =====================================

router.post('/discipline', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin']), async (req, res) => {
  try {
    const {
      student_id,
      incident_date,
      incident_type,
      severity,
      category,
      description,
      location,
      action_taken
    } = req.body;
    
    if (!student_id || !description) {
      return res.status(400).json({ success: false, message: 'Student ID and description are required' });
    }
    
    const [student] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE student_id = ? AND status = "active"',
      [student_id]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Active student not found' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO student_discipline_records (
        student_id, incident_date, incident_type, severity, category,
        description, location, action_taken, recorded_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        student_id,
        incident_date || new Date().toISOString().split('T')[0],
        incident_type || 'behavioral',
        severity || 'medium',
        category || 'conduct',
        description,
        location || '',
        action_taken || '',
        req.user.id
      ]
    );
    
    if (student[0].guardian_phone) {
      let smsService;
      try {
        smsService = require('../services/smsService');
        
        const message = `Dear ${student[0].guardian_name || 'Parent/Guardian'},\n\n` +
          `Discipline action recorded for ${student[0].first_name} ${student[0].last_name} (${student[0].student_code}).\n` +
          `Type: ${incident_type}\nSeverity: ${severity}\n` +
          `Description: ${description}\n` +
          `Please contact the school for more information.`;
        
        await smsService.sendSMS(student[0].guardian_phone, message);
      } catch (err) {
        console.log('SMS notification failed:', err);
      }
    }
    
    res.json({
      success: true,
      message: 'Discipline record created successfully',
      discipline_id: result.insertId
    });
  } catch (error) {
    console.error('Create discipline record error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/discipline', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { student_id, severity, start_date, end_date, limit } = req.query;
    
    let query = `
      SELECT 
        sdr.*,
        gss.first_name,
        gss.last_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number,
        gss.level_suffix,
        u.first_name as recorded_by_name
      FROM student_discipline_records sdr
      JOIN global_student_sheets gss ON sdr.student_id = gss.student_id
      LEFT JOIN users u ON sdr.recorded_by = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (student_id) {
      query += ` AND sdr.student_id = ?`;
      params.push(student_id);
    }
    
    if (severity) {
      query += ` AND sdr.severity = ?`;
      params.push(severity);
    }
    
    if (start_date) {
      query += ` AND sdr.incident_date >= ?`;
      params.push(start_date);
    }
    
    if (end_date) {
      query += ` AND sdr.incident_date <= ?`;
      params.push(end_date);
    }
    
    query += ` ORDER BY sdr.incident_date DESC, sdr.created_at DESC LIMIT ?`;
    params.push(parseInt(limit) || 100);
    
    const [records] = await pool.execute(query, params);
    
    res.json({ success: true, records: records });
  } catch (error) {
    console.error('Get discipline records error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// LEAVE MANAGEMENT
// =====================================

router.post('/leave/grant', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin']), async (req, res) => {
  try {
    const {
      student_id,
      leave_type,
      reason,
      start_time,
      end_time,
      destination,
      picked_by_name,
      picked_by_phone
    } = req.body;
    
    if (!student_id || !leave_type || !start_time) {
      return res.status(400).json({ success: false, message: 'Student ID, leave type, and start time are required' });
    }
    
    const [student] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE student_id = ? AND status = "active"',
      [student_id]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Active student not found' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO student_leave_records (
        student_id, leave_type, reason, start_time, end_time,
        destination, picked_by_name, picked_by_phone,
        approved_by, approved_by_name, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [
        student_id, leave_type, reason, start_time, end_time || null,
        destination || '', picked_by_name || '', picked_by_phone || '',
        req.user.id, `${req.user.first_name} ${req.user.last_name}`
      ]
    );
    
    if (student[0].guardian_phone) {
      let smsService;
      try {
        smsService = require('../services/smsService');
        
        const message = `Dear ${student[0].guardian_name || 'Parent/Guardian'},\n\n` +
          `Leave granted for ${student[0].first_name} ${student[0].last_name} (${student[0].student_code}).\n` +
          `Type: ${leave_type}\nStart: ${start_time}\n` +
          `Destination: ${destination || 'Not specified'}\n` +
          `Approved by: ${req.user.first_name} ${req.user.last_name}`;
        
        await smsService.sendSMS(student[0].guardian_phone, message);
      } catch (err) {
        console.log('SMS notification failed:', err);
      }
    }
    
    res.json({
      success: true,
      message: 'Leave granted successfully',
      leave_id: result.insertId
    });
  } catch (error) {
    console.error('Grant leave error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/leave/:leave_id/return', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin']), async (req, res) => {
  try {
    const { return_time, remarks } = req.body;
    
    await pool.execute(
      `UPDATE student_leave_records 
       SET status = 'returned', end_time = ?, remarks = ?, updated_at = NOW()
       WHERE id = ?`,
      [return_time || new Date().toISOString(), remarks || '', req.params.leave_id]
    );
    
    res.json({ success: true, message: 'Student return recorded successfully' });
  } catch (error) {
    console.error('Record return error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/leave', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { student_id, status, leave_type, limit } = req.query;
    
    let query = `
      SELECT 
        slr.*,
        gss.first_name,
        gss.last_name,
        gss.student_code,
        gss.trade_code,
        gss.guardian_phone
      FROM student_leave_records slr
      JOIN global_student_sheets gss ON slr.student_id = gss.student_id
      WHERE 1=1
    `;
    const params = [];
    
    if (student_id) {
      query += ` AND slr.student_id = ?`;
      params.push(student_id);
    }
    
    if (status) {
      query += ` AND slr.status = ?`;
      params.push(status);
    }
    
    if (leave_type) {
      query += ` AND slr.leave_type = ?`;
      params.push(leave_type);
    }
    
    query += ` ORDER BY slr.start_time DESC LIMIT ?`;
    params.push(parseInt(limit) || 100);
    
    const [leaves] = await pool.execute(query, params);
    
    res.json({ success: true, leaves: leaves });
  } catch (error) {
    console.error('Get leave records error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// REPORTS GENERATION
// =====================================

router.post('/reports/generate', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { report_type, start_date, end_date, student_id, trade_code } = req.body;
    
    let report = {};
    
    if (report_type === 'discipline_summary') {
      const [summary] = await pool.execute(`
        SELECT 
          gss.trade_code,
          gss.level_number,
          gss.level_suffix,
          COUNT(DISTINCT sdr.id) as total_incidents,
          COUNT(DISTINCT sdr.student_id) as students_involved,
          COUNT(CASE WHEN sdr.severity = 'high' THEN 1 END) as high_severity,
          COUNT(CASE WHEN sdr.severity = 'medium' THEN 1 END) as medium_severity,
          COUNT(CASE WHEN sdr.severity = 'low' THEN 1 END) as low_severity
        FROM student_discipline_records sdr
        JOIN global_student_sheets gss ON sdr.student_id = gss.student_id
        WHERE sdr.incident_date BETWEEN ? AND ?
        ${trade_code ? 'AND gss.trade_code = ?' : ''}
        GROUP BY gss.trade_code, gss.level_number, gss.level_suffix
      `, trade_code ? [start_date, end_date, trade_code] : [start_date, end_date]);
      
      report = { type: 'discipline_summary', period: { start_date, end_date }, summary };
    }
    
    if (report_type === 'student_discipline') {
      const [records] = await pool.execute(`
        SELECT 
          sdr.*,
          gss.first_name,
          gss.last_name,
          gss.student_code,
          gss.trade_code
        FROM student_discipline_records sdr
        JOIN global_student_sheets gss ON sdr.student_id = gss.student_id
        WHERE sdr.student_id = ?
        ORDER BY sdr.incident_date DESC
      `, [student_id]);
      
      report = { type: 'student_discipline', student_id, records };
    }
    
    res.json({ success: true, report });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
