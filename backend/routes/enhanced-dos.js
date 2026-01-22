const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, checkRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(checkRole(['dos', 'admin']));

const createTrade = async (req, res) => {
    try {
        const {
            trade_code,
            trade_name,
            level_number,
            level_suffix,
            description,
            duration_years,
            capacity
        } = req.body;

        const full_name = `${trade_name} Level ${level_number}${level_suffix || ''}`;

        const [result] = await db.query(
            `INSERT INTO trade_levels 
            (trade_code, trade_name, level_number, level_suffix, full_name, description, duration_years, capacity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [trade_code, trade_name, level_number, level_suffix, full_name, description, duration_years, capacity]
        );

        res.status(201).json({
            success: true,
            message: 'Trade created successfully',
            data: { id: result.insertId, full_name }
        });
    } catch (error) {
        console.error('Error creating trade:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating trade',
            error: error.message
        });
    }
};

const getAllTrades = async (req, res) => {
    try {
        const [trades] = await db.query(
            `SELECT * FROM trade_levels WHERE is_active = TRUE ORDER BY trade_code, level_number`
        );

        res.json({
            success: true,
            data: trades
        });
    } catch (error) {
        console.error('Error fetching trades:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching trades',
            error: error.message
        });
    }
};

const updateTrade = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.trade_name || updates.level_number) {
            updates.full_name = `${updates.trade_name || ''} Level ${updates.level_number || ''}${updates.level_suffix || ''}`;
        }

        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updates), id];

        await db.query(
            `UPDATE trade_levels SET ${fields} WHERE id = ?`,
            values
        );

        res.json({
            success: true,
            message: 'Trade updated successfully'
        });
    } catch (error) {
        console.error('Error updating trade:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating trade',
            error: error.message
        });
    }
};

const createTradeClass = async (req, res) => {
    try {
        const {
            trade_level_id,
            academic_year_id,
            class_name,
            classroom,
            capacity
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO trade_classes 
            (trade_level_id, academic_year_id, class_name, classroom, capacity)
            VALUES (?, ?, ?, ?, ?)`,
            [trade_level_id, academic_year_id, class_name, classroom, capacity]
        );

        res.status(201).json({
            success: true,
            message: 'Trade class created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating trade class:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating trade class',
            error: error.message
        });
    }
};

const getAllTeachers = async (req, res) => {
    try {
        const [teachers] = await db.query(
            `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.phone, u.profile_picture
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name = 'teacher' AND u.is_active = TRUE
            ORDER BY u.first_name, u.last_name`
        );

        res.json({
            success: true,
            data: teachers
        });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching teachers',
            error: error.message
        });
    }
};

