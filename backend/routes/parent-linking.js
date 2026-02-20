const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Import African Talking SMS Service for real SMS notifications
const { sendSMS, isReady: isSMSReady } = require('../services/africanTalkingService');

// ============================================================
// CORE LINK MANAGEMENT
// ============================================================

// GET /api/parent-linking/links - Get all links with advanced filtering
router.get('/links', authenticateToken, async (req, res) => {
  try {
    const {
      status,
      parent_id,
      student_id,
      relationship_type,
      min_confidence,
      max_confidence,
      page = 1,
      limit = 50,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    let sql = `
            SELECT 
                psl.*,
                CONCAT(p.first_name, ' ', p.last_name) as parent_name,
                p.email as parent_email,
                p.phone as parent_phone,
                CONCAT(s.first_name, ' ', s.last_name) as student_name,
                s.student_id as student_number,
                s.trade_code,
                s.level,
                COALESCE(t.name, s.trade_code) as trade_name
            FROM parent_student_links psl
            INNER JOIN users p ON psl.parent_id = p.id
            INNER JOIN users s ON psl.student_id = s.id
            LEFT JOIN trades t ON s.trade_code = t.code
            WHERE 1=1
        `;

    const params = [];

    if (status) {
      sql += ` AND psl.status = ?`;
      params.push(status);
    }
    if (parent_id) {
      sql += ` AND psl.parent_id = ?`;
      params.push(parent_id);
    }
    if (student_id) {
      sql += ` AND psl.student_id = ?`;
      params.push(student_id);
    }
    if (relationship_type) {
      sql += ` AND psl.relationship_type = ?`;
      params.push(relationship_type);
    }
    if (min_confidence) {
      sql += ` AND psl.match_confidence >= ?`;
      params.push(parseFloat(min_confidence));
    }
    if (max_confidence) {
      sql += ` AND psl.match_confidence <= ?`;
      params.push(parseFloat(max_confidence));
    }

    // Get total count
    const countSql = sql.replace(/SELECT .*? FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.execute(countSql, params);
    const total = countResult[0].total;

    // Add sorting and pagination
    const validSortFields = ['created_at', 'match_confidence', 'status', 'linked_at'];
    const sortField = validSortFields.includes(sort_by) ? `psl.${sort_by}` : 'psl.created_at';
    const order = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY ${sortField} ${order}`;
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [links] = await pool.execute(sql, params);

    res.json({
      success: true,
      data: links,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch links',
      error: error.message
    });
  }
});

// GET /api/parent-linking/links/:id - Get specific link details
router.get('/links/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [links] = await pool.execute(`
            SELECT 
                psl.*,
                CONCAT(p.first_name, ' ', p.last_name) as parent_name,
                p.email as parent_email,
                p.phone as parent_phone,
                p.address as parent_address,
                CONCAT(s.first_name, ' ', s.last_name) as student_name,
                s.student_id as student_number,
                s.trade_code,
                s.level,
                s.email as student_email,
                t.name as trade_name
            FROM parent_student_links psl
            INNER JOIN users p ON psl.parent_id = p.id
            INNER JOIN users s ON psl.student_id = s.id
            LEFT JOIN trades t ON s.trade_code = t.code
            WHERE psl.id = ?
        `, [id]);

    if (links.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }

    // Get activity history
    const [activity] = await pool.execute(`
            SELECT * FROM parent_student_link_activity
            WHERE link_id = ?
            ORDER BY created_at DESC
        `, [id]);

    res.json({
      success: true,
      link: links[0],
      activity
    });
  } catch (error) {
    console.error('Get link details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch link details',
      error: error.message
    });
  }
});

// POST /api/parent-linking/links - Create new link
router.post('/links', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      parent_id,
      student_id,
      relationship_type = 'Parent',
      match_confidence = 100,
      notes
    } = req.body;

    // Validate parent exists
    const [parent] = await connection.execute(
      'SELECT id FROM users WHERE id = ? AND role = "parent"',
      [parent_id]
    );
    if (parent.length === 0) {
      throw new Error('Parent not found');
    }

    // Validate student exists
    const [student] = await connection.execute(
      'SELECT id FROM users WHERE id = ? AND role = "student"',
      [student_id]
    );
    if (student.length === 0) {
      throw new Error('Student not found');
    }

    // Check if link already exists
    const [existing] = await connection.execute(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ?',
      [parent_id, student_id]
    );
    if (existing.length > 0) {
      throw new Error('Link already exists');
    }

    // Create link
    const [result] = await connection.execute(`
            INSERT INTO parent_student_links (
                parent_id, student_id, relationship_type, status,
                match_confidence, match_metadata, linked_at
            ) VALUES (?, ?, ?, 'active', ?, ?, NOW())
        `, [
      parent_id,
      student_id,
      relationship_type,
      match_confidence,
      JSON.stringify({ manually_created: true, created_by: req.user.userId, notes })
    ]);

    const linkId = result.insertId;

    // Log activity
    await connection.execute(`
            INSERT INTO parent_student_link_activity (link_id, action, details)
            VALUES (?, 'created', ?)
        `, [linkId, `Link created by user ${req.user.userId}`]);

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Link created successfully',
      link_id: linkId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create link error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create link'
    });
  } finally {
    connection.release();
  }
});

// PUT /api/parent-linking/links/:id - Update link
router.put('/links/:id', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { status, relationship_type, notes } = req.body;

    const [existing] = await connection.execute(
      'SELECT * FROM parent_student_links WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      throw new Error('Link not found');
    }

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (relationship_type) {
      updates.push('relationship_type = ?');
      params.push(relationship_type);
    }
    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    await connection.execute(
      `UPDATE parent_student_links SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Log activity
    await connection.execute(`
            INSERT INTO parent_student_link_activity (link_id, action, details)
            VALUES (?, 'updated', ?)
        `, [id, notes || `Link updated by user ${req.user.userId}`]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Link updated successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update link error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update link'
    });
  } finally {
    connection.release();
  }
});

// DELETE /api/parent-linking/links/:id - Remove link
router.delete('/links/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { reason } = req.body;

    const [existing] = await connection.execute(
      'SELECT * FROM parent_student_links WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      throw new Error('Link not found');
    }

    // Log activity before deletion
    await connection.execute(`
            INSERT INTO parent_student_link_activity (link_id, action, details)
            VALUES (?, 'deleted', ?)
        `, [id, reason || `Link deleted by user ${req.user.userId}`]);

    // Soft delete by setting status to 'deleted'
    await connection.execute(
      'UPDATE parent_student_links SET status = ?, updated_at = NOW() WHERE id = ?',
      ['deleted', id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Link deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Delete link error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete link'
    });
  } finally {
    connection.release();
  }
});

