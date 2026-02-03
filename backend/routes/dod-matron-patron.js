const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * ====================================
 * DOD/MATRON/PATRON MANAGEMENT
 * ====================================
 * Comprehensive discipline and student welfare management
 * - Discipline tracking and conduct management
 * - Student leave management
 * - Conduct records with auto-grading
 * - Parent notifications for all actions
 * - Global student sheet access
 * - Behavior intervention tracking
 */

// =====================================
// DASHBOARD
// =====================================

router.get('/dashboard', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin']), async (req, res) => {
  try {
    const [disciplineStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN severity = 'minor' THEN 1 END) as minor_cases,
        COUNT(CASE WHEN severity = 'major' THEN 1 END) as major_cases,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_cases,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_cases,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_cases
      FROM discipline_records
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    const [conductStats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT student_id) as students_tracked,
        AVG(conduct_score) as avg_conduct_score,
        COUNT(CASE WHEN conduct_grade = 'Excellent' THEN 1 END) as excellent_count,
        COUNT(CASE WHEN conduct_grade = 'Good' THEN 1 END) as good_count,
        COUNT(CASE WHEN conduct_grade = 'Fair' THEN 1 END) as fair_count,
        COUNT(CASE WHEN conduct_grade = 'Poor' THEN 1 END) as poor_count
      FROM student_conduct
    `);
    
    const [leaveStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_leaves,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_leaves,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_leaves,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_leaves,
        COUNT(CASE WHEN leave_type = 'sick' THEN 1 END) as sick_leaves,
        COUNT(CASE WHEN leave_type = 'family' THEN 1 END) as family_leaves,
        COUNT(CASE WHEN leave_type = 'emergency' THEN 1 END) as emergency_leaves
      FROM student_leaves
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    const [recentDiscipline] = await pool.execute(`
      SELECT 
        dr.*,
        gss.first_name,
        gss.last_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number,
        gss.guardian_phone,
        u.first_name as reported_by_first_name,
        u.last_name as reported_by_last_name
      FROM discipline_records dr
      JOIN global_student_sheets gss ON dr.student_id = gss.student_id
      LEFT JOIN users u ON dr.reported_by = u.id
      ORDER BY dr.incident_date DESC
      LIMIT 10
    `);
    
    const [pendingLeaves] = await pool.execute(`
      SELECT 
        sl.*,
        gss.first_name,
        gss.last_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number,
        gss.guardian_phone,
        gss.guardian_name
      FROM student_leaves sl
      JOIN global_student_sheets gss ON sl.student_id = gss.student_id
      WHERE sl.status = 'pending'
      ORDER BY sl.created_at DESC
      LIMIT 10
    `);
    
    const [conductTrends] = await pool.execute(`
      SELECT 
        conduct_grade,
        COUNT(*) as student_count,
        AVG(conduct_score) as avg_score
      FROM student_conduct
      GROUP BY conduct_grade
      ORDER BY FIELD(conduct_grade, 'Excellent', 'Good', 'Fair', 'Poor')
    `);
    
    res.json({
      success: true,
      dashboard: {
        discipline: disciplineStats[0],
        conduct: conductStats[0],
        leaves: leaveStats[0],
        recent_discipline: recentDiscipline,
        pending_leaves: pendingLeaves,
        conduct_trends: conductTrends
      }
    });
  } catch (error) {
    console.error('DOD dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// DISCIPLINE MANAGEMENT
// =====================================

router.get('/discipline-records', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin', 'teacher']), async (req, res) => {
  try {
    const { student_id, severity, status, from_date, to_date, search } = req.query;
    
    let query = `
      SELECT 
        dr.*,
        gss.first_name,
        gss.last_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number,
        gss.level_suffix,
        gss.guardian_phone,
        gss.guardian_name,
        u.first_name as reported_by_first_name,
        u.last_name as reported_by_last_name
      FROM discipline_records dr
      JOIN global_student_sheets gss ON dr.student_id = gss.student_id
      LEFT JOIN users u ON dr.reported_by = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (student_id) {
      query += ` AND dr.student_id = ?`;
      params.push(student_id);
    }
    if (severity) {
      query += ` AND dr.severity = ?`;
      params.push(severity);
    }
    if (status) {
      query += ` AND dr.status = ?`;
      params.push(status);
    }
    if (from_date) {
      query += ` AND dr.incident_date >= ?`;
      params.push(from_date);
    }
    if (to_date) {
      query += ` AND dr.incident_date <= ?`;
      params.push(to_date);
    }
    if (search) {
      query += ` AND (gss.first_name LIKE ? OR gss.last_name LIKE ? OR gss.student_code LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ` ORDER BY dr.incident_date DESC, dr.created_at DESC LIMIT 100`;
    
    const [records] = await pool.execute(query, params);
    
    res.json({
      success: true,
      records: records
    });
  } catch (error) {
    console.error('Get discipline records error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/discipline-records', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin', 'teacher']), async (req, res) => {
  try {
    const {
      student_id,
      incident_type,
      incident_description,
      incident_date,
      severity,
      action_taken,
      witnesses,
      location
    } = req.body;
    
    if (!student_id || !incident_type || !incident_description || !severity) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const [student] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE student_id = ? AND status = "active"',
      [student_id]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Active student not found' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO discipline_records (
        student_id, incident_type, incident_description, incident_date,
        severity, action_taken, witnesses, location, reported_by,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        student_id, incident_type, incident_description,
        incident_date || new Date().toISOString().split('T')[0],
        severity, action_taken, witnesses, location, req.user.id
      ]
    );
    
    await updateStudentConduct(student_id);
    
    if (student[0].guardian_phone) {
      const message = `Dear ${student[0].guardian_name || 'Parent/Guardian'},\n\n` +
        `This is to inform you about a discipline incident involving ${student[0].first_name} ${student[0].last_name}.\n` +
        `Incident: ${incident_type}\n` +
        `Severity: ${severity}\n` +
        `Date: ${incident_date || new Date().toLocaleDateString()}\n\n` +
        `Please contact the school for more details.`;
      
      try {
        const smsService = require('../services/smsService');
        await smsService.sendSMS(student[0].guardian_phone, message);
        
        await pool.execute(
          `INSERT INTO parent_notifications (
            student_id, notification_type, message, sent_to,
            sent_via, sent_by, sent_at
          ) VALUES (?, 'discipline', ?, ?, 'sms', ?, NOW())`,
          [student_id, message, student[0].guardian_phone, req.user.id]
        );
      } catch (err) {
        console.error('SMS notification error:', err);
      }
    }
    
    res.json({
      success: true,
      message: 'Discipline record created successfully',
      record_id: result.insertId
    });
  } catch (error) {
    console.error('Create discipline record error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/discipline-records/:id', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { action_taken, status, resolution_notes } = req.body;
    
    const [result] = await pool.execute(
      `UPDATE discipline_records 
       SET action_taken = ?, status = ?, resolution_notes = ?, 
           resolved_by = ?, resolved_at = NOW()
       WHERE id = ?`,
      [action_taken, status, resolution_notes, req.user.id, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    
    res.json({
      success: true,
      message: 'Discipline record updated successfully'
    });
  } catch (error) {
    console.error('Update discipline record error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/discipline-records/:id', authenticateToken, requireRole(['dod', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM discipline_records WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    
    res.json({
      success: true,
      message: 'Discipline record deleted successfully'
    });
  } catch (error) {
    console.error('Delete discipline record error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// STUDENT LEAVE MANAGEMENT
// =====================================

router.get('/student-leaves', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin']), async (req, res) => {
  try {
    const { status, student_id, leave_type } = req.query;
    
    let query = `
      SELECT 
        sl.*,
        gss.first_name,
        gss.last_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number,
        gss.guardian_phone,
        gss.guardian_name,
        u1.first_name as approved_by_first_name,
        u1.last_name as approved_by_last_name
      FROM student_leaves sl
      JOIN global_student_sheets gss ON sl.student_id = gss.student_id
      LEFT JOIN users u1 ON sl.approved_by = u1.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ` AND sl.status = ?`;
      params.push(status);
    }
    if (student_id) {
      query += ` AND sl.student_id = ?`;
      params.push(student_id);
    }
    if (leave_type) {
      query += ` AND sl.leave_type = ?`;
      params.push(leave_type);
    }
    
    query += ` ORDER BY sl.created_at DESC LIMIT 100`;
    
    const [leaves] = await pool.execute(query, params);
    
    res.json({
      success: true,
      leaves: leaves
    });
  } catch (error) {
    console.error('Get student leaves error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/student-leaves', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin']), async (req, res) => {
  try {
    const {
      student_id,
      leave_type,
      start_date,
      end_date,
      reason,
      emergency_contact,
      destination
    } = req.body;
    
    if (!student_id || !leave_type || !start_date || !end_date || !reason) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const [student] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE student_id = ? AND status = "active"',
      [student_id]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Active student not found' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO student_leaves (
        student_id, leave_type, start_date, end_date, reason,
        emergency_contact, destination, created_by, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [student_id, leave_type, start_date, end_date, reason, emergency_contact, destination, req.user.id]
    );
    
    res.json({
      success: true,
      message: 'Leave request created successfully',
      leave_id: result.insertId
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/student-leaves/:id', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    
    const [leave] = await pool.execute(
      `SELECT sl.*, gss.guardian_phone, gss.guardian_name, gss.first_name, gss.last_name
       FROM student_leaves sl
       JOIN global_student_sheets gss ON sl.student_id = gss.student_id
       WHERE sl.id = ?`,
      [id]
    );
    
    if (leave.length === 0) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    
    const [result] = await pool.execute(
      `UPDATE student_leaves 
       SET status = ?, rejection_reason = ?, approved_by = ?, approved_at = NOW()
       WHERE id = ?`,
      [status, rejection_reason, req.user.id, id]
    );
    
    if (leave[0].guardian_phone) {
      const message = `Dear ${leave[0].guardian_name || 'Parent/Guardian'},\n\n` +
        `Leave request for ${leave[0].first_name} ${leave[0].last_name} has been ${status}.\n` +
        `Type: ${leave[0].leave_type}\n` +
        `Period: ${new Date(leave[0].start_date).toLocaleDateString()} to ${new Date(leave[0].end_date).toLocaleDateString()}\n` +
        (status === 'rejected' && rejection_reason ? `Reason: ${rejection_reason}\n` : '') +
        `\nThank you.`;
      
      try {
        const smsService = require('../services/smsService');
        await smsService.sendSMS(leave[0].guardian_phone, message);
        
        await pool.execute(
          `INSERT INTO parent_notifications (
            student_id, notification_type, message, sent_to,
            sent_via, sent_by, sent_at
          ) VALUES (?, 'leave_status', ?, ?, 'sms', ?, NOW())`,
          [leave[0].student_id, message, leave[0].guardian_phone, req.user.id]
        );
      } catch (err) {
        console.error('SMS notification error:', err);
      }
    }
    
    res.json({
      success: true,
      message: `Leave request ${status} successfully`
    });
  } catch (error) {
    console.error('Update leave request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// STUDENT CONDUCT TRACKING
// =====================================

router.get('/student-conduct/:student_id', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin', 'teacher']), async (req, res) => {
  try {
    const { student_id } = req.params;
    
    const [conduct] = await pool.execute(
      `SELECT 
        sc.*,
        gss.first_name,
        gss.last_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number
      FROM student_conduct sc
      JOIN global_student_sheets gss ON sc.student_id = gss.student_id
      WHERE sc.student_id = ?
      ORDER BY sc.term DESC, sc.academic_year DESC
      LIMIT 10`,
      [student_id]
    );
    
    res.json({
      success: true,
      conduct: conduct
    });
  } catch (error) {
    console.error('Get student conduct error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/student-conduct', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin']), async (req, res) => {
  try {
    const {
      student_id,
      academic_year,
      term,
      conduct_score,
      behavior_notes,
      recommendations
    } = req.body;
    
    if (!student_id || !academic_year || !term || conduct_score === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    let conduct_grade = 'Poor';
    if (conduct_score >= 90) conduct_grade = 'Excellent';
    else if (conduct_score >= 75) conduct_grade = 'Good';
    else if (conduct_score >= 60) conduct_grade = 'Fair';
    
    const [existing] = await pool.execute(
      'SELECT id FROM student_conduct WHERE student_id = ? AND academic_year = ? AND term = ?',
      [student_id, academic_year, term]
    );
    
    if (existing.length > 0) {
      await pool.execute(
        `UPDATE student_conduct 
         SET conduct_score = ?, conduct_grade = ?, behavior_notes = ?,
             recommendations = ?, updated_by = ?, updated_at = NOW()
         WHERE id = ?`,
        [conduct_score, conduct_grade, behavior_notes, recommendations, req.user.id, existing[0].id]
      );
      
      res.json({
        success: true,
        message: 'Conduct record updated successfully',
        conduct_id: existing[0].id
      });
    } else {
      const [result] = await pool.execute(
        `INSERT INTO student_conduct (
          student_id, academic_year, term, conduct_score, conduct_grade,
          behavior_notes, recommendations, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [student_id, academic_year, term, conduct_score, conduct_grade, behavior_notes, recommendations, req.user.id]
      );
      
      res.json({
        success: true,
        message: 'Conduct record created successfully',
        conduct_id: result.insertId
      });
    }
  } catch (error) {
    console.error('Create/update conduct record error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// GLOBAL STUDENT SHEET ACCESS
// =====================================

router.get('/students', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin', 'teacher']), async (req, res) => {
  try {
    const { search, trade_code, level_number, status } = req.query;
    
    let query = `
      SELECT 
        gss.*,
        (SELECT COUNT(*) FROM discipline_records WHERE student_id = gss.student_id) as discipline_count,
        (SELECT conduct_grade FROM student_conduct WHERE student_id = gss.student_id ORDER BY created_at DESC LIMIT 1) as latest_conduct_grade
      FROM global_student_sheets gss
      WHERE 1=1
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
    if (status) {
      query += ` AND gss.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY gss.trade_code, gss.level_number, gss.last_name LIMIT 200`;
    
    const [students] = await pool.execute(query, params);
    
    res.json({
      success: true,
      students: students,
      total: students.length
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/students/:student_id/details', authenticateToken, requireRole(['dod', 'matron', 'patron', 'admin']), async (req, res) => {
  try {
    const { student_id } = req.params;
    
    const [student] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE student_id = ?',
      [student_id]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const [disciplineRecords] = await pool.execute(
      `SELECT * FROM discipline_records 
       WHERE student_id = ? 
       ORDER BY incident_date DESC 
       LIMIT 10`,
      [student_id]
    );
    
    const [conductRecords] = await pool.execute(
      `SELECT * FROM student_conduct 
       WHERE student_id = ? 
       ORDER BY academic_year DESC, term DESC 
       LIMIT 5`,
      [student_id]
    );
    
    const [leaveRecords] = await pool.execute(
      `SELECT * FROM student_leaves 
       WHERE student_id = ? 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [student_id]
    );
    
    const [linkedParent] = await pool.execute(
      `SELECT u.id, u.first_name, u.last_name, u.phone, u.email, psl.relationship
       FROM parent_student_links psl
       JOIN users u ON psl.parent_id = u.id
       WHERE psl.student_id = ?`,
      [student_id]
    );
    
    res.json({
      success: true,
      student: student[0],
      discipline_records: disciplineRecords,
      conduct_records: conductRecords,
      leave_records: leaveRecords,
      linked_parent: linkedParent[0] || null
    });
  } catch (error) {
    console.error('Get student details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// HELPER FUNCTIONS
// =====================================

async function updateStudentConduct(student_id) {
  try {
    const [disciplineRecords] = await pool.execute(
      `SELECT severity FROM discipline_records 
       WHERE student_id = ? AND incident_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)`,
      [student_id]
    );
    
    let baseScore = 100;
    disciplineRecords.forEach(record => {
      if (record.severity === 'critical') baseScore -= 15;
      else if (record.severity === 'major') baseScore -= 10;
      else if (record.severity === 'minor') baseScore -= 5;
    });
    
    baseScore = Math.max(0, baseScore);
    
    let conduct_grade = 'Poor';
    if (baseScore >= 90) conduct_grade = 'Excellent';
    else if (baseScore >= 75) conduct_grade = 'Good';
    else if (baseScore >= 60) conduct_grade = 'Fair';
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const term = currentMonth <= 4 ? 1 : currentMonth <= 8 ? 2 : 3;
    
    const [existing] = await pool.execute(
      'SELECT id FROM student_conduct WHERE student_id = ? AND academic_year = ? AND term = ?',
      [student_id, currentYear, term]
    );
    
    if (existing.length > 0) {
      await pool.execute(
        `UPDATE student_conduct 
         SET conduct_score = ?, conduct_grade = ?, updated_at = NOW()
         WHERE id = ?`,
        [baseScore, conduct_grade, existing[0].id]
      );
    } else {
      await pool.execute(
        `INSERT INTO student_conduct (
          student_id, academic_year, term, conduct_score, conduct_grade, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [student_id, currentYear, term, baseScore, conduct_grade]
      );
    }
  } catch (error) {
    console.error('Update student conduct error:', error);
  }
}

module.exports = router;
