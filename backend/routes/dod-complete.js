const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { sendConductRemovalSMS, sendLeaveApprovalSMS, sendCustomParentSMS } = require('../services/gardenSMSService');

const router = express.Router();

// ==================== GET ALL STUDENTS WITH PARENT INFO ====================
router.get('/students/all', authenticateToken, async (req, res) => {
  try {
    const { search, trade_code, level_number, conduct_filter } = req.query;
    
    let query = `
      SELECT DISTINCT
        gss.id, gss.student_code, gss.first_name, gss.last_name,
        gss.trade_code, gss.trade_name, gss.level_number,
        gss.conduct_score, gss.conduct_grade,
        CASE 
          WHEN gss.conduct_score >= 32 THEN 'Excellent'
          WHEN gss.conduct_score >= 24 THEN 'Good' 
          WHEN gss.conduct_score >= 16 THEN 'Warning'
          ELSE 'Critical'
        END as conduct_status,
        gss.overall_attendance_percentage, gss.gender,
        gss.phone,
        COUNT(DISTINCT dr.id) as total_incidents,
        COUNT(DISTINCT pc.id) as linked_parents,
        GROUP_CONCAT(DISTINCT COALESCE(pc.parent_phone, pc.phone)) as parent_phones,
        GROUP_CONCAT(DISTINCT pc.parent_name) as parent_names
      FROM global_student_sheets gss
      LEFT JOIN discipline_records dr ON gss.id = dr.student_id
      LEFT JOIN parent_connections pc ON gss.id = pc.student_id AND COALESCE(pc.status, 'active') = 'active'
      WHERE gss.status = 'active'
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (gss.first_name LIKE ? OR gss.last_name LIKE ? OR gss.student_code LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (trade_code) {
      query += ` AND gss.trade_code = ?`;
      params.push(trade_code);
    }
    
    if (level_number) {
      query += ` AND gss.level_number = ?`;
      params.push(level_number);
    }
    
    if (conduct_filter === 'poor') {
      query += ` AND gss.conduct_score < 24`;
    } else if (conduct_filter === 'warning') {
      query += ` AND gss.conduct_score >= 24 AND gss.conduct_score < 32`;
    }
    
    query += ` GROUP BY gss.id ORDER BY gss.first_name, gss.last_name`;
    
    const [students] = await pool.execute(query, params);
    
    res.json({ success: true, students });
  } catch (error) {
    console.error('Get Students Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== REMOVE CONDUCT WITH AUTO SMS ====================
router.post('/conduct/remove', authenticateToken, async (req, res) => {
  try {
    const { 
      student_id, conduct_type, severity, description, 
      action_taken, conduct_points_deducted, new_conduct_score, removed_by_name 
    } = req.body;
    
    // Get student
    const [students] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE id = ?',
      [student_id]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const student = students[0];
    
    // Insert discipline record
    const [result] = await pool.execute(`
      INSERT INTO discipline_records 
      (student_id, student_code, student_name, trade, class_level, conduct_type, 
       severity, description, action_taken, conduct_points_deducted, new_conduct_score, 
       removed_by_name, parent_notified, sms_sent, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, false, false, NOW())
    `, [
      student_id, student.student_code, `${student.first_name} ${student.last_name}`,
      student.code, student.level_number, conduct_type, severity,
      description, action_taken || '', conduct_points_deducted, new_conduct_score,
      removed_by_name
    ]);
    
    // Update conduct score
    await pool.execute(
      'UPDATE global_student_sheets SET conduct_score = ? WHERE id = ?',
      [new_conduct_score, student_id]
    );
    
    // Get all linked parents
    const [connections] = await pool.execute(
      `SELECT DISTINCT parent_phone, parent_name 
       FROM parent_connections 
       WHERE student_id = ? AND status = 'active' AND can_receive_notifications = 1 AND parent_phone IS NOT NULL`,
      [student_id]
    );
    
    let notifiedCount = 0;
    const smsResults = [];
    
    for (const conn of connections) {
      try {
        const smsResult = await sendConductRemovalSMS(
          conn.parent_phone,
          {
            name: `${student.first_name} ${student.last_name}`,
            code: student.student_code,
            trade: student.code,
            level: student.level_number,
            parentName: conn.parent_name || 'Mubyeyi'
          },
          {
            type: conduct_type,
            severity: severity,
            description: description,
            action: action_taken || 'Igihano cyatanzwe',
            pointsDeducted: conduct_points_deducted,
            newScore: new_conduct_score
          },
          {
            name: removed_by_name,
            role: removed_by_name.includes('Patron') ? 'Patron' : 
                  removed_by_name.includes('Matron') ? 'Matron' : 'DOD',
            phone: '+250783407691'
          }
        );
        
        if (smsResult.success) {
          notifiedCount++;
          smsResults.push({ phone: conn.parent_phone, status: 'sent', messageId: smsResult.messageId });
        }
      } catch (err) {
        console.error('SMS Error:', err);
        smsResults.push({ phone: conn.parent_phone, status: 'failed', error: err.message });
      }
    }
    
    if (notifiedCount > 0) {
      await pool.execute(
        'UPDATE discipline_records SET parent_notified = true, sms_sent = true WHERE id = ?',
        [result.insertId]
      );
    }
    
    res.json({ 
      success: true, 
      message: 'Conduct removed successfully', 
      recordId: result.insertId,
      parentsNotified: notifiedCount,
      smsResults
    });
  } catch (error) {
    console.error('Remove Conduct Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== GRANT LEAVE WITH AUTO SMS ====================
router.post('/leave/grant', authenticateToken, async (req, res) => {
  try {
    const { student_id, leave_type, reason, start_time, end_time, approved_by_name } = req.body;
    
    const [students] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE id = ?',
      [student_id]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const student = students[0];
    
    const [result] = await pool.execute(`
      INSERT INTO student_leaves 
      (student_id, student_code, student_name, trade, class_level, leave_type, 
       reason, start_time, end_time, approved_by_name, status, parent_notified, sms_sent, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', false, false, NOW())
    `, [
      student_id, student.student_code, `${student.first_name} ${student.last_name}`,
      student.code, student.level_number, leave_type, reason,
      start_time, end_time || start_time, approved_by_name
    ]);
    
    const [connections] = await pool.execute(
      `SELECT DISTINCT parent_phone, parent_name 
       FROM parent_connections 
       WHERE student_id = ? AND status = 'active' AND can_receive_notifications = 1 AND parent_phone IS NOT NULL`,
      [student_id]
    );
    
    let notifiedCount = 0;
    const smsResults = [];
    
    for (const conn of connections) {
      try {
        const smsResult = await sendLeaveApprovalSMS(
          conn.parent_phone,
          {
            name: `${student.first_name} ${student.last_name}`,
            code: student.student_code,
            trade: student.code,
            level: student.level_number,
            parentName: conn.parent_name || 'Mubyeyi'
          },
          {
            type: leave_type,
            reason: reason,
            startTime: start_time,
            endTime: end_time || start_time
          },
          {
            name: approved_by_name,
            role: approved_by_name.includes('Patron') ? 'Patron' : 
                  approved_by_name.includes('Matron') ? 'Matron' : 'DOD',
            phone: '+250783407691'
          }
        );
        
        if (smsResult.success) {
          notifiedCount++;
          smsResults.push({ phone: conn.parent_phone, status: 'sent', messageId: smsResult.messageId });
        }
      } catch (err) {
        console.error('SMS Error:', err);
        smsResults.push({ phone: conn.parent_phone, status: 'failed', error: err.message });
      }
    }
    
    if (notifiedCount > 0) {
      await pool.execute(
        'UPDATE student_leaves SET parent_notified = true, sms_sent = true WHERE id = ?',
        [result.insertId]
      );
    }
    
    res.json({ 
      success: true, 
      message: 'Leave granted successfully', 
      leaveId: result.insertId,
      parentsNotified: notifiedCount,
      smsResults
    });
  } catch (error) {
    console.error('Grant Leave Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== MESSAGE PARENTS (SINGLE OR BULK) ====================
router.post('/message-parents', authenticateToken, async (req, res) => {
  try {
    const { subject, message, send_via, student_ids } = req.body;
    
    if (!student_ids || student_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No students selected' });
    }
    
    let totalParents = 0;
    let successCount = 0;
    const results = [];
    
    for (const student_id of student_ids) {
      const [students] = await pool.execute(
        'SELECT * FROM global_student_sheets WHERE id = ?',
        [student_id]
      );
      
      if (students.length === 0) continue;
      const student = students[0];
      
      const [connections] = await pool.execute(
        `SELECT DISTINCT parent_phone, parent_name 
         FROM parent_connections 
         WHERE student_id = ? AND status = 'active' AND can_receive_notifications = 1 AND parent_phone IS NOT NULL`,
        [student_id]
      );
      
      for (const conn of connections) {
        totalParents++;
        try {
          const smsResult = await sendCustomParentSMS(
            conn.parent_phone,
            {
              name: `${student.first_name} ${student.last_name}`,
              code: student.student_code,
              trade: student.code,
              level: student.level_number,
              parentName: conn.parent_name || 'Mubyeyi'
            },
            {
              subject: subject,
              message: message
            },
            {
              name: req.user?.name || 'Garden TVET Staff',
              role: 'DOD',
              phone: '+250783407691'
            }
          );
          
          if (smsResult.success) {
            successCount++;
            results.push({ 
              student: `${student.first_name} ${student.last_name}`,
              parent: conn.parent_phone, 
              status: 'sent', 
              messageId: smsResult.messageId 
            });
          }
          
          // Log message
          await pool.execute(`
            INSERT INTO parent_messages 
            (student_id, parent_phone, subject, message, send_via, sent_by_name, delivery_status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'sent', NOW())
          `, [student_id, conn.parent_phone, subject, message, send_via, req.user?.name || 'DOD']);
          
        } catch (err) {
          console.error('SMS Error:', err);
          results.push({ 
            student: `${student.first_name} ${student.last_name}`,
            parent: conn.parent_phone, 
            status: 'failed', 
            error: err.message 
          });
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: `Messages sent to ${successCount} out of ${totalParents} parents`,
      count: successCount,
      total: totalParents,
      results
    });
  } catch (error) {
    console.error('Message Parents Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== MESSAGE ALL PARENTS ====================
router.post('/message-all-parents', authenticateToken, async (req, res) => {
  try {
    const { subject, message, send_via, filters } = req.body;
    
    let query = `
      SELECT DISTINCT 
        pc.parent_phone, pc.parent_name,
        gss.id as student_id, gss.first_name, gss.last_name, 
        gss.student_code, gss.trade_code, gss.level_number
      FROM parent_connections pc
      JOIN global_student_sheets gss ON pc.student_id = gss.id
      WHERE pc.status = 'active' 
        AND pc.can_receive_notifications = 1 
        AND pc.parent_phone IS NOT NULL
        AND gss.status = 'active'
    `;
    
    const params = [];
    
    if (filters?.trade_code) {
      query += ` AND gss.trade_code = ?`;
      params.push(filters.trade_code);
    }
    
    if (filters?.level_number) {
      query += ` AND gss.level_number = ?`;
      params.push(filters.level_number);
    }
    
    const [parents] = await pool.execute(query, params);
    
    let successCount = 0;
    const results = [];
    
    for (const parent of parents) {
      try {
        const smsResult = await sendCustomParentSMS(
          parent.parent_phone,
          {
            name: `${parent.first_name} ${parent.last_name}`,
            code: parent.student_code,
            trade: parent.code,
            level: parent.level_number,
            parentName: parent.parent_name || 'Mubyeyi'
          },
          {
            subject: subject,
            message: message
          },
          {
            name: req.user?.name || 'Garden TVET Staff',
            role: 'DOD',
            phone: '+250783407691'
          }
        );
        
        if (smsResult.success) {
          successCount++;
          results.push({ parent: parent.parent_phone, status: 'sent' });
        }
        
        await pool.execute(`
          INSERT INTO parent_messages 
          (student_id, parent_phone, subject, message, send_via, sent_by_name, delivery_status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 'sent', NOW())
        `, [parent.student_id, parent.parent_phone, subject, message, send_via, req.user?.name || 'DOD']);
        
      } catch (err) {
        console.error('SMS Error:', err);
        results.push({ parent: parent.parent_phone, status: 'failed', error: err.message });
      }
    }
    
    res.json({ 
      success: true, 
      message: `Broadcast sent to ${successCount} out of ${parents.length} parents`,
      count: successCount,
      total: parents.length,
      results
    });
  } catch (error) {
    console.error('Broadcast Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== GET STATISTICS ====================
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const [[totalStudents]] = await pool.execute(
      'SELECT COUNT(*) as count FROM global_student_sheets WHERE status = "active"'
    );
    
    const [[linkedParents]] = await pool.execute(
      'SELECT COUNT(DISTINCT COALESCE(parent_phone, phone)) as count FROM parent_connections WHERE COALESCE(status, "active") = "active" AND COALESCE(parent_phone, phone) IS NOT NULL'
    );
    
    const [[totalIncidents]] = await pool.execute(
      'SELECT COUNT(*) as count FROM discipline_records WHERE MONTH(created_at) = MONTH(CURRENT_DATE())'
    );
    
    const [[criticalIncidents]] = await pool.execute(
      'SELECT COUNT(*) as count FROM discipline_records WHERE severity = "Bikomeye" AND MONTH(created_at) = MONTH(CURRENT_DATE())'
    );
    
    const [[highIncidents]] = await pool.execute(
      'SELECT COUNT(*) as count FROM discipline_records WHERE severity = "Byagutse" AND MONTH(created_at) = MONTH(CURRENT_DATE())'
    );
    
    const [[pendingActions]] = await pool.execute(
      'SELECT COUNT(*) as count FROM global_student_sheets WHERE conduct_score < 24 AND status = "active"'
    );
    
    const [[avgConduct]] = await pool.execute(
      'SELECT AVG(conduct_score) as avg FROM global_student_sheets WHERE status = "active"'
    );
    
    res.json({
      success: true,
      stats: {
        totalStudents: totalStudents.count,
        linkedParents: linkedParents.count,
        totalIncidents: totalIncidents.count,
        criticalIncidents: criticalIncidents.count,
        highIncidents: highIncidents.count,
        pendingActions: pendingActions.count,
        avgConductScore: Math.round(avgConduct.avg || 0)
      }
    });
  } catch (error) {
    console.error('Statistics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== GET STUDENT HISTORY ====================
router.get('/student/:id/history', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [conduct] = await pool.execute(
      'SELECT * FROM discipline_records WHERE student_id = ? ORDER BY created_at DESC LIMIT 20',
      [id]
    );
    
    const [leaves] = await pool.execute(
      'SELECT * FROM student_leaves WHERE student_id = ? ORDER BY created_at DESC LIMIT 20',
      [id]
    );
    
    const [messages] = await pool.execute(
      'SELECT * FROM parent_messages WHERE student_id = ? ORDER BY created_at DESC LIMIT 20',
      [id]
    );
    
    res.json({ success: true, conduct, leaves, messages });
  } catch (error) {
    console.error('History Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
