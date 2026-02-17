/**
 * Parent Management API for Headmaster, DOD, DOS
 * Manages parent registrations, student links, and approvals
 */
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all parents with their linked students
router.get('/parents', authenticateToken, async (req, res) => {
    try {
        const { search, status, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        let sql = `
      SELECT 
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.is_active,
        u.created_at,
        (SELECT COUNT(*) FROM parent_student_links psl WHERE psl.parent_id = u.id) as total_children,
        (SELECT COUNT(*) FROM parent_student_links psl WHERE psl.parent_id = u.id AND psl.status = 'approved') as approved_children,
        (SELECT COUNT(*) FROM parent_student_links psl WHERE psl.parent_id = u.id AND psl.status = 'pending') as pending_children
      FROM users u
      WHERE u.role = 'parent'
    `;

        const params = [];

        if (search) {
            sql += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (status === 'active') {
            sql += ` AND u.is_active = 1`;
        } else if (status === 'inactive') {
            sql += ` AND u.is_active = 0`;
        }

        sql += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);

        const [parents] = await pool.execute(sql, params);

        // Get total count
        let countSql = `SELECT COUNT(*) as total FROM users WHERE role = 'parent'`;
        const countParams = [];
        if (search) {
            countSql += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        const [countResult] = await pool.execute(countSql, countParams);

        res.json({
            success: true,
            parents,
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching parents:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get parent details with linked students
router.get('/parents/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const [parents] = await pool.execute(`
      SELECT 
        u.*,
        r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ? AND u.role = 'parent'
    `, [id]);

        if (parents.length === 0) {
            return res.status(404).json({ success: false, message: 'Parent not found' });
        }

        const parent = parents[0];

        // Get linked students
        const [students] = await pool.execute(`
      SELECT 
        psl.id as link_id,
        psl.relationship_type,
        psl.status as link_status,
        psl.match_confidence,
        psl.linked_at,
        gss.id as student_id,
        gss.student_code,
        gss.first_name,
        gss.last_name,
        gss.trade_name,
        gss.trade_code,
        gss.level_number,
        gss.gender,
        gss.gpa,
        gss.attendance_percentage,
        gss.balance
      FROM parent_student_links psl
      JOIN global_student_sheets gss ON psl.student_id = gss.id
      WHERE psl.parent_id = ?
      ORDER BY psl.status, psl.linked_at DESC
    `, [id]);

        res.json({
            success: true,
            parent: {
                id: parent.id,
                username: parent.username,
                first_name: parent.first_name,
                last_name: parent.last_name,
                email: parent.email,
                phone: parent.phone,
                address: parent.address,
                province: parent.province,
                district: parent.district,
                sector: parent.sector,
                gender: parent.gender,
                date_of_birth: parent.date_of_birth,
                is_active: parent.is_active,
                created_at: parent.created_at,
                last_login: parent.last_login
            },
            linked_students: students
        });
    } catch (error) {
        console.error('Error fetching parent details:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get pending parent-student link requests
router.get('/pending-links', authenticateToken, async (req, res) => {
    try {
        const [links] = await pool.execute(`
      SELECT 
        psl.id as link_id,
        psl.relationship_type,
        psl.match_confidence,
        psl.created_at,
        u.id as parent_id,
        u.first_name as parent_first_name,
        u.last_name as parent_last_name,
        u.email as parent_email,
        u.phone as parent_phone,
        gss.id as student_id,
        gss.student_code,
        gss.first_name as student_first_name,
        gss.last_name as student_last_name,
        gss.trade_name,
        gss.trade_code,
        gss.level_number
      FROM parent_student_links psl
      JOIN users u ON psl.parent_id = u.id
      JOIN global_student_sheets gss ON psl.student_id = gss.id
      WHERE psl.status = 'pending'
      ORDER BY psl.created_at DESC
    `);

        res.json({
            success: true,
            pending_links: links,
            count: links.length
        });
    } catch (error) {
        console.error('Error fetching pending links:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Approve parent-student link
router.post('/links/:id/approve', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const approver_id = req.user.userId;

        // Update link status
        const [result] = await pool.execute(`
      UPDATE parent_student_links 
      SET status = 'approved', 
          verified_by = ?, 
          verified_at = NOW(),
          updated_at = NOW()
      WHERE id = ? AND status = 'pending'
    `, [approver_id, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Link not found or already processed'
            });
        }

        res.json({
            success: true,
            message: 'Parent-student link approved successfully'
        });
    } catch (error) {
        console.error('Error approving link:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Reject parent-student link
router.post('/links/:id/reject', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const rejector_id = req.user.userId;

        const [result] = await pool.execute(`
      UPDATE parent_student_links 
      SET status = 'rejected', 
          verified_by = ?, 
          verified_at = NOW(),
          rejection_reason = ?,
          updated_at = NOW()
      WHERE id = ? AND status = 'pending'
    `, [rejector_id, reason || 'Not specified', id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Link not found or already processed'
            });
        }

        res.json({
            success: true,
            message: 'Parent-student link rejected'
        });
    } catch (error) {
        console.error('Error rejecting link:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create manual parent-student link
router.post('/links/create', authenticateToken, async (req, res) => {
    try {
        const { parent_id, student_id, relationship_type } = req.body;
        const creator_id = req.user.userId;

        // Verify parent exists
        const [parent] = await pool.execute(
            'SELECT id FROM users WHERE id = ? AND role = "parent"',
            [parent_id]
        );

        if (parent.length === 0) {
            return res.status(404).json({ success: false, message: 'Parent not found' });
        }

        // Verify student exists in global_student_sheets
        const [student] = await pool.execute(
            'SELECT id FROM global_student_sheets WHERE id = ? AND status = "active"',
            [student_id]
        );

        if (student.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Check if link already exists
        const [existing] = await pool.execute(
            'SELECT id, status FROM parent_student_links WHERE parent_id = ? AND student_id = ?',
            [parent_id, student_id]
        );

        if (existing.length > 0) {
            if (existing[0].status === 'approved') {
                return res.status(400).json({ success: false, message: 'Link already exists and is approved' });
            }
            // Update existing link
            await pool.execute(`
        UPDATE parent_student_links 
        SET status = 'approved', 
            relationship_type = ?,
            verified_by = ?, 
            verified_at = NOW(),
            updated_at = NOW()
        WHERE id = ?
      `, [relationship_type || 'Parent', creator_id, existing[0].id]);

            return res.json({
                success: true,
                message: 'Existing link updated and approved'
            });
        }

        // Create new approved link
        await pool.execute(`
      INSERT INTO parent_student_links (
        parent_id, student_id, relationship_type, status,
        match_confidence, verified_by, verified_at, linked_at, created_at
      ) VALUES (?, ?, ?, 'approved', 100.00, ?, NOW(), NOW(), NOW())
    `, [parent_id, student_id, relationship_type || 'Parent', creator_id]);

        res.json({
            success: true,
            message: 'Parent-student link created successfully'
        });
    } catch (error) {
        console.error('Error creating link:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Remove parent-student link
router.delete('/links/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute(
            'DELETE FROM parent_student_links WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Link not found' });
        }

        res.json({
            success: true,
            message: 'Parent-student link removed'
        });
    } catch (error) {
        console.error('Error removing link:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Activate/Deactivate parent account
router.put('/parents/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        const [result] = await pool.execute(
            'UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ? AND role = "parent"',
            [is_active ? 1 : 0, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Parent not found' });
        }

        res.json({
            success: true,
            message: `Parent account ${is_active ? 'activated' : 'deactivated'}`
        });
    } catch (error) {
        console.error('Error updating parent status:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get parent statistics
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const [stats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'parent') as total_parents,
        (SELECT COUNT(*) FROM users WHERE role = 'parent' AND is_active = 1) as active_parents,
        (SELECT COUNT(*) FROM parent_student_links WHERE status = 'approved') as approved_links,
        (SELECT COUNT(*) FROM parent_student_links WHERE status = 'pending') as pending_links,
        (SELECT COUNT(*) FROM parent_student_links WHERE status = 'rejected') as rejected_links
    `);

        res.json({
            success: true,
            stats: stats[0]
        });
    } catch (error) {
        console.error('Error fetching parent stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Search students for linking
router.get('/search-students', authenticateToken, async (req, res) => {
    try {
        const { query, trade, level } = req.query;

        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        let sql = `
      SELECT 
        id,
        student_code,
        first_name,
        last_name,
        trade_name,
        trade_code,
        level_number,
        gender
      FROM global_student_sheets
      WHERE status = 'active'
        AND (first_name LIKE ? OR last_name LIKE ? OR student_code LIKE ? OR CONCAT(first_name, ' ', last_name) LIKE ?)
    `;

        const params = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];

        if (trade) {
            sql += ` AND trade_code = ?`;
            params.push(trade);
        }

        if (level) {
            sql += ` AND level_number = ?`;
            params.push(parseInt(level));
        }

        sql += ` ORDER BY first_name, last_name LIMIT 20`;

        const [students] = await pool.execute(sql, params);

        res.json({
            success: true,
            students,
            count: students.length
        });
    } catch (error) {
        console.error('Error searching students:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