const assignClassTeacher = async (req, res) => {
    try {
        const {
            teacher_id,
            trade_class_id,
            academic_year_id,
            assignment_date,
            responsibilities
        } = req.body;

        await db.query(
            `UPDATE class_teacher_assignments 
            SET is_active = FALSE 
            WHERE trade_class_id = ? AND academic_year_id = ? AND is_active = TRUE`,
            [trade_class_id, academic_year_id]
        );

        const [result] = await db.query(
            `INSERT INTO class_teacher_assignments 
            (teacher_id, trade_class_id, academic_year_id, assignment_date, responsibilities, assigned_by)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [teacher_id, trade_class_id, academic_year_id, assignment_date, responsibilities, req.user.id]
        );

        res.status(201).json({
            success: true,
            message: 'Class teacher assigned successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error assigning class teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning class teacher',
            error: error.message
        });
    }
};

const assignSubjectTeacher = async (req, res) => {
    try {
        const {
            teacher_id,
            subject_id,
            trade_class_id,
            academic_year_id,
            trade_level_id,
            assignment_type,
            weekly_periods,
            assignment_date,
            notes
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO teacher_subject_assignments 
            (teacher_id, subject_id, trade_class_id, academic_year_id, trade_level_id, 
            assignment_type, weekly_periods, assignment_date, assigned_by, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [teacher_id, subject_id, trade_class_id, academic_year_id, trade_level_id,
                assignment_type, weekly_periods, assignment_date, req.user.id, notes]
        );

        const [workload] = await db.query(
            `SELECT COUNT(DISTINCT trade_class_id) as total_classes,
                    COUNT(DISTINCT subject_id) as total_subjects,
                    SUM(weekly_periods) as total_periods
            FROM teacher_subject_assignments
            WHERE teacher_id = ? AND academic_year_id = ? AND is_active = TRUE`,
            [teacher_id, academic_year_id]
        );

        await db.query(
            `INSERT INTO teacher_workload 
            (teacher_id, academic_year_id, total_classes, total_subjects, weekly_periods)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            total_classes = VALUES(total_classes),
            total_subjects = VALUES(total_subjects),
            weekly_periods = VALUES(weekly_periods)`,
            [teacher_id, academic_year_id, workload[0].total_classes, 
             workload[0].total_subjects, workload[0].total_periods]
        );

        res.status(201).json({
            success: true,
            message: 'Subject teacher assigned successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error assigning subject teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning subject teacher',
            error: error.message
        });
    }
};

const getTeacherAssignments = async (req, res) => {
    try {
        const { teacher_id, academic_year_id } = req.query;

        let query = `
            SELECT 
                tsa.id,
                tsa.assignment_type,
                tsa.weekly_periods,
                tsa.assignment_date,
                u.first_name, u.last_name,
                s.name as subject_name, s.code as subject_code,
                tc.class_name,
                tl.full_name as trade_level,
                ay.name as academic_year
            FROM teacher_subject_assignments tsa
            JOIN users u ON tsa.teacher_id = u.id
            JOIN subjects s ON tsa.subject_id = s.id
            JOIN trade_classes tc ON tsa.trade_class_id = tc.id
            JOIN trade_levels tl ON tsa.trade_level_id = tl.id
            JOIN academic_years ay ON tsa.academic_year_id = ay.id
            WHERE tsa.is_active = TRUE
        `;

        const params = [];
        if (teacher_id) {
            query += ` AND tsa.teacher_id = ?`;
            params.push(teacher_id);
        }
        if (academic_year_id) {
            query += ` AND tsa.academic_year_id = ?`;
            params.push(academic_year_id);
        }

        query += ` ORDER BY u.last_name, tc.class_name, s.name`;

        const [assignments] = await db.query(query, params);

        res.json({
            success: true,
            data: assignments
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

const createTimetableTemplate = async (req, res) => {
    try {
        const {
            name,
            description,
            total_periods_per_day,
            period_duration_minutes,
            break_periods,
            start_time,
            end_time,
            working_days,
            is_default
        } = req.body;

        if (is_default) {
            await db.query(`UPDATE timetable_templates SET is_default = FALSE`);
        }

        const [result] = await db.query(
            `INSERT INTO timetable_templates 
            (name, description, total_periods_per_day, period_duration_minutes, 
            break_periods, start_time, end_time, working_days, is_default, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, description, total_periods_per_day, period_duration_minutes,
                JSON.stringify(break_periods), start_time, end_time, 
                JSON.stringify(working_days), is_default, req.user.id]
        );

        res.status(201).json({
            success: true,
            message: 'Timetable template created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating timetable template:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating timetable template',
            error: error.message
        });
    }
};

