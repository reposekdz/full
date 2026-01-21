const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

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
        if (trade_class_id && points_awarded > 0 || points_deducted > 0) {
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
        
        // Send parent notification if requested
        if (parent_notification) {
            const [parentResult] = await connection.execute(`
                SELECT p.*, s.first_name as student_first_name, s.last_name as student_last_name
                FROM users s
                LEFT JOIN users p ON s.parent_id = p.id
                WHERE s.id = ?
            `, [student_id]);
            
            if (parentResult.length > 0 && parentResult[0].id) {
                // Insert notification for parent
                await connection.execute(`
                    INSERT INTO notifications (
                        user_id, title, message, type, is_read
                    ) VALUES (?, ?, ?, 'conduct', false)
                `, [
                    parentResult[0].id,
                    `Conduct Record: ${title}`,
                    `Your child ${parentResult[0].student_first_name} ${parentResult[0].student_last_name} has a new conduct record: ${title}. ${description}`
                ]);
                
                // Update conduct record to mark parent as notified
                await connection.execute(`
                    UPDATE conduct_records 
                    SET parent_notified = true, parent_notified_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [conduct_id]);
            }
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
        
        // Add admin review fields if admin_reviewed is being set to true
        if (updates.admin_reviewed && req.user && req.user.id) {
            updateFields.push('admin_reviewed_by = ?', 'admin_reviewed_at = CURRENT_TIMESTAMP');
            values.push(req.user.id);
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

// Update teacher assignment
router.put('/teacher-assignments/:id', async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const updates = req.body;
        
        const allowedFields = [
            'assignment_type', 'start_date', 'end_date', 'is_active', 'notes'
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
        
        values.push(assignmentId);
        
        const query = `UPDATE teacher_class_assignments SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        
        const [result] = await pool.execute(query, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Assignment updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update assignment',
            error: error.message
        });
    }
});

// Remove teacher assignment
router.delete('/teacher-assignments/:id', async (req, res) => {
    try {
        const assignmentId = req.params.id;
        
        // Get assignment details before deletion
        const [assignment] = await pool.execute(`
            SELECT teacher_id, trade_class_id, assignment_type
            FROM teacher_class_assignments WHERE id = ?
        `, [assignmentId]);
        
        if (assignment.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }
        
        // Delete assignment
        await pool.execute(
            'UPDATE teacher_class_assignments SET is_active = false, end_date = CURDATE() WHERE id = ?',
            [assignmentId]
        );
        
        // Update class teacher if necessary
        const assignmentData = assignment[0];
        if (assignmentData.assignment_type === 'main') {
            await pool.execute(`
                UPDATE trade_classes SET main_teacher_id = NULL WHERE id = ?
            `, [assignmentData.trade_class_id]);
        } else if (assignmentData.assignment_type === 'assistant') {
            await pool.execute(`
                UPDATE trade_classes SET assistant_teacher_id = NULL WHERE id = ?
            `, [assignmentData.trade_class_id]);
        }
        
        res.json({
            success: true,
            message: 'Assignment removed successfully'
        });
        
    } catch (error) {
        console.error('Error removing assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove assignment',
            error: error.message
        });
    }
});

module.exports = router;