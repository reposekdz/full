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
        gss.id, gss.first_name, gss.last_name,
        gss.trade_code, gss.trade_name, gss.level_number,
        gss.conduct_score, gss.conduct_grade,
        CASE 
          WHEN gss.conduct_score >= 36 THEN 'Excellent'
          WHEN gss.conduct_score >= 32 THEN 'Good' 
          WHEN gss.conduct_score >= 28 THEN 'Fair'
          WHEN gss.conduct_score >= 24 THEN 'Warning'
          ELSE 'Critical'
        END as conduct_status,
        gss.overall_attendance_percentage, gss.gender,
        gss.phone,
        COUNT(DISTINCT scr.id) as total_incidents,
        COUNT(DISTINCT pc.id) as linked_parents,
        GROUP_CONCAT(DISTINCT COALESCE(pc.parent_phone, pc.phone)) as parent_phones,
        GROUP_CONCAT(DISTINCT pc.parent_name) as parent_names
      FROM global_student_sheets gss
      LEFT JOIN student_conduct_records scr ON gss.id = scr.student_id
      LEFT JOIN parent_connections pc ON gss.id = pc.student_id AND COALESCE(pc.status, 'active') = 'active'
      WHERE gss.status = 'active'
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (gss.first_name LIKE ? OR gss.last_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
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
    
    const [students] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE id = ?',
      [student_id]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const student = students[0];
    const currentScore = student.conduct_score || 40;
    const pointsToDeduct = parseInt(conduct_points_deducted) || 0;
    const calculatedNewScore = Math.max(0, currentScore - pointsToDeduct);
    
    // Insert conduct record
    const [result] = await pool.execute(`
      INSERT INTO student_conduct_records 
      (student_id, incident_type, severity, description, action_taken, incident_date)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [
      student_id, conduct_type || 'Disrespect', severity || 'moderate',
      description, action_taken || ''
    ]);
    
    // Update conduct score with calculated value
    await pool.execute(
      'UPDATE global_student_sheets SET conduct_score = ? WHERE id = ?',
      [calculatedNewScore, student_id]
    );
    
    // Send SMS to linked parents
    let parentsNotified = 0;
    try {
      const [connections] = await pool.execute(
        `SELECT DISTINCT parent_phone, parent_name 
         FROM parent_connections 
         WHERE student_id = ? AND status = 'active' AND can_receive_notifications = 1 AND parent_phone IS NOT NULL`,
        [student_id]
      );
      
      for (const conn of connections) {
        try {
          const message = `Garden TVET: Umwana ${student.first_name} ${student.last_name} yakiriye igihano cya ${conduct_type}. Amanota ${pointsToDeduct} yakuweho. Amanota ashya: ${calculatedNewScore}/40. ${description}`;
          
          await pool.execute(
            `INSERT INTO sms_queue (phone_number, message, status, priority, created_at) VALUES (?, ?, 'pending', 'high', NOW())`,
            [conn.parent_phone, message]
          );
          parentsNotified++;
        } catch (smsError) {
          console.log('SMS queue error:', smsError.message);
        }
      }
    } catch (linkError) {
      console.log('Parent linking not available:', linkError.message);
    }
    
    res.json({ 
      success: true, 
      message: 'Conduct removed successfully', 
      recordId: result.insertId,
      pointsDeducted: pointsToDeduct,
      oldScore: currentScore,
      newScore: calculatedNewScore,
      parentsNotified
    });
  } catch (error) {
    console.error('Remove Conduct Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== RESTORE CONDUCT (DELETE RECORD) ====================
router.delete('/conduct/:recordId', authenticateToken, async (req, res) => {
  try {
    const { recordId } = req.params;
    
    // Get the conduct record
    const [records] = await pool.execute(
      'SELECT student_id, incident_type, severity FROM student_conduct_records WHERE id = ?',
      [recordId]
    );
    
    if (records.length === 0) {
      return res.status(404).json({ success: false, message: 'Conduct record not found' });
    }
    
    const { student_id, incident_type, severity } = records[0];
    
    // Calculate points to restore based on severity
    const pointsToRestore = {
      'minor': 1,
      'moderate': 2,
      'major': 3,
      'severe': 4
    }[severity] || 2;
    
    // Get student info
    const [students] = await pool.execute(
      'SELECT first_name, last_name, conduct_score FROM global_student_sheets WHERE id = ?',
      [student_id]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const student = students[0];
    const currentScore = student.conduct_score || 0;
    const restoredScore = Math.min(40, currentScore + pointsToRestore);
    
    // Delete the conduct record
    await pool.execute(
      'DELETE FROM student_conduct_records WHERE id = ?',
      [recordId]
    );
    
    // Restore the points
    await pool.execute(
      'UPDATE global_student_sheets SET conduct_score = ? WHERE id = ?',
      [restoredScore, student_id]
    );
    
    // Try to notify linked parents (optional)
    let parentsNotified = 0;
    try {
      const [linkedParents] = await pool.execute(
        `SELECT DISTINCT parent_id FROM parent_student_links WHERE student_id = ? AND status = 'approved'`,
        [student_id]
      );
      
      for (const link of linkedParents) {
        try {
          await pool.execute(`
            INSERT INTO parent_notifications 
            (parent_id, student_id, type, title, message, severity, is_read, created_at)
            VALUES (?, ?, 'conduct_restored', ?, ?, 'info', 0, NOW())
          `, [
            link.parent_id,
            student_id,
            'Conduct Record Removed',
            `Good news! A conduct incident (${incident_type}) for ${student.first_name} ${student.last_name} has been removed. ${pointsToRestore} points restored. New score: ${restoredScore}/40.`
          ]);
          parentsNotified++;
        } catch (notifError) {
          console.log('Parent notification skipped:', notifError.message);
        }
      }
    } catch (linkError) {
      console.log('Parent linking not available:', linkError.message);
    }
    
    res.json({ 
      success: true, 
      message: 'Conduct record removed and points restored',
      pointsRestored: pointsToRestore,
      newScore: restoredScore,
      parentsNotified
    });
  } catch (error) {
    console.error('Restore Conduct Error:', error);
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
      (student_id, student_code, trade, class_level, leave_type, 
       reason, start_time, end_time, approved_by_name, status, parent_notified, sms_sent, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', false, false, NOW())
    `, [
      student_id, student.student_code || student.id,
      student.trade_code, student.level_number, leave_type, reason,
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
            code: student.id,
            trade: student.trade_code,
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
              code: student.id,
              trade: student.trade_code,
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
        gss.trade_code, gss.level_number
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
            code: parent.student_id,
            trade: parent.trade_code,
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
      'SELECT COUNT(*) as count FROM student_conduct_records WHERE MONTH(created_at) = MONTH(CURRENT_DATE())'
    );
    
    const [[criticalIncidents]] = await pool.execute(
      'SELECT COUNT(*) as count FROM student_conduct_records WHERE severity = "severe" AND MONTH(created_at) = MONTH(CURRENT_DATE())'
    );
    
    const [[highIncidents]] = await pool.execute(
      'SELECT COUNT(*) as count FROM student_conduct_records WHERE severity = "major" AND MONTH(created_at) = MONTH(CURRENT_DATE())'
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
      'SELECT * FROM student_conduct_records WHERE student_id = ? ORDER BY created_at DESC LIMIT 20',
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
