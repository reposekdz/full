const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user is admin or headmaster
const requireAdminOrHeadmaster = (req, res, next) => {
  if (!['admin', 'super_admin', 'headmaster'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Headmaster role required.'
    });
  }
  next();
};

// Get current staff access code
router.get('/access-code', authenticateToken, requireAdminOrHeadmaster, async (req, res) => {
  try {
    const [codes] = await pool.execute(
      `SELECT id, code_name, code_value, description, is_active, 
              updated_by, updated_at 
       FROM staff_access_codes 
       WHERE code_name = 'staff_portal_access' AND is_active = TRUE`
    );

    if (codes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Access code not found'
      });
    }

    res.json({
      success: true,
      accessCode: codes[0]
    });
  } catch (error) {
    console.error('Get access code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve access code'
    });
  }
});

// Update staff access code
router.put('/access-code', [
  authenticateToken,
  requireAdminOrHeadmaster,
  body('new_code').notEmpty().withMessage('New access code is required')
    .isLength({ min: 4 }).withMessage('Access code must be at least 4 characters'),
  body('change_reason').optional()
], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { new_code, change_reason } = req.body;
    const userId = req.user.userId;

    // Get current access code
    const [currentCodes] = await connection.execute(
      `SELECT id, code_value FROM staff_access_codes 
       WHERE code_name = 'staff_portal_access' AND is_active = TRUE`
    );

    if (currentCodes.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Access code not found'
      });
    }

    const currentCode = currentCodes[0];
    const oldValue = currentCode.code_value;

    // Update access code
    await connection.execute(
      `UPDATE staff_access_codes 
       SET code_value = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [new_code, userId, currentCode.id]
    );

    // Log the change in history
    await connection.execute(
      `INSERT INTO staff_access_code_history 
       (access_code_id, old_value, new_value, changed_by, change_reason, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [currentCode.id, oldValue, new_code, userId, change_reason || 'No reason provided', req.ip]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Access code updated successfully',
      oldCode: oldValue,
      newCode: new_code
    });

  } catch (error) {
    await connection.rollback();
    console.error('Update access code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update access code'
    });
  } finally {
    connection.release();
  }
});

// Get access code change history
router.get('/access-code/history', authenticateToken, requireAdminOrHeadmaster, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const [history] = await pool.execute(
      `SELECT h.*, a.username as changed_by_username, a.first_name, a.last_name
       FROM staff_access_code_history h
       LEFT JOIN admin_users a ON h.changed_by = a.id
       WHERE h.access_code_id = (
         SELECT id FROM staff_access_codes WHERE code_name = 'staff_portal_access'
       )
       ORDER BY h.changed_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      history,
      count: history.length
    });

  } catch (error) {
    console.error('Get access code history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve access code history'
    });
  }
});

// Verify access code (for login)
router.post('/verify-access-code', [
  body('access_code').notEmpty().withMessage('Access code is required')
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

    const { access_code } = req.body;

    const [codes] = await pool.execute(
      `SELECT id, code_value, is_active 
       FROM staff_access_codes 
       WHERE code_name = 'staff_portal_access' AND is_active = TRUE`
    );

    if (codes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Access code system not configured'
      });
    }

    const isValid = codes[0].code_value === access_code;

    res.json({
      success: true,
      valid: isValid,
      message: isValid ? 'Access code verified' : 'Invalid access code'
    });

  } catch (error) {
    console.error('Verify access code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify access code'
    });
  }
});

// Get all staff roles
router.get('/roles', async (req, res) => {
  try {
    const [roles] = await pool.execute(
      `SELECT role_name, display_name, requires_access_code, is_active 
       FROM staff_roles_config 
       WHERE is_active = TRUE 
       ORDER BY display_name`
    );

    res.json({
      success: true,
      roles
    });

  } catch (error) {
    console.error('Get staff roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve staff roles'
    });
  }
});

module.exports = router;
