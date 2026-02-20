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

// Get all parent linking requests - NEW ENDPOINT
router.get('/linking-requests', authenticateToken, async (req, res) => {
    try {
        const { status, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        let sql = `
      SELECT 
        plr.id,
        plr.student_first_name as student_name,
        plr.student_id as student_code,
        plr.level_number as level,
        plr.trade_code as trade,
        plr.relationship as message,
        plr.created_at,
        plr.updated_at,
        u.id as parent_id,
        u.first_name as parent_first_name,
        u.last_name as parent_last_name,
        u.email as parent_email,
        u.phone as parent_phone
      FROM parent_student_link_requests plr
      JOIN users u ON plr.parent_id = u.id
      WHERE 1=1
    `;

        const params = [];

        if (status && status !== 'all') {
            sql += ` AND plr.status = ?`;
            params.push(status);
        }

        sql += ` ORDER BY plr.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);

        const [requests] = await pool.execute(sql, params);

        let countSql = `SELECT COUNT(*) as total FROM parent_student_link_requests`;
        if (status && status !== 'all') {
            countSql += ` WHERE status = ?`;
        }
        const [countResult] = await pool.execute(countSql, status && status !== 'all' ? [status] : []);

        res.json({
            success: true,
            requests,
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching linking requests:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Respond to parent linking request - NEW ENDPOINT
router.post('/linking-requests/:id/respond', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { student_code, response_message, action } = req.body;
        const responder_id = req.user.userId;

        await pool.execute(`
      UPDATE parent_student_link_requests 
      SET status = ?, 
          student_id = COALESCE(?, student_id),
          rejection_reason = ?,
          approved_by = ?,
          approved_at = NOW(),
          updated_at = NOW()
      WHERE id = ?
    `, [action === 'approve' ? 'approved' : 'rejected', student_code || null, response_message, responder_id, id]);

        if (action === 'approve' && student_code) {
            const [request] = await pool.execute(
                'SELECT parent_id, student_first_name as student_name FROM parent_student_link_requests WHERE id = ?',
                [id]
            );

            if (request.length > 0) {
                const [student] = await pool.execute(
                    'SELECT id FROM global_student_sheets WHERE student_code = ? AND status = "active"',
                    [student_code]
                );

                if (student.length > 0) {
                    const [existing] = await pool.execute(
                        'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ?',
                        [request[0].parent_id, student[0].id]
                    );

                    if (existing.length === 0) {
                        await pool.execute(`
                  INSERT INTO parent_student_links (
                    parent_id, student_id, relationship_type, status,
                    match_confidence, verified_by, verified_at, linked_at, created_at
                  ) VALUES (?, ?, 'Parent', 'approved', 100.00, ?, NOW(), NOW(), NOW())
                `, [request[0].parent_id, student[0].id, responder_id]);
                    }
                }

                const notificationMessage = `Your linking request for student "${request[0].student_name}" has been approved!`;
                try {
                  await pool.execute(
                      'INSERT INTO notifications (user_id, message, created_at) VALUES (?, ?, NOW())',
                      [request[0].parent_id, notificationMessage]
                  );
                } catch (e) {
                  // Notifications table may not support this, skip
                }
            }
        }

        res.json({
            success: true,
            message: `Link request ${action === 'approve' ? 'approved' : 'rejected'} successfully`
        });
    } catch (error) {
        console.error('Error responding to linking request:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get parent linking analytics - NEW ENDPOINT
router.get('/analytics', authenticateToken, async (req, res) => {
    try {
        const [statusBreakdown] = await pool.execute(`
      SELECT status, COUNT(*) as count 
      FROM parent_student_links 
      GROUP BY status
    `);

        const [monthlyTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM parent_student_links
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `);

        const [relationshipTypes] = await pool.execute(`
      SELECT relationship_type, COUNT(*) as count 
      FROM parent_student_links 
      GROUP BY relationship_type
    `);

        const [tradeDistribution] = await pool.execute(`
      SELECT 
        gss.trade_name,
        COUNT(*) as count
      FROM parent_student_links psl
      JOIN global_student_sheets gss ON psl.student_id = gss.id
      GROUP BY gss.trade_name
      ORDER BY count DESC
      LIMIT 10
    `);

        const [avgConfidence] = await pool.execute(`
      SELECT AVG(match_confidence) as avg_confidence FROM parent_student_links
    `);

        res.json({
            success: true,
            analytics: {
                status_breakdown: statusBreakdown,
                monthly_trends: monthlyTrends,
                relationship_types: relationshipTypes,
                trade_distribution: tradeDistribution,
                average_confidence: avgConfidence[0]?.avg_confidence || 0
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get parent linking conflicts - NEW ENDPOINT
router.get('/conflicts', authenticateToken, async (req, res) => {
    try {
        const [conflicts] = await pool.execute(`
      SELECT 
        student_id,
        COUNT(*) as parent_count,
        GROUP_CONCAT(parent_id) as parent_ids
      FROM parent_student_links
      WHERE status = 'approved'
      GROUP BY student_id
      HAVING parent_count > 1
    `);

        const conflictsWithDetails = await Promise.all(conflicts.map(async (c) => {
            const [student] = await pool.execute(
                'SELECT student_code, first_name, last_name, trade_name FROM global_student_sheets WHERE id = ?',
                [c.student_id]
            );

            const parentIds = c.parent_ids.split(',');
            const [parents] = await pool.execute(
                `SELECT id, first_name, last_name, phone, email 
             FROM users WHERE id IN (${parentIds.map(() => '?').join(',')})`,
                parentIds
            );

            return {
                student: student[0] || null,
                parents,
                parent_count: c.parent_count
            };
        }));

        res.json({
            success: true,
            conflicts: conflictsWithDetails
        });
    } catch (error) {
        console.error('Error fetching conflicts:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Resolve conflict by keeping one parent - NEW ENDPOINT
router.post('/conflicts/:studentId/resolve', authenticateToken, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { keep_parent_id, remove_other_links } = req.body;
        const resolver_id = req.user.userId;

        if (remove_other_links) {
            await pool.execute(`
          DELETE FROM parent_student_links 
          WHERE student_id = ? AND parent_id != ?
        `, [studentId, keep_parent_id]);
        }

        await pool.execute(`
          INSERT INTO parent_student_links (
            parent_id, student_id, relationship_type, status,
            match_confidence, verified_by, verified_at, linked_at, created_at
          ) VALUES (?, ?, 'Conflict Resolution', 'approved', 100.00, ?, NOW(), NOW(), NOW())
          ON DUPLICATE KEY UPDATE status = 'approved', verified_by = ?, verified_at = NOW()
        `, [keep_parent_id, studentId, resolver_id, resolver_id]);

        res.json({
            success: true,
            message: 'Conflict resolved successfully'
        });
    } catch (error) {
        console.error('Error resolving conflict:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get parent activity log - NEW ENDPOINT
router.get('/activity/:parentId', authenticateToken, async (req, res) => {
    try {
        const { parentId } = req.params;
        const { limit = 50 } = req.query;

        const [linkActivity] = await pool.execute(`
      SELECT 
        'link' as activity_type,
        psl.id as reference_id,
        psl.status,
        psl.created_at,
        psl.linked_at,
        psl.verified_at
      FROM parent_student_links psl
      WHERE psl.parent_id = ?
      ORDER BY psl.created_at DESC
      LIMIT ?
    `, [parentId, parseInt(limit)]);

        const [requestActivity] = await pool.execute(`
      SELECT 
        'request' as activity_type,
        plr.id as reference_id,
        plr.status,
        plr.created_at,
        plr.approved_at as verified_at
      FROM parent_student_link_requests plr
      WHERE plr.parent_id = ?
      ORDER BY plr.created_at DESC
      LIMIT ?
    `, [parentId, parseInt(limit)]);

        const allActivity = [...linkActivity, ...requestActivity].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, parseInt(limit));

        res.json({
            success: true,
            activity: allActivity
        });
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Bulk operations - NEW ENDPOINT
router.post('/bulk-action', authenticateToken, async (req, res) => {
    try {
        const { action, parent_ids, link_ids, reason } = req.body;
        const actor_id = req.user.userId;

        let result = { success: true, affected: 0 };

        if (action === 'activate' && parent_ids) {
            const placeholders = parent_ids.map(() => '?').join(',');
            const [updateResult] = await pool.execute(
                `UPDATE users SET is_active = 1, updated_at = NOW() WHERE id IN (${placeholders}) AND role = 'parent'`,
                parent_ids
            );
            result.affected = updateResult.affectedRows;
        } else if (action === 'deactivate' && parent_ids) {
            const placeholders = parent_ids.map(() => '?').join(',');
            const [updateResult] = await pool.execute(
                `UPDATE users SET is_active = 0, updated_at = NOW() WHERE id IN (${placeholders}) AND role = 'parent'`,
                parent_ids
            );
            result.affected = updateResult.affectedRows;
        } else if (action === 'approve_links' && link_ids) {
            const placeholders = link_ids.map(() => '?').join(',');
            const [updateResult] = await pool.execute(
                `UPDATE parent_student_links SET status = 'approved', verified_by = ?, verified_at = NOW(), updated_at = NOW() WHERE id IN (${placeholders})`,
                [actor_id, ...link_ids]
            );
            result.affected = updateResult.affectedRows;
        } else if (action === 'reject_links' && link_ids) {
            const placeholders = link_ids.map(() => '?').join(',');
            const [updateResult] = await pool.execute(
                `UPDATE parent_student_links SET status = 'rejected', verified_by = ?, verified_at = NOW(), rejection_reason = ?, updated_at = NOW() WHERE id IN (${placeholders})`,
                [actor_id, reason || 'Not specified', ...link_ids]
            );
            result.affected = updateResult.affectedRows;
        }

        res.json({
            success: true,
            message: `${result.affected} item(s) ${action} successfully`,
            affected: result.affected
        });
    } catch (error) {
        console.error('Error performing bulk action:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Export parent links - NEW ENDPOINT
router.get('/export', authenticateToken, async (req, res) => {
    try {
        const { format = 'json', status } = req.query;

        let sql = `
      SELECT 
        u.id as parent_id,
        u.first_name as parent_first_name,
        u.last_name as parent_last_name,
        u.email as parent_email,
        u.phone as parent_phone,
        u.is_active as parent_active,
        gss.id as student_id,
        gss.student_code,
        gss.first_name as student_first_name,
        gss.last_name as student_last_name,
        gss.trade_name,
        gss.level_number,
        psl.relationship_type,
        psl.status as link_status,
        psl.match_confidence,
        psl.linked_at
      FROM parent_student_links psl
      JOIN users u ON psl.parent_id = u.id
      JOIN global_student_sheets gss ON psl.student_id = gss.id
      WHERE u.role = 'parent'
    `;

        const params = [];

        if (status && status !== 'all') {
            sql += ` AND psl.status = ?`;
            params.push(status);
        }

        sql += ` ORDER BY psl.linked_at DESC`;

        const [links] = await pool.execute(sql, params);

        if (format === 'csv') {
            const headers = Object.keys(links[0] || {}).join(',');
            const rows = links.map(link => Object.values(link).join(',')).join('\n');
            const csv = `${headers}\n${rows}`;

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=parent-links.csv');
            return res.send(csv);
        }

        res.json({
            success: true,
            links,
            total: links.length
        });
    } catch (error) {
        console.error('Error exporting links:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
