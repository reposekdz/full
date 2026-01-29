const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==========================================
// COMPREHENSIVE MARKS MANAGEMENT SYSTEM
// Dynamic columns for different assessment types
// Auto-calculation and report generation
// ==========================================

// Get teacher's classes with subjects
router.get('/teacher/classes', authenticateToken, requireRole('teacher', 'dos', 'admin'), async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    const [classes] = await pool.execute(`
      SELECT DISTINCT
        tc.id as class_id,
        tc.class_name,
        tl.trade_code,
        tl.trade_name,
        tl.level_number,
        s.id as subject_id,
        s.name as subject_name,
        s.code as subject_code,
        ay.id as academic_year_id,
        ay.name as academic_year
      FROM teacher_subject_assignments tsa
      JOIN trade_classes tc ON tsa.trade_class_id = tc.id
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      JOIN subjects s ON tsa.subject_id = s.id
      JOIN academic_years ay ON tsa.academic_year_id = ay.id
      WHERE tsa.teacher_id = ? AND tsa.is_active = TRUE
      ORDER BY tc.class_name, s.name
    `, [teacherId]);
    
    res.json({ success: true, classes });
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get assessment categories for marks entry
router.get('/assessment-categories', authenticateToken, async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT * FROM assessment_categories 
      WHERE is_active = TRUE 
      ORDER BY display_order
    `);
    
    res.json({ success: true, categories });
  } catch (error) {
    // If table doesn't exist, return default categories
    const defaultCategories = [
      { id: 1, name: 'Quiz', code: 'QUIZ', max_marks: 20, weight: 20 },
      { id: 2, name: 'Homework', code: 'HW', max_marks: 10, weight: 10 },
      { id: 3, name: 'Midterm Exam', code: 'MIDTERM', max_marks: 30, weight: 30 },
      { id: 4, name: 'Final Exam', code: 'FINAL', max_marks: 40, weight: 40 },
      { id: 5, name: 'Project', code: 'PROJECT', max_marks: 20, weight: 15 },
      { id: 6, name: 'Practical', code: 'PRACTICAL', max_marks: 25, weight: 25 }
    ];
    res.json({ success: true, categories: defaultCategories });
  }
});

// Get class students with marks for specific subject
router.get('/class/:classId/subject/:subjectId/marks', authenticateToken, requireRole('teacher', 'dos', 'admin'), async (req, res) => {
  try {
    const { classId, subjectId } = req.params;
    const { academic_year_id, term } = req.query;
    
    // Get students in class
    const [students] = await pool.execute(`
      SELECT 
        u.id as student_id,
        u.first_name,
        u.last_name,
        u.student_id as student_number,
        u.email,
        e.enrollment_date
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      WHERE e.class_id = ? AND e.status = 'active'
      ORDER BY u.last_name, u.first_name
    `, [classId]);
    
    // Get marks for each student
    for (let student of students) {
      const [marks] = await pool.execute(`
        SELECT 
          id, assessment_category, assessment_name, max_marks, 
          obtained_marks, assessment_date, remarks, created_at
        FROM student_marks
        WHERE student_id = ? AND subject_id = ? 
        ${academic_year_id ? 'AND academic_year_id = ?' : ''}
        ${term ? 'AND term = ?' : ''}
        ORDER BY assessment_date DESC
      `, [student.student_id, subjectId, academic_year_id, term].filter(Boolean));
      
      student.marks = marks;
      
      // Calculate totals
      const total_obtained = marks.reduce((sum, m) => sum + (m.obtained_marks || 0), 0);
      const total_max = marks.reduce((sum, m) => sum + (m.max_marks || 0), 0);
      student.total_obtained = total_obtained;
      student.total_max = total_max;
      student.percentage = total_max > 0 ? ((total_obtained / total_max) * 100).toFixed(2) : 0;
      student.grade = calculateGrade(student.percentage);
    }
    
    res.json({ success: true, students });
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add marks entry (single or bulk)
router.post('/marks/add', authenticateToken, requireRole('teacher', 'dos', 'admin'), async (req, res) => {
  try {
    const { marks_entries, subject_id, class_id, academic_year_id, term } = req.body;
    const teacherId = req.user.id;
    
    // Verify teacher assignment
    const [assignment] = await pool.execute(`
      SELECT id FROM teacher_subject_assignments
      WHERE teacher_id = ? AND subject_id = ? AND trade_class_id = ? AND is_active = TRUE
    `, [teacherId, subject_id, class_id]);
    
    if (assignment.length === 0 && req.user.role !== 'admin' && req.user.role !== 'dos') {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not assigned to teach this subject for this class' 
      });
    }
    
    const results = [];
    
    for (const entry of marks_entries) {
      const [result] = await pool.execute(`
        INSERT INTO student_marks (
          student_id, subject_id, class_id, academic_year_id, term,
          assessment_category, assessment_name, max_marks, obtained_marks,
          assessment_date, teacher_id, remarks, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        entry.student_id,
        subject_id,
        class_id,
        academic_year_id,
        term || 'Term 1',
        entry.assessment_category,
        entry.assessment_name,
        entry.max_marks,
        entry.obtained_marks,
        entry.assessment_date || new Date(),
        teacherId,
        entry.remarks || null
      ]);
      
      results.push({ student_id: entry.student_id, mark_id: result.insertId });
      
      // Update global student sheet
      await updateStudentSheet(entry.student_id, subject_id);
    }
    
    res.json({ 
      success: true, 
      message: `Successfully added marks for ${marks_entries.length} student(s)`,
      results 
    });
  } catch (error) {
    console.error('Error adding marks:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update marks entry
router.put('/marks/:markId', authenticateToken, requireRole('teacher', 'dos', 'admin'), async (req, res) => {
  try {
    const { markId } = req.params;
    const { obtained_marks, remarks } = req.body;
    const teacherId = req.user.id;
    
    // Verify ownership
    const [mark] = await pool.execute('SELECT * FROM student_marks WHERE id = ?', [markId]);
    
    if (mark.length === 0) {
      return res.status(404).json({ success: false, message: 'Mark entry not found' });
    }
    
    if (mark[0].teacher_id !== teacherId && req.user.role !== 'admin' && req.user.role !== 'dos') {
      return res.status(403).json({ success: false, message: 'You can only edit your own marks entries' });
    }
    
    await pool.execute(`
      UPDATE student_marks 
      SET obtained_marks = ?, remarks = ?, updated_at = NOW()
      WHERE id = ?
    `, [obtained_marks, remarks, markId]);
    
    // Update global student sheet
    await updateStudentSheet(mark[0].student_id, mark[0].subject_id);
    
    res.json({ success: true, message: 'Mark updated successfully' });
  } catch (error) {
    console.error('Error updating mark:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete marks entry
router.delete('/marks/:markId', authenticateToken, requireRole('teacher', 'dos', 'admin'), async (req, res) => {
  try {
    const { markId } = req.params;
    const teacherId = req.user.id;
    
    const [mark] = await pool.execute('SELECT * FROM student_marks WHERE id = ?', [markId]);
    
    if (mark.length === 0) {
      return res.status(404).json({ success: false, message: 'Mark entry not found' });
    }
    
    if (mark[0].teacher_id !== teacherId && req.user.role !== 'admin' && req.user.role !== 'dos') {
      return res.status(403).json({ success: false, message: 'You can only delete your own marks entries' });
    }
    
    await pool.execute('DELETE FROM student_marks WHERE id = ?', [markId]);
    
    // Update global student sheet
    await updateStudentSheet(mark[0].student_id, mark[0].subject_id);
    
    res.json({ success: true, message: 'Mark deleted successfully' });
  } catch (error) {
    console.error('Error deleting mark:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate comprehensive report for student
router.get('/reports/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academic_year_id, term } = req.query;
    
    // Get student info
    const [student] = await pool.execute(`
      SELECT u.*, 
        tc.class_name,
        tl.trade_name,
        tl.level_number
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE u.id = ?
    `, [studentId]);
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Get all marks grouped by subject
    const [marks] = await pool.execute(`
      SELECT 
        sm.*, 
        s.name as subject_name, 
        s.code as subject_code,
        u.first_name as teacher_first_name,
        u.last_name as teacher_last_name
      FROM student_marks sm
      JOIN subjects s ON sm.subject_id = s.id
      LEFT JOIN users u ON sm.teacher_id = u.id
      WHERE sm.student_id = ?
      ${academic_year_id ? 'AND sm.academic_year_id = ?' : ''}
      ${term ? 'AND sm.term = ?' : ''}
      ORDER BY s.name, sm.assessment_date
    `, [studentId, academic_year_id, term].filter(Boolean));
    
    // Group by subject and calculate
    const subjects = {};
    marks.forEach(mark => {
      if (!subjects[mark.subject_id]) {
        subjects[mark.subject_id] = {
          subject_id: mark.subject_id,
          subject_name: mark.subject_name,
          subject_code: mark.subject_code,
          marks: [],
          total_obtained: 0,
          total_max: 0,
          percentage: 0,
          grade: 'F'
        };
      }
      subjects[mark.subject_id].marks.push(mark);
      subjects[mark.subject_id].total_obtained += mark.obtained_marks || 0;
      subjects[mark.subject_id].total_max += mark.max_marks || 0;
    });
    
    // Calculate percentages and grades
    Object.values(subjects).forEach(subject => {
      if (subject.total_max > 0) {
        subject.percentage = ((subject.total_obtained / subject.total_max) * 100).toFixed(2);
        subject.grade = calculateGrade(subject.percentage);
      }
    });
    
    const subjectsArray = Object.values(subjects);
    
    // Calculate overall average
    const overall_percentage = subjectsArray.length > 0
      ? (subjectsArray.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / subjectsArray.length).toFixed(2)
      : 0;
    
    // Get attendance
    const [attendance] = await pool.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days
      FROM student_attendance_records
      WHERE student_id = ?
      ${term ? 'AND term = ?' : ''}
    `, [studentId, term].filter(Boolean));
    
    // Get discipline records
    const [discipline] = await pool.execute(`
      SELECT * FROM student_discipline_records
      WHERE student_id = ?
      ORDER BY incident_date DESC
      LIMIT 10
    `, [studentId]);
    
    res.json({
      success: true,
      report: {
        student: student[0],
        subjects: subjectsArray,
        overall_percentage,
        overall_grade: calculateGrade(overall_percentage),
        attendance: attendance[0],
        discipline_records: discipline
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function to calculate grade
function calculateGrade(percentage) {
  const p = parseFloat(percentage);
  if (p >= 90) return 'A';
  if (p >= 80) return 'B';
  if (p >= 70) return 'C';
  if (p >= 60) return 'D';
  if (p >= 50) return 'E';
  return 'F';
}

// Helper function to update global student sheet
async function updateStudentSheet(studentId, subjectId) {
  try {
    // Calculate total marks for this subject
    const [marks] = await pool.execute(`
      SELECT 
        SUM(obtained_marks) as total_obtained,
        SUM(max_marks) as total_max
      FROM student_marks
      WHERE student_id = ? AND subject_id = ?
    `, [studentId, subjectId]);
    
    const percentage = marks[0].total_max > 0 
      ? ((marks[0].total_obtained / marks[0].total_max) * 100).toFixed(2)
      : 0;
    
    // Update student_subject_performance table
    await pool.execute(`
      INSERT INTO student_subject_performance (
        student_id, subject_id, total_marks, total_max, percentage, grade, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        total_marks = VALUES(total_marks),
        total_max = VALUES(total_max),
        percentage = VALUES(percentage),
        grade = VALUES(grade),
        updated_at = NOW()
    `, [studentId, subjectId, marks[0].total_obtained, marks[0].total_max, percentage, calculateGrade(percentage)]);
    
    // Update overall student sheet
    const [allMarks] = await pool.execute(`
      SELECT AVG(percentage) as average_marks
      FROM student_subject_performance
      WHERE student_id = ?
    `, [studentId]);
    
    await pool.execute(`
      UPDATE global_student_sheets
      SET average_marks = ?, overall_grade = ?, updated_at = NOW()
      WHERE student_id = ?
    `, [allMarks[0].average_marks || 0, calculateGrade(allMarks[0].average_marks || 0), studentId]);
    
  } catch (error) {
    console.error('Error updating student sheet:', error);
  }
}

module.exports = router;
