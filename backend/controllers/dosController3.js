const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// ===============================
// TIMETABLE MANAGEMENT
// ===============================

// Get timetable for class or teacher
router.get('/timetable', async (req, res) => {
    try {
        const { class_id, teacher_id, day, academic_year_id } = req.query;
        
        let whereConditions = ['ts.is_active = true'];
        let queryParams = [];
        
        if (class_id) {
            whereConditions.push('ts.trade_class_id = ?');
            queryParams.push(class_id);
        }
        
        if (teacher_id) {
            whereConditions.push('ts.teacher_id = ?');
            queryParams.push(teacher_id);
        }
        
        if (day) {
            whereConditions.push('ts.day_of_week = ?');
            queryParams.push(day);
        }
        
        if (academic_year_id) {
            whereConditions.push('ts.academic_year_id = ?');
            queryParams.push(academic_year_id);
        } else {
            // Default to current academic year
            whereConditions.push('ay.is_active = true');
        }
        
        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
        
        const query = `
            SELECT 
                ts.*,
                tc.class_name,
                tl.trade_code,
                tl.level_number,
                tl.level_suffix,
                tl.full_name as trade_level_name,
                s.name as subject_name,
                s.code as subject_code,
                s.is_practical,
                CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
                t.email as teacher_email,
                ay.name as academic_year
            FROM timetable_sessions ts
            JOIN trade_classes tc ON ts.trade_class_id = tc.id
            JOIN trade_levels tl ON tc.trade_level_id = tl.id
            JOIN subjects s ON ts.subject_id = s.id
            JOIN users t ON ts.teacher_id = t.id
            JOIN academic_years ay ON ts.academic_year_id = ay.id
            ${whereClause}
            ORDER BY ts.day_of_week, ts.period_number, ts.start_time
        `;
        
        const [sessions] = await pool.execute(query, queryParams);
        
        // Group by day if requesting full timetable
        const groupedSessions = sessions.reduce((acc, session) => {
            if (!acc[session.day_of_week]) {
                acc[session.day_of_week] = [];
            }
            acc[session.day_of_week].push(session);
            return acc;
        }, {});
        
        res.json({
            success: true,
            data: {
                sessions,
                grouped_by_day: groupedSessions
            }
        });
        
    } catch (error) {
        console.error('Error fetching timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch timetable',
            error: error.message
        });
    }
});

// Create timetable session
router.post('/timetable', async (req, res) => {
    try {
        const {
            trade_class_id,
            subject_id,
            teacher_id,
            day_of_week,
            period_number,
            start_time,
            end_time,
            room,
            session_type = 'theory',
            equipment_needed,
            academic_year_id
        } = req.body;
        
        // Validate required fields
        if (!trade_class_id || !subject_id || !teacher_id || !day_of_week || !period_number || !start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'Required fields: trade_class_id, subject_id, teacher_id, day_of_week, period_number, start_time, end_time'
            });
        }
        
        // Get current academic year if not provided
        let yearId = academic_year_id;
        if (!yearId) {
            const [academicYear] = await pool.execute(
                'SELECT id FROM academic_years WHERE is_active = true LIMIT 1'
            );
            if (academicYear.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No active academic year found'
                });
            }
            yearId = academicYear[0].id;
        }
        
        // Check for conflicts
        const [conflicts] = await pool.execute(`
            SELECT COUNT(*) as conflicts
            FROM timetable_sessions
            WHERE (
                (trade_class_id = ? AND day_of_week = ? AND period_number = ?)
                OR (teacher_id = ? AND day_of_week = ? AND start_time < ? AND end_time > ?)
            )
            AND academic_year_id = ? AND is_active = true
        `, [
            trade_class_id, day_of_week, period_number,
            teacher_id, day_of_week, end_time, start_time,
            yearId
        ]);
        
        if (conflicts[0].conflicts > 0) {
            return res.status(409).json({
                success: false,
                message: 'Time slot conflict detected'
            });
        }
        
        const [result] = await pool.execute(`
            INSERT INTO timetable_sessions (
                trade_class_id, subject_id, teacher_id, day_of_week, period_number,
                start_time, end_time, room, session_type, equipment_needed,
                academic_year_id, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
        `, [
            trade_class_id, subject_id, teacher_id, day_of_week, period_number,
            start_time, end_time, room, session_type, equipment_needed, yearId
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Timetable session created successfully',
            data: { session_id: result.insertId }
        });
        
    } catch (error) {
        console.error('Error creating timetable session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create timetable session',
            error: error.message
        });
    }
});