// GET /api/parent-linking/parent/:parent_id/students - Get all students for a parent
router.get('/parent/:parent_id/students', authenticateToken, async (req, res) => {
  try {
    const { parent_id } = req.params;

    const [students] = await pool.execute(`
            SELECT 
                s.id,
                s.first_name,
                s.last_name,
                s.student_id,
                s.trade_code,
                s.level,
                s.email,
                s.phone,
                t.name as trade_name,
                psl.id as link_id,
                psl.relationship_type,
                psl.status,
                psl.match_confidence,
                psl.linked_at
            FROM parent_student_links psl
            INNER JOIN users s ON psl.student_id = s.id
            LEFT JOIN trades t ON s.trade_code = t.code
            WHERE psl.parent_id = ? AND psl.status IN ('active', 'pending')
            ORDER BY s.first_name, s.last_name
        `, [parent_id]);

    res.json({
      success: true,
      students,
      count: students.length
    });
  } catch (error) {
    console.error('Get parent students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
});

// GET /api/parent-linking/student/:student_id/parents - Get all parents for a student
router.get('/student/:student_id/parents', authenticateToken, async (req, res) => {
  try {
    const { student_id } = req.params;

    const [parents] = await pool.execute(`
            SELECT 
                p.id,
                p.first_name,
                p.last_name,
                p.email,
                p.phone,
                p.address,
                psl.id as link_id,
                psl.relationship_type,
                psl.status,
                psl.match_confidence,
                psl.linked_at
            FROM parent_student_links psl
            INNER JOIN users p ON psl.parent_id = p.id
            WHERE psl.student_id = ? AND psl.status IN ('active', 'pending')
            ORDER BY p.first_name, p.last_name
        `, [student_id]);

    res.json({
      success: true,
      parents,
      count: parents.length
    });
  } catch (error) {
    console.error('Get student parents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch parents',
      error: error.message
    });
  }
});

// ============================================================
// APPROVAL & VERIFICATION
// ============================================================

// GET /api/parent-linking/pending - Get all pending link requests
router.get('/pending', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const [links] = await pool.execute(`
            SELECT 
                psl.*,
                CONCAT(p.first_name, ' ', p.last_name) as parent_name,
                p.email as parent_email,
                p.phone as parent_phone,
                CONCAT(s.first_name, ' ', s.last_name) as student_name,
                s.student_id as student_number,
                s.trade_code,
                s.level,
                t.name as trade_name
            FROM parent_student_links psl
            INNER JOIN users p ON psl.parent_id = p.id
            INNER JOIN users s ON psl.student_id = s.id
            LEFT JOIN trades t ON s.trade_code = t.code
            WHERE psl.status = 'pending'
            ORDER BY psl.created_at DESC
            LIMIT ? OFFSET ?
        `, [parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]);

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM parent_student_links WHERE status = ?',
      ['pending']
    );

    res.json({
      success: true,
      data: links,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get pending links error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending links',
      error: error.message
    });
  }
});

// POST /api/parent-linking/approve/:id - Approve link request
router.post('/approve/:id', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { notes } = req.body;

    await connection.execute(
      'UPDATE parent_student_links SET status = ?, linked_at = NOW(), updated_at = NOW() WHERE id = ?',
      ['active', id]
    );

    await connection.execute(`
            INSERT INTO parent_student_link_activity (link_id, action, details)
            VALUES (?, 'approved', ?)
        `, [id, notes || `Approved by user ${req.user.userId}`]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Link approved successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Approve link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve link',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// POST /api/parent-linking/reject/:id - Reject link request
router.post('/reject/:id', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { reason } = req.body;

    await connection.execute(
      'UPDATE parent_student_links SET status = ?, updated_at = NOW() WHERE id = ?',
      ['rejected', id]
    );

    await connection.execute(`
            INSERT INTO parent_student_link_activity (link_id, action, details)
            VALUES (?, 'rejected', ?)
        `, [id, reason || `Rejected by user ${req.user.userId}`]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Link rejected successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Reject link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject link',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// POST /api/parent-linking/bulk-approve - Bulk approve links
router.post('/bulk-approve', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { link_ids } = req.body;

    if (!Array.isArray(link_ids) || link_ids.length === 0) {
      throw new Error('link_ids must be a non-empty array');
    }

    const placeholders = link_ids.map(() => '?').join(',');

    await connection.execute(
      `UPDATE parent_student_links SET status = 'active', linked_at = NOW(), updated_at = NOW() WHERE id IN (${placeholders})`,
      link_ids
    );

    // Log activities
    for (const linkId of link_ids) {
      await connection.execute(`
                INSERT INTO parent_student_link_activity (link_id, action, details)
                VALUES (?, 'bulk_approved', ?)
            `, [linkId, `Bulk approved by user ${req.user.userId}`]);
    }

    await connection.commit();

    res.json({
      success: true,
      message: `${link_ids.length} links approved successfully`,
      count: link_ids.length
    });
  } catch (error) {
    await connection.rollback();
    console.error('Bulk approve error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve links'
    });
  } finally {
    connection.release();
  }
});

// POST /api/parent-linking/bulk-reject - Bulk reject links
router.post('/bulk-reject', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { link_ids, reason } = req.body;

    if (!Array.isArray(link_ids) || link_ids.length === 0) {
      throw new Error('link_ids must be a non-empty array');
    }

    const placeholders = link_ids.map(() => '?').join(',');

    await connection.execute(
      `UPDATE parent_student_links SET status = 'rejected', updated_at = NOW() WHERE id IN (${placeholders})`,
      link_ids
    );

    // Log activities
    for (const linkId of link_ids) {
      await connection.execute(`
                INSERT INTO parent_student_link_activity (link_id, action, details)
                VALUES (?, 'bulk_rejected', ?)
            `, [linkId, reason || `Bulk rejected by user ${req.user.userId}`]);
    }

    await connection.commit();

    res.json({
      success: true,
      message: `${link_ids.length} links rejected successfully`,
      count: link_ids.length
    });
  } catch (error) {
    await connection.rollback();
    console.error('Bulk reject error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject links'
    });
  } finally {
    connection.release();
  }
});