const createTimetableEntry = async (req, res) => {
    try {
        const {
            trade_class_id,
            subject_id,
            teacher_id,
            academic_year_id,
            day_of_week,
            period_number,
            start_time,
            end_time,
            room,
            room_type,
            session_type,
            notes
        } = req.body;

        const [conflicts] = await db.query(
            `SELECT 'class' as conflict_type, id FROM timetables 
            WHERE trade_class_id = ? AND day_of_week = ? AND period_number = ? AND is_active = TRUE
            UNION
            SELECT 'teacher' as conflict_type, id FROM timetables 
            WHERE teacher_id = ? AND day_of_week = ? AND period_number = ? AND is_active = TRUE
            UNION
            SELECT 'room' as conflict_type, id FROM timetables 
            WHERE room = ? AND day_of_week = ? AND period_number = ? AND is_active = TRUE`,
            [trade_class_id, day_of_week, period_number,
                teacher_id, day_of_week, period_number,
                room, day_of_week, period_number]
        );

        if (conflicts.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Timetable conflict detected',
                conflicts: conflicts
            });
        }

        const [result] = await db.query(
            `INSERT INTO timetables 
            (trade_class_id, subject_id, teacher_id, academic_year_id, day_of_week, 
            period_number, start_time, end_time, room, room_type, session_type, notes, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [trade_class_id, subject_id, teacher_id, academic_year_id, day_of_week,
                period_number, start_time, end_time, room, room_type, session_type, notes, req.user.id]
        );

        res.status(201).json({
            success: true,
            message: 'Timetable entry created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating timetable entry:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating timetable entry',
            error: error.message
        });
    }
};

const generateAutoTimetable = async (req, res) => {
    try {
        const { trade_class_id, academic_year_id, template_id } = req.body;

        const [template] = await db.query(
            `SELECT * FROM timetable_templates WHERE id = ? OR is_default = TRUE LIMIT 1`,
            [template_id]
        );

        if (template.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No timetable template found'
            });
        }

        const config = template[0];
        const working_days = JSON.parse(config.working_days);
        const break_periods = JSON.parse(config.break_periods);

        const [assignments] = await db.query(
            `SELECT tsa.*, s.name as subject_name
            FROM teacher_subject_assignments tsa
            JOIN subjects s ON tsa.subject_id = s.id
            WHERE tsa.trade_class_id = ? AND tsa.academic_year_id = ? AND tsa.is_active = TRUE
            ORDER BY tsa.weekly_periods DESC`,
            [trade_class_id, academic_year_id]
        );

        if (assignments.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No subject assignments found for this class'
            });
        }

        await db.query(
            `DELETE FROM timetables 
            WHERE trade_class_id = ? AND academic_year_id = ?`,
            [trade_class_id, academic_year_id]
        );

        const entries = [];
        let assignmentIndex = 0;
        let periodStartTime = config.start_time;

        for (const day of working_days) {
            for (let period = 1; period <= config.total_periods_per_day; period++) {
                const isBreak = break_periods.some(bp => bp.period === period);
                
                if (isBreak) {
                    continue;
                }

                const assignment = assignments[assignmentIndex % assignments.length];
                
                const periodEnd = new Date(`2000-01-01T${periodStartTime}`);
                periodEnd.setMinutes(periodEnd.getMinutes() + config.period_duration_minutes);
                const end_time = periodEnd.toTimeString().slice(0, 8);

                entries.push([
                    trade_class_id,
                    assignment.subject_id,
                    assignment.teacher_id,
                    academic_year_id,
                    day,
                    period,
                    periodStartTime,
                    end_time,
                    null,
                    'classroom',
                    'theory',
                    `Auto-generated for ${assignment.subject_name}`,
                    req.user.id
                ]);

                assignmentIndex++;

                const nextStart = new Date(`2000-01-01T${end_time}`);
                const nextBreak = break_periods.find(bp => bp.period === period + 1);
                if (nextBreak) {
                    nextStart.setMinutes(nextStart.getMinutes() + nextBreak.duration);
                }
                periodStartTime = nextStart.toTimeString().slice(0, 8);
            }
        }

        if (entries.length > 0) {
            const placeholders = entries.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
            const values = entries.flat();

            await db.query(
                `INSERT INTO timetables 
                (trade_class_id, subject_id, teacher_id, academic_year_id, day_of_week, 
                period_number, start_time, end_time, room, room_type, session_type, notes, created_by)
                VALUES ${placeholders}`,
                values
            );
        }

        res.json({
            success: true,
            message: `Timetable generated successfully with ${entries.length} entries`,
            data: { entries_created: entries.length }
        });
    } catch (error) {
        console.error('Error generating timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating timetable',
            error: error.message
        });
    }
};

const getTimetable = async (req, res) => {
    try {
        const { trade_class_id, teacher_id, academic_year_id } = req.query;

        let query = `
            SELECT 
                t.*,
                s.name as subject_name, s.code as subject_code,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name,
                tc.class_name,
                tl.full_name as trade_level
            FROM timetables t
            JOIN subjects s ON t.subject_id = s.id
            JOIN users u ON t.teacher_id = u.id
            JOIN trade_classes tc ON t.trade_class_id = tc.id
            JOIN trade_levels tl ON tc.trade_level_id = tl.id
            WHERE t.is_active = TRUE
        `;

        const params = [];
        if (trade_class_id) {
            query += ` AND t.trade_class_id = ?`;
            params.push(trade_class_id);
        }
        if (teacher_id) {
            query += ` AND t.teacher_id = ?`;
            params.push(teacher_id);
        }
        if (academic_year_id) {
            query += ` AND t.academic_year_id = ?`;
            params.push(academic_year_id);
        }

        query += ` ORDER BY 
            FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
            t.period_number`;

        const [timetable] = await db.query(query, params);

        res.json({
            success: true,
            data: timetable
        });
    } catch (error) {
        console.error('Error fetching timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching timetable',
            error: error.message
        });
    }
};

const addStudentMark = async (req, res) => {
    try {
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

        const [result] = await db.query(
            `INSERT INTO student_marks 
            (student_id, subject_id, trade_class_id, academic_year_id, assessment_category_id,
            assessment_name, max_marks, obtained_marks, assessment_date, teacher_id, 
            source_type, source_id, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [student_id, subject_id, trade_class_id, academic_year_id, assessment_category_id,
                assessment_name, max_marks, obtained_marks, assessment_date, req.user.id,
                source_type, source_id, remarks]
        );

        res.status(201).json({
            success: true,
            message: 'Student mark added successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error adding student mark:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding student mark',
            error: error.message
        });
    }
};

