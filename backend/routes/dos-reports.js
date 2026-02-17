const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Helper: Calculate grade based on percentage
async function calculateGrade(percentage, connection, trade_code = null, level_number = null) {
    const [grades] = await connection.execute(`
    SELECT grade, grade_point FROM grading_scales
    WHERE (trade_code IS NULL OR trade_code = ?)
      AND (level_number IS NULL OR level_number = ?)
      AND ? BETWEEN min_percentage AND max_percentage
      AND is_active = TRUE
    ORDER BY trade_code DESC, level_number DESC
    LIMIT 1
  `, [trade_code, level_number, percentage]);

    if (grades.length > 0) {
        return { grade: grades[0].grade, grade_point: grades[0].grade_point };
    }

    return { grade: 'F', grade_point: 0.00 };
}

// Helper: Generate comment suggestions
function generateTeacherComment(percentage) {
    if (percentage >= 85) {
        return 'Excellent performance. Keep up the outstanding work!';
    } else if (percentage >= 75) {
        return 'Very good performance. Continue to work hard.';
    } else if (percentage >= 65) {
        return 'Good performance. There is room for improvement in some areas.';
    } else if (percentage >= 55) {
        return 'Satisfactory performance. More effort is needed to improve grades.';
    } else if (percentage >= 45) {
        return 'Below average performance. Student needs additional support and should work harder.';
    } else {
        return 'Poor performance. Immediate intervention required. Student must improve significantly.';
    }
}

