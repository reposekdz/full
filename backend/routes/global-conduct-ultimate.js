/**
 * ULTIMATE GLOBAL CONDUCT MANAGEMENT SYSTEM
 * - Uses existing gardenSMSService with real Africa's Talking
 * - All staff roles can remove conduct and send SMS
 * - Parent info visible in global_student_sheets
 * - Complete audit trail and notifications
 * - Production-ready with .env configuration
 */
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sendConductRemovalSMS, sendLeaveApprovalSMS } = require('../services/gardenSMSService');

/**
 * Update parent info in global_student_sheets
 */
async function updateStudentParentInfo(studentId) {
  try {
    const [parents] = await pool.execute(`
      SELECT 
        u.first_name,
        u.last_name,
        u.phone
      FROM parent_student_links psl
      JOIN users u ON psl.parent_id = u.id
      WHERE psl.student_id = ? AND psl.status = 'approved'
    `, [studentId]);
    
    const parentNames = parents.map(p => `${p.first_name} ${p.last_name}`).join(', ');
    const parentPhones = parents.map(p => p.phone).filter(p => p).join(', ');
    const parentCount = parents.length;
    
    await pool.execute(`
      UPDATE global_student_sheets
      SET parent_names = ?,
          parent_phones = ?,
          parent_count = ?,
          updated_at = NOW()
      WHERE id = ?
    `, [parentNames, parentPhones, parentCount, studentId]);
    
    return { parentNames, parentPhones, parentCount };
  } catch (error) {
    console.error('Error updating parent info:', error);
    return null;
  }
}

/**
 * REMOVE CONDUCT - ALL STAFF ROLES
 * Automatically sends SMS to all linked parents
 */
router.post('/remove-conduct',
  authenticateToken,
  requireRole('dod', 'director_discipline', 'dos', 'director_study', 'teacher', 'headmaster', 'admin', 'patron', 'matron'),
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const { student_id, incident_type, severity, description, action_taken, points_deducted } = req.body;
      
      const staffId = req.user.id || req.user.userId;
      const staffName = req.user.name || `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim();
      const staffRole = req.user.role;
      const staffPhone = req.user.phone || '+250 788 123 456';
      
      // Validate
      if (!student_id || !incident_type || !points_deducted) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Uzuza amakuru yose'
        });
      }
      
      // Get student with parent info
      const [students] = await connection.execute(`
        SELECT 
          gss.*,
          gss.parent_names,
          gss.parent_phones,
          gss.parent_count
        FROM global_student_sheets gss
        WHERE gss.id = ?
      `, [student_id]);
      
      if (students.length === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      
      const student = students[0];
      const currentScore = student.conduct_score || 40;
      const newScore = Math.max(0, currentScore - points_deducted);
      
      // Calculate grade
      let grade = 'F';
      if (newScore >= 36) grade = 'A';
      else if (newScore >= 32) grade = 'B';
      else if (newScore >= 28) grade = 'C';
      else if (newScore >= 24) grade = 'D';
      
      // Update global_student_sheets
      await connection.execute(`
        UPDATE global_student_sheets
        SET conduct_score = ?,
            conduct_grade = ?,
            last_parent_notification = NOW(),
            updated_at = NOW()
        WHERE id = ?
      `, [newScore, grade, student_id]);
      
      // Record conduct incident
      await connection.execute(`
        INSERT INTO student_conduct_records
        (student_id, incident_type, severity, description, action_taken, 
         points_deducted, new_conduct_score, recorded_by, recorded_by_name, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        student_id,
        incident_type,
        severity || 'moderate',
        description || '',
        action_taken || '',
        points_deducted,
        newScore,
        staffId,
        staffName
      ]);
      
      await connection.commit();
      
      // Get all linked parents (from BOTH old and new linking systems)
      const [parents] = await pool.execute(`
        SELECT DISTINCT
          u.id,
          u.first_name,
          u.last_name,
          u.phone,
          COALESCE(psl.can_view_discipline, pcl.can_view_discipline, 1) as can_view_discipline
        FROM users u
        LEFT JOIN parent_student_links psl ON psl.parent_id = u.id AND psl.student_id = ?
        LEFT JOIN parent_child_links pcl ON pcl.parent_id = u.id AND pcl.student_id = ?
        WHERE u.role = 'parent'
          AND u.status = 'active'
          AND u.phone IS NOT NULL
          AND (
            (psl.status = 'approved' AND psl.can_view_discipline = 1)
            OR (pcl.status = 'active' AND pcl.can_view_discipline = 1)
          )
      `, [student_id, student_id]);
      
      // Send SMS to all parents using existing gardenSMSService
      const smsResults = [];
      for (const parent of parents) {
        const studentData = {
          name: `${student.first_name} ${student.last_name}`,
          code: student.student_code,
          trade: student.trade_name,
          level: `Level ${student.level_number}`,
          parentName: `${parent.first_name} ${parent.last_name}`
        };
        
        const conductData = {
          type: incident_type,
          severity: severity || 'moderate',
          description: description || 'N/A',
          action: action_taken || 'N/A',
          pointsDeducted: points_deducted,
          newScore: newScore
        };
        
        const removedBy = {
          name: staffName,
          role: staffRole,
          phone: staffPhone
        };
        
        const smsResult = await sendConductRemovalSMS(parent.phone, studentData, conductData, removedBy);
        smsResults.push({
          parent: `${parent.first_name} ${parent.last_name}`,
          phone: parent.phone,
          ...smsResult
        });
        
        // Log SMS
        await pool.execute(`
          INSERT INTO sms_logs (phone, message, status, provider, created_at)
          VALUES (?, ?, ?, 'africastalking', NOW())
        `, [parent.phone, 'Conduct removal notification', smsResult.success ? 'sent' : 'failed']);
        
        // Log notification
        await pool.execute(`
          INSERT INTO parent_notifications 
          (parent_id, student_id, notification_type, title, message, sent_via, created_at)
          VALUES (?, ?, 'conduct_removed', 'Conduct Removed', ?, 'sms', NOW())
        `, [parent.id, student_id, `Conduct removed: ${incident_type}`]);
      }
      
      // Update parent info in global sheets
      await updateStudentParentInfo(student_id);
      
      console.log(`✅ Conduct removed by ${staffName} (${staffRole})`);
      console.log(`📱 SMS sent to ${parents.length} parent(s)`);
      
      res.json({
        success: true,
        message: `Conduct removed. New score: ${newScore}/40 (${grade}). ${parents.length} parent(s) notified via SMS.`,
        data: {
          student_name: `${student.first_name} ${student.last_name}`,
          student_code: student.student_code,
          previous_score: currentScore,
          new_score: newScore,
          grade: grade,
          points_deducted: points_deducted,
          parents_notified: parents.length,
          sms_results: smsResults
        }
      });
      
    } catch (error) {
      await connection.rollback();
      console.error('❌ Error:', error);
      res.status(500).json({ success: false, message: error.message });
    } finally {
      connection.release();
    }
  }
);