// ============================================================
// ADVANCED SEARCH & ANALYTICS
// ============================================================

// POST /api/parent-linking/search - Advanced search with filters
router.post('/search', authenticateToken, async (req, res) => {
  try {
    const {
      parent_name,
      student_name,
      parent_phone,
      student_number,
      trade_code,
      level,
      status,
      date_from,
      date_to,
      page = 1,
      limit = 20
    } = req.body;

    let sql = `
            SELECT 
                psl.*,
                CONCAT(p.first_name, ' ', p.last_name) as parent_name,
                p.email as parent_email,
                p.phone as parent_phone,
                CONCAT(s.first_name, ' ', s.last_name) as student_name,
                s.student_id as student_number,
                s.trade_code,
                s.level,
                COALESCE(t.name, s.trade_code) as trade_name
            FROM parent_student_links psl
            INNER JOIN users p ON psl.parent_id = p.id
            INNER JOIN users s ON psl.student_id = s.id
            LEFT JOIN trades t ON s.trade_code = t.code
            WHERE 1=1
        `;

    const params = [];

    if (parent_name) {
      sql += ` AND CONCAT(p.first_name, ' ', p.last_name) LIKE ?`;
      params.push(`%${parent_name}%`);
    }
    if (student_name) {
      sql += ` AND CONCAT(s.first_name, ' ', s.last_name) LIKE ?`;
      params.push(`%${student_name}%`);
    }
    if (parent_phone) {
      sql += ` AND p.phone LIKE ?`;
      params.push(`%${parent_phone}%`);
    }
    if (student_number) {
      sql += ` AND s.student_id LIKE ?`;
      params.push(`%${student_number}%`);
    }
    if (trade_code) {
      sql += ` AND s.trade_code = ?`;
      params.push(trade_code);
    }
    if (level) {
      sql += ` AND s.level = ?`;
      params.push(level);
    }
    if (status) {
      sql += ` AND psl.status = ?`;
      params.push(status);
    }
    if (date_from) {
      sql += ` AND psl.created_at >= ?`;
      params.push(date_from);
    }
    if (date_to) {
      sql += ` AND psl.created_at <= ?`;
      params.push(date_to);
    }

    // Get total count
    const countSql = sql.replace(/SELECT .*? FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.execute(countSql, params);
    const total = countResult[0].total;

    // Add pagination
    sql += ` ORDER BY psl.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [results] = await pool.execute(sql, params);

    res.json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search links',
      error: error.message
    });
  }
});

// GET /api/parent-linking/analytics - Link statistics and analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    // Total links by status
    const [statusStats] = await pool.execute(`
            SELECT status, COUNT(*) as count
            FROM parent_student_links
            GROUP BY status
        `);

    // Links created per month (last 12 months)
    const [monthlyStats] = await pool.execute(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as count
            FROM parent_student_links
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        `);

    // Average confidence scores
    const [confidenceStats] = await pool.execute(`
            SELECT 
                AVG(match_confidence) as avg_confidence,
                MIN(match_confidence) as min_confidence,
                MAX(match_confidence) as max_confidence
            FROM parent_student_links
            WHERE status IN ('approved', 'pending')
        `);

    // Top relationship types
    const [relationshipStats] = await pool.execute(`
            SELECT relationship_type, COUNT(*) as count
            FROM parent_student_links
            WHERE status = 'approved'
            GROUP BY relationship_type
            ORDER BY count DESC
            LIMIT 10
        `);

    // Links by trade
    const [tradeStats] = await pool.execute(`
            SELECT 
                COALESCE(t.name, s.trade_code) as trade_name,
                COUNT(psl.id) as count
            FROM parent_student_links psl
            INNER JOIN users s ON psl.student_id = s.id
            LEFT JOIN trades t ON s.trade_code = t.code
            WHERE psl.status = 'approved'
            GROUP BY s.trade_code
            ORDER BY count DESC
        `);

    // Links by level
    const [levelStats] = await pool.execute(`
            SELECT 
                s.level,
                COUNT(psl.id) as count
            FROM parent_student_links psl
            INNER JOIN users s ON psl.student_id = s.id
            WHERE psl.status = 'approved'
            GROUP BY s.level
            ORDER BY s.level
        `);

    res.json({
      success: true,
      analytics: {
        status_breakdown: statusStats,
        monthly_trends: monthlyStats,
        confidence_metrics: confidenceStats[0],
        relationship_types: relationshipStats,
        trade_distribution: tradeStats,
        level_distribution: levelStats
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

// GET /api/parent-linking/activity/:id - Get link activity history
router.get('/activity/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [activity] = await pool.execute(`
            SELECT * FROM parent_student_link_activity
            WHERE link_id = ?
            ORDER BY created_at DESC
        `, [id]);

    res.json({
      success: true,
      activity
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity',
      error: error.message
    });
  }
});

// GET /api/parent-linking/stats/dashboard - Dashboard statistics
router.get('/stats/dashboard', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    // Total links
    const [totalResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM parent_student_links'
    );

    // Pending links
    const [pendingResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM parent_student_links WHERE status = ?',
      ['pending']
    );

    // Approved links (active)
    const [activeResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM parent_student_links WHERE status = ?',
      ['approved']
    );

    // Rejected links
    const [rejectedResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM parent_student_links WHERE status = ?',
      ['rejected']
    );

    // Recent links (last 7 days)
    const [recentResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM parent_student_links WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
    );

    // Total parents
    const [parentsResult] = await pool.execute(
      "SELECT COUNT(DISTINCT parent_id) as total FROM parent_student_links"
    );

    // Total students linked
    const [studentsResult] = await pool.execute(
      "SELECT COUNT(DISTINCT student_id) as total FROM parent_student_links WHERE status = 'approved'"
    );

    // Links by trade
    const [tradeStats] = await pool.execute(`
      SELECT 
        COALESCE(t.name, u.trade_code) as trade_name,
        COUNT(*) as count
      FROM parent_student_links psl
      JOIN users u ON psl.student_id = u.id
      LEFT JOIN trades t ON u.trade_code = t.code
      WHERE psl.status = 'approved'
      GROUP BY u.trade_code
    `);

    // Links by relationship type
    const [relationshipStats] = await pool.execute(`
      SELECT 
        relationship_type,
        COUNT(*) as count
      FROM parent_student_links
      WHERE status = 'approved'
      GROUP BY relationship_type
    `);

    res.json({
      success: true,
      stats: {
        total: totalResult[0].total,
        pending: pendingResult[0].total,
        active: activeResult[0].total,
        rejected: rejectedResult[0].total,
        recent_7days: recentResult[0].total,
        total_parents: parentsResult[0].total,
        total_linked_students: studentsResult[0].total,
        by_trade: tradeStats,
        by_relationship: relationshipStats
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
});

// ============================================================
// ADMIN MANAGEMENT
// ============================================================

// GET /api/parent-linking/admin/overview - Admin overview
router.get('/admin/overview', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    // Get comprehensive overview
    const [stats] = await pool.execute(`
            SELECT 
                COUNT(*) as total_links,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_links,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_links,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_links,
                AVG(match_confidence) as avg_confidence
            FROM parent_student_links
        `);

    // Recent activity
    const [recentActivity] = await pool.execute(`
            SELECT 
                psla.*,
                psl.parent_id,
                psl.student_id,
                CONCAT(p.first_name, ' ', p.last_name) as parent_name,
                CONCAT(s.first_name, ' ', s.last_name) as student_name
            FROM parent_student_link_activity psla
            INNER JOIN parent_student_links psl ON psla.link_id = psl.id
            INNER JOIN users p ON psl.parent_id = p.id
            INNER JOIN users s ON psl.student_id = s.id
            ORDER BY psla.created_at DESC
            LIMIT 20
        `);

    res.json({
      success: true,
      overview: stats[0],
      recent_activity: recentActivity
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin overview',
      error: error.message
    });
  }
});

// GET /api/parent-linking/admin/conflicts - Detect conflicts
router.get('/admin/conflicts', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    // Find students with multiple active parent links
    const [multipleParents] = await pool.execute(`
            SELECT 
                s.id as student_id,
                CONCAT(s.first_name, ' ', s.last_name) as student_name,
                s.student_id as student_number,
                COUNT(psl.id) as parent_count,
                GROUP_CONCAT(CONCAT(p.first_name, ' ', p.last_name) SEPARATOR ', ') as parent_names
            FROM users s
            INNER JOIN parent_student_links psl ON s.id = psl.student_id
            INNER JOIN users p ON psl.parent_id = p.id
            WHERE s.role = 'student' AND psl.status = 'active'
            GROUP BY s.id
            HAVING COUNT(psl.id) > 2
        `);

    // Find duplicate pending requests
    const [duplicates] = await pool.execute(`
            SELECT 
                parent_id,
                student_id,
                COUNT(*) as count,
                GROUP_CONCAT(id) as link_ids
            FROM parent_student_links
            WHERE status = 'pending'
            GROUP BY parent_id, student_id
            HAVING COUNT(*) > 1
        `);

    res.json({
      success: true,
      conflicts: {
        multiple_parents: multipleParents,
        duplicate_requests: duplicates
      }
    });
  } catch (error) {
    console.error('Conflicts detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to detect conflicts',
      error: error.message
    });
  }
});

// POST /api/parent-linking/admin/force-link - Force create link (admin only)
router.post('/admin/force-link', authenticateToken, requireRole(['admin']), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { parent_id, student_id, relationship_type, reason } = req.body;

    // Create link with admin override
    const [result] = await connection.execute(`
            INSERT INTO parent_student_links (
                parent_id, student_id, relationship_type, status,
                match_confidence, match_metadata, linked_at
            ) VALUES (?, ?, ?, 'active', 100, ?, NOW())
        `, [
      parent_id,
      student_id,
      relationship_type,
      JSON.stringify({ admin_forced: true, created_by: req.user.userId, reason })
    ]);

    const linkId = result.insertId;

    // Log activity
    await connection.execute(`
            INSERT INTO parent_student_link_activity (link_id, action, details)
            VALUES (?, 'force_linked', ?)
        `, [linkId, `Force linked by admin ${req.user.userId}: ${reason}`]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Link force created successfully',
      link_id: linkId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Force link error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to force create link'
    });
  } finally {
    connection.release();
  }
});

// GET /api/parent-linking/admin/audit-log - Audit trail
router.get('/admin/audit-log', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { page = 1, limit = 50, action } = req.query;

    let sql = `
            SELECT 
                psla.*,
                psl.parent_id,
                psl.student_id,
                CONCAT(p.first_name, ' ', p.last_name) as parent_name,
                CONCAT(s.first_name, ' ', s.last_name) as student_name
            FROM parent_student_link_activity psla
            INNER JOIN parent_student_links psl ON psla.link_id = psl.id
            INNER JOIN users p ON psl.parent_id = p.id
            INNER JOIN users s ON psl.student_id = s.id
            WHERE 1=1
        `;

    const params = [];

    if (action) {
      sql += ` AND psla.action = ?`;
      params.push(action);
    }

    sql += ` ORDER BY psla.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [logs] = await pool.execute(sql, params);

    res.json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit log',
      error: error.message
    });
  }
});

// POST /api/parent-linking/auto-connect - Auto-connect parent with student
// Now includes gender for more accurate student matching and sends real SMS notifications
router.post('/auto-connect', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.id || req.user.userId;
    const { student_name, trade, level_id, level, relationship_type, relationship, student_gender, gender } = req.body;

    console.log('[Auto-Connect] Request:', { parentId, student_name, trade, level_id, level });

    if (!student_name || !trade || (!level_id && !level) || !(relationship_type || relationship)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: student_name, trade, level, relationship_type'
      });
    }

    // Parse student name into first and last name
    const nameParts = student_name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Parse level - level_id comes as "Level 1" or just a number
    let levelNumber;
    if (level_id) {
      levelNumber = parseInt(String(level_id).replace('Level ', '')) || parseInt(level_id);
    } else if (level) {
      levelNumber = parseInt(String(level).replace('Level ', '')) || parseInt(level);
    } else {
      levelNumber = 1;
    }

    const relType = relationship_type || relationship || 'parent';
    
    // Gender for more accurate matching
    const genderFilter = student_gender || gender || null;

    // Find the student - now with optional gender matching for more accurate results
    let studentQuery = `
      SELECT gss.id as gss_id, u.id as user_id, gss.student_id, gss.first_name, gss.last_name, 
             gss.trade_code, gss.trade_name, gss.level_number, gss.gender
      FROM global_student_sheets gss
      LEFT JOIN users u ON gss.student_id = u.student_id AND u.role = 'student'
      WHERE LOWER(gss.first_name) LIKE LOWER(CONCAT('%', ?, '%'))
        AND (LOWER(gss.last_name) LIKE LOWER(CONCAT('%', ?, '%')) OR LOWER(CONCAT(gss.first_name, ' ', gss.last_name)) LIKE LOWER(CONCAT('%', ?, '%')))
        AND gss.trade_code = ?
        AND gss.level_number = ?
    `;
    
    let queryParams = [firstName, lastName, student_name.trim(), trade, levelNumber];
    
    // If gender is provided, add it to the query for more accurate matching
    if (genderFilter) {
      studentQuery += ` AND LOWER(gender) = LOWER(?)`;
      queryParams.push(genderFilter);
    }
    
    studentQuery += ` LIMIT 5`; // Get up to 5 matches for better accuracy

    console.log('[Auto-Connect] Query:', studentQuery);
    console.log('[Auto-Connect] Params:', queryParams);

    // Use query instead of execute for better handling of LIKE with wildcards
    const [students] = await pool.query(studentQuery, queryParams);
    console.log('[Auto-Connect] Found students:', students.length);

    if (students.length === 0) {
      // Try without gender if no results found with gender
      if (genderFilter) {
        const [fallbackStudents] = await pool.query(`
          SELECT gss.id as gss_id, u.id as user_id, gss.student_id, gss.first_name, gss.last_name, 
                 gss.trade_code, gss.trade_name, gss.level_number, gss.gender
          FROM global_student_sheets gss
          LEFT JOIN users u ON gss.student_id = u.student_id AND u.role = 'student'
          WHERE LOWER(gss.first_name) LIKE LOWER(CONCAT('%', ?, '%'))
            AND (LOWER(gss.last_name) LIKE LOWER(CONCAT('%', ?, '%')) OR LOWER(CONCAT(gss.first_name, ' ', gss.last_name)) LIKE LOWER(CONCAT('%', ?, '%')))
            AND gss.trade_code = ?
            AND gss.level_number = ?
          LIMIT 5
        `, [firstName, lastName, student_name.trim(), trade, levelNumber]);
        
        if (fallbackStudents.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Student not found. Please check the details and try again or contact the school.',
            code: 'NO_MATCHES',
            error: 'NOT_FOUND'
          });
        }
        
        // Return multiple matches for user to choose
        if (fallbackStudents.length > 1) {
          return res.status(300).json({
            success: true,
            code: 'MULTIPLE_MATCHES',
            message: 'Multiple students found. Please provide more details.',
            students: fallbackStudents.map(s => ({
              id: s.id,
              studentId: s.student_id,
              firstName: s.first_name,
              lastName: s.last_name,
              gender: s.gender,
              trade: s.trade_name,
              level: s.level_number
            }))
          });
        }
        
        var student = fallbackStudents[0];
      } else {
        return res.status(404).json({
          success: false,
          message: 'Student not found. Please check the details and try again or contact the school.',
          code: 'NO_MATCHES',
          error: 'NOT_FOUND'
        });
      }
    }

    // If multiple students found with gender, let user choose
    if (!student && students.length > 1) {
      return res.status(300).json({
        success: true,
        code: 'MULTIPLE_MATCHES',
        message: 'Multiple students found with same details. Please confirm which one is yours.',
        students: students.map(s => ({
          id: s.id,
          studentId: s.student_id,
          firstName: s.first_name,
          lastName: s.last_name,
          gender: s.gender,
          trade: s.trade_name,
          level: s.level_number
        }))
      });
    }

    if (!student) {
      student = students[0];
    }
    
    const studentDbId = student.user_id || student.gss_id;

    // Check if already linked
    const [existing] = await pool.execute(`
      SELECT id FROM parent_student_links 
      WHERE parent_id = ? AND student_id = ? AND status = 'approved'
    `, [parentId, studentDbId]);

    if (existing.length > 0) {
      return res.json({
        success: true,
        message: 'Student is already linked to your account!',
        alreadyLinked: true,
        child: {
          id: student.id,
          studentId: studentDbId,
          firstName: student.first_name,
          lastName: student.last_name,
          gender: student.gender,
          trade: student.trade_name,
          level: student.level_number
        }
      });
    }

    // Create the link
    await pool.execute(`
      INSERT INTO parent_student_links 
      (parent_id, student_id, relationship_type, status, linked_by, linked_at)
      VALUES (?, ?, ?, 'approved', ?, NOW())
    `, [parentId, studentDbId, relType, req.user.name || 'Parent']);

    // Get parent info for SMS
    const [parentInfo] = await pool.execute(
      'SELECT first_name, last_name, phone FROM users WHERE id = ?',
      [parentId]
    );
    
    const parentName = parentInfo.length > 0 ? parentInfo[0].first_name : 'Parent';
    const parentPhone = parentInfo.length > 0 ? parentInfo[0].phone : null;

    // Send real SMS notification to parent via African Talking
    let smsResult = null;
    if (parentPhone && isSMSReady()) {
      const smsMessage = `Hello ${parentName}, you have successfully linked with ${student.first_name} ${student.last_name} (${student.trade_name} Level ${student.level_number}) in Garden TVET School system. You can now view their progress.`;
      smsResult = await sendSMS(parentPhone, smsMessage);
      console.log(`[SMS] Parent notification sent: ${smsResult ? 'Success' : 'Failed'}`);
    }

    res.json({
      success: true,
      message: 'Student linked successfully! 🎉',
      smsSent: smsResult ? smsResult.success : false,
      child: {
        id: student.id,
        studentId: studentDbId,
        firstName: student.first_name,
        lastName: student.last_name,
        gender: student.gender,
        trade: student.trade_name,
        level: student.level_number
      }
    });
  } catch (error) {
    console.error('[Auto-Connect] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect with student. Please check if the database is running.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.post('/link-student', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const parentId = req.user.userId || req.user.id;
    const {
      student_name,
      student_first_name,
      student_last_name,
      student_trade,
      student_level,
      student_gender,
      student_code,
      relationship_type = 'Parent'
    } = req.body;

    if (!student_trade || !student_level) {
      throw new Error('Umwuga n\'urwego birakenewe');
    }

    const levelNum = parseInt(student_level);
    let firstName = student_first_name;
    let lastName = student_last_name;

    if (!firstName && !lastName && student_name) {
      const nameParts = student_name.trim().split(' ');
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ') || '';
    }

    if (!firstName) {
      throw new Error('Amazina y\'umunyeshuri arakenewe');
    }

    let sql = `
      SELECT 
        id, student_id, student_code, first_name, last_name, 
        trade_code, trade_name, level_number, gender, email, phone, class_name
      FROM global_student_sheets
      WHERE status = 'active'
        AND trade_code = ?
        AND level_number = ?
    `;
    
    const params = [student_trade, levelNum];

    if (student_code) {
      sql += ` AND student_code = ?`;
      params.push(student_code);
    } else {
      sql += ` AND (
        LOWER(CONCAT(first_name, ' ', last_name)) = LOWER(?)
        OR (LOWER(first_name) = LOWER(?) AND LOWER(last_name) = LOWER(?))
        OR LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER(?)
      )`;
      const fullName = `${firstName} ${lastName}`.trim();
      params.push(fullName, firstName, lastName || '', `%${fullName}%`);
    }

    if (student_gender) {
      sql += ` AND LOWER(gender) = LOWER(?)`;
      params.push(student_gender);
    }

    const [students] = await connection.execute(sql, params);

    if (students.length === 0) {
      const [[requestExists]] = await connection.execute(
        `SELECT COUNT(*) as count FROM parent_student_link_requests 
         WHERE parent_id = ? AND student_first_name = ? AND student_last_name = ? 
         AND trade_code = ? AND level_number = ? AND status = 'pending'`,
        [parentId, firstName, lastName || '', student_trade, levelNum]
      );

      if (requestExists.count > 0) {
        await connection.rollback();
        return res.json({
          success: false,
          message: 'Usanzwe warakoze icyifuzo kuri uyu munyeshuri. Tegereza kwemezwa.'
        });
      }

      await connection.execute(`
        INSERT INTO parent_student_link_requests 
        (parent_id, student_first_name, student_last_name, trade_code, level_number, gender, relationship, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
      `, [parentId, firstName, lastName || '', student_trade, levelNum, student_gender, relationship_type]);

      await connection.commit();
      return res.json({
        success: true,
        message: 'Nta munyeshuri uhuye kuri amazina yanditse. Icyifuzo cyoherejwe ubuyobozi kugirango bakemeze.',
        request_submitted: true
      });
    }

    let bestMatch = students[0];
    let matchScore = 0;

    if (students.length > 1) {
      students.forEach(student => {
        let score = 0;
        const studentFullName = `${student.first_name} ${student.last_name}`.toLowerCase();
        const searchFullName = `${firstName} ${lastName}`.toLowerCase();
        
        if (studentFullName === searchFullName) score += 50;
        else if (studentFullName.includes(searchFullName) || searchFullName.includes(studentFullName)) score += 30;
        
        if (student_gender && student.gender && student.gender.toLowerCase() === student_gender.toLowerCase()) score += 20;
        if (student_code && student.student_code === student_code) score += 30;
        
        if (score > matchScore) {
          matchScore = score;
          bestMatch = student;
        }
      });
    } else {
      matchScore = 80;
    }

    const [existing] = await connection.execute(`
      SELECT id, status FROM parent_student_links
      WHERE parent_id = ? AND student_id = ?
    `, [parentId, bestMatch.id]);

    if (existing.length > 0) {
      const linkStatus = existing[0].status;
      await connection.rollback();
      
      if (linkStatus === 'active') {
        return res.json({
          success: false,
          message: `Uyu munyeshuri (${bestMatch.first_name} ${bestMatch.last_name}) asanzwe yarahuye na konte yanyu.`
        });
      } else if (linkStatus === 'pending') {
        return res.json({
          success: false,
          message: `Usanzwe ufite icyifuzo gitegereje kwemezwa kuri ${bestMatch.first_name} ${bestMatch.last_name}.`
        });
      }
    }

    const matchMetadata = JSON.stringify({
      search_name: `${firstName} ${lastName}`.trim(),
      matched_name: `${bestMatch.first_name} ${bestMatch.last_name}`,
      search_trade: student_trade,
      search_level: levelNum,
      search_gender: student_gender,
      search_code: student_code,
      match_score: matchScore,
      total_candidates: students.length,
      match_criteria: {
        name_match: true,
        trade_match: true,
        level_match: true,
        gender_match: student_gender ? bestMatch.gender?.toLowerCase() === student_gender.toLowerCase() : null,
        code_match: student_code ? bestMatch.student_code === student_code : null
      },
      timestamp: new Date().toISOString()
    });

    await connection.execute(`
      INSERT INTO parent_student_links (
        parent_id, student_id, relationship_type, status,
        match_confidence, match_metadata, linked_at
      ) VALUES (?, ?, ?, 'pending', ?, ?, NOW())
    `, [parentId, bestMatch.id, relationship_type, Math.min(matchScore + 10, 100), matchMetadata]);

    const [linkResult] = await connection.execute(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ? ORDER BY id DESC LIMIT 1',
      [parentId, bestMatch.id]
    );

    if (linkResult.length > 0) {
      await connection.execute(`
        INSERT INTO parent_student_link_activity (link_id, action, details)
        VALUES (?, 'created', ?)
      `, [linkResult[0].id, JSON.stringify({
        action: 'parent_link_request',
        parent_id: parentId,
        student_matched: `${bestMatch.first_name} ${bestMatch.last_name}`,
        match_score: matchScore,
        search_criteria: {
          name: `${firstName} ${lastName}`.trim(),
          trade: student_trade,
          level: levelNum,
          gender: student_gender
        },
        timestamp: new Date().toISOString()
      })]);
    }

    await connection.commit();

    const genderMatch = student_gender && bestMatch.gender ? 
      bestMatch.gender.toLowerCase() === student_gender.toLowerCase() : false;

    res.json({
      success: true,
      message: `✅ Icyifuzo cyoherejwe neza! Ubonetse: ${bestMatch.first_name} ${bestMatch.last_name} (${bestMatch.trade_name || bestMatch.trade_code} Urwego ${bestMatch.level_number}). Tegereza kwemezwa n'ubuyobozi.`,
      student: {
        name: `${bestMatch.first_name} ${bestMatch.last_name}`,
        trade: bestMatch.trade_name || bestMatch.trade_code,
        level: bestMatch.level_number,
        code: bestMatch.student_code,
        gender: bestMatch.gender
      },
      match_info: {
        confidence: Math.min(matchScore + 10, 100),
        total_candidates: students.length,
        match_criteria: {
          name: true,
          trade: true,
          level: true,
          gender: genderMatch
        }
      },
      next_steps: [
        'Icyifuzo cyawe kizasubirwaho n\'umuyobozi w\'ishuri',
        'Uzahabwa ubutumwa iyo cyemejwe',
        'Nyuma y\'kwemezwa uzashobora kureba amakuru y\'umwana wawe'
      ]
    });

  } catch (error) {
    await connection.rollback();
    console.error('Link student error:', error);
    
    const errorMessage = error.message.includes('Umwuga') || error.message.includes('Amazina') 
      ? error.message 
      : 'Habaye ikosa mu kohereza icyifuzo. Nyamuneka gerageza ukundi.';
    
    res.status(error.message.includes('birakenewe') ? 400 : 500).json({
      success: false,
      message: errorMessage,
      error_code: error.message.includes('birakenewe') ? 'MISSING_REQUIRED_FIELDS' : 'SERVER_ERROR'
    });
  } finally {
    connection.release();
  }
});