const generateStudentReport = async (req, res) => {
    try {
        const {
            student_id,
            trade_class_id,
            academic_year_id,
            term_id,
            report_type
        } = req.body;

        await db.query(
            `CALL GenerateStudentReport(?, ?, ?, ?, ?, ?)`,
            [student_id, trade_class_id, academic_year_id, term_id, report_type, req.user.id]
        );

        const [report] = await db.query(
            `SELECT sr.*, 
                    u.first_name, u.last_name, u.student_id as student_number,
                    tc.class_name,
                    tl.full_name as trade_level,
                    ay.name as academic_year_name
            FROM student_reports sr
            JOIN users u ON sr.student_id = u.id
            JOIN trade_classes tc ON sr.trade_class_id = tc.id
            JOIN trade_levels tl ON tc.trade_level_id = tl.id
            JOIN academic_years ay ON sr.academic_year_id = ay.id
            WHERE sr.student_id = ? AND sr.trade_class_id = ? 
                AND sr.academic_year_id = ? AND sr.term_id = ? AND sr.report_type = ?
            ORDER BY sr.id DESC LIMIT 1`,
            [student_id, trade_class_id, academic_year_id, term_id, report_type]
        );

        if (report.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        const [subjects] = await db.query(
            `SELECT rsd.*, s.name as subject_name, s.code as subject_code,
                    u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM report_subject_details rsd
            JOIN subjects s ON rsd.subject_id = s.id
            JOIN users u ON rsd.teacher_id = u.id
            WHERE rsd.report_id = ?
            ORDER BY s.name`,
            [report[0].id]
        );

        const reportData = {
            ...report[0],
            subjects: subjects
        };

        res.json({
            success: true,
            message: 'Student report generated successfully',
            data: reportData
        });
    } catch (error) {
        console.error('Error generating student report:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating student report',
            error: error.message
        });
    }
};

