/**
 * Global Student Conduct Management
 * Automatically notifies parents when conduct is removed
 */
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { notifyParentsConductRemoved } = require('../services/parentNotificationService');

// Remove conduct from student (DOS, DOD, Teacher, etc.)
router.post('/remove-conduct', 
  authenticateToken, 
  requireRole('dod', 'director_discipline', 'dos', 'director_study', 'teacher', 'headmaster', 'admin'),
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
      const staffName = req.user.name || `${req.user.first_name} ${req.user.last_name}`;
      const staffRole = req.user.role;
      
      // Validate input
      if (!student_id || !incident_type || !points_deducted) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Uzuza amakuru yose (student, incident type, points)'
        });
      }
      
      // Get current student conduct score
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
      
      // Calculate grade
      let grade = 'F';
      if (newScore >= 36) grade = 'A';
      else if (newScore >= 32) grade = 'B';
      else if (newScore >= 28) grade = 'C';
      else if (newScore >= 24) grade = 'D';
      
      // Update student conduct score in global_student_sheets
      await connection.execute(`
        UPDATE global_student_sheets
        SET conduct_score = ?,
            conduct_grade = ?,
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
      
      // Prepare conduct data for notification
      const conductData = {
        incident_type,
        severity: severity || 'moderate',
        description: description || '',
        action_taken: action_taken || '',
        points_deducted,
        new_conduct_score: newScore,
        recorded_by_name: staffName
      };
      
      // 🔔 AUTOMATICALLY NOTIFY ALL LINKED PARENTS VIA SMS
      notifyParentsConductRemoved(student_id, conductData)
        .then(result => {
          if (result.success) {
            console.log(`✅ Notified ${result.parentCount} parent(s) about conduct removal`);
          }
        })
        .catch(err => {
          console.error('❌ Error notifying parents:', err);
        });
      
      res.json({
        success: true,
        message: `Conduct removed successfully. New score: ${newScore}/40 (${grade})`,
        data: {
          student_name: `${student.first_name} ${student.last_name}`,
          student_code: student.student_code,
          previous_score: currentScore,
          new_score: newScore,
          grade: grade,
          points_deducted: points_deducted
        }
      });
      
    } catch (error) {
      await connection.rollback();
      console.error('Error removing conduct:', error);
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

// Get conduct history for a student
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
          gss.student_code
        FROM student_conduct_records scr
        JOIN global_student_sheets gss ON scr.student_id = gss.id
        WHERE scr.student_id = ?
        ORDER BY scr.created_at DESC
      `, [studentId]);
      
      res.json({
        success: true,
        records
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

module.exports = router;
