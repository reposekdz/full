const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, checkRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(checkRole(['teacher', 'dos', 'admin']));

const getMyAssignments = async (req, res) => {
    try {
        const teacher_id = req.user.id;
        const { academic_year_id } = req.query;

        let query = `
            SELECT 
                tsa.id,
                tsa.assignment_type,
                tsa.weekly_periods,
                tsa.assignment_date,
                s.id as subject_id,
                s.name as subject_name,
                s.code as subject_code,
                tc.id as trade_class_id,
                tc.class_name,
                tc.classroom,
                tl.id as trade_level_id,
                tl.full_name as trade_level,
                tl.trade_code,
                tl.level_number,
                ay.id as academic_year_id,
                ay.name as academic_year
            FROM teacher_subject_assignments tsa
            JOIN subjects s ON tsa.subject_id = s.id
            JOIN trade_classes tc ON tsa.trade_class_id = tc.id
            JOIN trade_levels tl ON tsa.trade_level_id = tl.id
            JOIN academic_years ay ON tsa.academic_year_id = ay.id
            WHERE tsa.teacher_id = ? AND tsa.is_active = TRUE
        `;

        const params = [teacher_id];
        if (academic_year_id) {
            query += ` AND tsa.academic_year_id = ?`;
            params.push(academic_year_id);
        }

        query += ` ORDER BY tc.class_name, s.name`;

        const [assignments] = await db.query(query, params);

        const [classTeacherAssignments] = await db.query(
            `SELECT 
                cta.id,
                cta.responsibilities,
                cta.assignment_date,
                tc.id as trade_class_id,
                tc.class_name,
                tc.classroom,
                tl.full_name as trade_level,
                ay.name as academic_year
            FROM class_teacher_assignments cta
            JOIN trade_classes tc ON cta.trade_class_id = tc.id
            JOIN trade_levels tl ON tc.trade_level_id = tl.id
            JOIN academic_years ay ON cta.academic_year_id = ay.id
            WHERE cta.teacher_id = ? AND cta.is_active = TRUE
            ${academic_year_id ? 'AND cta.academic_year_id = ?' : ''}`,
            academic_year_id ? [teacher_id, academic_year_id] : [teacher_id]
        );

        res.json({
            success: true,
            data: {
                subject_assignments: assignments,
                class_teacher_assignments: classTeacherAssignments
            }
        });
    } catch (error) {
        console.error('Error fetching teacher assignments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching teacher assignments',
            error: error.message
        });
    }
};

const getMyTimetable = async (req, res) => {
    try {
        const teacher_id = req.user.id;
        const { academic_year_id } = req.query;

        let query = `
            SELECT 
                t.*,
                s.name as subject_name,
                s.code as subject_code,
                tc.class_name,
                tl.full_name as trade_level
            FROM timetables t
            JOIN subjects s ON t.subject_id = s.id
            JOIN trade_classes tc ON t.trade_class_id = tc.id
            JOIN trade_levels tl ON tc.trade_level_id = tl.id
            WHERE t.teacher_id = ? AND t.is_active = TRUE
        `;

        const params = [teacher_id];
        if (academic_year_id) {
            query += ` AND t.academic_year_id = ?`;
            params.push(academic_year_id);
        }

        query += ` ORDER BY 
            FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
            t.period_number`;

        const [timetable] = await db.query(query, params);

        const organizedTimetable = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: []
        };

        timetable.forEach(entry => {
            organizedTimetable[entry.day_of_week].push(entry);
        });

        res.json({
            success: true,
            data: organizedTimetable
        });
    } catch (error) {
        console.error('Error fetching teacher timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching teacher timetable',
            error: error.message
        });
    }
};

const getMyClasses = async (req, res) => {
    try {
        const teacher_id = req.user.id;
        const { academic_year_id } = req.query;

        const [classes] = await db.query(
            `SELECT DISTINCT
                tc.id as trade_class_id,
                tc.class_name,
                tc.classroom,
                tc.capacity,
                tc.current_enrollment,
                tl.full_name as trade_level,
                tl.trade_code,
                ay.name as academic_year,
                ay.id as academic_year_id
            FROM teacher_subject_assignments tsa
            JOIN trade_classes tc ON tsa.trade_class_id = tc.id
            JOIN trade_levels tl ON tc.trade_level_id = tl.id
            JOIN academic_years ay ON tsa.academic_year_id = ay.id
            WHERE tsa.teacher_id = ? AND tsa.is_active = TRUE
            ${academic_year_id ? 'AND tsa.academic_year_id = ?' : ''}
            ORDER BY tc.class_name`,
            academic_year_id ? [teacher_id, academic_year_id] : [teacher_id]
        );

        res.json({
            success: true,
            data: classes
        });
    } catch (error) {
        console.error('Error fetching teacher classes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching teacher classes',
            error: error.message
        });
    }
};

