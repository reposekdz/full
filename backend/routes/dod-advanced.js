const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { sendUniversalMessage } = require('../services/smsService');
const { notifyConductRemoval, notifyLeaveApproval } = require('../utils/parentNotifications');
const { sendConductRemovalSMS, sendLeaveApprovalSMS } = require('../services/gardenSMSService');

const router = express.Router();

// Get student history (discipline, leaves, messages)
router.get('/student/:id/history', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [records] = await pool.execute(
      'SELECT * FROM discipline_records WHERE student_id = ? ORDER BY created_at DESC',
      [id]
    );
    
    const [leaves] = await pool.execute(
      'SELECT * FROM student_leaves WHERE student_id = ? ORDER BY created_at DESC',
      [id]
    );
    
    const [messages] = await pool.execute(
      'SELECT * FROM parent_messages WHERE student_id = ? ORDER BY created_at DESC',
      [id]
    );
    
    res.json({ success: true, records, leaves, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove conduct
router.post('/conduct/remove', authenticateToken, async (req, res) => {
  try {
    const { student_id, conduct_type, severity, description, action_taken, conduct_points_deducted, new_conduct_score, removed_by_name } = req.body;
    
    // Get student from global_student_sheets
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
      (student_id, student_code, student_name, trade, class_level, conduct_type, severity, description, action_taken, conduct_points_deducted, new_conduct_score, removed_by, removed_by_name, parent_notified, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, false, NOW())
    `, [
      student_id, student.student_code, `${student.first_name} ${student.last_name}`,
      student.trade_code, student.level_number, conduct_type, severity,
      description, action_taken || '', conduct_points_deducted, new_conduct_score,
      req.user?.id || 0, removed_by_name
    ]);
    
    // Update conduct score
    await pool.execute(
      'UPDATE global_student_sheets SET conduct_score = ? WHERE id = ?',
      [new_conduct_score, student_id]
    );
    
    // Notify parents through parent linking system
    const [connections] = await pool.execute(
      `SELECT DISTINCT parent_phone FROM parent_connections 
       WHERE student_id = ? AND status = 'active' AND can_receive_notifications = 1`,
      [student_id]
    );
    
    let notifiedCount = 0;
    for (const conn of connections) {
      if (conn.parent_phone) {
        // Send rich, detailed SMS using Garden SMS Service
        try {
          const smsResult = await sendConductRemovalSMS(
            conn.parent_phone,
            {
              name: `${student.first_name} ${student.last_name}`,
              code: student.student_code,
              trade: student.trade_code,
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
              role: removed_by_name.includes('Patron') ? 'Patron - Umuyobozi w\'Abahungu' : 
                    removed_by_name.includes('Matron') ? 'Matron - Umuyobozi w\'Abakobwa' : 
                    'DOD - Umuyobozi w\'Indero',
              phone: '+250783407691'
            }
          );
          
          if (smsResult.success) {
            notifiedCount++;
            console.log(`✅ SMS sent to ${conn.parent_phone}: ${smsResult.messageId}`);
          }
        } catch (err) {
          console.error('Failed to send SMS:', err);
        }
      }
    }
    
    if (notifiedCount > 0) {
      await pool.execute(
        'UPDATE discipline_records SET parent_notified = true, sms_sent = true WHERE id = ?',
        [result.insertId]
      );
    }
    
    // Also use the comprehensive notification system
    await notifyConductRemoval(student_id, {
      conduct_type,
      severity,
      description,
      action_taken
    }, result.insertId);
    
    res.json({ 
      success: true, 
      message: 'Conduct removed successfully', 
      recordId: result.insertId,
      parentsNotified: notifiedCount
    });
  } catch (error) {
    console.error('Error removing conduct:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Grant leave
router.post('/leave/add', authenticateToken, async (req, res) => {
  try {
    const { student_id, leave_type, reason, start_time, end_time, approved_by_name } = req.body;
    
    // Get student from global_student_sheets
    const [students] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE id = ?',
      [student_id]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const student = students[0];
    
    // Insert leave record
    const [result] = await pool.execute(`
      INSERT INTO student_leaves 
      (student_id, student_code, student_name, trade, class_level, leave_type, reason, start_time, end_time, approved_by, approved_by_name, status, parent_notified, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', false, NOW())
    `, [
      student_id, student.student_code, `${student.first_name} ${student.last_name}`,
      student.trade_code, student.level_number, leave_type, reason,
      start_time, end_time || start_time, req.user?.id || 0, approved_by_name
    ]);
    
    // Notify parents through parent linking system
    const [connections] = await pool.execute(
      `SELECT DISTINCT parent_phone FROM parent_connections 
       WHERE student_id = ? AND status = 'active' AND can_receive_notifications = 1`,
      [student_id]
    );
    
    let notifiedCount = 0;
    for (const conn of connections) {
      if (conn.parent_phone) {
        // Send rich, detailed SMS using Garden SMS Service
        try {
          const smsResult = await sendLeaveApprovalSMS(
            conn.parent_phone,
            {
              name: `${student.first_name} ${student.last_name}`,
              code: student.student_code,
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
              role: approved_by_name.includes('Patron') ? 'Patron - Umuyobozi w\'Abahungu' : 
                    approved_by_name.includes('Matron') ? 'Matron - Umuyobozi w\'Abakobwa' : 
                    'DOD - Umuyobozi w\'Indero',
              phone: '+250783407691'
            }
          );
          
          if (smsResult.success) {
            notifiedCount++;
            console.log(`✅ SMS sent to ${conn.parent_phone}: ${smsResult.messageId}`);
          }
        } catch (err) {
          console.error('Failed to send SMS:', err);
        }
      }
    }
    
    if (notifiedCount > 0) {
      await pool.execute(
        'UPDATE student_leaves SET parent_notified = true, sms_sent = true WHERE id = ?',
        [result.insertId]
      );
    }
    
    // Also use the comprehensive notification system
    await notifyLeaveApproval(student_id, {
      leave_type,
      reason,
      start_time
    }, result.insertId);
    
    res.json({ 
      success: true, 
      message: 'Leave granted successfully', 
      leaveId: result.insertId,
      parentsNotified: notifiedCount
    });
  } catch (error) {
    console.error('Error granting leave:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Message parents
router.post('/message-parents', authenticateToken, async (req, res) => {
  try {
    const { subject, message, send_via, student_ids } = req.body;
    
    let successCount = 0;
    
    for (const student_id of student_ids) {
      const [student] = await pool.execute('SELECT * FROM global_students WHERE id = ?', [student_id]);
      if (student.length === 0) continue;
      
      const [parents] = await pool.execute(
        'SELECT p.id, p.phone FROM student_parents p WHERE p.student_id = ? AND p.is_active = true',
        [student_id]
      );
      
      if (parents.length > 0 && parents[0].phone) {
        const fullMessage = `${subject}\n\n${message}\n\nUmwana: ${student[0].first_name} ${student[0].last_name}`;
        await sendUniversalMessage(parents[0].phone, fullMessage, req.user.userId, { type: 'manual_message', send_via });
        
        await pool.execute(`
          INSERT INTO parent_messages (student_id, parent_id, subject, message, send_via, sent_by, sent_by_name, delivery_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'sent')
        `, [student_id, parents[0].id, subject, message, send_via, req.user.userId, req.user.name]);
        
        successCount++;
      }
    }
    
    res.json({ success: true, message: `Messages sent to ${successCount} parents`, count: successCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Schedule meeting
router.post('/schedule-meeting', authenticateToken, async (req, res) => {
  try {
    const { student_id, meeting_type, date, time, location, notes } = req.body;
    
    const [student] = await pool.execute('SELECT * FROM global_students WHERE id = ?', [student_id]);
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO scheduled_meetings 
      (student_id, meeting_type, meeting_date, meeting_time, location, notes, scheduled_by, status, parent_notified)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', false)
    `, [student_id, meeting_type, date, time, location, notes, req.user.userId]);
    
    const [parents] = await pool.execute(
      'SELECT p.phone FROM student_parents p WHERE p.student_id = ? AND p.is_active = true',
      [student_id]
    );
    
    if (parents.length > 0 && parents[0].phone) {
      const message = `ISHURI: Mwahamagariwe mu nama yerekeye umwana wawe ${student[0].first_name} ${student[0].last_name}. Ubwoko: ${meeting_type}. Itariki: ${date} saa ${time}. Ahantu: ${location || 'Ishuri'}.`;
      await sendUniversalMessage(parents[0].phone, message, req.user.userId, { type: 'meeting_schedule' });
      await pool.execute('UPDATE scheduled_meetings SET parent_notified = true WHERE id = ?', [result.insertId]);
    }
    
    res.json({ success: true, message: 'Meeting scheduled successfully', meetingId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk action
router.post('/bulk-action', authenticateToken, async (req, res) => {
  try {
    const { student_ids, action_type, data } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO bulk_actions_log (action_type, student_ids, executed_by, execution_data, status)
      VALUES (?, ?, ?, ?, 'completed')
    `, [action_type, JSON.stringify(student_ids), req.user.userId, JSON.stringify(data)]);
    
    let processedCount = 0;
    
    switch (action_type) {
      case 'message':
        for (const student_id of student_ids) {
          const [parents] = await pool.execute(
            'SELECT p.phone FROM student_parents p WHERE p.student_id = ? AND p.is_active = true',
            [student_id]
          );
          if (parents.length > 0 && parents[0].phone) {
            await sendUniversalMessage(parents[0].phone, data.message, req.user.userId, { type: 'bulk_message' });
            processedCount++;
          }
        }
        break;
        
      case 'conduct_warning':
        for (const student_id of student_ids) {
          await pool.execute(`
            INSERT INTO discipline_records (student_id, conduct_type, severity, description, removed_by)
            VALUES (?, 'warning', 'low', ?, ?)
          `, [student_id, data.warning_message || 'Bulk warning issued', req.user.userId]);
          processedCount++;
        }
        break;
        
      case 'schedule_meeting':
        for (const student_id of student_ids) {
          await pool.execute(`
            INSERT INTO scheduled_meetings (student_id, meeting_type, meeting_date, meeting_time, scheduled_by, status)
            VALUES (?, ?, ?, ?, ?, 'scheduled')
          `, [student_id, data.meeting_type, data.date, data.time, req.user.userId]);
          processedCount++;
        }
        break;
        
      case 'update_status':
        await pool.execute(`
          UPDATE global_students SET academic_status = ? WHERE id IN (${student_ids.join(',')})
        `, [data.new_status]);
        processedCount = student_ids.length;
        break;
    }
    
    res.json({ success: true, message: `Bulk action completed for ${processedCount} students`, count: processedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get statistics
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const [totalStudents] = await pool.execute('SELECT COUNT(*) as count FROM global_students WHERE academic_status = "Active"');
    const [poorConduct] = await pool.execute('SELECT COUNT(*) as count FROM global_students WHERE conduct_score < 24');
    const [poorAttendance] = await pool.execute('SELECT COUNT(*) as count FROM global_students WHERE overall_attendance_percentage < 70');
    const [totalIncidents] = await pool.execute('SELECT COUNT(*) as count FROM discipline_records WHERE MONTH(created_at) = MONTH(CURRENT_DATE())');
    const [activeLeaves] = await pool.execute('SELECT COUNT(*) as count FROM student_leaves WHERE status = "active"');
    const [scheduledMeetings] = await pool.execute('SELECT COUNT(*) as count FROM scheduled_meetings WHERE status = "scheduled" AND meeting_date >= CURDATE()');
    
    res.json({
      success: true,
      stats: {
        totalStudents: totalStudents[0].count,
        poorConduct: poorConduct[0].count,
        poorAttendance: poorAttendance[0].count,
        totalIncidents: totalIncidents[0].count,
        activeLeaves: activeLeaves[0].count,
        scheduledMeetings: scheduledMeetings[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get recent activities
router.get('/recent-activities', authenticateToken, async (req, res) => {
  try {
    const [activities] = await pool.execute(`
      SELECT 'conduct' as type, student_name, conduct_type as action, created_at 
      FROM discipline_records 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      UNION ALL
      SELECT 'leave' as type, student_name, leave_type as action, created_at 
      FROM student_leaves 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      UNION ALL
      SELECT 'meeting' as type, 
        (SELECT CONCAT(first_name, ' ', last_name) FROM global_students WHERE id = scheduled_meetings.student_id) as student_name,
        meeting_type as action, created_at 
      FROM scheduled_meetings 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    res.json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
