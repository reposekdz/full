const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

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

module.exports = router;
