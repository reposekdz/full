const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Generate unique serial code
function generateSerialCode(tradeCode, levelNumber, levelSuffix) {
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  const suffix = levelSuffix || '';
  return `${tradeCode}${levelNumber}${suffix}-${randomPart}`;
}

// Create serial codes (DOS, Headmaster, Admin only)
router.post('/generate', authenticateToken, [
  body('trade_code').notEmpty().withMessage('Trade code is required'),
  body('level_number').isInt().withMessage('Level number is required'),
  body('level_suffix').optional(),
  body('quantity').isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100'),
  body('academic_year').optional(),
  body('expires_at').optional().isISO8601().withMessage('Valid expiration date required'),
  body('notes').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if user has permission (dos, headmaster, admin)
    const allowedRoles = ['dos', 'headmaster', 'admin', 'dod'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to generate serial codes'
      });
    }

    const {
      trade_code,
      level_number,
      level_suffix,
      quantity,
      academic_year,
      expires_at,
      notes
    } = req.body;

    // Verify trade level exists
    const [tradeLevel] = await pool.execute(
      `SELECT id FROM trade_levels 
       WHERE trade_code = ? AND level_number = ? 
       AND (level_suffix = ? OR (level_suffix IS NULL AND ? IS NULL))`,
      [trade_code, level_number, level_suffix, level_suffix]
    );

    if (tradeLevel.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Trade level not found'
      });
    }

    const generatedCodes = [];
    const currentYear = academic_year || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1);

    // Generate multiple serial codes
    for (let i = 0; i < quantity; i++) {
      let serialCode;
      let isUnique = false;
      
      // Ensure unique serial code
      while (!isUnique) {
        serialCode = generateSerialCode(trade_code, level_number, level_suffix);
        const [existing] = await pool.execute(
          'SELECT id FROM student_serial_codes WHERE serial_code = ?',
          [serialCode]
        );
        if (existing.length === 0) {
          isUnique = true;
        }
      }

      // Insert serial code
      await pool.execute(`
        INSERT INTO student_serial_codes (
          serial_code, trade_code, level_number, level_suffix,
          academic_year, generated_by, expires_at, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `, [
        serialCode,
        trade_code,
        level_number,
        level_suffix,
        currentYear,
        req.user.userId,
        expires_at || null,
        notes
      ]);

      generatedCodes.push(serialCode);
    }

    res.json({
      success: true,
      message: `${quantity} serial code(s) generated successfully`,
      codes: generatedCodes,
      details: {
        trade_code,
        level_number,
        level_suffix,
        academic_year: currentYear,
        expires_at: expires_at || 'No expiration'
      }
    });

  } catch (error) {
    console.error('Serial code generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate serial codes',
      error: error.message
    });
  }
});

// Validate serial code (public endpoint for student registration check)
router.post('/validate', [
  body('serial_code').notEmpty().withMessage('Serial code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { serial_code } = req.body;

    const [result] = await pool.execute(
      `SELECT sc.*, tl.trade_name 
       FROM student_serial_codes sc
       LEFT JOIN trade_levels tl ON sc.trade_code = tl.trade_code 
         AND sc.level_number = tl.level_number
         AND (sc.level_suffix = tl.level_suffix OR (sc.level_suffix IS NULL AND tl.level_suffix IS NULL))
       WHERE sc.serial_code = ?`,
      [serial_code]
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Serial code not found',
        valid: false
      });
    }

    const code = result[0];

    // Check if already used
    if (code.is_used || code.status === 'used') {
      return res.status(400).json({
        success: false,
        message: 'Serial code has already been used',
        valid: false
      });
    }

    // Check if expired
    if (code.expires_at && new Date(code.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Serial code has expired',
        valid: false
      });
    }

    // Check if revoked
    if (code.status === 'revoked') {
      return res.status(400).json({
        success: false,
        message: 'Serial code has been revoked',
        valid: false
      });
    }

    res.json({
      success: true,
      message: 'Serial code is valid',
      valid: true,
      code_details: {
        trade_code: code.trade_code,
        trade_name: code.trade_name,
        level_number: code.level_number,
        level_suffix: code.level_suffix,
        academic_year: code.academic_year,
        expires_at: code.expires_at
      }
    });

  } catch (error) {
    console.error('Serial code validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate serial code',
      error: error.message
    });
  }
});