// ============================================================
// MANAGEMENT DASHBOARD ENDPOINTS (for ParentLinkingManagement component)
// ============================================================

// GET /api/parent-linking/pending-count - Get count of pending requests
router.get('/pending-count', authenticateToken, requireRole(['admin', 'headmaster', 'dod', 'director_study', 'director_discipline', 'accountant', 'advisor', 'patron', 'matron']), async (req, res) => {
  try {
    const [result] = await pool.execute(
      "SELECT COUNT(*) as count FROM parent_student_links WHERE status = 'pending'"
    );
    res.json({ success: true, pendingCount: result[0].count });
  } catch (error) {
    console.error('Error getting pending count:', error);
    res.status(500).json({ success: false, message: 'Failed to get pending count', error: error.message });
  }
});

// GET /api/parent-linking/pending-requests - Get pending linking requests
router.get('/pending-requests', authenticateToken, requireRole(['admin', 'headmaster', 'dod', 'director_study', 'director_discipline', 'accountant', 'advisor', 'patron', 'matron']), async (req, res) => {
  try {
    const [requests] = await pool.execute(`
      SELECT 
        psl.id,
        psl.parent_id,
        psl.student_id,
        psl.relationship_type,
        psl.status,
        psl.reviewed_by,
        psl.reviewed_at,
        psl.review_note,
        psl.created_at,
        psl.linked_at,
        CONCAT(p.first_name, ' ', p.last_name) as parent_name,
        p.phone as parent_phone,
        p.email as parent_email,
        s.first_name as student_first_name,
        s.last_name as student_last_name,
        s.trade_code as student_trade,
        s.level as student_level,
        s.student_id as student_code,
        COALESCE(t.name, s.trade_code) as student_trade_name
      FROM parent_student_links psl
      INNER JOIN users p ON psl.parent_id = p.id
      INNER JOIN users s ON psl.student_id = s.id
      LEFT JOIN trades t ON s.trade_code = t.code
      WHERE psl.status = 'pending'
      ORDER BY psl.created_at DESC
    `);
    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error getting pending requests:', error);
    res.status(500).json({ success: false, message: 'Failed to get pending requests', error: error.message });
  }
});

