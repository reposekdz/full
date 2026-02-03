const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { emitToStudent, emitToParent } = require('../services/socketService');

router.post('/add-subject-column', authenticateToken, requireRole(['teacher', 'dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { subject_name, subject_code, max_marks, trade_code, level_number, level_suffix, term, academic_year } = req.body;
    
    if (!subject_name || !max_marks) {
      return res.status(400).json({ success: false, message: 'Subject name and max marks are required' });
    }
    
    // column_name is UNIQUE in the DB; generate a stable, class-scoped identifier to avoid collisions
    // across teachers / academic years / terms.
    const safeBase = (subject_code || subject_name)
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 20) || 'subject';

    const year = academic_year || new Date().getFullYear();
    const t = term || 1;
    const trade = (trade_code || 'all').toString().toLowerCase();
    const level = level_number || 0;
    const suffix = (level_suffix || '').toString().toLowerCase();

    const columnName = `${safeBase}_${trade}${level}${suffix}_y${year}t${t}_u${teacherId}`;
    
    const [result] = await pool.execute(`
      INSERT INTO subject_columns (
        teacher_id, subject_name, subject_code, column_name, max_marks,
        trade_code, level_number, level_suffix, term, academic_year, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [teacherId, subject_name, subject_code, columnName, max_marks, trade_code, level_number, level_suffix || '', term || 1, academic_year || new Date().getFullYear()]);
    
    res.json({
      success: true,
      message: 'Subject column created successfully',
      column_id: result.insertId,
      column_name: columnName
    });
  } catch (error) {
    console.error('Add subject column error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/subject-columns', authenticateToken, requireRole(['teacher', 'dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { trade_code, level_number, level_suffix } = req.query;
    
    let query = `
      SELECT sc.*, u.first_name, u.last_name
      FROM subject_columns sc
      LEFT JOIN users u ON sc.teacher_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (trade_code) {
      query += ' AND sc.trade_code = ?';
      params.push(trade_code);
    }
    if (level_number) {
      query += ' AND sc.level_number = ?';
      params.push(level_number);
    }
    if (level_suffix !== undefined) {
      query += ' AND sc.level_suffix = ?';
      params.push(level_suffix);
    }
    
    query += ' ORDER BY sc.created_at DESC';
    
    const [columns] = await pool.execute(query, params);
    
    res.json({
      success: true,
      columns: columns
    });
  } catch (error) {
    console.error('Get subject columns error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/record-marks', authenticateToken, requireRole(['teacher', 'dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { column_id, student_id, marks, remarks, exam_type } = req.body;
    
    if (!column_id || !student_id || marks === undefined) {
      return res.status(400).json({ success: false, message: 'Column ID, student ID, and marks are required' });
    }
    
    const [column] = await pool.execute(
      'SELECT * FROM subject_columns WHERE id = ?',
      [column_id]
    );
    
    if (column.length === 0) {
      return res.status(404).json({ success: false, message: 'Subject column not found' });
    }
    
    const subjectInfo = column[0];
    
    if (marks > subjectInfo.max_marks) {
      return res.status(400).json({ success: false, message: `Marks cannot exceed ${subjectInfo.max_marks}` });
    }
    
    const percentage = (marks / subjectInfo.max_marks) * 100;
    const grade = calculateGrade(percentage);
    
    const [result] = await pool.execute(`
      INSERT INTO student_marks (
        student_id, subject_name, subject_code, marks, max_marks, percentage,
        grade, exam_type, term, academic_year, remarks, recorded_by, recorded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        marks = VALUES(marks),
        percentage = VALUES(percentage),
        grade = VALUES(grade),
        remarks = VALUES(remarks),
        recorded_by = VALUES(recorded_by),
        recorded_at = NOW()
    `, [student_id, subjectInfo.subject_name, subjectInfo.subject_code, marks, subjectInfo.max_marks, percentage, grade, exam_type || 'exam', subjectInfo.term, subjectInfo.academic_year, remarks, teacherId]);
    
    await updateStudentGPA(student_id, subjectInfo.term, subjectInfo.academic_year);
    
    const [student] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE student_id = ?',
      [student_id]
    );
    
    if (student.length > 0) {
      emitToStudent(student_id, 'grade_update', {
        subject: subjectInfo.subject_name,
        marks: marks,
        grade: grade,
        message: `New grade posted for ${subjectInfo.subject_name}: ${marks}/${subjectInfo.max_marks} (${grade})`
      });
      
      const [parentLink] = await pool.execute(
        'SELECT parent_id FROM parent_student_links WHERE student_id = ? AND is_active = 1',
        [student_id]
      );
      
      if (parentLink.length > 0 && student[0].guardian_phone) {
        emitToParent(student[0].guardian_phone, 'grade_update', {
          student_name: `${student[0].first_name} ${student[0].last_name}`,
          subject: subjectInfo.subject_name,
          marks: marks,
          grade: grade
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Marks recorded successfully',
      marks: marks,
      percentage: percentage.toFixed(2),
      grade: grade
    });
  } catch (error) {
    console.error('Record marks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/bulk-record-marks', authenticateToken, requireRole(['teacher', 'dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { column_id, marks_data } = req.body;
    
    if (!column_id || !Array.isArray(marks_data) || marks_data.length === 0) {
      return res.status(400).json({ success: false, message: 'Column ID and marks data array are required' });
    }
    
    const [column] = await pool.execute(
      'SELECT * FROM subject_columns WHERE id = ?',
      [column_id]
    );
    
    if (column.length === 0) {
      return res.status(404).json({ success: false, message: 'Subject column not found' });
    }
    
    const subjectInfo = column[0];
    let successCount = 0;
    let errors = [];
    
    for (const data of marks_data) {
      try {
        const { student_id, marks, remarks } = data;
        
        if (marks > subjectInfo.max_marks) {
          errors.push({ student_id, error: `Marks exceed maximum (${subjectInfo.max_marks})` });
          continue;
        }
        
        const percentage = (marks / subjectInfo.max_marks) * 100;
        const grade = calculateGrade(percentage);
        
        await pool.execute(`
          INSERT INTO student_marks (
            student_id, subject_name, subject_code, marks, max_marks, percentage,
            grade, exam_type, term, academic_year, remarks, recorded_by, recorded_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'exam', ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
            marks = VALUES(marks),
            percentage = VALUES(percentage),
            grade = VALUES(grade),
            remarks = VALUES(remarks),
            recorded_by = VALUES(recorded_by),
            recorded_at = NOW()
        `, [student_id, subjectInfo.subject_name, subjectInfo.subject_code, marks, subjectInfo.max_marks, percentage, grade, subjectInfo.term, subjectInfo.academic_year, remarks, teacherId]);
        
        await updateStudentGPA(student_id, subjectInfo.term, subjectInfo.academic_year);
        successCount++;
        
      } catch (err) {
        errors.push({ student_id: data.student_id, error: err.message });
      }
    }
    
    res.json({
      success: true,
      message: `Bulk marks recorded: ${successCount} successful, ${errors.length} errors`,
      success_count: successCount,
      errors: errors
    });
  } catch (error) {
    console.error('Bulk record marks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/student-marks/:student_id', authenticateToken, async (req, res) => {
  try {
    const { student_id } = req.params;
    const { term, academic_year } = req.query;
    
    let query = `
      SELECT sm.*, u.first_name as teacher_first_name, u.last_name as teacher_last_name
      FROM student_marks sm
      LEFT JOIN users u ON sm.recorded_by = u.id
      WHERE sm.student_id = ?
    `;
    const params = [student_id];
    
    if (term) {
      query += ' AND sm.term = ?';
      params.push(term);
    }
    if (academic_year) {
      query += ' AND sm.academic_year = ?';
      params.push(academic_year);
    }
    
    query += ' ORDER BY sm.recorded_at DESC';
    
    const [marks] = await pool.execute(query, params);
    
    res.json({
      success: true,
      marks: marks
    });
  } catch (error) {
    console.error('Get student marks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/class-marks-overview', authenticateToken, requireRole(['teacher', 'dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { trade_code, level_number, level_suffix, column_id } = req.query;
    
    if (!column_id) {
      return res.status(400).json({ success: false, message: 'Column ID is required' });
    }
    
    const [column] = await pool.execute(
      'SELECT * FROM subject_columns WHERE id = ?',
      [column_id]
    );
    
    if (column.length === 0) {
      return res.status(404).json({ success: false, message: 'Subject column not found' });
    }
    
    const subjectInfo = column[0];
    
    const [students] = await pool.execute(`
      SELECT 
        gss.student_id,
        gss.student_code,
        gss.first_name,
        gss.last_name,
        sm.marks,
        sm.max_marks,
        sm.percentage,
        sm.grade,
        sm.remarks
      FROM global_student_sheets gss
      LEFT JOIN student_marks sm ON gss.student_id = sm.student_id 
        AND sm.subject_name = ? 
        AND sm.term = ? 
        AND sm.academic_year = ?
      WHERE gss.trade_code = ? 
        AND gss.level_number = ? 
        AND gss.level_suffix = ?
        AND gss.status = 'active'
      ORDER BY gss.last_name, gss.first_name
    `, [subjectInfo.subject_name, subjectInfo.term, subjectInfo.academic_year, trade_code, level_number, level_suffix || '']);
    
    res.json({
      success: true,
      subject_info: subjectInfo,
      students: students
    });
  } catch (error) {
    console.error('Get class marks overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

function calculateGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

async function updateStudentGPA(studentId, term, academicYear) {
  try {
    const [marks] = await pool.execute(`
      SELECT AVG(percentage) as avg_percentage
      FROM student_marks
      WHERE student_id = ? AND term = ? AND academic_year = ?
    `, [studentId, term, academicYear]);
    
    if (marks.length > 0 && marks[0].avg_percentage !== null) {
      const avgPercentage = marks[0].avg_percentage;
      const gpa = (avgPercentage / 100) * 4;
      const overallGrade = calculateGrade(avgPercentage);
      
      await pool.execute(`
        UPDATE global_student_sheets
        SET gpa = ?, overall_grade = ?, updated_at = NOW()
        WHERE student_id = ?
      `, [gpa, overallGrade, studentId]);
    }
  } catch (error) {
    console.error('Update student GPA error:', error);
  }
}

module.exports = router;