/**
 * APPROVE LEAVE - ALL STAFF ROLES
 * Automatically sends SMS to all linked parents
 */
router.post('/approve-leave',
  authenticateToken,
  requireRole('dod', 'director_discipline', 'dos', 'director_study', 'headmaster', 'admin', 'patron', 'matron'),
  async (req, res) => {
    try {
      const { student_id, leave_type, reason, start_time, end_time } = req.body;
      
      const staffName = req.user.name || `${req.user.first_name} ${req.user.last_name}`;
      const staffRole = req.user.role;
      const staffPhone = req.user.phone || '+250 788 123 456';
      
      // Get student
      const [students] = await pool.execute(`
        SELECT * FROM global_student_sheets WHERE id = ?
      `, [student_id]);
      
      if (students.length === 0) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      
      const student = students[0];
      
      // Get parents (from BOTH old and new linking systems)
      const [parents] = await pool.execute(`
        SELECT DISTINCT u.*
        FROM users u
        LEFT JOIN parent_student_links psl ON psl.parent_id = u.id AND psl.student_id = ?
        LEFT JOIN parent_child_links pcl ON pcl.parent_id = u.id AND pcl.student_id = ?
        WHERE u.role = 'parent'
          AND u.status = 'active'
          AND u.phone IS NOT NULL
          AND (psl.status = 'approved' OR pcl.status = 'active')
      `, [student_id, student_id]);
      
      // Send SMS to all parents
      const smsResults = [];
      for (const parent of parents) {
        const studentData = {
          name: `${student.first_name} ${student.last_name}`,
          code: student.student_code,
          trade: student.trade_name,
          level: `Level ${student.level_number}`,
          parentName: `${parent.first_name} ${parent.last_name}`
        };
        
        const leaveData = {
          type: leave_type,
          reason: reason,
          startTime: start_time,
          endTime: end_time
        };
        
        const approvedBy = {
          name: staffName,
          role: staffRole,
          phone: staffPhone
        };
        
        const smsResult = await sendLeaveApprovalSMS(parent.phone, studentData, leaveData, approvedBy);
        smsResults.push({
          parent: `${parent.first_name} ${parent.last_name}`,
          phone: parent.phone,
          ...smsResult
        });
      }
      
      res.json({
        success: true,
        message: `Leave approved. ${parents.length} parent(s) notified.`,
        parents_notified: parents.length,
        sms_results: smsResults
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * GET STUDENTS WITH PARENT INFO - FOR ALL STAFF
 */
router.get('/students-with-parents',
  authenticateToken,
  async (req, res) => {
    try {
      const { trade = '', level = '', search = '', limit = 50, offset = 0 } = req.query;
      
      let query = `
        SELECT 
          gss.*,
          gss.parent_names,
          gss.parent_phones,
          gss.parent_count
        FROM global_student_sheets gss
        WHERE gss.status = 'active'
      `;
      
      const params = [];
      
      if (trade) {
        query += ` AND gss.trade_code = ?`;
        params.push(trade);
      }
      
      if (level) {
        query += ` AND gss.level_number = ?`;
        params.push(parseInt(level));
      }
      
      if (search) {
        query += ` AND (gss.first_name LIKE ? OR gss.last_name LIKE ? OR gss.student_code LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      
      query += ` ORDER BY gss.last_name, gss.first_name LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), parseInt(offset));
      
      const [students] = await pool.execute(query, params);
      
      res.json({
        success: true,
        students,
        total: students.length
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * GET CONDUCT HISTORY
 */
router.get('/conduct-history/:studentId',
  authenticateToken,
  async (req, res) => {
    try {
      const [records] = await pool.execute(`
        SELECT scr.*, gss.first_name, gss.last_name, gss.student_code
        FROM student_conduct_records scr
        JOIN global_student_sheets gss ON scr.student_id = gss.id
        WHERE scr.student_id = ?
        ORDER BY scr.created_at DESC
      `, [req.params.studentId]);
      
      res.json({ success: true, records });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