// GET /api/parent-linking/linking-requests - Get all linking requests with optional status filter
router.get('/linking-requests', authenticateToken, requireRole(['admin', 'headmaster', 'dod', 'director_study', 'director_discipline', 'accountant', 'advisor', 'patron', 'matron']), async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    let sql = `
      SELECT 
        psl.id,
        psl.parent_id,
        psl.student_id,
        psl.relationship_type,
        psl.status,
        psl.reviewed_by,
        psl.reviewed_at,
        psl.review_note,
        psl.created_at,
        psl.linked_at,
        CONCAT(p.first_name, ' ', p.last_name) as parent_name,
        p.phone as parent_phone,
        p.email as parent_email,
        s.first_name as student_first_name,
        s.last_name as student_last_name,
        s.trade_code as student_trade,
        s.level as student_level,
        s.student_id as student_code,
        COALESCE(t.name, s.trade_code) as student_trade_name,
        CONCAT(r.first_name, ' ', r.last_name) as reviewed_by_name,
        r.role as reviewed_by_role
      FROM parent_student_links psl
      INNER JOIN users p ON psl.parent_id = p.id
      INNER JOIN users s ON psl.student_id = s.id
      LEFT JOIN trades t ON s.trade_code = t.code
      LEFT JOIN users r ON psl.reviewed_by = r.id
    `;
    
    const params = [];
    if (status && status !== 'all') {
      sql += ' WHERE psl.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY psl.created_at DESC';
    
    const [requests] = await pool.execute(sql, params);
    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error getting linking requests:', error);
    res.status(500).json({ success: false, message: 'Failed to get linking requests', error: error.message });
  }
});