const generateClassReports = async (req, res) => {
    try {
        const {
            trade_class_id,
            academic_year_id,
            term_id,
            report_type
        } = req.body;

        const [students] = await db.query(
            `SELECT DISTINCT e.student_id
            FROM enrollments e
            WHERE e.class_id = ? AND e.academic_year_id = ? AND e.status = 'active'`,
            [trade_class_id, academic_year_id]
        );

        const reports = [];
        for (const student of students) {
            try {
                await db.query(
                    `CALL GenerateStudentReport(?, ?, ?, ?, ?, ?)`,
                    [student.student_id, trade_class_id, academic_year_id, term_id, report_type, req.user.id]
                );
                reports.push({ student_id: student.student_id, status: 'success' });
            } catch (err) {
                reports.push({ student_id: student.student_id, status: 'failed', error: err.message });
            }
        }

        res.json({
            success: true,
            message: `Reports generated for ${reports.filter(r => r.status === 'success').length} out of ${students.length} students`,
            data: reports
        });
    } catch (error) {
        console.error('Error generating class reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating class reports',
            error: error.message
        });
    }
};

const getStudentRankings = async (req, res) => {
    try {
        const { trade_class_id, academic_year_id, term_id } = req.query;

        const [rankings] = await db.query(
            `SELECT 
                sr.class_rank,
                sr.overall_percentage,
                sr.total_subjects,
                sr.attendance_percentage,
                u.id as student_id,
                u.first_name,
                u.last_name,
                u.student_id as student_number,
                tc.class_name,
                tl.full_name as trade_level
            FROM student_reports sr
            JOIN users u ON sr.student_id = u.id
            JOIN trade_classes tc ON sr.trade_class_id = tc.id
            JOIN trade_levels tl ON tc.trade_level_id = tl.id
            WHERE sr.trade_class_id = ? 
                AND sr.academic_year_id = ? 
                AND sr.term_id = ?
            ORDER BY sr.class_rank ASC`,
            [trade_class_id, academic_year_id, term_id]
        );

        res.json({
            success: true,
            data: rankings
        });
    } catch (error) {
        console.error('Error fetching student rankings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student rankings',
            error: error.message
        });
    }
};

const getAssessmentCategories = async (req, res) => {
    try {
        const [categories] = await db.query(
            `SELECT * FROM assessment_categories WHERE is_active = TRUE ORDER BY name`
        );

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching assessment categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching assessment categories',
            error: error.message
        });
    }
};

const publishReport = async (req, res) => {
    try {
        const { report_id } = req.params;

        await db.query(
            `UPDATE student_reports 
            SET is_published = TRUE, published_at = NOW()
            WHERE id = ?`,
            [report_id]
        );

        res.json({
            success: true,
            message: 'Report published successfully'
        });
    } catch (error) {
        console.error('Error publishing report:', error);
        res.status(500).json({
            success: false,
            message: 'Error publishing report',
            error: error.message
        });
    }
};

const getTeacherWorkload = async (req, res) => {
    try {
        const { academic_year_id } = req.query;

        const [workload] = await db.query(
            `SELECT 
                tw.*,
                u.first_name,
                u.last_name,
                u.email,
                ay.name as academic_year_name
            FROM teacher_workload tw
            JOIN users u ON tw.teacher_id = u.id
            JOIN academic_years ay ON tw.academic_year_id = ay.id
            WHERE tw.academic_year_id = ?
            ORDER BY tw.workload_score DESC`,
            [academic_year_id]
        );

        res.json({
            success: true,
            data: workload
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

router.post('/trades', createTrade);
router.get('/trades', getAllTrades);
router.put('/trades/:id', updateTrade);
router.post('/trade-classes', createTradeClass);

router.get('/teachers', getAllTeachers);
router.post('/assign-class-teacher', assignClassTeacher);
router.post('/assign-subject-teacher', assignSubjectTeacher);
router.get('/teacher-assignments', getTeacherAssignments);
router.get('/teacher-workload', getTeacherWorkload);

router.post('/timetable/template', createTimetableTemplate);
router.post('/timetable/entry', createTimetableEntry);
router.post('/timetable/generate', generateAutoTimetable);
router.get('/timetable', getTimetable);

router.post('/marks', addStudentMark);
router.get('/assessment-categories', getAssessmentCategories);

router.post('/reports/generate', generateStudentReport);
router.post('/reports/generate-class', generateClassReports);
router.get('/reports/rankings', getStudentRankings);
router.put('/reports/:report_id/publish', publishReport);

module.exports = router;
