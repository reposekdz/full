const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for profile image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/profiles';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    }
});

// =====================================
// STAFF PROFILE MANAGEMENT
// =====================================

// Get current staff profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;

        const [user] = await pool.execute(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.phone_type,
        u.is_whatsapp_enabled,
        u.address,
        u.province,
        u.district,
        u.sector,
        u.date_of_birth,
        u.gender,
        u.profile_picture,
        u.profile_image,
        u.bio,
        u.department,
        u.office_location,
        u.role,
        u.role_id,
        u.employee_id,
        u.is_active,
        u.email_verified,
        u.last_login,
        u.created_at,
        u.updated_at,
        u.preferences,
        r.name as role_name,
        r.permissions
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [userId]);

        if (!user.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get role-specific data
        const userData = user[0];

        // Parse preferences if exists
        if (userData.preferences) {
            try {
                userData.preferences = JSON.parse(userData.preferences);
            } catch (e) {
                userData.preferences = {};
            }
        } else {
            userData.preferences = {};
        }

        // Get additional data based on role
        if (userData.role === 'teacher') {
            const [teacherData] = await pool.execute(`
        SELECT 
          t.trade_id,
          t.subjects,
          t.qualification,
          t.experience_years,
          t.join_date,
          tr.name as trade_name,
          tr.code as trade_code
        FROM teachers t
        LEFT JOIN trades tr ON t.trade_id = tr.id
        WHERE t.user_id = ?
      `, [userId]);

            if (teacherData.length) {
                userData.teacher_info = teacherData[0];
            }
        }

        res.json({ success: true, profile: userData });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
});

// Update staff profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const {
            first_name,
            last_name,
            phone,
            phone_type,
            is_whatsapp_enabled,
            address,
            province,
            district,
            sector,
            date_of_birth,
            gender,
            bio,
            department,
            office_location,
            preferences
        } = req.body;

        await pool.execute(`
      UPDATE users SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        phone = COALESCE(?, phone),
        phone_type = COALESCE(?, phone_type),
        is_whatsapp_enabled = COALESCE(?, is_whatsapp_enabled),
        address = COALESCE(?, address),
        province = COALESCE(?, province),
        district = COALESCE(?, district),
        sector = COALESCE(?, sector),
        date_of_birth = COALESCE(?, date_of_birth),
        gender = COALESCE(?, gender),
        bio = COALESCE(?, bio),
        department = COALESCE(?, department),
        office_location = COALESCE(?, office_location),
        preferences = COALESCE(?, preferences),
        updated_at = NOW()
      WHERE id = ?
    `, [
            first_name, last_name, phone, phone_type, is_whatsapp_enabled,
            address, province, district, sector, date_of_birth, gender,
            bio, department, office_location,
            preferences ? JSON.stringify(preferences) : null,
            userId
        ]);

        // Log the activity
        await pool.execute(`
      INSERT INTO activity_logs (user_id, action, description, created_at)
      VALUES (?, 'profile_update', 'Updated profile information', NOW())
    `, [userId]);

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

// Upload profile image
router.post('/profile/image', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }

        const imageUrl = `/uploads/profiles/${req.file.filename}`;

        await pool.execute(
            'UPDATE users SET profile_image = ?, profile_picture = ?, updated_at = NOW() WHERE id = ?',
            [imageUrl, imageUrl, userId]
        );

        res.json({
            success: true,
            message: 'Profile image uploaded successfully',
            image_url: imageUrl
        });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload image' });
    }
});

// Change password (self)
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { current_password, new_password, confirm_password } = req.body;

        if (!current_password || !new_password || !confirm_password) {
            return res.status(400).json({
                success: false,
                message: 'All password fields are required'
            });
        }

        if (new_password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match'
            });
        }

        if (new_password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
        }

        // Get current password hash
        const [user] = await pool.execute(
            'SELECT password, password_hash FROM users WHERE id = ?',
            [userId]
        );

        if (!user.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const storedPassword = user[0].password || user[0].password_hash;

        // Verify current password
        const isValid = await bcrypt.compare(current_password, storedPassword);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update password
        await pool.execute(
            'UPDATE users SET password = ?, password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL, updated_at = NOW() WHERE id = ?',
            [hashedPassword, hashedPassword, userId]
        );

        // Log the activity
        await pool.execute(`
      INSERT INTO activity_logs (user_id, action, description, created_at)
      VALUES (?, 'password_change', 'User changed their password', NOW())
    `, [userId]);

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ success: false, message: 'Failed to change password' });
    }
});

// =====================================
// ADMIN: STAFF MANAGEMENT
// =====================================