// PUT /api/parent-linking/linking-requests/:id - Approve or reject a linking request
router.put('/linking-requests/:id', authenticateToken, requireRole(['admin', 'headmaster', 'dod', 'director_study', 'director_discipline', 'accountant', 'advisor', 'patron', 'matron']), async (req, res) => {
  try {
    const { id } = req.params;
    const { action, note } = req.body; // action: 'approve' or 'reject'
    const userId = req.user.id || req.user.userId;
    const userName = req.user.name || req.user.firstName || 'Admin';
    const userRole = req.user.role || 'admin';
    
    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action. Use "approve" or "reject"' });
    }
    
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    await pool.execute(
      `UPDATE parent_student_links SET status = ?, reviewed_by = ?, reviewed_by_name = ?, reviewed_by_role = ?, reviewed_at = NOW(), review_note = ? WHERE id = ?`,
      [newStatus, userId, userName, userRole, note || null, id]
    );
    
    // Get parent info to send SMS notification
    const [linkInfo] = await pool.execute(
      `SELECT psl.*, p.phone as parent_phone, p.first_name as parent_first_name, s.first_name as student_first_name, s.last_name as student_last_name
       FROM parent_student_links psl
       INNER JOIN users p ON psl.parent_id = p.id
       INNER JOIN users s ON psl.student_id = s.id
       WHERE psl.id = ?`,
      [id]
    );
    
    if (linkInfo.length > 0 && linkInfo[0].parent_phone) {
      const parentName = linkInfo[0].parent_first_name;
      const studentName = `${linkInfo[0].student_first_name} ${linkInfo[0].student_last_name}`;
      
      if (action === 'approve') {
        const smsMessage = `Hello ${parentName}, your request to connect with ${studentName} has been APPROVED! You can now view their academic progress.`;
        if (isSMSReady()) {
          await sendSMS(linkInfo[0].parent_phone, smsMessage);
        }
      } else {
        const smsMessage = `Hello ${parentName}, your request to connect with ${studentName} has been REJECTED. Please contact the school for more information.`;
        if (isSMSReady()) {
          await sendSMS(linkInfo[0].parent_phone, smsMessage);
        }
      }
    }
    
    res.json({ success: true, message: `Request ${action}d successfully!` });
  } catch (error) {
    console.error('Error updating linking request:', error);
    res.status(500).json({ success: false, message: 'Failed to update linking request', error: error.message });
  }
});

