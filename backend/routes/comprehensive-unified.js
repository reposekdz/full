/**
 * ========================================================
 * COMPREHENSIVE UNIFIED API FOR ALL ROLES
 * ========================================================
 * Advanced Parent Linking System with Real Database
 * 
 * Features:
 * - Parent Application Portal (apply to link with child)
 * - Staff Management (all roles can view/approve/reject)
 * - Auto-student search for linking
 * - Real-time SMS notifications via Africa's Talking
 * - Complete audit trail
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Import SMS service for real notifications
let smsService = null;
try {
    smsService = require('../services/smsService');
} catch (e) {
    console.log('SMS Service not available');
}

let africanTalkingService = null;
try {
    africanTalkingService = require('../services/africanTalkingService');
} catch (e) {
    console.log('Africa\'s Talking Service not available');
}

// Allowed roles for this API
const ALLOWED_ROLES = ['admin', 'dod', 'director_discipline', 'dos', 'director_study', 'headmaster', 'accountant', 'advisor', 'teacher', 'patron', 'matron', 'stock_manager', 'parent'];

function isAllowedRole(role) {
    return ALLOWED_ROLES.includes(role);
}

// ===============================
// REAL DATABASE TRADES & LEVELS
// ===============================

async function getRealTrades() {
    try {
        const [trades] = await pool.execute(`
            SELECT DISTINCT trade_code, trade_name 
            FROM global_student_sheets 
            WHERE status = 'active' 
            AND trade_code IS NOT NULL
            ORDER BY trade_name
        `);
        return trades.length > 0 ? trades : [
            { trade_code: 'SOD', trade_name: 'Software Development' },
            { trade_code: 'BDC', trade_name: 'Building and Construction' },
            { trade_code: 'AUTO', trade_name: 'Automobile Technology' }
        ];
    } catch (error) {
        console.error('Error fetching trades:', error);
        return [
            { trade_code: 'SOD', trade_name: 'Software Development' },
            { trade_code: 'BDC', trade_name: 'Building and Construction' },
            { trade_code: 'AUTO', trade_name: 'Automobile Technology' }
        ];
    }
}

async function getRealLevels() {
    try {
        const [levels] = await pool.execute(`
            SELECT DISTINCT level_number 
            FROM global_student_sheets 
            WHERE status = 'active' 
            AND level_number IS NOT NULL
            ORDER BY level_number
        `);
        return levels.length > 0 ? levels.map(l => l.level_number) : [1, 2, 3, 4, 5];
    } catch (error) {
        console.error('Error fetching levels:', error);
        return [1, 2, 3, 4, 5];
    }
}

// SMS Service helper - Uses real SMS service
async function sendParentSMS(phone, message, priority = 'normal') {
    try {
        // Try using Africa's Talking directly
        if (africanTalkingService && africanTalkingService.sendSMS) {
            const result = await africanTalkingService.sendSMS(phone, message);
            console.log(`✅ SMS sent to ${phone}:`, result.success ? 'Success' : result.message);
            
            // Also log to database
            await pool.execute(`
                INSERT INTO sms_queue (phone_number, message, status, priority, created_at)
                VALUES (?, ?, ?, ?, NOW())
            `, [phone, message, result.success ? 'sent' : 'failed', priority]);
            
            return result.success;
        }
        
        // Fallback to smsService
        if (smsService && smsService.sendSMS) {
            const result = await smsService.sendSMS(phone, message, 0, { type: 'unified_api' });
            
            await pool.execute(`
                INSERT INTO sms_queue (phone_number, message, status, priority, created_at)
                VALUES (?, ?, ?, ?, NOW())
            `, [phone, message, result.success ? 'sent' : 'failed', priority]);
            
            return result.success;
        }
        
        // Last resort: just queue
        await pool.execute(`
            INSERT INTO sms_queue (phone_number, message, status, priority, created_at)
            VALUES (?, ?, 'pending', ?, NOW())
        `, [phone, message, priority]);
        
        return true;
    } catch (error) {
        console.log('SMS error:', error.message);
        // Still log to queue
        try {
            await pool.execute(`
                INSERT INTO sms_queue (phone_number, message, status, priority, created_at, error_message)
                VALUES (?, ?, 'failed', ?, ?, NOW())
            `, [phone, message, priority, error.message]);
        } catch (e) {}
        return false;
    }
}

// Get parents info for a student
async function getStudentParents(studentId) {
    try {
        const [parents] = await pool.execute(`
            SELECT 
                psl.id as link_id,
                psl.parent_id,
                psl.relationship_type,
                psl.status as link_status,
                psl.can_view_marks,
                psl.can_view_attendance,
                u.first_name as parent_first_name,
                u.last_name as parent_last_name,
                u.phone as parent_phone,
                u.email as parent_email
            FROM parent_student_links psl
            JOIN users u ON psl.parent_id = u.id
            WHERE psl.student_id = ?
        `, [studentId]);
        return parents;
    } catch (error) {
        console.log('Get parents error:', error.message);
        return [];
    }
}

// ===============================
// CONFIG ENDPOINTS
// ===============================

router.get('/config', authenticateToken, async (req, res) => {
    try {
        const trades = await getRealTrades();
        const levels = await getRealLevels();
        
        res.json({ 
            success: true, 
            config: {
                trades,
                levels,
                roles: ALLOWED_ROLES
            }
        });
    } catch (error) {
        console.error('Config Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===============================
// GLOBAL SHEETS - All Roles Access
// ===============================

router.get('/global-sheets', authenticateToken, async (req, res) => {
    try {
        const userRole = req.user.role;
        
        if (!isAllowedRole(userRole)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const { search = '', trade_code = '', level_number = '', status = 'active', page = 1, limit = 100 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Get students with parent info
        let query = `
            SELECT 
                gss.*,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'parent_id', psl.parent_id,
                            'parent_name', CONCAT(u.first_name, ' ', u.last_name),
                            'parent_phone', u.phone,
                            'parent_email', u.email,
                            'relationship_type', psl.relationship_type,
                            'can_view_marks', psl.can_view_marks
                        )
                    )
                    FROM parent_student_links psl
                    JOIN users u ON psl.parent_id = u.id
                    WHERE psl.student_id = gss.id AND psl.status = 'approved'
                ) as linked_parents
            FROM global_student_sheets gss
            WHERE gss.status = 'active'
        `;
        
        const params = [];
        
        if (search) {
            query += ` AND (gss.first_name LIKE ? OR gss.last_name LIKE ? OR gss.student_code LIKE ? OR gss.phone LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        if (trade_code && trade_code !== 'all') {
            query += ` AND gss.trade_code = ?`;
            params.push(trade_code);
        }
        
        if (level_number && level_number !== 'all') {
            query += ` AND gss.level_number = ?`;
            params.push(parseInt(level_number));
        }
        
        if (status) {
            query += ` AND gss.status = ?`;
            params.push(status);
        }
        
        query += ` ORDER BY gss.last_name, gss.first_name LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);

        const [students] = await pool.execute(query, params);
        
        // Get counts
        let countQuery = `SELECT COUNT(*) as total FROM global_student_sheets gss WHERE gss.status = 'active'`;
        const countParams = [];
        
        if (search) {
            countQuery += ` AND (gss.first_name LIKE ? OR gss.last_name LIKE ? OR gss.student_code LIKE ?)`;
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (trade_code && trade_code !== 'all') {
            countQuery += ` AND gss.trade_code = ?`;
            countParams.push(trade_code);
        }
        if (level_number && level_number !== 'all') {
            countQuery += ` AND gss.level_number = ?`;
            countParams.push(parseInt(level_number));
        }
        
        const [countResult] = await pool.execute(countQuery, countParams);
        
        // Parse linked_parents JSON
        const parsedStudents = students.map(s => ({
            ...s,
            linked_parents: s.linked_parents ? JSON.parse(s.linked_parents) : []
        }));
        
        res.json({ 
            success: true, 
            students: parsedStudents,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                totalPages: Math.ceil(countResult[0].total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Global Sheets Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===============================
// GET STUDENTS BY TRADE & LEVEL (Simple)
// ===============================

router.get('/students-by-trade-level', authenticateToken, async (req, res) => {
    try {
        const userRole = req.user.role;
        
        if (!isAllowedRole(userRole)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const { trade_code, level_number } = req.query;

        let query = `
            SELECT 
                gss.id,
                gss.student_id,
                gss.student_code,
                gss.first_name,
                gss.last_name,
                gss.trade_code,
                gss.trade_name,
                gss.level_number,
                gss.gender,
                gss.phone,
                gss.status,
                gss.conduct_score,
                gss.attendance_percentage,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'parent_id', psl.parent_id,
                            'parent_name', CONCAT(u.first_name, ' ', u.last_name),
                            'parent_phone', u.phone
                        )
                    )
                    FROM parent_student_links psl
                    JOIN users u ON psl.parent_id = u.id
                    WHERE psl.student_id = gss.id AND psl.status = 'approved'
                ) as linked_parents
            FROM global_student_sheets gss
            WHERE gss.status = 'active'
        `;
        
        const params = [];
        
        if (trade_code && trade_code !== 'all') {
            query += ` AND gss.trade_code = ?`;
            params.push(trade_code);
        }
        
        if (level_number) {
            query += ` AND gss.level_number = ?`;
            params.push(parseInt(level_number));
        }
        
        query += ` ORDER BY gss.last_name, gss.first_name LIMIT 200`;

        const [students] = await pool.execute(query, params);
        
        const parsedStudents = students.map(s => ({
            ...s,
            linked_parents: s.linked_parents ? JSON.parse(s.linked_parents) : []
        }));
        
        res.json({ 
            success: true, 
            students: parsedStudents,
            total: parsedStudents.length
        });
    } catch (error) {
        console.error('Students by Trade Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===============================
// STUDENT DATA API (Real Database)
// ===============================

router.get('/students', authenticateToken, async (req, res) => {
    try {
        const userRole = req.user.role;
        
        if (!isAllowedRole(userRole)) {
            return res.status(403).json({ success: false, message: 'Unauthorized role' });
        }

        const { search = '', trade_code = '', level_number = '', status = 'active', page = 1, limit = 50 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = `
            SELECT DISTINCT
                gss.id, gss.student_id, gss.student_code,
                gss.first_name, gss.last_name, 
                CONCAT(gss.first_name, ' ', gss.last_name) as full_name,
                gss.trade_code, gss.trade_name, gss.level_number, gss.level_suffix,
                gss.gender, gss.phone, gss.email,
                gss.status, gss.gpa, gss.attendance_percentage, gss.conduct_score, gss.conduct_grade,
                gss.academic_year,
                (SELECT COUNT(*) FROM parent_student_links psl WHERE psl.student_id = gss.id AND psl.status = 'approved') as linked_parents_count
            FROM global_student_sheets gss
            WHERE 1=1
        `;
        
        const params = [];
        
        if (search) {
            query += ` AND (gss.first_name LIKE ? OR gss.last_name LIKE ? OR gss.student_code LIKE ? OR gss.student_id LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        if (trade_code) {
            query += ` AND gss.trade_code = ?`;
            params.push(trade_code);
        }
        
        if (level_number) {
            query += ` AND gss.level_number = ?`;
            params.push(parseInt(level_number));
        }
        
        if (status) {
            query += ` AND gss.status = ?`;
            params.push(status);
        }
        
        query += ` ORDER BY gss.last_name, gss.first_name LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);

        const [students] = await pool.execute(query, params);
        
        let countQuery = `SELECT COUNT(DISTINCT gss.id) as total FROM global_student_sheets gss WHERE 1=1`;
        const countParams = [];
        
        if (search) {
            countQuery += ` AND (gss.first_name LIKE ? OR gss.last_name LIKE ? OR gss.student_code LIKE ?)`;
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (trade_code) {
            countQuery += ` AND gss.trade_code = ?`;
            countParams.push(trade_code);
        }
        if (level_number) {
            countQuery += ` AND gss.level_number = ?`;
            countParams.push(parseInt(level_number));
        }
        if (status) {
            countQuery += ` AND gss.status = ?`;
            countParams.push(status);
        }
        
        const [countResult] = await pool.execute(countQuery, countParams);
        
        res.json({ 
            success: true, 
            students,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                totalPages: Math.ceil(countResult[0].total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get Students Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/students/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;
        
        if (!isAllowedRole(userRole)) {
            return res.status(403).json({ success: false, message: 'Unauthorized role' });
        }

        const [students] = await pool.execute(`
            SELECT * FROM global_student_sheets WHERE id = ?
        `, [id]);

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const [parents] = await pool.execute(`
            SELECT psl.*, 
                   u.first_name as parent_first_name, u.last_name as parent_last_name,
                   u.phone as parent_phone, u.email as parent_email
            FROM parent_student_links psl
            LEFT JOIN users u ON psl.parent_id = u.id
            WHERE psl.student_id = ? AND psl.status = 'approved'
        `, [id]);

        const [conductRecords] = await pool.execute(`
            SELECT * FROM student_conduct_records 
            WHERE student_id = ? 
            ORDER BY incident_date DESC
            LIMIT 20
        `, [id]);

        res.json({ 
            success: true, 
            student: students[0],
            parents,
            conductRecords
        });
    } catch (error) {
        console.error('Get Student Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===============================
// ADVANCED STUDENT SEARCH (For Linking)
// ===============================

router.get('/search/students', authenticateToken, async (req, res) => {
    try {
        const { query = '', trade_code = '', level_number = '' } = req.query;
        
        if (!query || query.length < 2) {
            return res.json({ success: true, students: [] });
        }

        let sql = `
            SELECT id, student_code, first_name, last_name, trade_code, trade_name, level_number, gender, status, conduct_score
            FROM global_student_sheets
            WHERE status = 'active'
            AND (LOWER(first_name) LIKE LOWER(?) OR LOWER(last_name) LIKE LOWER(?) OR LOWER(student_code) LIKE LOWER(?) OR LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER(?))
        `;
        
        const params = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];
        
        if (trade_code) {
            sql += ` AND trade_code = ?`;
            params.push(trade_code);
        }
        
        if (level_number) {
            sql += ` AND level_number = ?`;
            params.push(parseInt(level_number));
        }
        
        sql += ` ORDER BY first_name, last_name LIMIT 30`;

        const [students] = await pool.execute(sql, params);

        res.json({ 
            success: true, 
            students
        });
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===============================
// PARENT APPLICATION PORTAL
// ===============================

// Parent applies to link with their child
router.post('/parent/apply', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const parentId = req.user.id || req.user.userId;
        const { 
            student_first_name, student_last_name, 
            trade_code, level_number, 
            relationship_type, student_code,
            parent_phone, additional_info 
        } = req.body;

        // Validate required fields
        if (!student_first_name || !student_last_name || !trade_code || !level_number) {
            await connection.rollback();
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide: student name, trade, and level' 
            });
        }

        // Get parent info
        const [parents] = await connection.execute(
            'SELECT id, first_name, last_name, phone, email FROM users WHERE id = ?',
            [parentId]
        );

        if (parents.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Parent not found' });
        }

        const parent = parents[0];

        // Check if student exists in database
        let studentFound = null;
        const [students] = await connection.execute(`
            SELECT id, first_name, last_name, student_code, trade_name, level_number, status
            FROM global_student_sheets
            WHERE LOWER(first_name) = LOWER(?) 
              AND LOWER(last_name) = LOWER(?)
              AND trade_code = ?
              AND level_number = ?
            LIMIT 1
        `, [student_first_name, student_last_name, trade_code, parseInt(level_number)]);

        if (students.length > 0) {
            studentFound = students[0];
            
            // Check if already linked
            const [existingLink] = await connection.execute(`
                SELECT id FROM parent_student_links 
                WHERE parent_id = ? AND student_id = ? AND status = 'approved'
            `, [parentId, studentFound.id]);

            if (existingLink.length > 0) {
                await connection.rollback();
                return res.json({ 
                    success: false, 
                    message: 'You are already linked to this student',
                    alreadyLinked: true
                });
            }

            // Check for pending request
            const [pendingRequest] = await connection.execute(`
                SELECT id FROM parent_manual_link_requests 
                WHERE parent_id = ? AND student_name LIKE ? AND status = 'pending'
            `, [parentId, `%${student_first_name}%`]);

            if (pendingRequest.length > 0) {
                await connection.rollback();
                return res.json({ 
                    success: false, 
                    message: 'You already have a pending request for this student',
                    pendingRequest: true
                });
            }
        }

        // Create application record
        const [result] = await connection.execute(`
            INSERT INTO parent_manual_link_requests 
            (parent_id, parent_name, parent_phone, parent_email, student_name, trade, level, message, status, student_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW())
        `, [
            parentId,
            `${parent.first_name} ${parent.last_name}`,
            parent_phone || parent.phone || '',
            parent.email || '',
            `${student_first_name} ${student_last_name}`,
            trade_code,
            level_number,
            additional_info || `Student Code: ${student_code || 'N/A'}`,
            studentFound ? studentFound.id : null
        ]);

        await connection.commit();

        res.json({ 
            success: true, 
            message: studentFound 
                ? 'Application submitted! Student found in database. Staff will review and approve shortly.'
                : 'Application submitted! Since student was not found by name, staff will search and connect you.',
            applicationId: result.insertId,
            studentFound: !!studentFound,
            student: studentFound
        });
    } catch (error) {
        await connection.rollback();
        console.error('Parent Apply Error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

// Get parent's applications status
router.get('/parent/applications', authenticateToken, async (req, res) => {
    try {
        const parentId = req.user.id || req.user.userId;

        const [applications] = await pool.execute(`
            SELECT * FROM parent_manual_link_requests 
            WHERE parent_id = ?
            ORDER BY created_at DESC
            LIMIT 20
        `, [parentId]);

        const [linkedStudents] = await pool.execute(`
            SELECT gss.*, psl.relationship_type, psl.linked_at
            FROM parent_student_links psl
            JOIN global_student_sheets gss ON psl.student_id = gss.id
            WHERE psl.parent_id = ? AND psl.status = 'approved'
            ORDER BY psl.linked_at DESC
        `, [parentId]);

        res.json({ 
            success: true, 
            applications,
            linkedStudents,
            stats: {
                totalApplications: applications.length,
                pending: applications.filter(a => a.status === 'pending').length,
                approved: applications.filter(a => a.status === 'approved').length,
                rejected: applications.filter(a => a.status === 'rejected').length,
                linkedStudents: linkedStudents.length
            }
        });
    } catch (error) {
        console.error('Get Applications Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===============================
// STAFF MANAGEMENT OF APPLICATIONS
// ===============================

// Get all applications (for staff)
router.get('/staff/applications', authenticateToken, async (req, res) => {
    try {
        const userRole = req.user.role;
        
        if (!isAllowedRole(userRole)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const { status = 'all', page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = `
            SELECT pmlr.*,
                   u.first_name as parent_first_name, u.last_name as parent_last_name,
                   u.phone as parent_phone, u.email as parent_email
            FROM parent_manual_link_requests pmlr
            LEFT JOIN users u ON pmlr.parent_id = u.id
        `;
        
        const params = [];
        
        if (status !== 'all') {
            query += ` WHERE pmlr.status = ?`;
            params.push(status);
        }
        
        query += ` ORDER BY pmlr.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);

        const [applications] = await pool.execute(query, params);

        // Get counts
        const [counts] = await pool.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
            FROM parent_manual_link_requests
        `);

        res.json({ 
            success: true, 
            applications,
            stats: counts[0]
        });
    } catch (error) {
        console.error('Get Applications Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Auto-approve and link (staff)
router.post('/staff/auto-approve', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const userRole = req.user.role;
        const userId = req.user.id || req.user.userId;
        const userName = req.user.username || req.user.first_name || 'Staff';
        
        if (!isAllowedRole(userRole)) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const { application_id, student_id, notes } = req.body;

        if (!application_id || !student_id) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Application ID and Student ID required' });
        }

        // Get application
        const [applications] = await connection.execute(
            'SELECT * FROM parent_manual_link_requests WHERE id = ?',
            [application_id]
        );

        if (applications.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const application = applications[0];

        // Get student info
        const [students] = await connection.execute(
            'SELECT * FROM global_student_sheets WHERE id = ?',
            [student_id]
        );

        if (students.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const student = students[0];

        // Check if already linked
        const [existingLink] = await connection.execute(
            'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ? AND status = "approved"',
            [application.parent_id, student_id]
        );

        if (existingLink.length > 0) {
            await connection.rollback();
            return res.json({ success: false, message: 'Already linked' });
        }

        // Create the link
        await connection.execute(`
            INSERT INTO parent_student_links 
            (parent_id, student_id, relationship_type, status, linked_by, linked_at, can_view_marks, can_view_attendance, can_view_report_cards, can_view_discipline)
            VALUES (?, ?, 'Parent', 'approved', ?, NOW(), 1, 1, 1, 1)
        `, [application.parent_id, student_id, userName]);

        // Update application status
        await connection.execute(
            'UPDATE parent_manual_link_requests SET status = "approved", processed_at = NOW(), processed_by = ?, processed_by_name = ?, notes = ?, student_id = ? WHERE id = ?',
            [userId, userName, notes || `Auto-approved. Linked to ${student.first_name} ${student.last_name} (${student.student_code})`, student_id, application_id]
        );

        // Send SMS notification to parent
        try {
            const [parentUser] = await connection.execute(
                'SELECT phone FROM users WHERE id = ?',
                [application.parent_id]
            );
            
            if (parentUser.length > 0 && parentUser[0].phone) {
                const smsMessage = `Garden TVET: Your request to link with ${student.first_name} ${student.last_name} has been approved! You can now view their academic information.`;
                
                // Use real SMS service
                await sendParentSMS(parentUser[0].phone, smsMessage, 'high');
            }
        } catch (smsError) {
            console.log('SMS error:', smsError.message);
        }

        await connection.commit();

        res.json({ 
            success: true, 
            message: `Successfully linked ${student.first_name} ${student.last_name} to parent!`,
            student: {
                id: student.id,
                name: `${student.first_name} ${student.last_name}`,
                code: student.student_code
            },
            parentNotified: true
        });
    } catch (error) {
        await connection.rollback();
        console.error('Auto Approve Error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

// Reject application (staff)
router.post('/staff/reject', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const userRole = req.user.role;
        const userId = req.user.id || req.user.userId;
        const userName = req.user.username || req.user.first_name || 'Staff';
        
        if (!isAllowedRole(userRole)) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const { application_id, reason } = req.body;

        if (!application_id) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Application ID required' });
        }

        // Get application for notification
        const [applications] = await connection.execute(
            'SELECT * FROM parent_manual_link_requests WHERE id = ?',
            [application_id]
        );

        if (applications.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Update status
        await connection.execute(
            'UPDATE parent_manual_link_requests SET status = "rejected", processed_at = NOW(), processed_by = ?, processed_by_name = ?, notes = ? WHERE id = ?',
            [userId, userName, reason || 'Application rejected', application_id]
        );

        // Send rejection SMS
        try {
            const [parentUser] = await connection.execute(
                'SELECT phone FROM users WHERE id = ?',
                [applications[0].parent_id]
            );
            
            if (parentUser.length > 0 && parentUser[0].phone) {
                const smsMessage = `Garden TVET: Your linking request for ${applications[0].student_name} has been rejected. ${reason ? 'Reason: ' + reason : ''} Please contact the school for more information.`;
                
                // Use real SMS service
                await sendParentSMS(parentUser[0].phone, smsMessage, 'normal');
            }
        } catch (smsError) {
            console.log('SMS error:', smsError.message);
        }

        await connection.commit();

        res.json({ 
            success: true, 
            message: 'Application rejected',
            parentNotified: true
        });
    } catch (error) {
        await connection.rollback();
        console.error('Reject Error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

// ===============================
// PARENT LINKING MANAGEMENT
// ===============================

router.get('/parent-links/requests', authenticateToken, async (req, res) => {
    try {
        const userRole = req.user.role;
        
        if (!isAllowedRole(userRole)) {
            return res.status(403).json({ success: false, message: 'Unauthorized role' });
        }

        const { status = 'all', page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = `
            SELECT pmlr.*,
                   u.first_name as parent_first_name, u.last_name as parent_last_name,
                   u.phone as parent_phone, u.email as parent_email
            FROM parent_manual_link_requests pmlr
            LEFT JOIN users u ON pmlr.parent_id = u.id
        `;
        
        const params = [];
        
        if (status !== 'all') {
            query += ` WHERE pmlr.status = ?`;
            params.push(status);
        }
        
        query += ` ORDER BY pmlr.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);

        const [requests] = await pool.execute(query, params);

        const [counts] = await pool.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
            FROM parent_manual_link_requests
        `);

        res.json({ 
            success: true, 
            requests,
            stats: counts[0]
        });
    } catch (error) {
        console.error('Get Requests Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/parent-links/linked-students', authenticateToken, async (req, res) => {
    try {
        const parentId = req.user.id || req.user.userId;

        const [students] = await pool.execute(`
            SELECT 
                gss.*,
                psl.relationship_type,
                psl.linked_at,
                psl.can_view_marks,
                psl.can_view_attendance,
                psl.can_view_report_cards,
                psl.can_view_discipline
            FROM parent_student_links psl
            JOIN global_student_sheets gss ON psl.student_id = gss.id
            WHERE psl.parent_id = ? AND psl.status = 'approved'
            ORDER BY psl.linked_at DESC
        `, [parentId]);

        res.json({ 
            success: true, 
            students,
            count: students.length
        });
    } catch (error) {
        console.error('Get Linked Students Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/parent-links/link', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const parentId = req.user.id || req.user.userId;
        const { student_first_name, student_last_name, trade_code, level_number, relationship_type } = req.body;

        if (!student_first_name || !student_last_name || !trade_code || !level_number) {
            await connection.rollback();
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide: first name, last name, trade, and level' 
            });
        }

        const [students] = await connection.execute(`
            SELECT id, first_name, last_name, student_code, trade_name, level_number
            FROM global_student_sheets
            WHERE LOWER(first_name) = LOWER(?) 
              AND LOWER(last_name) = LOWER(?)
              AND trade_code = ?
              AND level_number = ?
              AND status = 'active'
            LIMIT 1
        `, [student_first_name, student_last_name, trade_code, parseInt(level_number)]);

        if (students.length === 0) {
            await connection.rollback();
            return res.status(404).json({ 
                success: false, 
                message: `Student ${student_first_name} ${student_last_name} not found in ${trade_code} Level ${level_number}` 
            });
        }

        const student = students[0];

        const [existing] = await connection.execute(`
            SELECT id FROM parent_student_links 
            WHERE parent_id = ? AND student_id = ? AND status = 'approved'
        `, [parentId, student.id]);

        if (existing.length > 0) {
            await connection.rollback();
            return res.json({ 
                success: false, 
                message: 'This student is already linked to your account' 
            });
        }

        await connection.execute(`
            INSERT INTO parent_student_links 
            (parent_id, student_id, relationship_type, status, linked_by, linked_at, can_view_marks, can_view_attendance, can_view_report_cards, can_view_discipline)
            VALUES (?, ?, ?, 'approved', ?, NOW(), 1, 1, 1, 1)
        `, [parentId, student.id, relationship_type || 'Parent', req.user.username || 'Parent']);

        await connection.commit();

        res.json({ 
            success: true, 
            message: `Successfully linked to ${student.first_name} ${student.last_name}!`,
            student: {
                id: student.id,
                name: `${student.first_name} ${student.last_name}`,
                code: student.student_code,
                trade: student.trade_name,
                level: student.level_number
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Link Student Error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

router.post('/parent-links/approve', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const userRole = req.user.role;
        const userId = req.user.id || req.user.userId;
        const userName = req.user.username || req.user.first_name || 'Staff';
        
        if (!isAllowedRole(userRole)) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const { request_id, student_id, notes } = req.body;

        if (!request_id || !student_id) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const [requests] = await connection.execute(
            'SELECT * FROM parent_manual_link_requests WHERE id = ?',
            [request_id]
        );

        if (requests.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        const request = requests[0];

        const [existing] = await connection.execute(
            'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ? AND status = "approved"',
            [request.parent_id, student_id]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.json({ success: false, message: 'Already linked' });
        }

        await connection.execute(`
            INSERT INTO parent_student_links 
            (parent_id, student_id, relationship_type, status, linked_by, linked_at, can_view_marks, can_view_attendance, can_view_report_cards, can_view_discipline)
            VALUES (?, ?, 'Parent', 'approved', ?, NOW(), 1, 1, 1, 1)
        `, [request.parent_id, student_id, userName]);

        await connection.execute(
            'UPDATE parent_manual_link_requests SET status = "approved", processed_at = NOW(), processed_by = ?, processed_by_name = ?, notes = ?, student_id = ? WHERE id = ?',
            [userId, userName, notes || null, student_id, request_id]
        );

        await connection.commit();

        res.json({ 
            success: true, 
            message: 'Request approved and link created!' 
        });
    } catch (error) {
        await connection.rollback();
        console.error('Approve Error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

router.post('/parent-links/reject', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const userRole = req.user.role;
        const userId = req.user.id || req.user.userId;
        const userName = req.user.username || req.user.first_name || 'Staff';
        
        if (!isAllowedRole(userRole)) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const { request_id, notes } = req.body;

        if (!request_id) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Request ID required' });
        }

        await connection.execute(
            'UPDATE parent_manual_link_requests SET status = "rejected", processed_at = NOW(), processed_by = ?, processed_by_name = ?, notes = ? WHERE id = ?',
            [userId, userName, notes || null, request_id]
        );

        await connection.commit();

        res.json({ 
            success: true, 
            message: 'Request rejected' 
        });
    } catch (error) {
        await connection.rollback();
        console.error('Reject Error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

router.delete('/parent-links/:linkId', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const { linkId } = req.params;
        const userRole = req.user.role;
        
        if (!isAllowedRole(userRole)) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await connection.execute(
            'DELETE FROM parent_student_links WHERE id = ?',
            [linkId]
        );

        await connection.commit();

        res.json({ 
            success: true, 
            message: 'Link removed successfully' 
        });
    } catch (error) {
        await connection.rollback();
        console.error('Remove Link Error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

// ===============================
// DOD OPERATIONS WITH MESSAGING
// ===============================

router.post('/dod/drop-student', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const userRole = req.user.role;
        const userId = req.user.id || req.user.userId;
        const userName = req.user.username || req.user.first_name || 'DOD';
        
        if (!['admin', 'dod', 'director_discipline', 'headmaster'].includes(userRole)) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Only DOD can drop students' });
        }

        const { student_id, reason, notes, send_sms = true } = req.body;

        if (!student_id) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Student ID required' });
        }

        const [students] = await connection.execute(
            'SELECT * FROM global_student_sheets WHERE id = ?',
            [student_id]
        );

        if (students.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const student = students[0];

        await connection.execute(
            'UPDATE global_student_sheets SET status = "dropped", updated_at = NOW() WHERE id = ?',
            [student_id]
        );

        const [dodResult] = await connection.execute(`
            INSERT INTO dod_records 
            (student_id, action_type, reason, notes, processed_by, processed_by_id, created_at)
            VALUES (?, 'drop', ?, ?, ?, ?, NOW())
        `, [student_id, reason || 'DOD', notes || '', userName, userId]);

        let parentsNotified = 0;
        
        if (send_sms) {
            const [parents] = await connection.execute(`
                SELECT DISTINCT psl.parent_id, u.phone as parent_phone, u.first_name as parent_first_name, u.last_name as parent_last_name
                FROM parent_student_links psl
                JOIN users u ON psl.parent_id = u.id
                WHERE psl.student_id = ? AND psl.status = 'approved' AND u.phone IS NOT NULL
            `, [student_id]);

            for (const parent of parents) {
                try {
                    const smsMessage = `Garden TVET: Mukuruse ${student.first_name} ${student.last_name} avuye muri scho. ${reason ? 'Impamvu: ' + reason : ''}. Mukuruse wasaba ubutumwa.`;
                    
                    // Use real SMS service
                    await sendParentSMS(parent.parent_phone, smsMessage, 'urgent');
                    
                    parentsNotified++;
                } catch (smsError) {
                    console.log('SMS error:', smsError.message);
                }
            }
        }

        await connection.commit();

        res.json({ 
            success: true, 
            message: `Student ${student.first_name} ${student.last_name} has been dropped`,
            student: {
                id: student.id,
                name: `${student.first_name} ${student.last_name}`,
                code: student.student_code,
                trade: student.trade_name,
                level: student.level_number
            },
            dodRecordId: dodResult.insertId,
            parentsNotified
        });
    } catch (error) {
        await connection.rollback();
        console.error('Drop Student Error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

router.post('/dod/restore-student', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const userRole = req.user.role;
        
        if (!['admin', 'dod', 'director_discipline', 'headmaster', 'dos', 'director_study'].includes(userRole)) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const { student_id, reason } = req.body;

        const [students] = await connection.execute(
            'SELECT * FROM global_student_sheets WHERE id = ?',
            [student_id]
        );

        if (students.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const student = students[0];

        await connection.execute(
            'UPDATE global_student_sheets SET status = "active", updated_at = NOW() WHERE id = ?',
            [student_id]
        );

        await connection.execute(`
            INSERT INTO dod_records 
            (student_id, action_type, reason, processed_by, created_at)
            VALUES (?, 'restore', ?, ?, NOW())
        `, [student_id, reason || 'Restored', req.user.username || 'Staff']);

        await connection.commit();

        res.json({ 
            success: true, 
            message: `Student ${student.first_name} ${student.last_name} has been restored`,
            student: {
                id: student.id,
                name: `${student.first_name} ${student.last_name}`
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Restore Student Error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

// ===============================
// CONDUCT MANAGEMENT WITH MESSAGING
// ===============================

router.post('/conduct/add', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const userRole = req.user.role;
        
        if (!isAllowedRole(userRole)) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const { student_id, incident_type, severity, description, action_taken, send_sms = true } = req.body;

        if (!student_id) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Student ID required' });
        }

        const [students] = await connection.execute(
            'SELECT * FROM global_student_sheets WHERE id = ?',
            [student_id]
        );

        if (students.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const student = students[0];

        const pointsMap = { minor: 1, moderate: 2, major: 3, severe: 5 };
        const points = pointsMap[severity] || 2;
        const currentScore = student.conduct_score || 40;
        const newScore = Math.max(0, currentScore - points);

        const [result] = await connection.execute(`
            INSERT INTO student_conduct_records 
            (student_id, incident_type, severity, description, action_taken, points_deducted, incident_date)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [student_id, incident_type || 'Discipline', severity || 'moderate', description || '', action_taken || '', points]);

        await connection.execute(
            'UPDATE global_student_sheets SET conduct_score = ?, updated_at = NOW() WHERE id = ?',
            [newScore, student_id]
        );

        let parentsNotified = 0;
        
        if (send_sms) {
            const [parents] = await connection.execute(`
                SELECT DISTINCT u.phone as parent_phone
                FROM parent_student_links psl
                JOIN users u ON psl.parent_id = u.id
                WHERE psl.student_id = ? AND psl.status = 'approved' AND u.phone IS NOT NULL
            `, [student_id]);

            for (const parent of parents) {
                try {
                    const smsMessage = `Garden TVET: Umwana ${student.first_name} ${student.last_name} akiriwe igihano ${incident_type}. Amanota ${points} yakuweho. Amanota ashya: ${newScore}/40.`;
                    
                    // Use real SMS service
                    await sendParentSMS(parent.parent_phone, smsMessage, 'high');
                    
                    parentsNotified++;
                } catch (smsError) {
                    console.log('SMS error:', smsError.message);
                }
            }
        }

        await connection.commit();

        res.json({ 
            success: true, 
            message: 'Conduct record added',
            recordId: result.insertId,
            oldScore: currentScore,
            newScore,
            pointsDeducted: points,
            parentsNotified
        });
    } catch (error) {
        await connection.rollback();
        console.error('Add Conduct Error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

router.post('/conduct/remove', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const userRole = req.user.role;
        
        if (!isAllowedRole(userRole)) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const { record_id, reason, send_sms = true } = req.body;

        const [records] = await connection.execute(
            'SELECT * FROM student_conduct_records WHERE id = ?',
            [record_id]
        );

        if (records.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Conduct record not found' });
        }

        const record = records[0];

        const [students] = await connection.execute(
            'SELECT * FROM global_student_sheets WHERE id = ?',
            [record.student_id]
        );

        if (students.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const student = students[0];
        const currentScore = student.conduct_score || 0;
        const pointsToRestore = record.points_deducted || 2;
        const newScore = Math.min(40, currentScore + pointsToRestore);

        await connection.execute(
            'DELETE FROM student_conduct_records WHERE id = ?',
            [record_id]
        );

        await connection.execute(
            'UPDATE global_student_sheets SET conduct_score = ?, updated_at = NOW() WHERE id = ?',
            [newScore, record.student_id]
        );

        let parentsNotified = 0;
        
        if (send_sms) {
            const [parents] = await connection.execute(`
                SELECT DISTINCT u.phone as parent_phone
                FROM parent_student_links psl
                JOIN users u ON psl.parent_id = u.id
                WHERE psl.student_id = ? AND psl.status = 'approved' AND u.phone IS NOT NULL
            `, [record.student_id]);

            for (const parent of parents) {
                try {
                    const smsMessage = `Garden TVET: Igihano cya ${record.incident_type} cyakuweho umwana ${student.first_name} ${student.last_name}. Amanota ${pointsToRestore} yongerwaho. Amanota ashya: ${newScore}/40.`;
                    
                    // Use real SMS service
                    await sendParentSMS(parent.parent_phone, smsMessage, 'normal');
                    
                    parentsNotified++;
                } catch (smsError) {
                    console.log('SMS error:', smsError.message);
                }
            }
        }

        await connection.commit();

        res.json({ 
            success: true, 
            message: 'Conduct record removed and points restored',
            oldScore: currentScore,
            newScore,
            pointsRestored: pointsToRestore,
            parentsNotified
        });
    } catch (error) {
        await connection.rollback();
        console.error('Remove Conduct Error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

router.get('/conduct/:studentId', authenticateToken, async (req, res) => {
    try {
        const { studentId } = req.params;
        const userRole = req.user.role;
        
        if (!isAllowedRole(userRole)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const [records] = await pool.execute(`
            SELECT * FROM student_conduct_records 
            WHERE student_id = ? 
            ORDER BY incident_date DESC
            LIMIT 50
        `, [studentId]);

        res.json({ 
            success: true, 
            records
        });
    } catch (error) {
        console.error('Get Conduct Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===============================
// DASHBOARD STATS
// ===============================

router.get('/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        const userRole = req.user.role;
        
        if (!isAllowedRole(userRole)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const [studentStats] = await pool.execute(`
            SELECT 
                COUNT(*) as total_students,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_students,
                SUM(CASE WHEN status = 'dropped' THEN 1 ELSE 0 END) as dropped_students,
                SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_students,
                AVG(conduct_score) as avg_conduct_score,
                AVG(attendance_percentage) as avg_attendance
            FROM global_student_sheets
        `);

        const [parentLinkStats] = await pool.execute(`
            SELECT 
                COUNT(*) as total_links,
                COUNT(DISTINCT parent_id) as total_parents,
                COUNT(DISTINCT student_id) as total_students_linked
            FROM parent_student_links 
            WHERE status = 'approved'
        `);

        const [pendingRequests] = await pool.execute(`
            SELECT COUNT(*) as pending FROM parent_manual_link_requests WHERE status = 'pending'
        `);

        const [recentDodActions] = await pool.execute(`
            SELECT * FROM dod_records 
            ORDER BY created_at DESC 
            LIMIT 10
        `);

        const [recentConduct] = await pool.execute(`
            SELECT scr.*, gss.first_name, gss.last_name
            FROM student_conduct_records scr
            JOIN global_student_sheets gss ON scr.student_id = gss.id
            ORDER BY scr.incident_date DESC 
            LIMIT 10
        `);

        res.json({ 
            success: true, 
            stats: {
                students: studentStats[0],
                parentLinks: parentLinkStats[0],
                pendingRequests: pendingRequests[0].pending,
                recentDodActions,
                recentConduct
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