// Get all staff (admin only)
router.get('/all', authenticateToken, async (req, res) => {
    try {
        const { role, search, status } = req.query;

        let query = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.role,
        u.role_id,
        u.employee_id,
        u.department,
        u.office_location,
        u.is_active,
        u.email_verified,
        u.last_login,
        u.created_at,
        u.profile_image,
        r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.role IN ('admin', 'accountant', 'teacher', 'dos', 'dod', 'headmaster', 'patron', 'matron', 'advisor', 'school_owner')
    `;

        const params = [];

        if (role) {
            query += ' AND u.role = ?';
            params.push(role);
        }

        if (status === 'active') {
            query += ' AND u.is_active = 1';
        } else if (status === 'inactive') {
            query += ' AND u.is_active = 0';
        }

        if (search) {
            query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.username LIKE ? OR u.employee_id LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY u.role, u.first_name, u.last_name';

        const [staff] = await pool.execute(query, params);

        res.json({ success: true, staff, count: staff.length });
    } catch (error) {
        console.error('Staff fetch error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch staff' });
    }
});

// Force password change (admin only)
router.post('/force-password', authenticateToken, async (req, res) => {
    try {
        const { user_id, new_password, require_change_on_login } = req.body;

        if (!user_id || !new_password) {
            return res.status(400).json({
                success: false,
                message: 'User ID and new password are required'
            });
        }

        // Check permission
        if (!['admin', 'headmaster', 'school_owner'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied'
            });
        }

        // Get user info
        const [user] = await pool.execute(
            'SELECT id, username, email, role, first_name, last_name FROM users WHERE id = ?',
            [user_id]
        );

        if (!user.length) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Validate password strength
        if (new_password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update password
        await pool.execute(`
      UPDATE users SET 
        password = ?, 
        password_hash = ?, 
        password_reset_token = NULL, 
        password_reset_expires = NULL,
        force_password_change = ?,
        updated_at = NOW() 
      WHERE id = ?
    `, [hashedPassword, hashedPassword, require_change_on_login ? 1 : 0, user_id]);

        // Log the action
        await pool.execute(`
      INSERT INTO activity_logs (user_id, action, description, created_at)
      VALUES (?, 'force_password_change', ?, NOW())
    `, [req.user.userId || req.user.id, `Admin force changed password for user ${user[0].username}`]);

        res.json({
            success: true,
            message: `Password updated successfully for ${user[0].first_name} ${user[0].last_name}`,
            user: {
                id: user[0].id,
                username: user[0].username,
                email: user[0].email,
                role: user[0].role
            }
        });
    } catch (error) {
        console.error('Force password change error:', error);
        res.status(500).json({ success: false, message: 'Failed to change password' });
    }
});

// Force email change (admin only)
router.post('/force-email', authenticateToken, async (req, res) => {
    try {
        const { user_id, new_email } = req.body;

        if (!user_id || !new_email) {
            return res.status(400).json({
                success: false,
                message: 'User ID and new email are required'
            });
        }

        // Check permission
        if (!['admin', 'headmaster', 'school_owner'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied'
            });
        }

        // Check if email already exists
        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [new_email, user_id]
        );

        if (existing.length) {
            return res.status(400).json({
                success: false,
                message: 'Email already in use by another account'
            });
        }

        // Update email
        await pool.execute(
            'UPDATE users SET email = ?, email_verified = 0, updated_at = NOW() WHERE id = ?',
            [new_email, user_id]
        );

        // Get user info for response
        const [user] = await pool.execute(
            'SELECT username, first_name, last_name FROM users WHERE id = ?',
            [user_id]
        );

        // Log the action
        await pool.execute(`
      INSERT INTO activity_logs (user_id, action, description, created_at)
      VALUES (?, 'force_email_change', ?, NOW())
    `, [req.user.userId || req.user.id, `Admin force changed email for user ${user[0]?.username} to ${new_email}`]);

        res.json({
            success: true,
            message: `Email updated successfully for ${user[0]?.first_name} ${user[0]?.last_name}`
        });
    } catch (error) {
        console.error('Force email change error:', error);
        res.status(500).json({ success: false, message: 'Failed to change email' });
    }
});

// Update staff status (activate/deactivate)
router.put('/status/:id', authenticateToken, async (req, res) => {
    try {
        const { is_active } = req.body;
        const targetUserId = req.params.id;

        // Check permission
        if (!['admin', 'headmaster', 'school_owner'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied'
            });
        }

        await pool.execute(
            'UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?',
            [is_active ? 1 : 0, targetUserId]
        );

        // Log the action
        await pool.execute(`
      INSERT INTO activity_logs (user_id, action, description, created_at)
      VALUES (?, 'status_change', ?, NOW())
    `, [req.user.userId || req.user.id, `Admin ${is_active ? 'activated' : 'deactivated'} user ID ${targetUserId}`]);

        res.json({
            success: true,
            message: `User ${is_active ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
});

// Get staff activity logs
router.get('/activity-logs/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50 } = req.query;

        const [logs] = await pool.execute(`
      SELECT 
        al.*,
        u.username,
        u.first_name,
        u.last_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.user_id = ?
      ORDER BY al.created_at DESC
      LIMIT ?
    `, [userId, parseInt(limit)]);

        res.json({ success: true, logs });
    } catch (error) {
        console.error('Activity logs error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch activity logs' });
    }
});

// Get staff statistics
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const [stats] = await pool.execute(`
      SELECT 
        role,
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN email_verified = 1 THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN last_login > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as active_last_30_days
      FROM users
      WHERE role IN ('admin', 'accountant', 'teacher', 'dos', 'dod', 'headmaster', 'patron', 'matron', 'advisor', 'school_owner')
      GROUP BY role
      ORDER BY role
    `);

        res.json({ success: true, stats });
    } catch (error) {
        console.error('Staff stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch staff statistics' });
    }
});

module.exports = router;