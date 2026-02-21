/**
 * Comprehensive DOD Messaging System
 * Real messaging for ALL students across all trades and levels
 * Level 3-5, Trades: AUTO, BDC, SOD
 * Stored in database - fully dynamic
 */
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ===============================
// DYNAMIC CONFIG FROM DATABASE
// ===============================

// Get real trades from database (AUTO, BDC, SOD only)
async function getRealTrades() {
    try {
        const [trades] = await pool.execute(`
            SELECT DISTINCT trade_code, trade_name 
            FROM global_student_sheets 
            WHERE status = 'active' 
            AND trade_code IN ('AUTO', 'BDC', 'SOD', 'Automobile Technology', 'Building and Construction', 'Software Development')
            ORDER BY trade_name
        `);
        return trades;
    } catch (error) {
        console.error('Error fetching trades:', error);
        return [
            { trade_code: 'SOD', trade_name: 'Software Development' },
            { trade_code: 'BDC', trade_name: 'Building and Construction' },
            { trade_code: 'AUTO', trade_name: 'Automobile Technology' }
        ];
    }
}

// Get real levels from database (Level 3-5)
async function getRealLevels(tradeCode = null) {
    try {
        let query = `
            SELECT DISTINCT level_number 
            FROM global_student_sheets 
            WHERE status = 'active' 
            AND level_number >= 3 AND level_number <= 5
        `;
        const params = [];
        
        if (tradeCode) {
            query += ` AND trade_code = ?`;
            params.push(tradeCode);
        }
        
        query += ` ORDER BY level_number`;
        
        const [levels] = await pool.execute(query, params);
        return levels.map(l => l.level_number);
    } catch (error) {
        console.error('Error fetching levels:', error);
        return [3, 4, 5];
    }
}

// ===============================
// CONFIG ENDPOINTS
// ===============================

