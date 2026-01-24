const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/profiles');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      role = '',
      gender = '',
      isActive = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let query = `
      SELECT u.*, r.name as role_name, r.description as role_description,
             parent.username as parent_username, parent.email as parent_email
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN users parent ON u.parent_id = parent.id
      WHERE 1=1
    `;
    
    const params = [];

    if (search) {
      query += ` AND (u.username LIKE ? OR u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.student_id LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (role) {
      query += ` AND r.name = ?`;
      params.push(role);
    }

    if (gender) {
      query += ` AND u.gender = ?`;
      params.push(gender);
    }

    if (isActive !== '') {
      query += ` AND u.is_active = ?`;
      params.push(isActive === 'true' ? 1 : 0);
    }

    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    const validSortFields = ['id', 'username', 'email', 'first_name', 'last_name', 'created_at', 'last_login'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY u.${sortField} ${order} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [users] = await pool.query(query, params);

    users.forEach(user => {
      delete user.password_hash;
      delete user.password_reset_token;
      delete user.password_reset_expires;
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [users] = await pool.query(`
      SELECT u.*, r.name as role_name, r.description as role_description,
             parent.username as parent_username, parent.email as parent_email,
             parent.phone as parent_phone, parent.first_name as parent_first_name,
             parent.last_name as parent_last_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN users parent ON u.parent_id = parent.id
      WHERE u.id = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    delete user.password_hash;
    delete user.password_reset_token;
    delete user.password_reset_expires;

    const [permissions] = await pool.query(`
      SELECT p.* FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
    `, [user.role_id]);

    const [userPermissions] = await pool.query(`
      SELECT p.*, up.granted FROM permissions p
      INNER JOIN user_permissions up ON p.id = up.permission_id
      WHERE up.user_id = ?
    `, [id]);

    const [children] = await pool.query(`
      SELECT id, username, email, first_name, last_name, student_id, is_active
      FROM users WHERE parent_id = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        ...user,
        rolePermissions: permissions,
        userPermissions,
        children
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user', error: error.message });
  }
});

router.post('/users', upload.single('profilePicture'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      username, email, password, firstName, lastName, phone, address,
      dateOfBirth, gender, roleId, studentId, parentId, isActive
    } = req.body;

    if (!username || !email || !password || !firstName || !lastName || !roleId) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        success: false, 
        message: 'Required fields: username, email, password, firstName, lastName, roleId' 
      });
    }

    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    if (studentId) {
      const [existingStudent] = await connection.query(
        'SELECT id FROM users WHERE student_id = ?',
        [studentId]
      );
      if (existingStudent.length > 0) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Student ID already exists' });
      }
    }

    const [roleCheck] = await connection.query('SELECT id FROM roles WHERE id = ?', [roleId]);
    if (roleCheck.length === 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Invalid role ID' });
    }

    if (parentId) {
      const [parentCheck] = await connection.query('SELECT id FROM users WHERE id = ?', [parentId]);
      if (parentCheck.length === 0) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Invalid parent ID' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const profilePicture = req.file ? `/uploads/profiles/${req.file.filename}` : null;

    const [result] = await connection.query(`
      INSERT INTO users (
        username, email, password_hash, first_name, last_name, phone, address,
        date_of_birth, gender, profile_picture, role_id, student_id, parent_id, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      username, email, passwordHash, firstName, lastName, phone, address,
      dateOfBirth, gender, profilePicture, roleId, studentId, parentId,
      isActive !== undefined ? isActive : true
    ]);

    await connection.commit();

    const [newUser] = await connection.query(`
      SELECT u.*, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [result.insertId]);

    delete newUser[0].password_hash;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser[0]
    });
  } catch (error) {
    await connection.rollback();
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Failed to create user', error: error.message });
  } finally {
    connection.release();
  }
});

router.put('/users/:id', upload.single('profilePicture'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      username, email, firstName, lastName, phone, address,
      dateOfBirth, gender, roleId, studentId, parentId, isActive
    } = req.body;

    const [existingUser] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updates = [];
    const params = [];

    if (username && username !== existingUser[0].username) {
      const [duplicateCheck] = await connection.query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, id]
      );
      if (duplicateCheck.length > 0) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Username already exists' });
      }
      updates.push('username = ?');
      params.push(username);
    }

    if (email && email !== existingUser[0].email) {
      const [duplicateCheck] = await connection.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );
      if (duplicateCheck.length > 0) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      updates.push('email = ?');
      params.push(email);
    }

    if (studentId && studentId !== existingUser[0].student_id) {
      const [duplicateCheck] = await connection.query(
        'SELECT id FROM users WHERE student_id = ? AND id != ?',
        [studentId, id]
      );
      if (duplicateCheck.length > 0) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Student ID already exists' });
      }
      updates.push('student_id = ?');
      params.push(studentId);
    }

    if (firstName) { updates.push('first_name = ?'); params.push(firstName); }
    if (lastName) { updates.push('last_name = ?'); params.push(lastName); }
    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
    if (address !== undefined) { updates.push('address = ?'); params.push(address); }
    if (dateOfBirth) { updates.push('date_of_birth = ?'); params.push(dateOfBirth); }
    if (gender) { updates.push('gender = ?'); params.push(gender); }
    if (roleId) { updates.push('role_id = ?'); params.push(roleId); }
    if (parentId !== undefined) { updates.push('parent_id = ?'); params.push(parentId); }
    if (isActive !== undefined) { updates.push('is_active = ?'); params.push(isActive); }

    if (req.file) {
      if (existingUser[0].profile_picture) {
        const oldPath = path.join(__dirname, '..', existingUser[0].profile_picture);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.push('profile_picture = ?');
      params.push(`/uploads/profiles/${req.file.filename}`);
    }

    if (updates.length > 0) {
      params.push(id);
      await connection.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    await connection.commit();

    const [updatedUser] = await connection.query(`
      SELECT u.*, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [id]);

    delete updatedUser[0].password_hash;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser[0]
    });
  } catch (error) {
    await connection.rollback();
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
  } finally {
    connection.release();
  }
});