// Update timetable session
router.put('/timetable/:id', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const updates = req.body;
        
        const allowedFields = [
            'subject_id', 'teacher_id', 'day_of_week', 'period_number',
            'start_time', 'end_time', 'room', 'session_type', 'equipment_needed', 'is_active'
        ];
        
        const updateFields = [];
        const values = [];
        
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                updateFields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });
        
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }
        
        values.push(sessionId);
        
        const query = `UPDATE timetable_sessions SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        
        const [result] = await pool.execute(query, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Timetable session not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Timetable session updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating timetable session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update timetable session',
            error: error.message
        });
    }
});

// Delete timetable session
router.delete('/timetable/:id', async (req, res) => {
    try {
        const sessionId = req.params.id;
        
        const [result] = await pool.execute(
            'UPDATE timetable_sessions SET is_active = false WHERE id = ?',
            [sessionId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Timetable session not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Timetable session deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting timetable session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete timetable session',
            error: error.message
        });
    }
});

// ===============================
// PERFORMANCE ANALYTICS
// ===============================

// Get comprehensive analytics dashboard
router.get('/analytics/overview', async (req, res) => {
    try {
        const { academic_year_id } = req.query;
        
        // Get current academic year if not specified
        let yearId = academic_year_id;
        if (!yearId) {
            const [academicYear] = await pool.execute(
                'SELECT id FROM academic_years WHERE is_active = true LIMIT 1'
            );
            if (academicYear.length > 0) {
                yearId = academicYear[0].id;
            }
        }
        
        // Overall statistics
        const [overallStats] = await pool.execute(`
            SELECT 
                COUNT(DISTINCT u.id) as total_students,
                COUNT(DISTINCT CASE WHEN u.is_active = true THEN u.id END) as active_students,
                COUNT(DISTINCT tc.id) as total_classes,
                COUNT(DISTINCT t.id) as total_teachers,
                AVG(sps.average_grade) as overall_average_grade,
                AVG(sps.attendance_percentage) as overall_attendance,
                AVG(sps.conduct_score) as overall_conduct_score
            FROM users u
            JOIN enrollments e ON u.id = e.student_id
            JOIN trade_classes tc ON e.class_id = tc.id
            LEFT JOIN student_performance_summary sps ON u.id = sps.student_id
            LEFT JOIN teacher_class_assignments tca ON tc.id = tca.trade_class_id
            LEFT JOIN users t ON tca.teacher_id = t.id AND t.role_id = (SELECT id FROM roles WHERE name = 'teacher')
            WHERE u.role_id = (SELECT id FROM roles WHERE name = 'student')
            ${yearId ? 'AND e.academic_year_id = ?' : ''}
        `, yearId ? [yearId] : []);
        
        // Performance by trade
        const [tradeStats] = await pool.execute(`
            SELECT 
                tl.trade_code,
                tl.trade_name,
                COUNT(DISTINCT u.id) as student_count,
                AVG(sps.average_grade) as avg_grade,
                AVG(sps.attendance_percentage) as avg_attendance,
                AVG(sps.conduct_score) as avg_conduct_score,
                COUNT(DISTINCT tc.id) as class_count
            FROM trade_levels tl
            LEFT JOIN trade_classes tc ON tl.id = tc.trade_level_id
            LEFT JOIN enrollments e ON tc.id = e.class_id
            LEFT JOIN users u ON e.student_id = u.id
            LEFT JOIN student_performance_summary sps ON u.id = sps.student_id AND tc.id = sps.trade_class_id
            WHERE tl.is_active = true
            ${yearId ? 'AND (e.academic_year_id = ? OR e.academic_year_id IS NULL)' : ''}
            GROUP BY tl.id, tl.trade_code, tl.trade_name
            ORDER BY tl.trade_code, tl.level_number
        `, yearId ? [yearId] : []);
        
        // Recent conduct statistics
        const [conductStats] = await pool.execute(`
            SELECT 
                incident_type,
                severity,
                COUNT(*) as count,
                DATE(incident_date) as date
            FROM conduct_records
            WHERE incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY incident_type, severity, DATE(incident_date)
            ORDER BY incident_date DESC
        `);
        
        // Top performing students
        const [topStudents] = await pool.execute(`
            SELECT 
                u.id,
                CONCAT(u.first_name, ' ', u.last_name) as student_name,
                u.student_id,
                tc.class_name,
                tl.trade_code,
                tl.level_number,
                tl.level_suffix,
                sps.average_grade,
                sps.attendance_percentage,
                sps.conduct_score,
                sps.rank_in_class,
                sps.total_conduct_points
            FROM student_performance_summary sps
            JOIN users u ON sps.student_id = u.id
            JOIN trade_classes tc ON sps.trade_class_id = tc.id
            JOIN trade_levels tl ON tc.trade_level_id = tl.id
            WHERE u.is_active = true
            ${yearId ? 'AND sps.academic_year_id = ?' : ''}
            ORDER BY sps.average_grade DESC, sps.attendance_percentage DESC
            LIMIT 10
        `, yearId ? [yearId] : []);
        
        // Students needing attention
        const [attentionStudents] = await pool.execute(`
            SELECT 
                u.id,
                CONCAT(u.first_name, ' ', u.last_name) as student_name,
                u.student_id,
                tc.class_name,
                tl.trade_code,
                tl.level_number,
                tl.level_suffix,
                sps.average_grade,
                sps.attendance_percentage,
                sps.conduct_score,
                sps.negative_conducts
            FROM student_performance_summary sps
            JOIN users u ON sps.student_id = u.id
            JOIN trade_classes tc ON sps.trade_class_id = tc.id
            JOIN trade_levels tl ON tc.trade_level_id = tl.id
            WHERE u.is_active = true
            AND (
                sps.average_grade < 60 
                OR sps.attendance_percentage < 80 
                OR sps.conduct_score < 70
                OR sps.negative_conducts > 3
            )
            ${yearId ? 'AND sps.academic_year_id = ?' : ''}
            ORDER BY sps.average_grade ASC, sps.attendance_percentage ASC
            LIMIT 15
        `, yearId ? [yearId] : []);
        
        // Class performance summary
        const [classStats] = await pool.execute(`
            SELECT 
                tc.id,
                tc.class_name,
                tl.trade_code,
                tl.level_number,
                tl.level_suffix,
                tl.full_name as trade_level_name,
                cpa.total_students,
                cpa.average_grade,
                cpa.average_attendance,
                cpa.average_conduct_score,
                cpa.excellent_students,
                cpa.improvement_needed,
                CONCAT(mt.first_name, ' ', mt.last_name) as main_teacher,
                CONCAT(at.first_name, ' ', at.last_name) as assistant_teacher
            FROM trade_classes tc
            JOIN trade_levels tl ON tc.trade_level_id = tl.id
            LEFT JOIN class_performance_analytics cpa ON tc.id = cpa.trade_class_id
            LEFT JOIN users mt ON tc.main_teacher_id = mt.id
            LEFT JOIN users at ON tc.assistant_teacher_id = at.id
            WHERE tc.is_active = true
            ${yearId ? 'AND (cpa.academic_year_id = ? OR cpa.academic_year_id IS NULL)' : ''}
            ORDER BY tl.trade_code, tl.level_number, tc.class_name
        `, yearId ? [yearId] : []);
        
        res.json({
            success: true,
            data: {
                overall_statistics: overallStats[0],
                trade_performance: tradeStats,
                conduct_trends: conductStats,
                top_performers: topStudents,
                attention_needed: attentionStudents,
                class_performance: classStats
            }
        });
        
    } catch (error) {
        console.error('Error fetching analytics overview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics overview',
            error: error.message
        });
    }
});

// Get detailed class analytics
router.get('/analytics/class/:id', async (req, res) => {
    try {
        const classId = req.params.id;
        const { academic_year_id } = req.query;
        
        // Get current academic year if not specified
        let yearId = academic_year_id;
        if (!yearId) {
            const [academicYear] = await pool.execute(
                'SELECT id FROM academic_years WHERE is_active = true LIMIT 1'
            );
            if (academicYear.length > 0) {
                yearId = academicYear[0].id;
            }
        }
        
        // Class basic info
        const [classInfo] = await pool.execute(`
            SELECT 
                tc.*,
                tl.trade_code,
                tl.trade_name,
                tl.level_number,
                tl.level_suffix,
                tl.full_name as trade_level_name,
                CONCAT(mt.first_name, ' ', mt.last_name) as main_teacher,
                CONCAT(at.first_name, ' ', at.last_name) as assistant_teacher
            FROM trade_classes tc
            JOIN trade_levels tl ON tc.trade_level_id = tl.id
            LEFT JOIN users mt ON tc.main_teacher_id = mt.id
            LEFT JOIN users at ON tc.assistant_teacher_id = at.id
            WHERE tc.id = ?
        `, [classId]);
        
        if (classInfo.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }
        
        // Students in class with performance
        const [students] = await pool.execute(`
            SELECT 
                u.id,
                CONCAT(u.first_name, ' ', u.last_name) as student_name,
                u.student_id,
                u.email,
                sps.average_grade,
                sps.attendance_percentage,
                sps.conduct_score,
                sps.rank_in_class,
                sps.total_conduct_points,
                sps.positive_conducts,
                sps.negative_conducts
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            LEFT JOIN student_performance_summary sps ON u.id = sps.student_id AND e.class_id = sps.trade_class_id
            WHERE e.class_id = ? AND e.status = 'active' AND u.is_active = true
            ${yearId ? 'AND e.academic_year_id = ?' : ''}
            ORDER BY sps.rank_in_class ASC, u.last_name, u.first_name
        `, yearId ? [classId, yearId] : [classId]);
        
        // Subject performance breakdown
        const [subjectStats] = await pool.execute(`
            SELECT 
                s.name as subject_name,
                s.code as subject_code,
                COUNT(g.id) as total_assessments,
                AVG(g.obtained_marks / g.max_marks * 100) as average_percentage,
                MIN(g.obtained_marks / g.max_marks * 100) as min_percentage,
                MAX(g.obtained_marks / g.max_marks * 100) as max_percentage,
                CONCAT(t.first_name, ' ', t.last_name) as teacher_name
            FROM subjects s
            LEFT JOIN grades g ON s.id = g.subject_id AND g.class_id = ?
            LEFT JOIN teacher_class_assignments tca ON s.id = tca.subject_id AND tca.trade_class_id = ?
            LEFT JOIN users t ON tca.teacher_id = t.id
            WHERE s.course_id = (
                SELECT course_id FROM classes 
                WHERE id = ?
            )
            GROUP BY s.id, s.name, s.code, t.first_name, t.last_name
            ORDER BY s.name
        `, [classId, classId, classId]);
        
        // Monthly attendance trends
        const [attendanceTrends] = await pool.execute(`
            SELECT 
                YEAR(attendance_date) as year,
                MONTH(attendance_date) as month,
                COUNT(*) as total_records,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
                ROUND(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as attendance_percentage
            FROM attendance a
            JOIN enrollments e ON a.student_id = e.student_id
            WHERE e.class_id = ? AND a.attendance_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY YEAR(attendance_date), MONTH(attendance_date)
            ORDER BY year DESC, month DESC
        `, [classId]);
        
        // Recent conduct incidents
        const [recentConducts] = await pool.execute(`
            SELECT 
                cr.*,
                CONCAT(s.first_name, ' ', s.last_name) as student_name,
                s.student_id,
                CONCAT(r.first_name, ' ', r.last_name) as reported_by_name
            FROM conduct_records cr
            JOIN users s ON cr.student_id = s.id
            JOIN users r ON cr.reported_by = r.id
            WHERE cr.trade_class_id = ?
            ORDER BY cr.incident_date DESC
            LIMIT 20
        `, [classId]);
        
        res.json({
            success: true,
            data: {
                class_info: classInfo[0],
                students: students,
                subject_performance: subjectStats,
                attendance_trends: attendanceTrends,
                recent_conducts: recentConducts
            }
        });
        
    } catch (error) {
        console.error('Error fetching class analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch class analytics',
            error: error.message
        });
    }
});

// ===============================
// TRADE AND CLASS MANAGEMENT
// ===============================

// Get all trades and levels
router.get('/trades', async (req, res) => {
    try {
        const [trades] = await pool.execute(`
            SELECT 
                tl.*,
                COUNT(tc.id) as class_count,
                SUM(tc.current_enrollment) as total_students
            FROM trade_levels tl
            LEFT JOIN trade_classes tc ON tl.id = tc.trade_level_id AND tc.is_active = true
            WHERE tl.is_active = true
            GROUP BY tl.id
            ORDER BY tl.trade_code, tl.level_number, tl.level_suffix
        `);
        
        res.json({
            success: true,
            data: trades
        });
        
    } catch (error) {
        console.error('Error fetching trades:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trades',
            error: error.message
        });
    }
});

// Get classes for a specific trade level
router.get('/trades/:trade_level_id/classes', async (req, res) => {
    try {
        const tradeLevelId = req.params.trade_level_id;
        const { academic_year_id } = req.query;
        
        let whereConditions = ['tc.trade_level_id = ?', 'tc.is_active = true'];
        let queryParams = [tradeLevelId];
        
        if (academic_year_id) {
            whereConditions.push('tc.academic_year_id = ?');
            queryParams.push(academic_year_id);
        } else {
            whereConditions.push('ay.is_active = true');
        }
        
        const [classes] = await pool.execute(`
            SELECT 
                tc.*,
                tl.trade_code,
                tl.trade_name,
                tl.level_number,
                tl.level_suffix,
                tl.full_name as trade_level_name,
                ay.name as academic_year,
                CONCAT(mt.first_name, ' ', mt.last_name) as main_teacher,
                CONCAT(at.first_name, ' ', at.last_name) as assistant_teacher,
                cpa.average_grade,
                cpa.average_attendance,
                cpa.average_conduct_score
            FROM trade_classes tc
            JOIN trade_levels tl ON tc.trade_level_id = tl.id
            JOIN academic_years ay ON tc.academic_year_id = ay.id
            LEFT JOIN users mt ON tc.main_teacher_id = mt.id
            LEFT JOIN users at ON tc.assistant_teacher_id = at.id
            LEFT JOIN class_performance_analytics cpa ON tc.id = cpa.trade_class_id
            WHERE ${whereConditions.join(' AND ')}
            ORDER BY tc.class_name
        `, queryParams);
        
        res.json({
            success: true,
            data: classes
        });
        
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch classes',
            error: error.message
        });
    }
});

module.exports = router;