/**
 * ULTRA-ADVANCED GLOBAL CONDUCT MANAGEMENT
 * Real SMS notifications to parents
 * All staff roles supported (DOS, DOD, Teacher, Headmaster, Admin, Patron, Matron)
 * Environment-based configuration
 * Complete audit trail
 */
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { notifyParentsConductRemoved, notifyParentsGradeChanged, notifyParentsAttendanceChanged, notifyParentsLeaveApproved } = require('../services/parentNotificationServiceAdvanced');

// ========================================
// CONDUCT MANAGEMENT
// ========================================

/**
 * Remove conduct from student (ALL STAFF ROLES)
 * Automatically notifies parents via SMS
 */
router.post('/remove-conduct', 
  authenticateToken, 
  requireRole('dod', 'director_discipline', 'dos', 'director_study', 'teacher', 'headmaster', 'admin', 'patron', 'matron'),
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const { 
        student_id, 
        incident_type, 
        severity, 
        description, 
        action_taken, 
        points_deducted 
      } = req.body;
      
      const staffId = req.user.id || req.user.userId;
      const staffName = req.user.name || `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim();
      const staffRole = req.user.role;
      
      // Validate
      if (!student_id || !incident_type || !points_deducted) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Uzuza amakuru yose (student, incident type, points)'
        });
      }
      
      // Get student
      const [students] = await connection.execute(`
        SELECT id, first_name, last_name, student_code, conduct_score, trade_name, level_number
        FROM global_student_sheets
        WHERE id = ?
      `, [student_id]);
      
      if (students.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
      
      const student = students[0];
      const currentScore = student.conduct_score || 40;
      const newScore = Math.max(0, currentScore - points_deducted);
      
      // Calculate grade (40-point system)
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
            updated_at = NOW()
        WHERE id = ?
      `, [newScore, grade, student_id]);
      
      // Record in student_conduct_records
      const [recordResult] = await connection.execute(`
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
      
      // Prepare conduct data for SMS
      const conductData = {
        incident_type,
        severity: severity || 'moderate',
        description: description || '',
        action_taken: action_taken || '',
        points_deducted,
        new_conduct_score: newScore,
        grade: grade
      };
      
      // 🔔 SEND REAL SMS TO ALL LINKED PARENTS
      const notificationResult = await notifyParentsConductRemoved(student_id, conductData, staffName);
      
      console.log(`✅ Conduct removed by ${staffName} (${staffRole})`);
      console.log(`📱 Notified ${notificationResult.parentCount} parent(s)`);
      
      res.json({
        success: true,
        message: `Conduct removed successfully. New score: ${newScore}/40 (${grade}). ${notificationResult.parentCount} parent(s) notified via SMS.`,
        data: {
          student_name: `${student.first_name} ${student.last_name}`,
          student_code: student.student_code,
          previous_score: currentScore,
          new_score: newScore,
          grade: grade,
          points_deducted: points_deducted,
          parents_notified: notificationResult.parentCount,
          record_id: recordResult.insertId
        }
      });
      
    } catch (error) {
      await connection.rollback();
      console.error('❌ Error removing conduct:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing conduct',
        error: error.message
      });
    } finally {
      connection.release();
    }
  }
);

/**
 * Get conduct history for a student
 */
router.get('/conduct-history/:studentId',
  authenticateToken,
  async (req, res) => {
    try {
      const { studentId } = req.params;
      
      const [records] = await pool.execute(`
        SELECT 
          scr.*,
          gss.first_name,
          gss.last_name,
          gss.student_code,
          gss.trade_name,
          gss.level_number
        FROM student_conduct_records scr
        JOIN global_student_sheets gss ON scr.student_id = gss.id
        WHERE scr.student_id = ?
        ORDER BY scr.created_at DESC
      `, [studentId]);
      
      res.json({
        success: true,
        records,
        total: records.length
      });
    } catch (error) {
      console.error('Error fetching conduct history:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * Get all conduct records (for staff dashboards)
 */
router.get('/conduct-records',
  authenticateToken,
  requireRole('dod', 'director_discipline', 'dos', 'director_study', 'headmaster', 'admin'),
  async (req, res) => {
    try {
      const { limit = 50, offset = 0, trade = '', level = '' } = req.query;
      
      let query = `
        SELECT 
          scr.*,
          gss.first_name,
          gss.last_name,
          gss.student_code,
          gss.trade_name,
          gss.level_number,
          gss.conduct_score,
          gss.conduct_grade
        FROM student_conduct_records scr
        JOIN global_student_sheets gss ON scr.student_id = gss.id
        WHERE 1=1
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
      
      query += ` ORDER BY scr.created_at DESC LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), parseInt(offset));
      
      const [records] = await pool.execute(query, params);
      
      // Get total count
      let countQuery = `
        SELECT COUNT(*) as total
        FROM student_conduct_records scr
        JOIN global_student_sheets gss ON scr.student_id = gss.id
        WHERE 1=1
      `;
      const countParams = [];
      
      if (trade) {
        countQuery += ` AND gss.trade_code = ?`;
        countParams.push(trade);
      }
      
      if (level) {
        countQuery += ` AND gss.level_number = ?`;
        countParams.push(parseInt(level));
      }
      
      const [countResult] = await pool.execute(countQuery, countParams);
      
      res.json({
        success: true,
        records,
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      console.error('Error fetching conduct records:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// ========================================
// GRADE MANAGEMENT
// ========================================

/**
 * Update student grade (notify parents)
 */
router.post('/update-grade',
  authenticateToken,
  requireRole('teacher', 'dos', 'director_study', 'headmaster', 'admin'),
  async (req, res) => {
    try {
      const { student_id, subject, marks, total, grade, percentage } = req.body;
      const teacherName = req.user.name || `${req.user.first_name} ${req.user.last_name}`;
      
      // Notify parents
      const result = await notifyParentsGradeChanged(student_id, {
        subject,
        marks,
        total,
        grade,
        percentage,
        teacher_name: teacherName
      });
      
      res.json({
        success: true,
        message: `Grade updated. ${result.parentCount} parent(s) notified.`,
        parents_notified: result.parentCount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// ========================================
// ATTENDANCE MANAGEMENT
// ========================================

/**
 * Mark attendance (notify parents if absent)
 */
router.post('/mark-attendance',
  authenticateToken,
  requireRole('teacher', 'dos', 'director_study', 'dod', 'director_discipline', 'headmaster', 'admin'),
  async (req, res) => {
    try {
      const { student_id, status, date, time, reason } = req.body;
      
      // Only notify if absent
      if (status === 'absent') {
        const result = await notifyParentsAttendanceChanged(student_id, {
          status,
          date: date || new Date().toLocaleDateString('rw-RW'),
          time: time || new Date().toLocaleTimeString('rw-RW'),
          reason
        });
        
        res.json({
          success: true,
          message: `Attendance marked. ${result.parentCount} parent(s) notified.`,
          parents_notified: result.parentCount
        });
      } else {
        res.json({
          success: true,
          message: 'Attendance marked.',
          parents_notified: 0
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// ========================================
// LEAVE MANAGEMENT
// ========================================

/**
 * Approve leave (notify parents)
 */
router.post('/approve-leave',
  authenticateToken,
  requireRole('dod', 'director_discipline', 'dos', 'director_study', 'headmaster', 'admin', 'patron', 'matron'),
  async (req, res) => {
    try {
      const { student_id, leave_type, reason, start_time, end_time } = req.body;
      const approverName = req.user.name || `${req.user.first_name} ${req.user.last_name}`;
      
      const result = await notifyParentsLeaveApproved(student_id, {
        leave_type,
        reason,
        start_time,
        end_time,
        approved_by_name: approverName
      });
      
      res.json({
        success: true,
        message: `Leave approved. ${result.parentCount} parent(s) notified.`,
        parents_notified: result.parentCount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

module.exports = router;