// POST /api/dos-reports/generate - Generate report cards
router.post('/generate', async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const {
            academic_year,
            term,
            trade_code,
            level_number,
            student_ids, // Optional: specific students, or all if not provided
            user_id
        } = req.body;

        // Validation
        if (!academic_year || !term) {
            throw new Error('Academic year and term are required');
        }

        // Get students to generate reports for
        let students;
        if (student_ids && student_ids.length > 0) {
            const [result] = await connection.execute(
                'SELECT id, first_name, last_name, student_id, trade_code, level FROM users WHERE id IN (?) AND role = "student"',
                [student_ids]
            );
            students = result;
        } else {
            // Generate for all students with filters
            let query = 'SELECT id, first_name, last_name, student_id, trade_code, level FROM users WHERE role = "student"';
            const params = [];

            if (trade_code) {
                query += ' AND trade_code = ?';
                params.push(trade_code);
            }
            if (level_number) {
                query += ' AND level = ?';
                params.push(level_number);
            }

            const [result] = await connection.execute(query, params);
            students = result;
        }

        const generatedReports = [];

        // For each student, generate report
        for (const student of students) {
            // Get all marks for this student in this term
            const [marks] = await connection.execute(`
        SELECT 
          sm.marks,
          gssc.column_name,
          gssc.assessment_type,
          gssc.max_marks,
          gssc.course_name as subject,
          (sm.marks / gssc.max_marks * 100) as percentage
        FROM student_marks sm
        JOIN global_student_sheets_custom_columns gssc ON sm.column_id = gssc.id
        WHERE sm.student_id = ?
          AND sm.academic_year = ?
          AND sm.term = ?
      `, [student.id, academic_year, term]);

            // Calculate totals
            const totalMarks = marks.reduce((sum, m) => sum + parseFloat(m.marks || 0), 0);
            const maxMarks = marks.reduce((sum, m) => sum + parseFloat(m.max_marks || 0), 0);
            const averagePercentage = maxMarks > 0 ? (totalMarks / maxMarks * 100) : 0;

            // Get grade
            const gradeInfo = await calculateGrade(averagePercentage, connection, student.code, student.level);

            // Group marks by subject
            const subjectMap = {};
            marks.forEach(mark => {
                const subject = mark.subject || 'General';
                if (!subjectMap[subject]) {
                    subjectMap[subject] = {
                        subject,
                        marks_obtained: 0,
                        max_marks: 0,
                        assessments: []
                    };
                }
                subjectMap[subject].marks_obtained += parseFloat(mark.marks || 0);
                subjectMap[subject].max_marks += parseFloat(mark.max_marks || 0);
                subjectMap[subject].assessments.push({
                    name: mark.column_name,
                    type: mark.assessment_type,
                    marks: mark.marks,
                    max: mark.max_marks
                });
            });

            // Calculate subject-wise grades
            const subjectsData = Object.values(subjectMap).map(sub => ({
                ...sub,
                percentage: sub.max_marks > 0 ? (sub.marks_obtained / sub.max_marks * 100) : 0,
                grade: null // Will be calculated
            }));

            // Calculate grades for each subject
            for (const subject of subjectsData) {
                const subGrade = await calculateGrade(subject.percentage, connection, student.code, student.level);
                subject.grade = subGrade.grade;
            }

            // Get class rank
            const [rankData] = await connection.execute(`
        SELECT COUNT(*) + 1 as rank
        FROM student_performance_summary
        WHERE trade_code = ? 
          AND level_number = ?
          AND average_percentage > ?
      `, [student.code, student.level, averagePercentage]);

            const classRank = rankData.length > 0 ? rankData[0].rank : 1;

            // Get total students in class
            const [classSize] = await connection.execute(`
        SELECT COUNT(*) as total
        FROM users
        WHERE role = 'student'
          AND trade_code = ?
          AND level = ?
      `, [student.code, student.level]);

            const totalStudentsInClass = classSize[0].total;

            // Get attendance
            const [attendance] = await connection.execute(
                'SELECT attendance_percentage, conduct_score FROM global_student_sheets WHERE student_id = ?',
                [student.id]
            );

            const attendancePercentage = attendance.length > 0 ? attendance[0].attendance_percentage : 0;
            const conductScore = attendance.length > 0 ? attendance[0].conduct_score : 0;

            // Generate comments
            const teacherComment = generateTeacherComment(averagePercentage);
            const headmasterComment = averagePercentage >= 75
                ? 'Congratulations on your excellent performance. Keep striving for excellence.'
                : 'Work hard and be disciplined. Success comes to those who persevere.';

            // Insert/update report card
            const [existingReport] = await connection.execute(
                'SELECT id FROM report_cards WHERE student_id = ? AND academic_year = ? AND term = ?',
                [student.id, academic_year, term]
            );

            if (existingReport.length > 0) {
                // Update existing
                await connection.execute(`
          UPDATE report_cards
          SET total_marks = ?,
              max_marks = ?,
              average_marks = ?,
              percentage = ?,
              grade = ?,
              class_rank = ?,
              total_students_in_class = ?,
              attendance_percentage = ?,
              conduct_score = ?,
              teacher_comment = ?,
              headmaster_comment = ?,
              subjects_data = ?,
              generated_by = ?,
              generated_at = NOW(),
              status = 'final'
          WHERE id = ?
        `, [
                    totalMarks, maxMarks, averagePercentage, averagePercentage,
                    gradeInfo.grade, classRank, totalStudentsInClass,
                    attendancePercentage, conductScore,
                    teacherComment, headmasterComment,
                    JSON.stringify(subjectsData),
                    user_id,
                    existingReport[0].id
                ]);

                generatedReports.push(existingReport[0].id);
            } else {
                // Insert new
                const [newReport] = await connection.execute(`
          INSERT INTO report_cards (
            student_id, academic_year, term, trade_code, level_number,
            total_marks, max_marks, average_marks, percentage, grade,
            class_rank, total_students_in_class,
            attendance_percentage, conduct_score,
            teacher_comment, headmaster_comment,
            subjects_data, generated_by, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'final')
        `, [
                    student.id, academic_year, term, student.code, student.level,
                    totalMarks, maxMarks, averagePercentage, averagePercentage, gradeInfo.grade,
                    classRank, totalStudentsInClass,
                    attendancePercentage, conductScore,
                    teacherComment, headmasterComment,
                    JSON.stringify(subjectsData), user_id
                ]);

                generatedReports.push(newReport.insertId);
            }
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: `Generated ${generatedReports.length} report card(s)`,
            report_ids: generatedReports
        });

    } catch (error) {
        await connection.rollback();
        console.error('Report generation error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

// GET /api/dos-reports/:id - Get report card details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [reports] = await pool.execute(`
      SELECT 
        rc.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.student_id as student_code,
        s.email as student_email,
        s.date_of_birth,
        s.gender,
        t.name
      FROM report_cards rc
      JOIN users s ON rc.student_id = s.id
      LEFT JOIN trades t ON rc.trade_code = t.code
      WHERE rc.id = ?
    `, [id]);

        if (reports.length === 0) {
            return res.status(404).json({ success: false, message: 'Report card not found' });
        }

        res.json({
            success: true,
            report: reports[0]
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/dos-reports/student/:studentId - Get all reports for a student
router.get('/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        const [reports] = await pool.execute(`
      SELECT * FROM report_cards
      WHERE student_id = ?
      ORDER BY academic_year DESC, term DESC
    `, [studentId]);

        res.json({
            success: true,
            reports
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/dos-reports/class/:trade/:level - Get all reports for a class
router.get('/class/:trade/:level', async (req, res) => {
    try {
        const { trade, level } = req.params;
        const { academic_year, term } = req.query;

        const [reports] = await pool.execute(`
      SELECT 
        rc.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.student_id as student_code
      FROM report_cards rc
      JOIN users s ON rc.student_id = s.id
      WHERE rc.trade_code = ?
        AND rc.level_number = ?
        AND rc.academic_year = ?
        AND rc.term = ?
      ORDER BY rc.class_rank ASC
    `, [trade, level, academic_year, term]);

        res.json({
            success: true,
            reports,
            count: reports.length
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
