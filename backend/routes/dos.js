const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and role check to all DOS routes
router.use(authenticateToken);
router.use(requireRole('director_of_study', 'admin', 'super_admin'));

// ===============================
// DASHBOARD ANALYTICS
// ===============================

// Get analytics overview
router.get('/analytics/overview', async (req, res) => {
    try {
        // Get total students
        const [totalStudents] = await pool.execute(
            'SELECT COUNT(*) as count FROM students WHERE status = "active"'
        );

        // Get students by trade level
        const [studentsByLevel] = await pool.execute(`
            SELECT 
                trade_level, 
                COUNT(*) as count 
            FROM students 
            WHERE status = "active" 
            GROUP BY trade_level
        `);

        // Get students by trade program
        const [studentsByProgram] = await pool.execute(`
            SELECT 
                trade_program, 
                COUNT(*) as count 
            FROM students 
            WHERE status = "active" 
            GROUP BY trade_program
        `);

        // Get recent conduct records
        const [recentConduct] = await pool.execute(`
            SELECT COUNT(*) as count 
            FROM conduct_records 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);

        // Get average attendance
        const [avgAttendance] = await pool.execute(`
            SELECT 
                AVG(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100 as percentage
            FROM attendance_records 
            WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `);

        // Get recent academic performance
        const [avgGrades] = await pool.execute(`
            SELECT AVG(percentage) as average
            FROM academic_records 
            WHERE assessment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `);

        res.json({
            success: true,
            data: {
                overview: {
                    total_students: totalStudents[0].count,
                    avg_attendance_rate: Math.round(avgAttendance[0].percentage || 0),
                    avg_academic_performance: Math.round(avgGrades[0].average || 0),
                    conduct_records_this_month: recentConduct[0].count
                },
                students_by_level: studentsByLevel,
                students_by_program: studentsByProgram
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
    }
});

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
            ORDER BY s.${sort_by} ${sort_order}
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

// Get single student details
router.get('/students/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        
        const [students] = await pool.execute(`
            SELECT 
                s.*,
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
            WHERE s.id = ?
            GROUP BY s.id
        `, [studentId]);
        
        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        res.json({
            success: true,
            data: students[0]
        });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch student', error: error.message });
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
        
        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: {
                id: result.insertId,
                student_id: student_id
            }
        });
        
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create student', 
            error: error.message 
        });
    }
});

// Update student
router.put('/students/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        const updates = req.body;
        
        const allowedFields = [
            'first_name', 'last_name', 'email', 'phone', 'date_of_birth', 
            'gender', 'address', 'guardian_name', 'guardian_phone', 'guardian_email',
            'trade_level', 'trade_program', 'status', 'academic_year', 'notes'
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
        
        const query = `UPDATE students SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        
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

// ===============================
// CONDUCT RECORDS MANAGEMENT
// ===============================

// Get conduct records
router.get('/conduct-records', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            student_id, 
            incident_type, 
            severity,
            status,
            search
        } = req.query;
        
        const offset = (page - 1) * limit;
        
        let whereConditions = [];
        let queryParams = [];
        
        if (student_id) {
            whereConditions.push('cr.student_id = ?');
            queryParams.push(student_id);
        }
        
        if (incident_type) {
            whereConditions.push('cr.incident_type = ?');
            queryParams.push(incident_type);
        }
        
        if (severity) {
            whereConditions.push('cr.severity = ?');
            queryParams.push(severity);
        }
        
        if (status) {
            whereConditions.push('cr.status = ?');
            queryParams.push(status);
        }
        
        if (search) {
            whereConditions.push('(cr.title LIKE ? OR cr.description LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ?)');
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        const query = `
            SELECT 
                cr.*,
                s.student_id,
                s.first_name,
                s.last_name,
                s.trade_program,
                s.trade_level
            FROM conduct_records cr
            JOIN students s ON cr.student_id = s.id
            ${whereClause}
            ORDER BY cr.incident_date DESC, cr.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        queryParams.push(parseInt(limit), parseInt(offset));
        
        const [records] = await pool.execute(query, queryParams);
        
        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM conduct_records cr
            JOIN students s ON cr.student_id = s.id
            ${whereClause}
        `;
        
        const [countResult] = await pool.execute(countQuery, queryParams.slice(0, -2));
        const total = countResult[0].total;
        
        res.json({
            success: true,
            data: {
                records,
                pagination: {
                    current_page: parseInt(page),
                    per_page: parseInt(limit),
                    total: total,
                    total_pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching conduct records:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch conduct records', error: error.message });
    }
});

// Create conduct record
router.post('/conduct-records', async (req, res) => {
    try {
        const {
            student_id,
            incident_type,
            severity = 'medium',
            title,
            description,
            action_taken,
            reported_by,
            incident_date,
            follow_up_required = false,
            follow_up_date,
            points_awarded = 0,
            points_deducted = 0
        } = req.body;
        
        // Validate required fields
        if (!student_id || !incident_type || !title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Required fields: student_id, incident_type, title, description'
            });
        }
        
        const [result] = await pool.execute(`
            INSERT INTO conduct_records (
                student_id, incident_type, severity, title, description, action_taken,
                reported_by, incident_date, follow_up_required, follow_up_date,
                points_awarded, points_deducted, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
        `, [
            student_id, incident_type, severity, title, description, action_taken,
            reported_by, incident_date || new Date().toISOString().split('T')[0], 
            follow_up_required, follow_up_date, points_awarded, points_deducted
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Conduct record created successfully',
            data: { id: result.insertId }
        });
        
    } catch (error) {
        console.error('Error creating conduct record:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create conduct record', 
            error: error.message 
        });
    }
});

// Update conduct record
router.put('/conduct-records/:id', async (req, res) => {
    try {
        const recordId = req.params.id;
        const updates = req.body;
        
        const allowedFields = [
            'incident_type', 'severity', 'title', 'description', 'action_taken',
            'reported_by', 'incident_date', 'follow_up_required', 'follow_up_date',
            'status', 'points_awarded', 'points_deducted'
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
        
        values.push(recordId);
        
        const query = `UPDATE conduct_records SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        
        const [result] = await pool.execute(query, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Conduct record not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Conduct record updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating conduct record:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update conduct record', 
            error: error.message 
        });
    }
});

// ===============================
// ATTENDANCE MANAGEMENT
// ===============================

// Get attendance records
router.get('/attendance', async (req, res) => {
    try {
        const { 
            date,
            student_id,
            subject,
            status,
            page = 1,
            limit = 50
        } = req.query;
        
        const offset = (page - 1) * limit;
        
        let whereConditions = [];
        let queryParams = [];
        
        if (date) {
            whereConditions.push('ar.attendance_date = ?');
            queryParams.push(date);
        } else {
            // Default to today if no date specified
            whereConditions.push('ar.attendance_date = CURDATE()');
        }
        
        if (student_id) {
            whereConditions.push('ar.student_id = ?');
            queryParams.push(student_id);
        }
        
        if (subject) {
            whereConditions.push('ar.subject = ?');
            queryParams.push(subject);
        }
        
        if (status) {
            whereConditions.push('ar.status = ?');
            queryParams.push(status);
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        const query = `
            SELECT 
                ar.*,
                s.student_id,
                s.first_name,
                s.last_name,
                s.trade_program,
                s.trade_level
            FROM attendance_records ar
            JOIN students s ON ar.student_id = s.id
            ${whereClause}
            ORDER BY ar.attendance_date DESC, s.last_name ASC
            LIMIT ? OFFSET ?
        `;
        
        queryParams.push(parseInt(limit), parseInt(offset));
        
        const [records] = await pool.execute(query, queryParams);
        
        res.json({
            success: true,
            data: {
                records,
                date: date || new Date().toISOString().split('T')[0]
            }
        });
        
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch attendance', error: error.message });
    }
});

// Mark attendance
router.post('/attendance', async (req, res) => {
    try {
        const {
            student_id,
            attendance_date,
            status,
            subject = 'General',
            period = 'Morning',
            notes,
            marked_by
        } = req.body;
        
        // Validate required fields
        if (!student_id || !attendance_date || !status) {
            return res.status(400).json({
                success: false,
                message: 'Required fields: student_id, attendance_date, status'
            });
        }
        
        // Check if attendance already exists for this student, date, subject, and period
        const [existing] = await pool.execute(`
            SELECT id FROM attendance_records 
            WHERE student_id = ? AND attendance_date = ? AND subject = ? AND period = ?
        `, [student_id, attendance_date, subject, period]);
        
        if (existing.length > 0) {
            // Update existing record
            await pool.execute(`
                UPDATE attendance_records 
                SET status = ?, notes = ?, marked_by = ?
                WHERE id = ?
            `, [status, notes, marked_by, existing[0].id]);
            
            res.json({
                success: true,
                message: 'Attendance updated successfully',
                data: { id: existing[0].id }
            });
        } else {
            // Create new record
            const [result] = await pool.execute(`
                INSERT INTO attendance_records (
                    student_id, attendance_date, status, subject, period, notes, marked_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [student_id, attendance_date, status, subject, period, notes, marked_by]);
            
            res.status(201).json({
                success: true,
                message: 'Attendance recorded successfully',
                data: { id: result.insertId }
            });
        }
        
    } catch (error) {
        console.error('Error recording attendance:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to record attendance', 
            error: error.message 
        });
    }
});

// Get trade levels (dropdown data)
router.get('/trade-levels', async (req, res) => {
    try {
        const tradeLevels = [
            { value: 'Level1', label: 'Level 1' },
            { value: 'Level2', label: 'Level 2' },
            { value: 'Level3', label: 'Level 3' }
        ];
        
        const tradePrograms = [
            { value: 'Software Development', label: 'Software Development' },
            { value: 'Building Construction', label: 'Building Construction' },
            { value: 'Automobile Technology', label: 'Automobile Technology' }
        ];
        
        res.json({
            success: true,
            data: {
                trade_levels: tradeLevels,
                trade_programs: tradePrograms
            }
        });
    } catch (error) {
        console.error('Error fetching trade levels:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch trade levels', error: error.message });
    }
});

module.exports = router;