// GET /api/parent-linking/connections - Get all active parent-student connections
router.get('/connections', authenticateToken, requireRole(['admin', 'headmaster', 'dod', 'director_study', 'director_discipline', 'accountant', 'advisor', 'patron', 'matron']), async (req, res) => {
  try {
    const [connections] = await pool.execute(`
      SELECT 
        psl.id,
        psl.connection_id,
        psl.parent_id,
        psl.student_id,
        psl.relationship_type,
        psl.status,
        psl.can_view_marks,
        psl.can_view_attendance,
        psl.can_view_discipline,
        psl.can_view_fees,
        psl.approved_by,
        psl.approved_by_role,
        psl.created_at,
        psl.linked_at,
        CONCAT(p.first_name, ' ', p.last_name) as parent_name,
        p.phone as parent_phone,
        p.email as parent_email,
        s.first_name,
        s.last_name,
        s.student_id as student_code,
        s.trade_code,
        s.level as level_number,
        COALESCE(t.name, s.trade_code) as trade_name
      FROM parent_student_links psl
      INNER JOIN users p ON psl.parent_id = p.id
      INNER JOIN users s ON psl.student_id = s.id
      LEFT JOIN trades t ON s.trade_code = t.code
      WHERE psl.status = 'approved'
      ORDER BY psl.linked_at DESC
    `);
    res.json({ success: true, connections });
  } catch (error) {
    console.error('Error getting connections:', error);
    res.status(500).json({ success: false, message: 'Failed to get connections', error: error.message });
  }
});

// POST /api/parent-linking/bulk-approve - Bulk approve linking requests
router.post('/bulk-approve', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { request_ids } = req.body;
    const userId = req.user.id || req.user.userId;
    const userName = req.user.name || req.user.firstName || 'Admin';
    const userRole = req.user.role || 'admin';
    
    if (!request_ids || !Array.isArray(request_ids) || request_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No request IDs provided' });
    }
    
    const placeholders = request_ids.map(() => '?').join(',');
    const [result] = await pool.execute(
      `UPDATE parent_student_links SET status = 'active', reviewed_by = ?, reviewed_by_name = ?, reviewed_by_role = ?, reviewed_at = NOW() WHERE id IN (${placeholders}) AND status = 'pending'`,
      [userId, userName, userRole, ...request_ids]
    );
    
    res.json({ success: true, approved: result.affectedRows, message: `Successfully approved ${result.affectedRows} requests` });
  } catch (error) {
    console.error('Error in bulk approve:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk approve', error: error.message });
  }
});

module.exports = router;
