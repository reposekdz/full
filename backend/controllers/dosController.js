const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// ===============================
// STUDENT MANAGEMENT
// ===============================

// Get all students with filtering and pagination
router.get('/students', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            trade, 
            level, 
            class_id, 
            status, 
            search,
            sort_by = 'last_name',
            sort_order = 'ASC'
        } = req.query;
        
        const offset = (page - 1) * limit;
        
        let whereConditions = ['u.role_id = (SELECT id FROM roles WHERE name = "student")'];
        let queryParams = [];
        
        if (trade) {
            whereConditions.push('tl.trade_code = ?');
            queryParams.push(trade);
        }
        
        if (level) {
            whereConditions.push('tl.level_number = ?');
            queryParams.push(level);
        }
        
        if (class_id) {
            whereConditions.push('tc.id = ?');
            queryParams.push(class_id);
        }
        
        if (status) {
            whereConditions.push('u.is_active = ?');
            queryParams.push(status === 'active' ? 1 : 0);
        }
        
        if (search) {
            whereConditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR u.student_id LIKE ? OR u.email LIKE ?)');
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        const query = `
            SELECT 
                u.id,
                u.student_id,
                u.first_name,
                u.last_name,
                u.email,
                u.phone,
                u.date_of_birth,
                u.gender,
                u.profile_picture,
                u.is_active,
                u.last_login,
                u.created_at,
                tl.trade_code,
                tl.trade_name,
                tl.level_number,
                tl.level_suffix,
                tl.full_name as trade_level_name,
                tc.class_name,
                tc.id as class_id,
                sps.average_grade,
                sps.attendance_percentage,
                sps.conduct_score,
                sps.rank_in_class,
                sps.total_conduct_points,
                parent.first_name as parent_first_name,
                parent.last_name as parent_last_name,
                parent.phone as parent_phone,
                parent.email as parent_email
            FROM users u
            LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
            LEFT JOIN trade_classes tc ON e.class_id = tc.id
            LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
            LEFT JOIN student_performance_summary sps ON u.id = sps.student_id AND tc.id = sps.trade_class_id
            LEFT JOIN users parent ON u.parent_id = parent.id
            ${whereClause}
            ORDER BY ${sort_by} ${sort_order}
            LIMIT ? OFFSET ?
        `;
        
        queryParams.push(parseInt(limit), parseInt(offset));
        
        const [students] = await pool.execute(query, queryParams);
        
        // Get total count
        const countQuery = `
            SELECT COUNT(DISTINCT u.id) as total
            FROM users u
            LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
            LEFT JOIN trade_classes tc ON e.class_id = tc.id
            LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
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
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const {
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            gender,
            trade_code,
            level_number,
            level_suffix,
            address,
            emergency_contact,
            medical_info,
            parent_info
        } = req.body;
        
        // Validate required fields
        if (!first_name || !last_name || !email || !trade_code || !level_number) {
            return res.status(400).json({ 
                success: false, 
                message: 'Required fields: first_name, last_name, email, trade_code, level_number' 
            });
        }
        
        // Generate student ID
        const year = new Date().getFullYear();
        const tradePrefix = trade_code.toUpperCase();
        const levelSuffix = level_suffix ? `${level_number}${level_suffix}` : level_number;
        
        const [lastStudent] = await connection.execute(
            'SELECT student_id FROM users WHERE student_id LIKE ? ORDER BY student_id DESC LIMIT 1',
            [`${year}${tradePrefix}${levelSuffix}%`]
        );
        
        let studentNumber = 1;
        if (lastStudent.length > 0) {
            const lastNumber = parseInt(lastStudent[0].student_id.slice(-3));
            studentNumber = lastNumber + 1;
        }
        
        const student_id = `${year}${tradePrefix}${levelSuffix}${studentNumber.toString().padStart(3, '0')}`;
        
        // Get student role ID
        const [roleResult] = await connection.execute(
            'SELECT id FROM roles WHERE name = "student"'
        );
        
        if (roleResult.length === 0) {
            throw new Error('Student role not found');
        }
        
        const student_role_id = roleResult[0].id;
        
        // Create parent if provided
        let parent_id = null;
        if (parent_info && parent_info.first_name && parent_info.last_name) {
            const [parentRoleResult] = await connection.execute(
                'SELECT id FROM roles WHERE name = "parent"'
            );
            
            if (parentRoleResult.length > 0) {
                const [parentResult] = await connection.execute(`
                    INSERT INTO users (
                        username, email, password_hash, first_name, last_name, 
                        phone, role_id, is_active
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, true)
                `, [
                    `parent_${Date.now()}`,
                    parent_info.email || `${first_name.toLowerCase()}.parent@school.rw`,
                    '$2a$10$defaulthash', // Default password hash
                    parent_info.first_name,
                    parent_info.last_name,
                    parent_info.phone,
                    parentRoleResult[0].id
                ]);
                
                parent_id = parentResult.insertId;
            }
        }
        
        // Create student
        const [studentResult] = await connection.execute(`
            INSERT INTO users (
                username, email, password_hash, first_name, last_name,
                phone, date_of_birth, gender, role_id, student_id, parent_id,
                address, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
        `, [
            student_id,
            email,
            '$2a$10$defaulthash', // Default password hash
            first_name,
            last_name,
            phone,
            date_of_birth,
            gender,
            student_role_id,
            student_id,
            parent_id,
            address
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
                    const classCount = await connection.execute(`
                        SELECT COUNT(*) as count FROM trade_classes 
                        WHERE trade_level_id = ? AND academic_year_id = ?
                    `, [tradeLevelResult[0].id, academicYearResult[0].id]);
                    
                    const classNumber = classCount[0][0].count + 1;
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
                
                // Initialize performance summary
                await connection.execute(`
                    INSERT INTO student_performance_summary (
                        student_id, trade_class_id, academic_year_id
                    ) VALUES (?, ?, ?)
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
        
        // Build dynamic update query
        const allowedFields = [
            'first_name', 'last_name', 'email', 'phone', 'date_of_birth', 
            'gender', 'address', 'emergency_contact', 'medical_info', 'is_active'
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
                sps.*,
                parent.first_name as parent_first_name,
                parent.last_name as parent_last_name,
                parent.phone as parent_phone,
                parent.email as parent_email
            FROM users u
            LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
            LEFT JOIN trade_classes tc ON e.class_id = tc.id
            LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
            LEFT JOIN student_performance_summary sps ON u.id = sps.student_id AND tc.id = sps.trade_class_id
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
// CONDUCT MANAGEMENT
// ===============================

// Get conduct records with filtering
router.get('/conduct', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            student_id, 
            class_id, 
            type, 
            severity, 
            status,
            date_from,
            date_to,
            sort_by = 'incident_date',
            sort_order = 'DESC'
        } = req.query;
        
        const offset = (page - 1) * limit;
        
        let whereConditions = ['1 = 1'];
        let queryParams = [];
        
        if (student_id) {
            whereConditions.push('cr.student_id = ?');
            queryParams.push(student_id);
        }
        
        if (class_id) {
            whereConditions.push('cr.trade_class_id = ?');
            queryParams.push(class_id);
        }
        
        if (type) {
            whereConditions.push('cr.incident_type = ?');
            queryParams.push(type);
        }
        
        if (severity) {
            whereConditions.push('cr.severity = ?');
            queryParams.push(severity);
        }
        
        if (status) {
            whereConditions.push('cr.status = ?');
            queryParams.push(status);
        }
        
        if (date_from) {
            whereConditions.push('DATE(cr.incident_date) >= ?');
            queryParams.push(date_from);
        }
        
        if (date_to) {
            whereConditions.push('DATE(cr.incident_date) <= ?');
            queryParams.push(date_to);
        }
        
        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
        
        const query = `
            SELECT 
                cr.*,
                CONCAT(s.first_name, ' ', s.last_name) as student_name,
                s.student_id as student_code,
                CONCAT(r.first_name, ' ', r.last_name) as reported_by_name,
                tc.class_name,
                tl.trade_code,
                tl.level_number,
                tl.level_suffix
            FROM conduct_records cr
            JOIN users s ON cr.student_id = s.id
            JOIN users r ON cr.reported_by = r.id
            LEFT JOIN trade_classes tc ON cr.trade_class_id = tc.id
            LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
            ${whereClause}
            ORDER BY ${sort_by} ${sort_order}
            LIMIT ? OFFSET ?
        `;
        
        queryParams.push(parseInt(limit), parseInt(offset));
        
        const [conducts] = await pool.execute(query, queryParams);
        
        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM conduct_records cr
            JOIN users s ON cr.student_id = s.id
            JOIN users r ON cr.reported_by = r.id
            LEFT JOIN trade_classes tc ON cr.trade_class_id = tc.id
            LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
            ${whereClause}
        `;
        
        const [countResult] = await pool.execute(countQuery, queryParams.slice(0, -2));
        const total = countResult[0].total;
        
        res.json({
            success: true,
            data: {
                conducts,
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

// Add conduct record
router.post('/conduct', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const {
            student_id,
            trade_class_id,
            incident_type,
            severity = 'medium',
            title,
            description,
            location,
            incident_date,
            reported_by,
            witness_ids,
            action_taken,
            points_awarded = 0,
            points_deducted = 0,
            parent_notification = true
        } = req.body;
        
        // Validate required fields
        if (!student_id || !title || !description || !incident_date || !reported_by) {
            return res.status(400).json({
                success: false,
                message: 'Required fields: student_id, title, description, incident_date, reported_by'
            });
        }
        
        // Insert conduct record
        const [result] = await connection.execute(`
            INSERT INTO conduct_records (
                student_id, trade_class_id, incident_type, severity, title, description,
                location, incident_date, reported_by, witness_ids, action_taken,
                points_awarded, points_deducted, parent_notified, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `, [
            student_id,
            trade_class_id,
            incident_type,
            severity,
            title,
            description,
            location,
            incident_date,
            reported_by,
            witness_ids ? JSON.stringify(witness_ids) : null,
            action_taken,
            points_awarded,
            points_deducted,
            parent_notification ? 1 : 0
        ]);
        
        const conduct_id = result.insertId;
        
        // Update student performance summary
        if (trade_class_id && (points_awarded > 0 || points_deducted > 0)) {
            await connection.execute(`
                UPDATE student_performance_summary 
                SET 
                    total_conduct_points = total_conduct_points + ? - ?,
                    positive_conducts = positive_conducts + ?,
                    negative_conducts = negative_conducts + ?,
                    last_updated = CURRENT_TIMESTAMP
                WHERE student_id = ? AND trade_class_id = ?
            `, [
                points_awarded,
                points_deducted,
                incident_type === 'positive' ? 1 : 0,
                incident_type === 'negative' ? 1 : 0,
                student_id,
                trade_class_id
            ]);
        }
        
        await connection.commit();
        
        res.status(201).json({
            success: true,
            message: 'Conduct record added successfully',
            data: { conduct_id }
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Error adding conduct record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add conduct record',
            error: error.message
        });
    } finally {
        connection.release();
    }
});

// Update conduct record
router.put('/conduct/:id', async (req, res) => {
    try {
        const conductId = req.params.id;
        const updates = req.body;
        
        const allowedFields = [
            'incident_type', 'severity', 'title', 'description', 'location',
            'action_taken', 'follow_up_required', 'follow_up_date', 'status',
            'points_awarded', 'points_deducted', 'admin_reviewed'
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
        
        values.push(conductId);
        
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

// Delete conduct record
router.delete('/conduct/:id', async (req, res) => {
    try {
        const conductId = req.params.id;
        
        const [result] = await pool.execute(
            'DELETE FROM conduct_records WHERE id = ?',
            [conductId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Conduct record not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Conduct record deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting conduct record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete conduct record',
            error: error.message
        });
    }
});

// ===============================
// TEACHER ASSIGNMENT MANAGEMENT
// ===============================

// Get teacher assignments
router.get('/teacher-assignments', async (req, res) => {
    try {
        const { teacher_id, class_id, subject_id, is_active = true } = req.query;
        
        let whereConditions = ['1 = 1'];
        let queryParams = [];
        
        if (teacher_id) {
            whereConditions.push('tca.teacher_id = ?');
            queryParams.push(teacher_id);
        }
        
        if (class_id) {
            whereConditions.push('tca.trade_class_id = ?');
            queryParams.push(class_id);
        }
        
        if (subject_id) {
            whereConditions.push('tca.subject_id = ?');
            queryParams.push(subject_id);
        }
        
        if (is_active !== undefined) {
            whereConditions.push('tca.is_active = ?');
            queryParams.push(is_active === 'true' ? 1 : 0);
        }
        
        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
        
        const query = `
            SELECT 
                tca.*,
                CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
                t.email as teacher_email,
                tc.class_name,
                tl.trade_code,
                tl.level_number,
                tl.level_suffix,
                tl.full_name as trade_level_name,
                s.name as subject_name,
                s.code as subject_code,
                CONCAT(a.first_name, ' ', a.last_name) as assigned_by_name
            FROM teacher_class_assignments tca
            JOIN users t ON tca.teacher_id = t.id
            JOIN trade_classes tc ON tca.trade_class_id = tc.id
            JOIN trade_levels tl ON tc.trade_level_id = tl.id
            JOIN subjects s ON tca.subject_id = s.id
            JOIN users a ON tca.assigned_by = a.id
            ${whereClause}
            ORDER BY tl.trade_code, tl.level_number, tl.level_suffix, tc.class_name, s.name
        `;
        
        const [assignments] = await pool.execute(query, queryParams);
        
        res.json({
            success: true,
            data: assignments
        });
        
    } catch (error) {
        console.error('Error fetching teacher assignments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch teacher assignments',
            error: error.message
        });
    }
});

// Assign teacher to class/subject
router.post('/teacher-assignments', async (req, res) => {
    try {
        const {
            teacher_id,
            trade_class_id,
            subject_id,
            assignment_type = 'subject_specialist',
            start_date,
            end_date,
            assigned_by,
            notes
        } = req.body;
        
        // Validate required fields
        if (!teacher_id || !trade_class_id || !subject_id || !assigned_by) {
            return res.status(400).json({
                success: false,
                message: 'Required fields: teacher_id, trade_class_id, subject_id, assigned_by'
            });
        }
        
        // Check if assignment already exists
        const [existing] = await pool.execute(`
            SELECT id FROM teacher_class_assignments 
            WHERE teacher_id = ? AND trade_class_id = ? AND subject_id = ? AND is_active = true
        `, [teacher_id, trade_class_id, subject_id]);
        
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Teacher is already assigned to this class/subject combination'
            });
        }
        
        const [result] = await pool.execute(`
            INSERT INTO teacher_class_assignments (
                teacher_id, trade_class_id, subject_id, assignment_type,
                start_date, end_date, assigned_by, notes, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, true)
        `, [
            teacher_id,
            trade_class_id,
            subject_id,
            assignment_type,
            start_date || new Date().toISOString().split('T')[0],
            end_date,
            assigned_by,
            notes
        ]);
        
        // Update class main teacher if assignment type is main
        if (assignment_type === 'main') {
            await pool.execute(`
                UPDATE trade_classes SET main_teacher_id = ? WHERE id = ?
            `, [teacher_id, trade_class_id]);
        } else if (assignment_type === 'assistant') {
            await pool.execute(`
                UPDATE trade_classes SET assistant_teacher_id = ? WHERE id = ?
            `, [teacher_id, trade_class_id]);
        }
        
        res.status(201).json({
            success: true,
            message: 'Teacher assigned successfully',
            data: { assignment_id: result.insertId }
        });
        
    } catch (error) {
        console.error('Error assigning teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign teacher',
            error: error.message
        });
    }
});

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