const getClassStudents = async (req, res) => {
    try {
        const { trade_class_id } = req.params;
        const { subject_id } = req.query;

        const [students] = await db.query(
            `SELECT 
                u.id as student_id,
                u.first_name,
                u.last_name,
                u.student_id as student_number,
                u.email,
                u.phone,
                e.enrollment_date,
                e.status as enrollment_status
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            WHERE e.class_id = ? AND e.status = 'active'
            ORDER BY u.last_name, u.first_name`,
            [trade_class_id]
        );

        if (subject_id) {
            for (let student of students) {
                const [marks] = await db.query(
                    `SELECT 
                        COUNT(*) as total_assessments,
                        AVG(percentage) as average_percentage,
                        SUM(obtained_marks) as total_obtained,
                        SUM(max_marks) as total_max
                    FROM student_marks
                    WHERE student_id = ? AND subject_id = ?`,
                    [student.student_id, subject_id]
                );
                student.performance = marks[0];
            }
        }

        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Error fetching class students:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching class students',
            error: error.message
        });
    }
};

const addMarks = async (req, res) => {
    try {
        const teacher_id = req.user.id;
        const {
            student_id,
            subject_id,
            trade_class_id,
            academic_year_id,
            assessment_category_id,
            assessment_name,
            max_marks,
            obtained_marks,
            assessment_date,
            source_type,
            source_id,
            remarks
        } = req.body;

        const [assignment] = await db.query(
            `SELECT id FROM teacher_subject_assignments 
            WHERE teacher_id = ? AND subject_id = ? AND trade_class_id = ? AND is_active = TRUE`,
            [teacher_id, subject_id, trade_class_id]
        );

        if (assignment.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to teach this subject for this class'
            });
        }

        const [result] = await db.query(
            `INSERT INTO student_marks 
            (student_id, subject_id, trade_class_id, academic_year_id, assessment_category_id,
            assessment_name, max_marks, obtained_marks, assessment_date, teacher_id, 
            source_type, source_id, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [student_id, subject_id, trade_class_id, academic_year_id, assessment_category_id,
                assessment_name, max_marks, obtained_marks, assessment_date, teacher_id,
                source_type, source_id, remarks]
        );

        res.status(201).json({
            success: true,
            message: 'Marks added successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error adding marks:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding marks',
            error: error.message
        });
    }
};

const bulkAddMarks = async (req, res) => {
    try {
        const teacher_id = req.user.id;
        const {
            marks_array,
            subject_id,
            trade_class_id,
            academic_year_id,
            assessment_category_id,
            assessment_name,
            max_marks,
            assessment_date,
            source_type,
            source_id
        } = req.body;

        const [assignment] = await db.query(
            `SELECT id FROM teacher_subject_assignments 
            WHERE teacher_id = ? AND subject_id = ? AND trade_class_id = ? AND is_active = TRUE`,
            [teacher_id, subject_id, trade_class_id]
        );

        if (assignment.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to teach this subject for this class'
            });
        }

        const values = marks_array.map(mark => [
            mark.student_id,
            subject_id,
            trade_class_id,
            academic_year_id,
            assessment_category_id,
            assessment_name,
            max_marks,
            mark.obtained_marks,
            assessment_date,
            teacher_id,
            source_type,
            source_id,
            mark.remarks || null
        ]);

        const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        const flatValues = values.flat();

        await db.query(
            `INSERT INTO student_marks 
            (student_id, subject_id, trade_class_id, academic_year_id, assessment_category_id,
            assessment_name, max_marks, obtained_marks, assessment_date, teacher_id, 
            source_type, source_id, remarks)
            VALUES ${placeholders}`,
            flatValues
        );

        res.json({
            success: true,
            message: `Marks added successfully for ${marks_array.length} students`
        });
    } catch (error) {
        console.error('Error adding bulk marks:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding bulk marks',
            error: error.message
        });
    }
};

const updateMarks = async (req, res) => {
    try {
        const teacher_id = req.user.id;
        const { mark_id } = req.params;
        const { obtained_marks, remarks } = req.body;

        const [mark] = await db.query(
            `SELECT * FROM student_marks WHERE id = ? AND teacher_id = ?`,
            [mark_id, teacher_id]
        );

        if (mark.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You can only update marks that you entered'
            });
        }

        await db.query(
            `UPDATE student_marks 
            SET obtained_marks = ?, remarks = ?
            WHERE id = ?`,
            [obtained_marks, remarks, mark_id]
        );

        res.json({
            success: true,
            message: 'Marks updated successfully'
        });
    } catch (error) {
        console.error('Error updating marks:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating marks',
            error: error.message
        });
    }
};

const getStudentMarks = async (req, res) => {
    try {
        const { student_id, subject_id } = req.query;

        const [marks] = await db.query(
            `SELECT 
                sm.*,
                ac.name as category_name,
                ac.weight_percentage,
                s.name as subject_name
            FROM student_marks sm
            JOIN assessment_categories ac ON sm.assessment_category_id = ac.id
            JOIN subjects s ON sm.subject_id = s.id
            WHERE sm.student_id = ? AND sm.subject_id = ?
            ORDER BY sm.assessment_date DESC`,
            [student_id, subject_id]
        );

        const [summary] = await db.query(
            `SELECT 
                COUNT(*) as total_assessments,
                AVG(percentage) as average_percentage,
                MAX(percentage) as highest_percentage,
                MIN(percentage) as lowest_percentage,
                SUM(obtained_marks) as total_obtained,
                SUM(max_marks) as total_max
            FROM student_marks
            WHERE student_id = ? AND subject_id = ?`,
            [student_id, subject_id]
        );

        res.json({
            success: true,
            data: {
                marks: marks,
                summary: summary[0]
            }
        });
    } catch (error) {
        console.error('Error fetching student marks:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student marks',
            error: error.message
        });
    }
};

const getClassPerformance = async (req, res) => {
    try {
        const { trade_class_id, subject_id } = req.query;

        const [performance] = await db.query(
            `SELECT 
                u.id as student_id,
                u.first_name,
                u.last_name,
                u.student_id as student_number,
                COUNT(sm.id) as total_assessments,
                AVG(sm.percentage) as average_percentage,
                SUM(sm.obtained_marks) as total_obtained,
                SUM(sm.max_marks) as total_max
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            LEFT JOIN student_marks sm ON sm.student_id = u.id 
                AND sm.subject_id = ? 
                AND sm.trade_class_id = ?
            WHERE e.class_id = ? AND e.status = 'active'
            GROUP BY u.id, u.first_name, u.last_name, u.student_id
            ORDER BY average_percentage DESC`,
            [subject_id, trade_class_id, trade_class_id]
        );

        const [classStats] = await db.query(
            `SELECT 
                COUNT(DISTINCT sm.student_id) as students_assessed,
                AVG(sm.percentage) as class_average,
                MAX(sm.percentage) as highest_score,
                MIN(sm.percentage) as lowest_score
            FROM student_marks sm
            WHERE sm.trade_class_id = ? AND sm.subject_id = ?`,
            [trade_class_id, subject_id]
        );

        res.json({
            success: true,
            data: {
                students: performance,
                stats: classStats[0]
            }
        });
    } catch (error) {
        console.error('Error fetching class performance:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching class performance',
            error: error.message
        });
    }
};

const getMyWorkload = async (req, res) => {
    try {
        const teacher_id = req.user.id;
        const { academic_year_id } = req.query;

        const [workload] = await db.query(
            `SELECT * FROM teacher_workload 
            WHERE teacher_id = ? AND academic_year_id = ?`,
            [teacher_id, academic_year_id]
        );

        const [assignments] = await db.query(
            `SELECT 
                COUNT(DISTINCT trade_class_id) as total_classes,
                COUNT(DISTINCT subject_id) as total_subjects,
                SUM(weekly_periods) as total_weekly_periods
            FROM teacher_subject_assignments
            WHERE teacher_id = ? AND academic_year_id = ? AND is_active = TRUE`,
            [teacher_id, academic_year_id]
        );

        const [classTeacher] = await db.query(
            `SELECT COUNT(*) as class_teacher_count
            FROM class_teacher_assignments
            WHERE teacher_id = ? AND academic_year_id = ? AND is_active = TRUE`,
            [teacher_id, academic_year_id]
        );

        res.json({
            success: true,
            data: {
                workload: workload[0] || {},
                current_stats: {
                    ...assignments[0],
                    class_teacher_assignments: classTeacher[0].class_teacher_count
                }
            }
        });
    } catch (error) {
        console.error('Error fetching teacher workload:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching teacher workload',
            error: error.message
        });
    }
};

const addSubjectComment = async (req, res) => {
    try {
        const teacher_id = req.user.id;
        const {
            student_id,
            subject_id,
            trade_class_id,
            academic_year_id,
            term_id,
            comment
        } = req.body;

        await db.query(
            `UPDATE student_subject_summary 
            SET teacher_comment = ?
            WHERE student_id = ? AND subject_id = ? AND trade_class_id = ? 
                AND academic_year_id = ? AND term_id = ?`,
            [comment, student_id, subject_id, trade_class_id, academic_year_id, term_id]
        );

        res.json({
            success: true,
            message: 'Comment added successfully'
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment',
            error: error.message
        });
    }
};

router.get('/my-assignments', getMyAssignments);
router.get('/my-timetable', getMyTimetable);
router.get('/my-classes', getMyClasses);
router.get('/my-workload', getMyWorkload);

router.get('/class/:trade_class_id/students', getClassStudents);
router.get('/class/performance', getClassPerformance);

router.post('/marks', addMarks);
router.post('/marks/bulk', bulkAddMarks);
router.put('/marks/:mark_id', updateMarks);
router.get('/marks/student', getStudentMarks);

router.post('/comment/subject', addSubjectComment);

module.exports = router;