// Get all serial codes (DOS, Headmaster, Admin only)
router.get('/list', authenticateToken, async (req, res) => {
  try {
    // Check if user has permission
    const allowedRoles = ['dos', 'headmaster', 'admin', 'dod'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view serial codes'
      });
    }

    const { status, trade_code, level_number, is_used, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT sc.*, 
             tl.trade_name,
             u1.first_name as generated_by_first_name,
             u1.last_name as generated_by_last_name,
             u2.first_name as used_by_first_name,
             u2.last_name as used_by_last_name,
             u2.student_id as student_registration_id
      FROM student_serial_codes sc
      LEFT JOIN trade_levels tl ON sc.trade_code = tl.trade_code 
        AND sc.level_number = tl.level_number
        AND (sc.level_suffix = tl.level_suffix OR (sc.level_suffix IS NULL AND tl.level_suffix IS NULL))
      LEFT JOIN users u1 ON sc.generated_by = u1.id
      LEFT JOIN users u2 ON sc.used_by = u2.id
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += ' AND sc.status = ?';
      params.push(status);
    }

    if (trade_code) {
      query += ' AND sc.trade_code = ?';
      params.push(trade_code);
    }

    if (level_number) {
      query += ' AND sc.level_number = ?';
      params.push(level_number);
    }

    if (is_used !== undefined) {
      query += ' AND sc.is_used = ?';
      params.push(is_used === 'true' ? 1 : 0);
    }

    query += ' ORDER BY sc.generated_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [codes] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM student_serial_codes WHERE 1=1';
    const countParams = [];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (trade_code) {
      countQuery += ' AND trade_code = ?';
      countParams.push(trade_code);
    }

    if (level_number) {
      countQuery += ' AND level_number = ?';
      countParams.push(level_number);
    }

    if (is_used !== undefined) {
      countQuery += ' AND is_used = ?';
      countParams.push(is_used === 'true' ? 1 : 0);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      codes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('List serial codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve serial codes',
      error: error.message
    });
  }
});

// Revoke serial code (DOS, Headmaster, Admin only)
router.put('/revoke/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user has permission
    const allowedRoles = ['dos', 'headmaster', 'admin', 'dod'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to revoke serial codes'
      });
    }

    const { id } = req.params;

    // Check if code exists and is not used
    const [code] = await pool.execute(
      'SELECT * FROM student_serial_codes WHERE id = ?',
      [id]
    );

    if (code.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Serial code not found'
      });
    }

    if (code[0].is_used) {
      return res.status(400).json({
        success: false,
        message: 'Cannot revoke a serial code that has already been used'
      });
    }

    // Revoke the code
    await pool.execute(
      'UPDATE student_serial_codes SET status = "revoked" WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Serial code revoked successfully'
    });

  } catch (error) {
    console.error('Revoke serial code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke serial code',
      error: error.message
    });
  }
});

// Delete serial code (Admin only, unused codes only)
router.delete('/delete/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete serial codes'
      });
    }

    const { id } = req.params;

    // Check if code exists and is not used
    const [code] = await pool.execute(
      'SELECT * FROM student_serial_codes WHERE id = ?',
      [id]
    );

    if (code.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Serial code not found'
      });
    }

    if (code[0].is_used) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a serial code that has been used'
      });
    }

    // Delete the code
    await pool.execute(
      'DELETE FROM student_serial_codes WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Serial code deleted successfully'
    });

  } catch (error) {
    console.error('Delete serial code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete serial code',
      error: error.message
    });
  }
});

// Get statistics (DOS, Headmaster, Admin only)
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    // Check if user has permission
    const allowedRoles = ['dos', 'headmaster', 'admin', 'dod'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view statistics'
      });
    }

    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_codes,
        SUM(CASE WHEN is_used = true THEN 1 ELSE 0 END) as used_codes,
        SUM(CASE WHEN is_used = false AND status = 'active' THEN 1 ELSE 0 END) as available_codes,
        SUM(CASE WHEN status = 'revoked' THEN 1 ELSE 0 END) as revoked_codes,
        SUM(CASE WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 1 ELSE 0 END) as expired_codes
      FROM student_serial_codes
    `);

    const [byTrade] = await pool.execute(`
      SELECT 
        trade_code,
        level_number,
        level_suffix,
        COUNT(*) as total,
        SUM(CASE WHEN is_used = true THEN 1 ELSE 0 END) as used,
        SUM(CASE WHEN is_used = false AND status = 'active' THEN 1 ELSE 0 END) as available
      FROM student_serial_codes
      GROUP BY trade_code, level_number, level_suffix
      ORDER BY trade_code, level_number
    `);

    res.json({
      success: true,
      overall: stats[0],
      by_trade_level: byTrade
    });

  } catch (error) {
    console.error('Serial code statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
      error: error.message
    });
  }
});

module.exports = router;
