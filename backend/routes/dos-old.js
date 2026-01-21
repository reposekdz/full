const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and role check to all DOS routes
router.use(authenticateToken);
router.use(requireRole('director_of_study', 'admin', 'super_admin'));

// ===============================
// STUDENT MANAGEMENT
// ===============================

// Get all students with filtering and pagination
router.get('/students', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            trade_program, 
            trade_level, 
            status, 
            search,
            sort_by = 'last_name',
            sort_order = 'ASC'
        } = req.query;
        
        const offset = (page - 1) * limit;
        
        let whereConditions = [];
        let queryParams = [];
        
        if (trade_program) {
            whereConditions.push('s.trade_program = ?');
            queryParams.push(trade_program);
        }
        
        if (trade_level) {
            whereConditions.push('s.trade_level = ?');
            queryParams.push(trade_level);
        }
        
        if (status) {
            whereConditions.push('s.status = ?');
            queryParams.push(status);
        }
        
        if (search) {
            whereConditions.push('(s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_id LIKE ? OR s.email LIKE ?)');
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        const query = `
            SELECT 
                s.id,
                s.student_id,
                s.first_name,
                s.last_name,
                s.email,
                s.phone,
                s.date_of_birth,
                s.gender,
                s.address,
                s.guardian_name,
                s.guardian_phone,
                s.admission_date,
                s.trade_level,
                s.trade_program,
                s.status,
                s.academic_year,
                s.profile_picture,
                s.created_at,
                COALESCE(AVG(ar.percentage), 0) as average_grade,
                COALESCE(
                    (SELECT COUNT(*) FROM attendance_records att WHERE att.student_id = s.id AND att.status = 'present') * 100.0 / 
                    NULLIF((SELECT COUNT(*) FROM attendance_records att WHERE att.student_id = s.id), 0), 
                    100
                ) as attendance_percentage,
                COALESCE(SUM(cr.points_awarded - cr.points_deducted), 0) as conduct_score
            FROM students s
            LEFT JOIN academic_records ar ON s.id = ar.student_id
            LEFT JOIN conduct_records cr ON s.id = cr.student_id
            ${whereClause}
            GROUP BY s.id
            ORDER BY ${sort_by} ${sort_order}
            LIMIT ? OFFSET ?
        `;
        
        queryParams.push(parseInt(limit), parseInt(offset));
        
        const [students] = await pool.execute(query, queryParams);
        
        // Get total count
        const countQuery = `
            SELECT COUNT(DISTINCT s.id) as total
            FROM students s
            ${whereClause}
        `;
        
        const [countResult] = await pool.execute(countQuery, queryParams.slice(0, -2));
        const total = countResult[0].total;
        
        res.json({
            success: true,
            data: {
                students,
                pagination: {
                    current_page: parseInt(page),
                    per_page: parseInt(limit),
                    total: total,
                    total_pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch students', error: error.message });
    }
});

// Create new student
router.post('/students', async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            gender,
            trade_level,
            trade_program,
            address,
            guardian_name,
            guardian_phone,
            guardian_email,
            academic_year
        } = req.body;
        
        // Validate required fields
        if (!first_name || !last_name || !trade_level || !trade_program) {
            return res.status(400).json({ 
                success: false, 
                message: 'Required fields: first_name, last_name, trade_level, trade_program' 
            });
        }
        
        // Generate student ID
        const year = new Date().getFullYear();
        const tradeCode = trade_program.replace(/\s+/g, '').substring(0, 3).toUpperCase();
        const levelCode = trade_level.replace('Level', 'L');
        
        const [lastStudent] = await pool.execute(
            'SELECT student_id FROM students WHERE student_id LIKE ? ORDER BY student_id DESC LIMIT 1',
            [`${year}${tradeCode}${levelCode}%`]
        );
        
        let studentNumber = 1;
        if (lastStudent.length > 0) {
            const lastNumber = parseInt(lastStudent[0].student_id.slice(-3));
            studentNumber = lastNumber + 1;
        }
        
        const student_id = `${year}${tradeCode}${levelCode}${studentNumber.toString().padStart(3, '0')}`;
        
        // Create student
        const [result] = await pool.execute(`
            INSERT INTO students (
                student_id, first_name, last_name, email, phone, date_of_birth, gender,
                address, guardian_name, guardian_phone, guardian_email, admission_date,
                trade_level, trade_program, status, academic_year
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, 'active', ?)
        `, [
            student_id,
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            gender,
            address,
            guardian_name,
            guardian_phone,
            guardian_email,
            trade_level,
            trade_program,
            academic_year || '2025-2026'
        ]);
        
        const new_student_id = studentResult.insertId;
        
        // Get trade level and assign to appropriate class
        const [tradeLevelResult] = await connection.execute(`
            SELECT id FROM trade_levels 
            WHERE trade_code = ? AND level_number = ? 
            AND (level_suffix = ? OR (level_suffix IS NULL AND ? IS NULL))
        `, [trade_code, level_number, level_suffix, level_suffix]);
        
        if (tradeLevelResult.length > 0) {
            // Get current academic year
            const [academicYearResult] = await connection.execute(
                'SELECT id FROM academic_years WHERE is_active = true LIMIT 1'
            );
            
            if (academicYearResult.length > 0) {
                // Find available class or create new one
                const [classResult] = await connection.execute(`
                    SELECT id, current_enrollment, capacity 
                    FROM trade_classes 
                    WHERE trade_level_id = ? AND academic_year_id = ? AND is_active = true
                    AND current_enrollment < capacity
                    ORDER BY current_enrollment ASC
                    LIMIT 1
                `, [tradeLevelResult[0].id, academicYearResult[0].id]);
                
                let class_id;
                if (classResult.length > 0) {
                    class_id = classResult[0].id;
                    
                    // Update enrollment count
                    await connection.execute(`
                        UPDATE trade_classes 
                        SET current_enrollment = current_enrollment + 1
                        WHERE id = ?
                    `, [class_id]);
                } else {
                    // Create new class
                    const [classCount] = await connection.execute(`
                        SELECT COUNT(*) as count FROM trade_classes 
                        WHERE trade_level_id = ? AND academic_year_id = ?
                    `, [tradeLevelResult[0].id, academicYearResult[0].id]);
                    
                    const classNumber = classCount[0].count + 1;
                    const className = `Class ${classNumber}`;
                    
                    const [newClassResult] = await connection.execute(`
                        INSERT INTO trade_classes (
                            trade_level_id, academic_year_id, class_name, current_enrollment
                        ) VALUES (?, ?, ?, 1)
                    `, [tradeLevelResult[0].id, academicYearResult[0].id, className]);
                    
                    class_id = newClassResult.insertId;
                }
                
                // Enroll student in class
                await connection.execute(`
                    INSERT INTO enrollments (
                        student_id, class_id, academic_year_id, enrollment_date, status
                    ) VALUES (?, ?, ?, CURDATE(), 'active')
                `, [new_student_id, class_id, academicYearResult[0].id]);
            }
        }
        
        await connection.commit();
        
        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: {
                student_id: new_student_id,
                student_code: student_id
            }
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Error creating student:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create student', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
});