// Get available trades (AUTO, BDC, SOD)
router.get('/config/trades', authenticateToken, async (req, res) => {
    try {
        const trades = await getRealTrades();
        res.json({ success: true, trades });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get available levels for a trade (3-5)
router.get('/config/levels', authenticateToken, async (req, res) => {
    try {
        const { trade_code } = req.query;
        const levels = await getRealLevels(trade_code);
        res.json({ success: true, levels });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===============================
// STUDENT MESSAGING - LEVEL 3-5, TRADES: AUTO, BDC, SOD
// ===============================

// Get students for messaging (Level 3-5, AUTO/BDC/SOD)
router.get('/students', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dod', 'dos', 'patron', 'matron'), async (req, res) => {
    try {
        const { search = '', trade_code = '', level = '', page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT 
                gss.id,
                gss.student_id,
                gss.student_code,
                gss.first_name,
                gss.last_name,
                CONCAT(gss.first_name, ' ', gss.last_name) as full_name,
                gss.trade_code,
                gss.trade_name,
                gss.level_number,
                gss.level_suffix,
                gss.class_name,
                gss.gender,
                gss.phone,
                gss.guardian_phone,
                gss.guardian_name,
                gss.status,
                gss.conduct_score,
                gss.conduct_grade,
                gss.attendance_percentage
            FROM global_student_sheets gss
            WHERE gss.status = 'active'
            AND gss.level_number >= 3 AND gss.level_number <= 5
            AND gss.trade_code IN ('AUTO', 'BDC', 'SOD', 'Automobile Technology', 'Building and Construction', 'Software Development')
        `;

        const params = [];

        if (search) {
            query += ` AND (
                LOWER(gss.first_name) LIKE LOWER(?) 
                OR LOWER(gss.last_name) LIKE LOWER(?)
                OR LOWER(CONCAT(gss.first_name, ' ', gss.last_name)) LIKE LOWER(?)
                OR gss.student_code LIKE ?
                OR gss.phone LIKE ?
                OR gss.guardian_phone LIKE ?
            )`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
        }

        if (trade_code) {
            query += ` AND gss.trade_code = ?`;
            params.push(trade_code);
        }

        if (level) {
            query += ` AND gss.level_number = ?`;
            params.push(parseInt(level));
        }

        query += ` ORDER BY gss.trade_name, gss.level_number, gss.last_name LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);

        const [students] = await pool.execute(query, params);

        // Get total count
        let countQuery = `
            SELECT COUNT(*) as total FROM global_student_sheets 
            WHERE status = 'active'
            AND level_number >= 3 AND level_number <= 5
            AND trade_code IN ('AUTO', 'BDC', 'SOD', 'Automobile Technology', 'Building and Construction', 'Software Development')
        `;
        const countParams = [];
        if (search) {
            countQuery += ` AND (LOWER(first_name) LIKE LOWER(?) OR LOWER(last_name) LIKE LOWER(?) OR student_code LIKE ?)`;
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (trade_code) {
            countQuery += ` AND trade_code = ?`;
            countParams.push(trade_code);
        }
        if (level) {
            countQuery += ` AND level_number = ?`;
            countParams.push(parseInt(level));
        }
        const [countResult] = await pool.execute(countQuery, countParams);

        res.json({
            success: true,
            students,
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get student by ID
router.get('/students/:id', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dod', 'dos', 'patron', 'matron'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const [students] = await pool.execute(`
            SELECT * FROM global_student_sheets 
            WHERE id = ? AND status = 'active'
            AND level_number >= 3 AND level_number <= 5
            AND trade_code IN ('AUTO', 'BDC', 'SOD', 'Automobile Technology', 'Building and Construction', 'Software Development')
        `, [id]);

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, student: students[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/message/student', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dod', 'patron', 'matron'), async (req, res) => {
    try {
        const { student_id, subject, message, priority = 'normal', send_sms = false } = req.body;
        const sender_id = req.user.userId;
        const sender_name = req.user.name || `${req.user.first_name} ${req.user.last_name}`;
        const sender_role = req.user.role;

        // Get student info
        const [students] = await pool.execute(
            `SELECT * FROM global_student_sheets WHERE id = ?`,
            [student_id]
        );

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const student = students[0];

        // Create message record in database
        const messageId = `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        await pool.execute(`
            INSERT INTO dod_student_messages 
            (message_id, student_id, student_code, student_name, trade, level,
             subject, message, priority, sender_id, sender_name, sender_role,
             status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sent', NOW())
        `, [
            messageId, student.id, student.student_code, 
            `${student.first_name} ${student.last_name}`,
            student.trade_name, student.level_number,
            subject, message, priority, sender_id, sender_name, sender_role
        ]);

        // Send SMS if requested
        let smsResult = null;
        if (send_sms && student.guardian_phone) {
            try {
                const smsService = require('../services/smsService');
                const fullMessage = `${subject}\n\n${message}\n\nStudent: ${student.first_name} ${student.last_name}`;
                smsResult = await smsService.sendSMS(student.guardian_phone, fullMessage);
            } catch (smsError) {
                console.log('SMS sending failed:', smsError.message);
            }
        }

        res.json({
            success: true,
            message: 'Message sent successfully',
            message_id: messageId,
            student: {
                id: student.id,
                name: `${student.first_name} ${student.last_name}`,
                code: student.student_code,
                trade: student.trade_name,
                level: student.level_number
            },
            sms_sent: smsResult?.success || false
        });
    } catch (error) {
        console.error('Error sending student message:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===============================
// SEND MESSAGE TO PARENT
// ===============================

router.post('/message/parent', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dod', 'patron', 'matron'), async (req, res) => {
    try {
        const { student_id, subject, message, priority = 'normal', send_sms = true } = req.body;
        const sender_id = req.user.userId;
        const sender_name = req.user.name || `${req.user.first_name} ${req.user.last_name}`;
        const sender_role = req.user.role;

        // Get student info including parent contact
        const [students] = await pool.execute(
            `SELECT * FROM global_student_sheets WHERE id = ?`,
            [student_id]
        );

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const student = students[0];

        if (!student.guardian_phone) {
            return res.status(400).json({ success: false, message: 'No guardian phone number on file' });
        }

        // Create parent notification record
        const notificationId = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        await pool.execute(`
            INSERT INTO parent_notifications 
            (notification_id, student_id, student_code, parent_phone, title, message, 
             type, priority, sent_by, sent_by_role, sent_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            notificationId, student.id, student.student_code, student.guardian_phone,
            subject, message, 'dod_message', priority, sender_id, sender_role
        ]);

        // Send SMS
        let smsResult = null;
        if (send_sms) {
            try {
                const smsService = require('../services/smsService');
                const fullMessage = `${subject}\n\n${message}\n\nUmwana: ${student.first_name} ${student.last_name}\nTrade: ${student.trade_name}\nLevel: ${student.level_number}`;
                smsResult = await smsService.sendSMS(student.guardian_phone, fullMessage);
            } catch (smsError) {
                console.log('SMS sending failed:', smsError.message);
            }
        }

        res.json({
            success: true,
            message: 'Parent notification sent successfully',
            notification_id: notificationId,
            student: {
                id: student.id,
                name: `${student.first_name} ${student.last_name}`,
                parent_phone: student.guardian_phone
            },
            sms_sent: smsResult?.success || false
        });
    } catch (error) {
        console.error('Error sending parent message:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===============================
// BULK MESSAGE TO TRADE/LEVEL
// ===============================

router.post('/message/bulk', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dod', 'patron', 'matron'), async (req, res) => {
    try {
        const { trade_code, level_number, subject, message, priority = 'normal', target = 'parents' } = req.body;
        const sender_id = req.user.userId;
        const sender_name = req.user.name || `${req.user.first_name} ${req.user.last_name}`;
        const sender_role = req.user.role;

        // Get all students for the trade/level
        let query = `
            SELECT id, student_code, first_name, last_name, trade_name, level_number, 
                   phone, guardian_phone, guardian_name
            FROM global_student_sheets 
            WHERE status = 'active'
        `;
        const params = [];

        if (trade_code) {
            query += ` AND trade_code = ?`;
            params.push(trade_code);
        }
        if (level_number) {
            query += ` AND level_number = ?`;
            params.push(parseInt(level_number));
        }

        const [students] = await pool.execute(query, params);

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'No students found for the selected criteria' });
        }

        const results = { sent: 0, failed: 0, sms_sent: 0 };
        const messageIds = [];

        // Import SMS service
        let smsService;
        try {
            smsService = require('../services/smsService');
        } catch (e) {
            smsService = null;
        }

        // Send to each student/parent
        for (const student of students) {
            try {
                const contactPhone = target === 'students' ? student.phone : student.guardian_phone;
                
                if (!contactPhone) {
                    results.failed++;
                    continue;
                }

                // Create notification record
                const notificationId = `BULK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                
                await pool.execute(`
                    INSERT INTO parent_notifications 
                    (notification_id, student_id, student_code, parent_phone, title, message,
                     type, priority, sent_by, sent_by_role, sent_at, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `, [
                    notificationId, student.id, student.student_code, contactPhone,
                    subject, message, 'bulk_dod_message', priority, sender_id, sender_role
                ]);

                messageIds.push(notificationId);

                // Send SMS
                if (smsService) {
                    const fullMessage = `${subject}\n\n${message}\n\nUmwana: ${student.first_name} ${student.last_name}`;
                    const smsResult = await smsService.sendSMS(contactPhone, fullMessage);
                    if (smsResult?.success) {
                        results.sms_sent++;
                    }
                }

                results.sent++;
            } catch (err) {
                console.error(`Failed to send to student ${student.id}:`, err.message);
                results.failed++;
            }
        }

        // Log bulk message activity
        await pool.execute(`
            INSERT INTO dod_message_logs 
            (sender_id, sender_name, sender_role, trade_code, level_number, 
             target_type, subject, message, recipients_count, sent_count, failed_count, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            sender_id, sender_name, sender_role, trade_code || 'ALL', level_number || 'ALL',
            target, subject, message, students.length, results.sent, results.failed
        ]);

        res.json({
            success: true,
            message: `Bulk message processed: ${results.sent} sent, ${results.failed} failed`,
            summary: {
                total_students: students.length,
                sent: results.sent,
                failed: results.failed,
                sms_sent: results.sms_sent
            }
        });
    } catch (error) {
        console.error('Error sending bulk message:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===============================
// GET MESSAGE HISTORY
// ===============================

router.get('/messages/history', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dod', 'patron', 'matron'), async (req, res) => {
    try {
        const { page = 1, limit = 50, trade_code, level_number } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT * FROM dod_message_logs 
            WHERE 1=1
        `;
        const params = [];

        if (trade_code) {
            query += ` AND trade_code = ?`;
            params.push(trade_code);
        }
        if (level_number) {
            query += ` AND level_number = ?`;
            params.push(level_number);
        }

        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);

        const [messages] = await pool.execute(query, params);

        // Get totals
        let countQuery = `SELECT COUNT(*) as total FROM dod_message_logs`;
        const [countResult] = await pool.execute(countQuery);

        res.json({
            success: true,
            messages,
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching message history:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===============================
// CONDUCT MANAGEMENT - ALL STUDENTS
// ===============================

// Get conduct records for all students
router.get('/conduct/all', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dod', 'patron', 'matron'), async (req, res) => {
    try {
        const { page = 1, limit = 50, trade_code, level_number, search } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT sdr.*, 
                   gss.first_name, gss.last_name, gss.student_code,
                   gss.trade_name, gss.level_number, gss.conduct_score
            FROM student_discipline_records sdr
            LEFT JOIN global_student_sheets gss ON sdr.student_id = gss.id
            WHERE 1=1
        `;
        const params = [];

        if (trade_code) {
            query += ` AND gss.trade_code = ?`;
            params.push(trade_code);
        }
        if (level_number) {
            query += ` AND gss.level_number = ?`;
            params.push(parseInt(level_number));
        }
        if (search) {
            query += ` AND (gss.first_name LIKE ? OR gss.last_name LIKE ? OR gss.student_code LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY sdr.incident_date DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);

        const [records] = await pool.execute(query, params);

        // Get totals
        let countQuery = `
            SELECT COUNT(*) as total FROM student_discipline_records sdr
            LEFT JOIN global_student_sheets gss ON sdr.student_id = gss.id
            WHERE 1=1
        `;
        const [countResult] = await pool.execute(countQuery);

        res.json({
            success: true,
            records,
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching conduct records:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add conduct record for student
router.post('/conduct/add', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dod'), async (req, res) => {
    try {
        const { student_id, incident_type, severity, description, action_taken, points_deducted, notify_parent = true } = req.body;
        const recorded_by = req.user.userId;
        const recorded_by_name = req.user.name || `${req.user.first_name} ${req.user.last_name}`;

        // Get student info
        const [students] = await pool.execute(
            `SELECT * FROM global_student_sheets WHERE id = ?`,
            [student_id]
        );

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const student = students[0];
        
        // Calculate new conduct score
        const currentScore = student.conduct_score || 40;
        const newScore = Math.max(0, currentScore - (points_deducted || 0));

        // Insert discipline record
        const recordId = `DISC-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        
        await pool.execute(`
            INSERT INTO student_discipline_records 
            (record_id, student_id, student_code, student_name, trade, class_level,
             incident_type, severity, description, action_taken, conduct_points_deducted,
             new_conduct_score, recorded_by, recorded_by_name, incident_date, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            recordId, student.id, student.student_code, 
            `${student.first_name} ${student.last_name}`,
            student.trade_name, student.level_number,
            incident_type, severity, description, action_taken,
            points_deducted || 0, newScore, recorded_by, recorded_by_name
        ]);

        // Update student conduct score
        await pool.execute(
            `UPDATE global_student_sheets SET conduct_score = ? WHERE id = ?`,
            [newScore, student_id]
        );

        // Notify parent if requested
        let smsResult = null;
        if (notify_parent && student.guardian_phone) {
            try {
                const smsService = require('../services/smsService');
                const notificationMessage = `ISHURI: Ikosa ryagaragajwe k'umwana ${student.first_name} ${student.last_name}. Ibiro: ${incident_type}. Igitabo: ${description}. Igihano: ${action_taken}. Ayobozi.`;
                smsResult = await smsService.sendSMS(student.guardian_phone, notificationMessage);
            } catch (smsError) {
                console.log('Parent notification failed:', smsError.message);
            }
        }

        res.json({
            success: true,
            message: 'Conduct record added successfully',
            record_id: recordId,
            new_conduct_score: newScore,
            parent_notified: smsResult?.success || false
        });
    } catch (error) {
        console.error('Error adding conduct record:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===============================
// CONTACT MANAGEMENT - ALL STUDENTS
// ===============================

// Get all student contacts
router.get('/contacts/all', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dod', 'patron', 'matron'), async (req, res) => {
    try {
        const { page = 1, limit = 50, trade_code, level_number } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT id, student_id, student_code, first_name, last_name,
                   trade_code, trade_name, level_number,
                   phone, guardian_phone, guardian_name, guardian_relationship,
                   email, address, parent_email
            FROM global_student_sheets
            WHERE status = 'active'
            AND (guardian_phone IS NOT NULL OR phone IS NOT NULL)
        `;
        const params = [];

        if (trade_code) {
            query += ` AND trade_code = ?`;
            params.push(trade_code);
        }
        if (level_number) {
            query += ` AND level_number = ?`;
            params.push(parseInt(level_number));
        }

        query += ` ORDER BY last_name LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);

        const [contacts] = await pool.execute(query, params);

        let countQuery = `
            SELECT COUNT(*) as total FROM global_student_sheets
            WHERE status = 'active' AND (guardian_phone IS NOT NULL OR phone IS NOT NULL)
        `;
        const [countResult] = await pool.execute(countQuery);

        res.json({
            success: true,
            contacts,
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===============================
// DASHBOARD STATS
// ===============================

router.get('/dashboard/stats', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dod', 'patron', 'matron'), async (req, res) => {
    try {
        // Total students
        const [totalStudents] = await pool.execute(
            `SELECT COUNT(*) as count FROM global_student_sheets WHERE status = 'active'`
        );

        // Students by trade
        const [byTrade] = await pool.execute(`
            SELECT trade_name, trade_code, COUNT(*) as count 
            FROM global_student_sheets 
            WHERE status = 'active' 
            GROUP BY trade_name, trade_code
            ORDER BY count DESC
        `);

        // Recent discipline incidents
        const [recentIncidents] = await pool.execute(`
            SELECT COUNT(*) as count 
            FROM student_discipline_records 
            WHERE incident_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);

        // Messages sent today
        const [messagesToday] = await pool.execute(`
            SELECT COUNT(*) as count 
            FROM parent_notifications 
            WHERE DATE(created_at) = CURDATE()
        `);

        // Low conduct students (score < 30)
        const [lowConduct] = await pool.execute(`
            SELECT COUNT(*) as count 
            FROM global_student_sheets 
            WHERE status = 'active' AND conduct_score < 30
        `);

        res.json({
            success: true,
            stats: {
                total_students: totalStudents[0].count,
                by_trade: byTrade,
                recent_incidents_7days: recentIncidents[0].count,
                messages_today: messagesToday[0].count,
                low_conduct_students: lowConduct[0].count
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