router.delete('/users/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [user] = await connection.query('SELECT profile_picture FROM users WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [children] = await connection.query('SELECT COUNT(*) as count FROM users WHERE parent_id = ?', [id]);
    if (children[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete user with linked children. Please reassign or delete children first.' 
      });
    }

    await connection.query('DELETE FROM users WHERE id = ?', [id]);

    if (user[0].profile_picture) {
      const filePath = path.join(__dirname, '..', user[0].profile_picture);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  } finally {
    connection.release();
  }
});

router.post('/users/:id/change-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters long' 
      });
    }

    const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, id]);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Failed to change password', error: error.message });
  }
});

router.post('/users/:id/permissions', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { permissionId, granted } = req.body;

    const [userCheck] = await connection.query('SELECT id FROM users WHERE id = ?', [id]);
    if (userCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [permissionCheck] = await connection.query('SELECT id FROM permissions WHERE id = ?', [permissionId]);
    if (permissionCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Permission not found' });
    }

    await connection.query(`
      INSERT INTO user_permissions (user_id, permission_id, granted)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE granted = ?
    `, [id, permissionId, granted, granted]);

    await connection.commit();

    res.json({
      success: true,
      message: 'User permission updated successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating user permission:', error);
    res.status(500).json({ success: false, message: 'Failed to update user permission', error: error.message });
  } finally {
    connection.release();
  }
});

router.get('/users/:id/activity-log', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const [activities] = await pool.query(`
      SELECT 'attendance' as type, created_at as timestamp, 
             CONCAT('Attendance recorded: ', status) as description
      FROM attendance WHERE user_id = ?
      UNION ALL
      SELECT 'grade' as type, created_at as timestamp,
             CONCAT('Grade recorded: ', grade) as description
      FROM grades WHERE student_id = ?
      UNION ALL
      SELECT 'assignment' as type, created_at as timestamp,
             CONCAT('Assignment submitted') as description
      FROM assignment_submissions WHERE student_id = ?
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `, [id, id, id, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity log', error: error.message });
  }
});

router.post('/users/bulk-import', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ success: false, message: 'Users array is required' });
    }

    const results = { success: [], failed: [] };

    for (const user of users) {
      try {
        const { username, email, password, firstName, lastName, roleId } = user;

        if (!username || !email || !password || !firstName || !lastName || !roleId) {
          results.failed.push({ user, reason: 'Missing required fields' });
          continue;
        }

        const [existing] = await connection.query(
          'SELECT id FROM users WHERE username = ? OR email = ?',
          [username, email]
        );

        if (existing.length > 0) {
          results.failed.push({ user, reason: 'Username or email already exists' });
          continue;
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await connection.query(`
          INSERT INTO users (
            username, email, password_hash, first_name, last_name, role_id, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, 1)
        `, [username, email, passwordHash, firstName, lastName, roleId]);

        results.success.push({ username, email });
      } catch (error) {
        results.failed.push({ user, reason: error.message });
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Imported ${results.success.length} users, ${results.failed.length} failed`,
      data: results
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error bulk importing users:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk import users', error: error.message });
  } finally {
    connection.release();
  }
});

router.get('/users/:id/statistics', async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await pool.query('SELECT role_id FROM users WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const stats = {};

    const [attendance] = await pool.query(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days
      FROM attendance WHERE user_id = ?
    `, [id]);
    stats.attendance = attendance[0];

    const [grades] = await pool.query(`
      SELECT 
        COUNT(*) as total_grades,
        AVG(CAST(grade as DECIMAL(5,2))) as average_grade
      FROM grades WHERE student_id = ?
    `, [id]);
    stats.grades = grades[0];

    const [assignments] = await pool.query(`
      SELECT 
        COUNT(*) as total_assignments,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN status = 'graded' THEN 1 ELSE 0 END) as graded
      FROM assignment_submissions WHERE student_id = ?
    `, [id]);
    stats.assignments = assignments[0];

    const [fees] = await pool.query(`
      SELECT 
        SUM(amount) as total_fees,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_fees,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_fees
      FROM fee_payments WHERE student_id = ?
    `, [id]);
    stats.fees = fees[0];

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: error.message });
  }
});

module.exports = router;
