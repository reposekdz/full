const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { sendSMS } = require('../services/smsService');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/profiles/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

// Generate unique serial codes
function generateSerialCode(type) {
  const prefix = type === 'student' ? 'STD' : 'PAR';
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${year}${random}`;
}

// ======================
// PARENT REGISTRATION WITH SERIAL CODE
// ======================
router.post('/parent/register', [
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Valid email required if provided'),
  body('district').notEmpty().withMessage('District is required'),
  body('province').notEmpty().withMessage('Province is required'),
  body('relationship_type').isIn(['father', 'mother', 'guardian']).withMessage('Relationship type must be father, mother, or guardian'),
  body('has_smartphone').isBoolean().optional()
], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await connection.rollback();
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { password, first_name, last_name, phone, email, district, province, 
            relationship_type, address, national_id, occupation, has_smartphone } = req.body;

    // Check if parent already registered
    const [existingParent] = await connection.execute(
      'SELECT id FROM users WHERE email = ? OR phone = ?',
      [email || '', phone]
    );

    if (existingParent.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number or email already registered' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [parentRole] = await connection.execute('SELECT id FROM roles WHERE name = "parent"');

    if (parentRole.length === 0) {
      await connection.rollback();
      return res.status(500).json({ success: false, message: 'Parent role not configured' });
    }

    const username = `parent_${phone.replace(/[^0-9]/g, '')}`;
    const parentEmail = email || `${username}@parent.gardentvet.com`;
    
    // Create user account
    const [userResult] = await connection.execute(`
      INSERT INTO users (
        username, email, password_hash, first_name, last_name, 
        phone, address, district, province, relationship_type, role_id, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, NOW())
    `, [username, parentEmail, hashedPassword, first_name, last_name, 
        phone, address || null, district, province, relationship_type, parentRole[0].id]);

    const userId = userResult.insertId;

    // Create parent record in parents table for compatibility
    await connection.execute(`
      INSERT INTO parents (
        username, email, password_hash, first_name, last_name, phone, 
        district, province, relationship_type, address, national_id, occupation, 
        has_smartphone, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, NOW())
    `, [username, parentEmail, hashedPassword, first_name, last_name, phone,
        district, province, relationship_type, address || null, national_id || null, 
        occupation || null, has_smartphone ? 1 : 0]);

    await connection.commit();

    // Send SMS notification
    const message = `Welcome ${first_name}! Your parent account has been created at Garden TVET School. Login with your phone number. Support: +250788123456`;
    await sendSMS(phone, message, 1, { type: 'parent_registration' }).catch(err => 
      console.log('SMS notification failed:', err.message)
    );

    const token = jwt.sign(
      { userId, username, role: 'parent' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Parent account registered successfully',
      token,
      user: { 
        id: userId, 
        username, 
        email: parentEmail,
        phone,
        role: 'parent', 
        first_name, 
        last_name,
        district,
        province,
        relationship_type,
        has_smartphone: has_smartphone || false
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Parent registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  } finally {
    connection.release();
  }
});

// ======================
// STUDENT REGISTRATION WITH SERIAL CODE
// ======================
router.post('/student/register', [
  body('serial_code').notEmpty().withMessage('Student serial code is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('parent_phone').notEmpty().withMessage('Parent phone number is required'),
  body('location').notEmpty().withMessage('Location is required')
], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await connection.rollback();
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { serial_code, password, parent_phone, location, emergency_contact } = req.body;

    // Check if serial code exists in students table
    const [studentCheck] = await connection.execute(
      'SELECT * FROM students WHERE student_id = ? AND status = "active"',
      [serial_code]
    );

    if (studentCheck.length === 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid student serial code. Please contact school administration.' 
      });
    }

    const student = studentCheck[0];

    // Check if already registered
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE serial_code = ?',
      [serial_code]
    );

    if (existingUser.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'This serial code is already registered' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [studentRole] = await connection.execute('SELECT id FROM roles WHERE name = "student"');

    if (studentRole.length === 0) {
      await connection.rollback();
      return res.status(500).json({ success: false, message: 'Student role not configured' });
    }

    const username = serial_code.toLowerCase();

    // Create user account
    const [userResult] = await connection.execute(`
      INSERT INTO users (
        username, password_hash, first_name, last_name, email,
        phone, address, role_id, serial_code, student_id, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, NOW())
    `, [username, hashedPassword, student.first_name, student.last_name,
        student.email || null, parent_phone, location, 
        studentRole[0].id, serial_code, student.id]);

    const userId = userResult.insertId;

    // Update student record
    await connection.execute(`
      UPDATE students SET 
        parent_phone = ?, address = ?, emergency_contact = ?, updated_at = NOW()
      WHERE id = ?
    `, [parent_phone, location, emergency_contact || parent_phone, student.id]);

    // Link to parent if parent exists
    const [parentExists] = await connection.execute(
      'SELECT id, has_smartphone FROM parents WHERE phone = ?',
      [parent_phone]
    );

    if (parentExists.length > 0) {
      await connection.execute(`
        INSERT INTO parent_student_links (parent_id, student_id, relationship, created_at)
        VALUES ((SELECT id FROM users WHERE serial_code = (SELECT parent_code FROM parents WHERE id = ?)), ?, 'guardian', NOW())
        ON DUPLICATE KEY UPDATE updated_at = NOW()
      `, [parentExists[0].id, student.id]);

      // Send SMS to parent
      const message = `Your child ${student.first_name} ${student.last_name} has registered on the school platform. Student Code: ${serial_code}`;
      await sendSMS(parent_phone, message, 1, { type: 'student_registration_notification' });
    }

    await connection.commit();

    const token = jwt.sign(
      { userId, username, role: 'student', serial_code, student_id: student.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Student account registered successfully',
      token,
      user: { 
        id: userId, 
        username, 
        role: 'student', 
        first_name: student.first_name,
        last_name: student.last_name,
        serial_code,
        student_id: student.id,
        class: student.class_id
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Student registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  } finally {
    connection.release();
  }
});

// ======================
// PARENT LOGIN WITH SERIAL CODE
// ======================
router.post('/parent/login', [
  body('serial_code').notEmpty().withMessage('Serial code is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { serial_code, password } = req.body;

    const [users] = await pool.execute(`
      SELECT u.*, r.name as role_name,
             (SELECT COUNT(*) FROM parent_student_links WHERE parent_id = u.id) as children_count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.serial_code = ? AND r.name = 'parent' AND u.is_active = true
    `, [serial_code]);

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid serial code or password' 
      });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid serial code or password' 
      });
    }

    await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: 'parent', serial_code },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: 'parent',
        serial_code,
        children_count: user.children_count,
        profile_picture: user.profile_picture
      }
    });

  } catch (error) {
    console.error('Parent login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ======================
// STUDENT LOGIN WITH SERIAL CODE
// ======================
router.post('/student/login', [
  body('serial_code').notEmpty().withMessage('Serial code is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { serial_code, password } = req.body;

    const [users] = await pool.execute(`
      SELECT u.*, r.name as role_name, s.class_id, c.name as class_name,
             s.admission_number, s.date_of_birth, s.gender
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN students s ON u.student_id = s.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE u.serial_code = ? AND r.name = 'student' AND u.is_active = true
    `, [serial_code]);

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid serial code or password' 
      });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid serial code or password' 
      });
    }

    await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: 'student', serial_code, student_id: user.student_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: 'student',
        serial_code,
        student_id: user.student_id,
        class_id: user.class_id,
        class_name: user.class_name,
        admission_number: user.admission_number,
        profile_picture: user.profile_picture
      }
    });

  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ======================
// STAFF LOGIN WITH GLOBAL CREDENTIALS
// ======================
router.post('/staff/login', [
  body('staff_id').notEmpty().withMessage('Staff ID is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { staff_id, password } = req.body;

    // Check staff table
    const [staffMembers] = await pool.execute(`
      SELECT s.*, r.name as role_name, d.name as department_name
      FROM staff s
      LEFT JOIN roles r ON s.role_id = r.id
      LEFT JOIN departments d ON s.department_id = d.id
      WHERE s.employee_id = ? AND s.status = 'active'
    `, [staff_id]);

    if (staffMembers.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid staff ID or password' 
      });
    }

    const staff = staffMembers[0];

    // Check if staff has custom password, otherwise use global default
    let isValidPassword = false;
    if (staff.password_hash) {
      isValidPassword = await bcrypt.compare(password, staff.password_hash);
    } else {
      // Global default password is "Staff@2024" - can be changed via profile
      const globalPassword = process.env.STAFF_DEFAULT_PASSWORD || 'Staff@2024';
      isValidPassword = (password === globalPassword);
    }

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid staff ID or password' 
      });
    }

    // Create/update user account for staff
    const [existingUser] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [staff.email, staff_id.toLowerCase()]
    );

    let userId;
    if (existingUser.length > 0) {
      userId = existingUser[0].id;
      await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [userId]);
    } else {
      // Create user account for staff
      const [roleResult] = await pool.execute(
        'SELECT id FROM roles WHERE name = ?',
        [staff.role_name || 'staff']
      );
      
      const [userResult] = await pool.execute(`
        INSERT INTO users (
          username, email, password_hash, first_name, last_name,
          phone, role_id, is_active, created_at, last_login
        ) VALUES (?, ?, ?, ?, ?, ?, ?, true, NOW(), NOW())
      `, [staff_id.toLowerCase(), staff.email, staff.password_hash,
          staff.first_name, staff.last_name, staff.phone,
          roleResult.length > 0 ? roleResult[0].id : null]);
      
      userId = userResult.insertId;
    }

    const token = jwt.sign(
      { 
        userId, 
        username: staff_id.toLowerCase(), 
        role: staff.role_name || 'staff', 
        staff_id: staff.id,
        employee_id: staff.employee_id 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: userId,
        staff_id: staff.id,
        employee_id: staff.employee_id,
        username: staff_id.toLowerCase(),
        first_name: staff.first_name,
        last_name: staff.last_name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role_name || 'staff',
        position: staff.position,
        department: staff.department_name,
        profile_picture: staff.profile_picture,
        has_custom_password: !!staff.password_hash
      }
    });

  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ======================
// UPDATE PROFILE (ALL ROLES)
// ======================
router.put('/profile/update', authenticateToken, upload.single('profile_picture'), async (req, res) => {
  try {
    const { first_name, last_name, email, phone, address } = req.body;
    const userId = req.user.id;
    const profilePicture = req.file ? `/uploads/profiles/${req.file.filename}` : null;

    const updates = [];
    const values = [];

    if (first_name) { updates.push('first_name = ?'); values.push(first_name); }
    if (last_name) { updates.push('last_name = ?'); values.push(last_name); }
    if (email) { updates.push('email = ?'); values.push(email); }
    if (phone) { updates.push('phone = ?'); values.push(phone); }
    if (address) { updates.push('address = ?'); values.push(address); }
    if (profilePicture) { updates.push('profile_picture = ?'); values.push(profilePicture); }
    
    updates.push('updated_at = NOW()');
    values.push(userId);

    await pool.execute(`
      UPDATE users SET ${updates.join(', ')} WHERE id = ?
    `, values);

    // If staff member, update staff table too
    if (req.user.role === 'staff' || req.user.role === 'teacher' || req.user.role === 'admin') {
      const [staffCheck] = await pool.execute(
        'SELECT id FROM staff WHERE email = ?',
        [req.user.email]
      );

      if (staffCheck.length > 0) {
        const staffUpdates = [];
        const staffValues = [];

        if (first_name) { staffUpdates.push('first_name = ?'); staffValues.push(first_name); }
        if (last_name) { staffUpdates.push('last_name = ?'); staffValues.push(last_name); }
        if (email) { staffUpdates.push('email = ?'); staffValues.push(email); }
        if (phone) { staffUpdates.push('phone = ?'); staffValues.push(phone); }
        if (profilePicture) { staffUpdates.push('profile_picture = ?'); staffValues.push(profilePicture); }
        
        staffValues.push(staffCheck[0].id);

        await pool.execute(`
          UPDATE staff SET ${staffUpdates.join(', ')} WHERE id = ?
        `, staffValues);
      }
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile_picture: profilePicture
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Profile update failed' });
  }
});

// ======================
// CHANGE PASSWORD (ALL ROLES)
// ======================
router.put('/profile/change-password', authenticateToken, [
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    const [users] = await pool.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isValid = await bcrypt.compare(current_password, users[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 12);

    await pool.execute(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );

    // If staff, also update staff table
    if (req.user.role === 'staff' || req.user.role === 'teacher' || req.user.role === 'admin') {
      const [staffCheck] = await pool.execute(
        'SELECT id FROM staff WHERE email = ?',
        [req.user.email]
      );

      if (staffCheck.length > 0) {
        await pool.execute(
          'UPDATE staff SET password_hash = ? WHERE id = ?',
          [hashedPassword, staffCheck[0].id]
        );
      }
    }

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again with your new password.'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ success: false, message: 'Password change failed' });
  }
});

// ======================
// GET CURRENT USER PROFILE
// ======================
router.get('/profile/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const [users] = await pool.execute(`
      SELECT u.*, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    const profile = {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role_name,
      profile_picture: user.profile_picture,
      serial_code: user.serial_code,
      last_login: user.last_login
    };

    // Add role-specific data
    if (role === 'student') {
      const [studentData] = await pool.execute(`
        SELECT s.*, c.name as class_name, c.section
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id
        WHERE s.id = ?
      `, [user.student_id]);

      if (studentData.length > 0) {
        profile.student_data = studentData[0];
      }
    } else if (role === 'parent') {
      const [children] = await pool.execute(`
        SELECT s.id, s.student_id, s.first_name, s.last_name, c.name as class_name
        FROM parent_student_links psl
        JOIN students s ON psl.student_id = s.id
        LEFT JOIN classes c ON s.class_id = c.id
        WHERE psl.parent_id = ?
      `, [userId]);

      profile.children = children;
    } else if (role === 'staff' || role === 'teacher' || role === 'admin') {
      const [staffData] = await pool.execute(`
        SELECT s.*, d.name as department_name
        FROM staff s
        LEFT JOIN departments d ON s.department_id = d.id
        WHERE s.email = ?
      `, [user.email]);

      if (staffData.length > 0) {
        profile.staff_data = staffData[0];
      }
    }

    res.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// ======================
// GENERATE SERIAL CODE (ADMIN ONLY)
// ======================
router.post('/generate-serial-code', authenticateToken, async (req, res) => {
  try {
    const { type, person_id, person_name } = req.body; // type: 'student' or 'parent'

    if (!['student', 'parent'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type must be either "student" or "parent"' 
      });
    }

    let serialCode;
    let isUnique = false;

    // Generate unique serial code
    while (!isUnique) {
      serialCode = generateSerialCode(type);
      
      if (type === 'student') {
        const [existing] = await pool.execute(
          'SELECT id FROM students WHERE student_id = ?',
          [serialCode]
        );
        isUnique = existing.length === 0;
      } else {
        const [existing] = await pool.execute(
          'SELECT id FROM parents WHERE parent_code = ?',
          [serialCode]
        );
        isUnique = existing.length === 0;
      }
    }

    res.json({
      success: true,
      serial_code: serialCode,
      type,
      message: `Serial code generated successfully. Give this code to the ${type} for registration.`
    });

  } catch (error) {
    console.error('Generate serial code error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate serial code' });
  }
});

module.exports = router;
