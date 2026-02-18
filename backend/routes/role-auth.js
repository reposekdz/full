const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create role_credentials table if it doesn't exist
const initializeRoleCredentials = async () => {
  try {
    // Test if pool is available first
    if (!pool || !pool.execute) {
      console.warn('⚠️ Database pool not available, skipping role credentials initialization');
      return;
    }
    
    // Test connection first
    try {
      await pool.execute('SELECT 1');
    } catch (connError) {
      console.warn('⚠️ Database not connected, skipping role credentials initialization:', connError.message);
      return;
    }
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS role_credentials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_name VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        avatar VARCHAR(500),
        preferences JSON,
        last_login TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_role (role_name),
        INDEX idx_email (email)
      )
    `);

    // Insert default credentials for all roles
    const defaultRoles = [
      {
        role_name: 'director_study',
        email: 'reponse@gmail.com',
        password: await bcrypt.hash('2026', 10),
        first_name: 'Director',
        last_name: 'of Studies'
      },
      {
        role_name: 'director_discipline',
        email: 'reponse@gmail.com',
        password: await bcrypt.hash('2026', 10),
        first_name: 'Director',
        last_name: 'of Discipline'
      },
      {
        role_name: 'headmaster',
        email: 'reponse@gmail.com',
        password: await bcrypt.hash('2026', 10),
        first_name: 'Head',
        last_name: 'Master'
      },
      {
        role_name: 'teacher',
        email: 'reponse@gmail.com',
        password: await bcrypt.hash('2026', 10),
        first_name: 'Teacher',
        last_name: 'Staff'
      },
      {
        role_name: 'accountant',
        email: 'reponse@gmail.com',
        password: await bcrypt.hash('2026', 10),
        first_name: 'School',
        last_name: 'Accountant'
      },
      {
        role_name: 'stock_manager',
        email: 'reponse@gmail.com',
        password: await bcrypt.hash('2026', 10),
        first_name: 'Stock',
        last_name: 'Manager'
      },
      {
        role_name: 'admin',
        email: 'reponse@gmail.com',
        password: await bcrypt.hash('2026', 10),
        first_name: 'System',
        last_name: 'Admin'
      }
    ];

    for (const roleData of defaultRoles) {
      try {
        await pool.execute(
          'INSERT IGNORE INTO role_credentials (role_name, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
          [roleData.role_name, roleData.email, roleData.password, roleData.first_name, roleData.last_name]
        );
      } catch (error) {
        // Role might already exist
        console.log(`Role ${roleData.role_name} already exists`);
      }
    }

    console.log('✅ Role credentials table initialized');
  } catch (error) {
    console.error('Error initializing role credentials:', error);
  }
};

// Initialize on module load - but don't run the async function
// The initialization will be called lazily on first request
let roleCredentialsInitialized = false;

const tryInitializeRoleCredentials = async () => {
  if (roleCredentialsInitialized) return;
  roleCredentialsInitialized = true;
  
  // Small delay to ensure DB is ready
  setTimeout(() => {
    initializeRoleCredentials().catch(err => {
      console.warn('⚠️ Role credentials delayed init skipped:', err.message);
      roleCredentialsInitialized = false; // Allow retry
    });
  }, 2000);
};

// Get role credentials (for login form)
router.get('/role/:roleName', async (req, res) => {
  try {
    // Try to initialize on first request
    await tryInitializeRoleCredentials();
    
    const { roleName } = req.params;

    const [rows] = await pool.execute(
      'SELECT role_name, email, first_name, last_name, avatar, is_active FROM role_credentials WHERE role_name = ?',
      [roleName]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Get role credentials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Login with role
router.post('/login-role', [
  body('roleName').notEmpty().withMessage('Role is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { roleName, email, password } = req.body;

    const [rows] = await pool.execute(
      'SELECT * FROM role_credentials WHERE role_name = ? AND email = ? AND is_active = true',
      [roleName, email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const roleCredentials = rows[0];
    const isValidPassword = await bcrypt.compare(password, roleCredentials.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await pool.execute(
      'UPDATE role_credentials SET last_login = NOW() WHERE id = ?',
      [roleCredentials.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: roleCredentials.id,
        role: roleName,
        email: roleCredentials.email,
        userType: 'role_admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: roleCredentials.id,
        role: roleName,
        email: roleCredentials.email,
        first_name: roleCredentials.first_name,
        last_name: roleCredentials.last_name,
        avatar: roleCredentials.avatar,
        user_type: 'role_admin'
      }
    });

  } catch (error) {
    console.error('Role login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update role credentials
router.put('/role/:roleName', [
  authenticateToken,
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
  body('last_name').optional().notEmpty().withMessage('Last name cannot be empty')
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

    const { roleName } = req.params;
    const { email, password, first_name, last_name, phone, avatar, preferences } = req.body;

    // Check if user has permission to update this role
    if (req.user.role !== roleName && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateFields = [];
    const updateValues = [];

    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }
    if (first_name) {
      updateFields.push('first_name = ?');
      updateValues.push(first_name);
    }
    if (last_name) {
      updateFields.push('last_name = ?');
      updateValues.push(last_name);
    }
    if (phone) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (avatar) {
      updateFields.push('avatar = ?');
      updateValues.push(avatar);
    }
    if (preferences) {
      updateFields.push('preferences = ?');
      updateValues.push(JSON.stringify(preferences));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(roleName);
    const query = `UPDATE role_credentials SET ${updateFields.join(', ')}, updated_at = NOW() WHERE role_name = ?`;
    
    await pool.execute(query, updateValues);

    // Fetch updated credentials
    const [updatedRows] = await pool.execute(
      'SELECT role_name, email, first_name, last_name, phone, avatar, preferences FROM role_credentials WHERE role_name = ?',
      [roleName]
    );

    res.json({
      success: true,
      message: 'Role credentials updated successfully',
      data: updatedRows[0]
    });

  } catch (error) {
    console.error('Update role credentials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all role statuses (for admin)
router.get('/roles/status', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin privileges
    if (!['admin', 'super_admin', 'headmaster'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [rows] = await pool.execute(`
      SELECT role_name, email, first_name, last_name, last_login, is_active 
      FROM role_credentials 
      ORDER BY role_name
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Get role status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Register new role credentials
router.post('/register-role', [
  body('roleName').notEmpty().withMessage('Role is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required')
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

    const { roleName, email, password, first_name, last_name, phone } = req.body;

    // Check if role exists in our predefined roles
    const validRoles = ['director_study', 'director_discipline', 'headmaster', 'teacher', 'accountant', 'stock_manager', 'admin'];
    if (!validRoles.includes(roleName)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Check if role already has custom credentials
    const [existingRole] = await pool.execute(
      'SELECT email FROM role_credentials WHERE role_name = ? AND email != ?',
      [roleName, 'reponse@gmail.com']
    );

    if (existingRole.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Role already has custom credentials. Please login or reset.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update role credentials
    await pool.execute(
      'UPDATE role_credentials SET email = ?, password = ?, first_name = ?, last_name = ?, phone = ?, updated_at = NOW() WHERE role_name = ?',
      [email, hashedPassword, first_name, last_name, phone || null, roleName]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: roleName,
        role: roleName,
        email: email,
        userType: 'role_admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Role registered successfully',
      token,
      user: {
        id: roleName,
        role: roleName,
        email: email,
        first_name: first_name,
        last_name: last_name,
        user_type: 'role_admin'
      }
    });

  } catch (error) {
    console.error('Role registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Reset role credentials (admin only)
router.post('/role/:roleName/reset', authenticateToken, async (req, res) => {
  try {
    const { roleName } = req.params;

    // Check if user has admin privileges
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const defaultPassword = await bcrypt.hash('2026', 10);
    
    await pool.execute(
      'UPDATE role_credentials SET email = ?, password = ?, updated_at = NOW() WHERE role_name = ?',
      ['reponse@gmail.com', defaultPassword, roleName]
    );

    res.json({
      success: true,
      message: 'Role credentials reset to default'
    });

  } catch (error) {
    console.error('Reset role credentials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;