// Update student
router.put('/students/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        const updates = req.body;
        
        const allowedFields = [
            'first_name', 'last_name', 'email', 'phone', 'date_of_birth', 
            'gender', 'address', 'is_active'
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
        
        values.push(studentId);
        
        const query = `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        
        const [result] = await pool.execute(query, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Student updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update student', 
            error: error.message 
        });
    }
});

// Delete student (soft delete)
router.delete('/students/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const studentId = req.params.id;
        
        // Soft delete student
        const [result] = await connection.execute(
            'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [studentId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        // Update class enrollment count
        await connection.execute(`
            UPDATE trade_classes tc
            JOIN enrollments e ON tc.id = e.class_id
            SET tc.current_enrollment = tc.current_enrollment - 1
            WHERE e.student_id = ? AND e.status = 'active'
        `, [studentId]);
        
        // Update enrollment status
        await connection.execute(
            'UPDATE enrollments SET status = "dropped", updated_at = CURRENT_TIMESTAMP WHERE student_id = ?',
            [studentId]
        );
        
        await connection.commit();
        
        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting student:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete student', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
});

// Get student details
router.get('/students/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        
        const [students] = await pool.execute(`
            SELECT 
                u.*,
                tl.trade_code,
                tl.trade_name,
                tl.level_number,
                tl.level_suffix,
                tl.full_name as trade_level_name,
                tc.class_name,
                tc.id as class_id,
                parent.first_name as parent_first_name,
                parent.last_name as parent_last_name,
                parent.phone as parent_phone,
                parent.email as parent_email
            FROM users u
            LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
            LEFT JOIN trade_classes tc ON e.class_id = tc.id
            LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
            LEFT JOIN users parent ON u.parent_id = parent.id
            WHERE u.id = ?
        `, [studentId]);
        
        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        // Get recent conduct records
        const [conducts] = await pool.execute(`
            SELECT cr.*, u.first_name as reported_by_name, u.last_name as reported_by_lastname
            FROM conduct_records cr
            JOIN users u ON cr.reported_by = u.id
            WHERE cr.student_id = ?
            ORDER BY cr.incident_date DESC
            LIMIT 10
        `, [studentId]);
        
        // Get recent grades
        const [grades] = await pool.execute(`
            SELECT g.*, s.name as subject_name, t.first_name as teacher_name, t.last_name as teacher_lastname
            FROM grades g
            JOIN subjects s ON g.subject_id = s.id
            JOIN users t ON g.teacher_id = t.id
            WHERE g.student_id = ?
            ORDER BY g.assessment_date DESC
            LIMIT 10
        `, [studentId]);
        
        // Get attendance summary
        const [attendance] = await pool.execute(`
            SELECT 
                COUNT(*) as total_days,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
                SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
                SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused_days
            FROM attendance
            WHERE student_id = ? AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `, [studentId]);
        
        const student = {
            ...students[0],
            recent_conducts: conducts,
            recent_grades: grades,
            attendance_summary: attendance[0]
        };
        
        res.json({
            success: true,
            data: student
        });
        
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch student details', 
            error: error.message 
        });
    }
});

// ===============================
// ANALYTICS
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
                COALESCE(AVG(g.obtained_marks / g.max_marks * 100), 0) as overall_average_grade,
                COALESCE(
                    (SELECT COUNT(*) FROM attendance a WHERE a.status = 'present') * 100.0 / 
                    NULLIF((SELECT COUNT(*) FROM attendance a), 0), 
                    0
                ) as overall_attendance,
                COALESCE(AVG(cr.points_awarded - cr.points_deducted), 0) as overall_conduct_score
            FROM users u
            JOIN roles r ON u.role_id = r.id AND r.name = 'student'
            LEFT JOIN enrollments e ON u.id = e.student_id
            LEFT JOIN trade_classes tc ON e.class_id = tc.id
            LEFT JOIN grades g ON u.id = g.student_id
            LEFT JOIN conduct_records cr ON u.id = cr.student_id
            LEFT JOIN teacher_class_assignments tca ON tc.id = tca.trade_class_id
            LEFT JOIN users t ON tca.teacher_id = t.id
            LEFT JOIN roles tr ON t.role_id = tr.id AND tr.name = 'teacher'
            ${yearId ? 'WHERE e.academic_year_id = ?' : ''}
        `, yearId ? [yearId] : []);
        
        // Performance by trade
        const [tradeStats] = await pool.execute(`
            SELECT 
                tl.trade_code,
                tl.trade_name,
                COUNT(DISTINCT u.id) as student_count,
                COALESCE(AVG(g.obtained_marks / g.max_marks * 100), 0) as avg_grade,
                COALESCE(
                    (SELECT COUNT(*) FROM attendance a 
                     JOIN enrollments e2 ON a.student_id = e2.student_id 
                     JOIN trade_classes tc2 ON e2.class_id = tc2.id 
                     WHERE tc2.trade_level_id = tl.id AND a.status = 'present') * 100.0 / 
                    NULLIF((SELECT COUNT(*) FROM attendance a 
                            JOIN enrollments e2 ON a.student_id = e2.student_id 
                            JOIN trade_classes tc2 ON e2.class_id = tc2.id 
                            WHERE tc2.trade_level_id = tl.id), 0), 
                    0
                ) as avg_attendance,
                COALESCE(AVG(cr.points_awarded - cr.points_deducted), 0) as avg_conduct_score,
                COUNT(DISTINCT tc.id) as class_count
            FROM trade_levels tl
            LEFT JOIN trade_classes tc ON tl.id = tc.trade_level_id
            LEFT JOIN enrollments e ON tc.id = e.class_id
            LEFT JOIN users u ON e.student_id = u.id
            LEFT JOIN grades g ON u.id = g.student_id
            LEFT JOIN conduct_records cr ON u.id = cr.student_id
            WHERE tl.is_active = true
            ${yearId ? 'AND (e.academic_year_id = ? OR e.academic_year_id IS NULL)' : ''}
            GROUP BY tl.id, tl.trade_code, tl.trade_name
            ORDER BY tl.trade_code, tl.level_number
        `, yearId ? [yearId] : []);
        
        res.json({
            success: true,
            data: {
                overall_statistics: overallStats[0],
                trade_performance: tradeStats
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
                COALESCE(AVG(g.obtained_marks / g.max_marks * 100), 0) as average_grade,
                COALESCE(
                    (SELECT COUNT(*) FROM attendance a 
                     JOIN enrollments e2 ON a.student_id = e2.student_id 
                     WHERE e2.class_id = tc.id AND a.status = 'present') * 100.0 / 
                    NULLIF((SELECT COUNT(*) FROM attendance a 
                            JOIN enrollments e2 ON a.student_id = e2.student_id 
                            WHERE e2.class_id = tc.id), 0), 
                    0
                ) as average_attendance,
                COALESCE(AVG(cr.points_awarded - cr.points_deducted), 0) as average_conduct_score
            FROM trade_classes tc
            JOIN trade_levels tl ON tc.trade_level_id = tl.id
            JOIN academic_years ay ON tc.academic_year_id = ay.id
            LEFT JOIN users mt ON tc.main_teacher_id = mt.id
            LEFT JOIN users at ON tc.assistant_teacher_id = at.id
            LEFT JOIN enrollments e ON tc.id = e.class_id
            LEFT JOIN grades g ON e.student_id = g.student_id
            LEFT JOIN conduct_records cr ON e.student_id = cr.student_id
            WHERE ${whereConditions.join(' AND ')}
            GROUP BY tc.id
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