const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/sheets/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    
    const [students] = await pool.execute(`
      SELECT 
        u.id, u.student_id, u.first_name, u.last_name, u.email, u.phone,
        e.enrollment_date, e.status,
        tc.class_name, tl.trade_name, tl.trade_code
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      JOIN trade_classes tc ON e.class_id = tc.id
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE e.class_id = ? AND e.status = 'active' AND u.is_active = true
      ORDER BY u.last_name, u.first_name
    `, [classId]);
    
    const [subjects] = await pool.execute(`
      SELECT DISTINCT s.*
      FROM subjects s
      JOIN grades g ON s.id = g.subject_id
      JOIN users u ON g.student_id = u.id
      JOIN enrollments e ON u.id = e.student_id
      WHERE e.class_id = ? AND e.status = 'active'
      UNION
      SELECT s.*
      FROM subjects s
      WHERE s.is_active = true
      ORDER BY subject_name
    `, [classId]);
    
    const studentData = await Promise.all(students.map(async (student) => {
      const [grades] = await pool.execute(`
        SELECT g.*, s.subject_name, s.subject_code, s.max_score
        FROM grades g
        JOIN subjects s ON g.subject_id = s.id
        WHERE g.student_id = ? AND g.academic_year = YEAR(NOW())
        ORDER BY s.subject_name
      `, [student.id]);
      
      const [attendance] = await pool.execute(`
        SELECT 
          COUNT(*) as total_days,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
          SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days
        FROM attendance
        WHERE student_id = ? AND YEAR(attendance_date) = YEAR(NOW())
      `, [student.id]);
      
      const totalMarks = grades.reduce((sum, g) => sum + (g.grade_value || 0), 0);
      const maxTotalMarks = grades.reduce((sum, g) => sum + (g.max_score || 100), 0);
      const percentage = maxTotalMarks > 0 ? ((totalMarks / maxTotalMarks) * 100).toFixed(2) : 0;
      const averageGrade = grades.length > 0 ? (totalMarks / grades.length).toFixed(2) : 0;
      
      const attendanceRate = attendance[0].total_days > 0 
        ? ((attendance[0].present_days / attendance[0].total_days) * 100).toFixed(2)
        : 100;
      
      return {
        ...student,
        grades: grades.reduce((acc, g) => {
          acc[g.subject_code] = {
            value: g.grade_value,
            max_score: g.max_score,
            percentage: ((g.grade_value / g.max_score) * 100).toFixed(2),
            exam_date: g.exam_date,
            remarks: g.remarks
          };
          return acc;
        }, {}),
        statistics: {
          total_marks: totalMarks,
          max_total_marks: maxTotalMarks,
          percentage: parseFloat(percentage),
          average_grade: parseFloat(averageGrade),
          attendance_rate: parseFloat(attendanceRate),
          total_days: attendance[0].total_days,
          present_days: attendance[0].present_days,
          absent_days: attendance[0].absent_days,
          late_days: attendance[0].late_days
        }
      };
    }));
    
    const rankedStudents = studentData
      .sort((a, b) => b.statistics.percentage - a.statistics.percentage)
      .map((student, index) => ({
        ...student,
        rank: index + 1,
        position_suffix: getPositionSuffix(index + 1)
      }));
    
    res.json({
      success: true,
      class_id: classId,
      total_students: rankedStudents.length,
      subjects: subjects,
      students: rankedStudents,
      class_statistics: {
        highest_percentage: rankedStudents[0]?.statistics.percentage || 0,
        lowest_percentage: rankedStudents[rankedStudents.length - 1]?.statistics.percentage || 0,
        average_percentage: (rankedStudents.reduce((sum, s) => sum + s.statistics.percentage, 0) / rankedStudents.length).toFixed(2),
        average_attendance: (rankedStudents.reduce((sum, s) => sum + s.statistics.attendance_rate, 0) / rankedStudents.length).toFixed(2)
      }
    });
    
  } catch (error) {
    console.error('Error fetching student sheets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sheets/:classId/add-student', async (req, res) => {
  try {
    const { classId } = req.params;
    const { first_name, last_name, email, phone, date_of_birth, gender, parent_phone } = req.body;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      const serialCode = await generateSerialCode(classId, connection);
      
      const [roleResult] = await connection.execute(
        'SELECT id FROM roles WHERE name = ?',
        ['student']
      );
      
      const defaultPassword = await require('bcrypt').hash('student123', 10);
      
      const [userResult] = await connection.execute(
        `INSERT INTO users (username, email, password, first_name, last_name, phone, student_id, role_id, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, NOW())`,
        [email.split('@')[0], email, defaultPassword, first_name, last_name, phone, serialCode, roleResult[0].id]
      );
      
      await connection.execute(
        `INSERT INTO enrollments (student_id, class_id, enrollment_date, status, academic_year, created_at)
         VALUES (?, ?, NOW(), 'active', YEAR(NOW()), NOW())`,
        [userResult.insertId, classId]
      );
      
      if (parent_phone) {
        await connection.execute(
          `INSERT INTO parent_student_links (parent_phone, student_id, relationship, created_at)
           VALUES (?, ?, 'parent', NOW())`,
          [parent_phone, userResult.insertId]
        );
      }
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'Student added successfully',
        student_id: userResult.insertId,
        serial_code: serialCode,
        default_password: 'student123'
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sheets/custom-column', async (req, res) => {
  try {
    const { class_id, column_name, column_type, calculation_formula } = req.body;
    
    await pool.execute(
      `INSERT INTO custom_sheet_columns (class_id, column_name, column_type, calculation_formula, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [class_id, column_name, column_type, calculation_formula || null]
    );
    
    res.json({ success: true, message: 'Custom column added successfully' });
    
  } catch (error) {
    console.error('Error adding custom column:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sheets/custom-columns/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    
    const [columns] = await pool.execute(
      'SELECT * FROM custom_sheet_columns WHERE class_id = ? ORDER BY display_order, created_at',
      [classId]
    );
    
    res.json({ success: true, columns });
    
  } catch (error) {
    console.error('Error fetching custom columns:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/generate-report-cards/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const { academic_year, term } = req.body;
    
    const [students] = await pool.execute(`
      SELECT u.id, u.student_id, u.first_name, u.last_name,
             tc.class_name, tl.trade_name
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      JOIN trade_classes tc ON e.class_id = tc.id
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE e.class_id = ? AND e.status = 'active'
    `, [classId]);
    
    const reportCards = [];
    
    for (const student of students) {
      const [grades] = await pool.execute(`
        SELECT g.*, s.subject_name, s.subject_code, s.max_score
        FROM grades g
        JOIN subjects s ON g.subject_id = s.id
        WHERE g.student_id = ? AND g.academic_year = ?
        ORDER BY s.subject_name
      `, [student.id, academic_year]);
      
      const [attendance] = await pool.execute(`
        SELECT COUNT(*) as total, 
               SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
        FROM attendance
        WHERE student_id = ? AND YEAR(attendance_date) = ?
      `, [student.id, academic_year]);
      
      const [discipline] = await pool.execute(`
        SELECT COUNT(*) as total_cases, 
               SUM(CASE WHEN severity_level = 'high' THEN 1 ELSE 0 END) as serious_cases
        FROM discipline_cases
        WHERE student_id = ? AND YEAR(incident_date) = ?
      `, [student.id, academic_year]);
      
      const totalMarks = grades.reduce((sum, g) => sum + g.grade_value, 0);
      const maxMarks = grades.reduce((sum, g) => sum + g.max_score, 0);
      const percentage = ((totalMarks / maxMarks) * 100).toFixed(2);
      
      reportCards.push({
        student_id: student.id,
        serial_code: student.student_id,
        name: `${student.first_name} ${student.last_name}`,
        class: student.class_name,
        trade: student.trade_name,
        grades: grades,
        total_marks: totalMarks,
        max_marks: maxMarks,
        percentage: parseFloat(percentage),
        attendance: {
          total: attendance[0].total,
          present: attendance[0].present,
          rate: ((attendance[0].present / attendance[0].total) * 100).toFixed(2)
        },
        discipline: discipline[0],
        term: term,
        academic_year: academic_year
      });
    }
    
    const rankedReports = reportCards
      .sort((a, b) => b.percentage - a.percentage)
      .map((report, index) => ({
        ...report,
        class_rank: index + 1,
        position: `${index + 1}${getPositionSuffix(index + 1)}`,
        grade_letter: getGradeLetter(report.percentage),
        remarks: getPerformanceRemarks(report.percentage)
      }));
    
    await pool.execute(
      `INSERT INTO generated_reports (class_id, academic_year, term, report_data, generated_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [classId, academic_year, term, JSON.stringify(rankedReports)]
    );
    
    res.json({
      success: true,
      report_cards: rankedReports,
      class_statistics: {
        total_students: rankedReports.length,
        average_percentage: (rankedReports.reduce((sum, r) => sum + r.percentage, 0) / rankedReports.length).toFixed(2),
        highest: rankedReports[0],
        lowest: rankedReports[rankedReports.length - 1]
      }
    });
    
  } catch (error) {
    console.error('Error generating report cards:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

async function generateSerialCode(classId, connection) {
  const [classInfo] = await connection.execute(
    `SELECT tc.class_name, tl.trade_code, COUNT(e.id) as student_count
     FROM trade_classes tc
     JOIN trade_levels tl ON tc.trade_level_id = tl.id
     LEFT JOIN enrollments e ON tc.id = e.class_id
     WHERE tc.id = ?
     GROUP BY tc.id`,
    [classId]
  );
  
  if (classInfo.length === 0) throw new Error('Class not found');
  
  const year = new Date().getFullYear().toString().substr(-2);
  const tradeCode = classInfo[0].trade_code;
  const studentNumber = (classInfo[0].student_count + 1).toString().padStart(3, '0');
  
  return `${year}${tradeCode}${studentNumber}`;
}

function getPositionSuffix(position) {
  const j = position % 10;
  const k = position % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

function getGradeLetter(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

function getPerformanceRemarks(percentage) {
  if (percentage >= 90) return 'Excellent! Outstanding performance';
  if (percentage >= 80) return 'Very Good! Keep up the excellent work';
  if (percentage >= 70) return 'Good! Room for improvement';
  if (percentage >= 60) return 'Satisfactory. Work harder';
  if (percentage >= 50) return 'Pass. Needs significant improvement';
  if (percentage >= 40) return 'Weak. Requires serious attention';
  return 'Fail. Urgent intervention needed';
}

module.exports = router;
