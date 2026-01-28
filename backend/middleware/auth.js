const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // First try admin_users table (for backward compatibility)
    let [users] = await pool.execute(
      'SELECT id, username, email, role FROM admin_users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      // Try users table with role information
      [users] = await pool.execute(`
        SELECT u.id, u.username, u.email, r.name as role, u.first_name, u.last_name, u.student_id
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ? AND u.is_active = true
      `, [decoded.userId]);
    }

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found or inactive' 
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

const requireRole = (...roles) => {
  return async (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions',
        required_roles: roles,
        user_role: req.user?.role || 'none'
      });
    }
    next();
  };
};

// Check specific permissions with role hierarchy
const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    try {
      // Admin and headmaster have all permissions
      if (['admin', 'headmaster', 'patron'].includes(req.user.role)) {
        return next();
      }

      // Check if user has the specific permission
      const [permissions] = await pool.execute(`
        SELECT p.name
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN roles r ON rp.role_id = r.id
        JOIN users u ON r.id = u.role_id
        WHERE u.id = ? AND p.name = ?
        UNION
        SELECT p.name
        FROM permissions p
        JOIN user_permissions up ON p.id = up.permission_id
        WHERE up.user_id = ? AND up.granted = true AND p.name = ?
      `, [req.user.id, permission, req.user.id, permission]);

      if (permissions.length === 0) {
        return res.status(403).json({ 
          success: false, 
          message: 'Insufficient permissions',
          required_permission: permission,
          user_role: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Permission check failed' 
      });
    }
  };
};

module.exports = {
  authenticateToken,
  authenticate: authenticateToken,
  requireRole,
  authorize: requireRole,
  authorizeRoles: requireRole,
  checkRole: requireRole,
  requirePermission
};