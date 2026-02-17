const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const smsService = require('../services/smsService');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/profiles/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    message: 'Authentication service is running',
    timestamp: new Date().toISOString()
  });
});

// Login for both admin_users and users tables
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
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

    const { username, password } = req.body;
    let user = null;
    let isValidPassword = false;

    // First try admin_users table
    const [adminUsers] = await pool.execute(
      'SELECT * FROM admin_users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (adminUsers.length > 0) {
      user = adminUsers[0];
      isValidPassword = await bcrypt.compare(password, user.password);

      if (isValidPassword) {
        const token = jwt.sign(
          { userId: user.id, username: user.username, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE }
        );

        // Update last login
        await pool.execute(
          'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
          [user.id]
        );

        return res.json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            first_name: user.first_name || user.username,
            last_name: user.last_name || '',
            user_type: 'admin'
          }
        });
      }
    }

    // If not found in admin_users, try users table
    const [users] = await pool.execute(`
      SELECT u.*, COALESCE(r.name, u.role) as role_name 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE (u.username = ? OR u.email = ?) AND u.is_active = true
    `, [username, username]);

    if (users.length > 0) {
      user = users[0];
      isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (isValidPassword) {
        const token = jwt.sign(
          { userId: user.id, username: user.username, role: user.role_name },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE }
        );

        const defaultEmails = [
          'reponse@gmail.com',
          'reponsekdz06@gmail.com',
          'dod@reponsekdz06.com',
          'accountant@reponsekdz06@gmail.com',
          'dos@reponsekdz06.com',
          'advisor@reponsekdz06.com',
          'headmaster@reponsekdz06.com',
          'stockmanager@reponsekdz06.com'
        ];
        const userEmail = (user.email || '').trim().toLowerCase();
        const isDefaultEmail = defaultEmails.includes(userEmail);
        const mustChangeFromDb = user.must_change_password === 1 || user.must_change_password === true;
        const mustChange = mustChangeFromDb || isDefaultEmail;
        if (isDefaultEmail && !mustChangeFromDb) {
          await pool.execute(
            'UPDATE users SET last_login = NOW(), must_change_password = 1 WHERE id = ?',
            [user.id]
          ).catch(() => pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]));
        } else {
          await pool.execute(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [user.id]
          );
        }
        return res.json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role_name,
            first_name: user.first_name,
            last_name: user.last_name,
            student_id: user.student_id,
            user_type: 'user',
            must_change_password: mustChange
          }
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Student Login with Serial Code
router.post('/login/student', [
  body('serial_code').notEmpty().withMessage('Serial code is required'),
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

    const { serial_code, password } = req.body;

    // Find student by serial code (username)
    const [users] = await pool.execute(`
      SELECT u.* 
      FROM users u 
      WHERE u.username = ? AND u.role = 'student' AND u.is_active = true
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

    // Generate token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Update last login
    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        student_id: user.student_id || user.username,
        role: 'student'
      }
    });

  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Parent Login with Phone
router.post('/login/parent', [
  body('phone').notEmpty().withMessage('Phone number is required'),
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

    const { phone, password } = req.body;
    let parent = null;
    let isValidPassword = false;

    // First try parents table
    const [parents] = await pool.execute(`
      SELECT * FROM parents WHERE phone = ? AND is_active = true
    `, [phone]);

    if (parents.length > 0) {
      parent = parents[0];
      isValidPassword = await bcrypt.compare(password, parent.password_hash);

      if (isValidPassword) {
        const token = jwt.sign(
          { userId: parent.id, username: parent.username, role: 'parent' },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE }
        );

        await pool.execute(
          'UPDATE parents SET last_login = NOW() WHERE id = ?',
          [parent.id]
        );

        const [children] = await pool.execute(
          'SELECT COUNT(*) as count FROM parent_student WHERE parent_id = ?',
          [parent.id]
        );

        return res.json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: parent.id,
            username: parent.username,
            email: parent.email,
            phone: parent.phone,
            first_name: parent.first_name,
            last_name: parent.last_name,
            profile_image: parent.profile_image,
            role: 'parent',
            children_count: children[0].count
          }
        });
      }
    }

    // If not found in parents table, try users table with parent role
    const [users] = await pool.execute(`
      SELECT u.*, r.name as role_name 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.phone = ? AND (r.name = 'parent' OR u.role = 'parent') AND u.is_active = true
    `, [phone]);

    if (users.length > 0) {
      parent = users[0];
      isValidPassword = await bcrypt.compare(password, parent.password_hash);

      if (isValidPassword) {
        const token = jwt.sign(
          { userId: parent.id, username: parent.username, role: 'parent' },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE }
        );

        await pool.execute(
          'UPDATE users SET last_login = NOW() WHERE id = ?',
          [parent.id]
        );

        const [children] = await pool.execute(
          'SELECT COUNT(*) as child_count FROM parent_student WHERE parent_id = ?',
          [parent.id]
        );

        return res.json({
          success: true,
          message: 'Parent login successful',
          token,
          user: {
            id: parent.id,
            username: parent.username,
            email: parent.email,
            phone: parent.phone,
            role: 'parent',
            first_name: parent.first_name,
            last_name: parent.last_name,
            user_type: 'parent',
            linked_children: children[0].child_count
          }
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid phone number or password'
    });

  } catch (error) {
    console.error('Parent login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Enhanced Student Registration with Serial Code
router.post('/register/student', [
  body('serial_code').notEmpty().withMessage('Serial code is required'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('date_of_birth').optional().isDate().withMessage('Valid date of birth required'),
  body('gender').optional().isIn(['Male', 'Female']).withMessage('Valid gender required'),
  body('address').optional(),
  body('emergency_contact').optional(),
  body('medical_info').optional(),
  body('parent_info').optional()
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

    const {
      serial_code,
      first_name,
      last_name,
      email,
      phone,
      password,
      date_of_birth,
      gender,
      address,
      emergency_contact,
      medical_info,
      parent_info
    } = req.body;

    // Validate serial code from new serial_codes table
    const [serialCodeResult] = await connection.execute(
      `SELECT sc.*, gss.first_name as student_first_name, gss.last_name as student_last_name, 
              gss.trade_name, gss.trade_code, gss.level_number, gss.level_suffix
       FROM serial_codes sc
       JOIN global_student_sheets gss ON sc.student_id = gss.student_id
       WHERE sc.serial_code = ? AND sc.status = 'active'`,
      [serial_code]
    );

    if (serialCodeResult.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid or already used serial code'
      });
    }

    const serialCodeData = serialCodeResult[0];
    const trade_code = serialCodeData.trade_code;
    const level_number = serialCodeData.level_number;
    const level_suffix = serialCodeData.level_suffix;

    // Check if serial code has expired
    if (serialCodeData.expires_at && new Date(serialCodeData.expires_at) < new Date()) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Serial code has expired'
      });
    }

    // Check if email already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get student role ID
    const [studentRole] = await connection.execute(
      'SELECT id FROM roles WHERE name = "student"'
    );

    if (studentRole.length === 0) {
      throw new Error('Student role not found');
    }

    // Generate student ID
    const year = new Date().getFullYear();
    const tradePrefix = trade_code.toUpperCase();
    const levelSuffix = level_suffix ? `${level_number}${level_suffix}` : level_number;

    const [lastStudent] = await connection.execute(
      'SELECT student_id FROM users WHERE student_id LIKE ? ORDER BY student_id DESC LIMIT 1',
      [`${year}${tradePrefix}${levelSuffix}%`]
    );

    let studentNumber = 1;
    if (lastStudent.length > 0) {
      const lastNumber = parseInt(lastStudent[0].student_id.slice(-3));
      studentNumber = lastNumber + 1;
    }

    const student_id = `${year}${tradePrefix}${levelSuffix}${studentNumber.toString().padStart(3, '0')}`;
    const username = student_id;

    // Create parent if provided
    let parent_id = null;
    if (parent_info && parent_info.first_name && parent_info.last_name) {
      const [parentRoleResult] = await connection.execute(
        'SELECT id FROM roles WHERE name = "parent"'
      );

      if (parentRoleResult.length > 0) {
        const [parentResult] = await connection.execute(`
          INSERT INTO users (
            username, email, password_hash, first_name, last_name,
            phone, role_id, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, true)
        `, [
          `parent_${Date.now()}`,
          parent_info.email || `${first_name.toLowerCase()}.parent@school.rw`,
          '$2a$10$defaulthash', // Default password hash
          parent_info.first_name,
          parent_info.last_name,
          parent_info.phone,
          parentRoleResult[0].id
        ]);

        parent_id = parentResult.insertId;
      }
    }

    // Create student
    const [studentResult] = await connection.execute(`
      INSERT INTO users (
        username, email, password_hash, first_name, last_name,
        phone, date_of_birth, gender, role_id, student_id, parent_id,
        address, emergency_contact, medical_info, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
    `, [
      username,
      email,
      hashedPassword,
      first_name,
      last_name,
      phone,
      date_of_birth,
      gender,
      studentRole[0].id,
      student_id,
      parent_id,
      address,
      emergency_contact,
      medical_info
    ]);

    const new_student_id = studentResult.insertId;

    // Get trade level and assign to appropriate class
    const [tradeLevelResult] = await connection.execute(`
      SELECT tl.id, tl.trade_code, tl.level_number, tl.level_suffix
      FROM trade_levels tl
      WHERE tl.trade_code = ? AND tl.level_number = ?
      AND (tl.level_suffix = ? OR (tl.level_suffix IS NULL AND ? IS NULL))
    `, [trade_code, level_number, level_suffix, level_suffix]);

    if (tradeLevelResult.length > 0) {
      // Get current academic year
      const [academicYearResult] = await connection.execute(
        'SELECT id FROM academic_years WHERE is_active = true LIMIT 1'
      );

      if (academicYearResult.length > 0) {
        // Find available class or create new one
        const [classResult] = await connection.execute(`
          SELECT id, current_enrollment, capacity
          FROM trade_classes
          WHERE trade_level_id = ? AND academic_year_id = ? AND is_active = true
          AND current_enrollment < capacity
          ORDER BY current_enrollment ASC
          LIMIT 1
        `, [tradeLevelResult[0].id, academicYearResult[0].id]);

        let class_id;
        if (classResult.length > 0) {
          class_id = classResult[0].id;

          // Update enrollment count
          await connection.execute(`
            UPDATE trade_classes
            SET current_enrollment = current_enrollment + 1
            WHERE id = ?
          `, [class_id]);
        } else {
          // Create new class
          const [classCount] = await connection.execute(`
            SELECT COUNT(*) as count FROM trade_classes
            WHERE trade_level_id = ? AND academic_year_id = ?
          `, [tradeLevelResult[0].id, academicYearResult[0].id]);

          const classNumber = classCount[0].count + 1;
          const className = `Class ${classNumber}`;

          const [newClassResult] = await connection.execute(`
            INSERT INTO trade_classes (
              trade_level_id, academic_year_id, class_name, current_enrollment
            ) VALUES (?, ?, ?, 1)
          `, [tradeLevelResult[0].id, academicYearResult[0].id, className]);

          class_id = newClassResult.insertId;
        }

        // Enroll student in class
        await connection.execute(`
          INSERT INTO enrollments (
            student_id, class_id, academic_year_id, enrollment_date, status
          ) VALUES (?, ?, ?, CURDATE(), 'active')
        `, [new_student_id, class_id, academicYearResult[0].id]);
      }
    }

    // Mark serial code as used
    await connection.execute(`
      UPDATE serial_codes
      SET status = 'used', 
          used_by = ?, 
          used_at = NOW()
      WHERE serial_code = ?
    `, [new_student_id, serial_code]);

    await connection.commit();

    // Send welcome message to student
    const studentMessage = `Muraho ${first_name}! Murakaza neza kuri Garden TVET School. Konti yanyu y'umunyeshuri yafunguwe neza. Student ID yanyu ni: ${student_id}`;
    smsService.sendUniversalMessage(phone, studentMessage, 0, {
      type: 'student_registration',
      studentId: new_student_id,
      preferredMethod: 'whatsapp'
    }).catch(err => console.error('Failed to send student welcome message:', err));

    // Send welcome message to parent if created
    if (parent_id && parent_info && parent_info.phone) {
      const parentMessage = `Muraho ${parent_info.first_name}! Umwana wanyu ${first_name} ${last_name} yanditswe muri Garden TVET School. Student ID ye ni: ${student_id}. Mushobora kwinjira mukoresheje imeyili yanyu mwanatanze.`;
      smsService.sendUniversalMessage(parent_info.phone, parentMessage, 0, {
        type: 'parent_registration_via_student',
        parentId: parent_id,
        studentId: new_student_id,
        preferredMethod: 'whatsapp'
      }).catch(err => console.error('Failed to send parent welcome message:', err));
    }

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { userId: new_student_id, username: username, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: 'Student registration successful',
      token,
      user: {
        id: new_student_id,
        username,
        email,
        first_name,
        last_name,
        student_id,
        role: 'student'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Student registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Student Registration with Serial Code
router.post('/register/student-serial', [
  body('serial_code').notEmpty().withMessage('Serial code is required'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      serial_code,
      first_name,
      last_name,
      phone,
      password,
      date_of_birth,
      gender,
      address
    } = req.body;

    // Check if serial code exists and is not used
    const [serialCodes] = await connection.execute(
      'SELECT * FROM serial_codes WHERE serial_code = ? AND status = ? AND used_by IS NULL',
      [serial_code, 'active']
    );

    if (serialCodes.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid or already used serial code'
      });
    }

    const serialCodeData = serialCodes[0];

    // Check if phone already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get student role ID
    const [roles] = await connection.execute(
      "SELECT id FROM roles WHERE name = 'student'"
    );
    const role_id = roles.length > 0 ? roles[0].id : null;

    // Create user account with serial code as username
    const [userResult] = await connection.execute(`
      INSERT INTO users (username, email, password_hash, role, role_id, first_name, last_name, phone, is_active, created_at)
      VALUES (?, ?, ?, 'student', ?, ?, ?, ?, true, NOW())
    `, [serial_code, `${serial_code}@garden.tvet`, hashedPassword, role_id, first_name, last_name, phone]);

    const new_student_id = userResult.insertId;

    // Create student profile
    await connection.execute(`
      INSERT INTO student_profiles (user_id, admission_number, date_of_birth, gender, address, enrollment_date)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [new_student_id, serial_code, date_of_birth || null, gender || null, address || null]);

    // Mark serial code as used
    await connection.execute(
      'UPDATE serial_codes SET status = ?, used_by = ?, used_at = NOW() WHERE serial_code = ?',
      ['used', new_student_id, serial_code]
    );

    // Add student to global_student_sheets if serial code has trade info
    if (serialCodeData.trade_code && serialCodeData.level_number) {
      await connection.execute(`
        INSERT INTO global_student_sheets (
          student_id, student_code, first_name, last_name, email, phone,
          trade_code, trade_name, level_number, level_suffix,
          status, enrollment_date, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
      `, [
        new_student_id,
        serial_code,
        first_name,
        last_name,
        `${serial_code}@garden.tvet`,
        phone,
        serialCodeData.trade_code,
        serialCodeData.trade_name || serialCodeData.trade_code,
        serialCodeData.level_number,
        serialCodeData.level_suffix || ''
      ]);

      // Create enrollment if trade_classes exist
      const [tradeClasses] = await connection.execute(
        'SELECT id FROM trade_classes WHERE trade_code = ? ORDER BY id DESC LIMIT 1',
        [serialCodeData.trade_code]
      );

      if (tradeClasses.length > 0) {
        await connection.execute(`
          INSERT INTO enrollments (student_id, class_id, enrollment_date, status)
          VALUES (?, ?, NOW(), 'active')
        `, [new_student_id, tradeClasses[0].id]);
      }
    }

    await connection.commit();

    // Send welcome SMS
    const welcomeMessage = `Muraho ${first_name}! Wakoze kwinjira muri Garden TVET School. Nimero yawe ni: ${serial_code}. Urakoze!`;
    smsService.sendUniversalMessage(phone, welcomeMessage, 0, {
      type: 'student_registration',
      studentId: new_student_id
    }).catch(err => console.error('Failed to send welcome SMS:', err));

    // Generate JWT token
    const token = jwt.sign(
      { userId: new_student_id, username: serial_code, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: 'Student registration successful',
      token,
      user: {
        id: new_student_id,
        username: serial_code,
        email: `${serial_code}@garden.tvet`,
        first_name,
        last_name,
        student_id: serial_code,
        role: 'student'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Student serial registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Enhanced Parent Registration
router.post('/register/parent', [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('district').notEmpty().withMessage('District is required'),
  body('province').notEmpty().withMessage('Province is required'),
  body('relationship_type').isIn(['father', 'mother', 'guardian']).withMessage('Relationship type must be father, mother, or guardian'),
  body('address').optional(),
  body('occupation').optional(),
  body('children').optional().isArray().withMessage('Children must be an array')
], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      password,
      district,
      province,
      relationship_type,
      address,
      occupation,
      children
    } = req.body;

    // Check if email already exists in parents table
    const [existingParents] = await connection.execute(
      'SELECT id FROM parents WHERE email = ?',
      [email]
    );

    if (existingParents.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate username
    const username = `parent_${Date.now()}`;

    // Create parent in parents table
    const [parentResult] = await connection.execute(`
      INSERT INTO parents (
        username, email, password_hash, first_name, last_name,
        phone, address, district, province, relationship_type, occupation, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
    `, [
      username,
      email,
      hashedPassword,
      first_name,
      last_name,
      phone,
      address,
      district,
      province,
      relationship_type,
      occupation
    ]);

    const parent_id = parentResult.insertId;

    // Link children if provided
    if (children && Array.isArray(children)) {
      for (const child of children) {
        if (child.student_id) {
          await connection.execute(
            'INSERT INTO parent_student (parent_id, student_id) VALUES (?, ?)',
            [parent_id, child.student_id]
          );
        }
      }
    }

    await connection.commit();

    // Send welcome message via WhatsApp/SMS
    const welcomeMessage = `Muraho ${first_name} ${last_name}! Murakaza neza kuri Garden TVET School. Konti yanyu y'umubyeyi yafunguwe neza. Mushobora gukurikirana imyigire y'abana banyu hano.`;

    smsService.sendUniversalMessage(phone, welcomeMessage, 0, {
      type: 'parent_registration',
      parentId: parent_id,
      preferredMethod: 'whatsapp'
    }).catch(err => console.error('Failed to send welcome message:', err));

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { userId: parent_id, username: username, role: 'parent' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: 'Parent registration successful',
      token,
      user: {
        id: parent_id,
        username,
        email,
        first_name,
        last_name,
        phone,
        profile_image: null,
        role: 'parent'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Parent registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Get available trades for registration
router.get('/registration/trades', async (req, res) => {
  try {
    const [trades] = await pool.execute(`
      SELECT
        tl.id,
        tl.trade_code,
        tl.trade_name,
        tl.level_number,
        tl.level_suffix,
        tl.full_name,
        tl.description,
        tl.capacity,
        COUNT(tc.id) as class_count
      FROM trade_levels tl
      LEFT JOIN trade_classes tc ON tl.id = tc.id
      WHERE tl.is_active = true
      GROUP BY tl.id
      ORDER BY tl.trade_code, tl.level_number, tl.level_suffix
    `);

    res.json({
      success: true,
      trades
    });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trades'
    });
  }
});

// Check email availability
router.post('/check-email', [
  body('email').isEmail().withMessage('Valid email required')
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

    const { email } = req.body;

    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    res.json({
      success: true,
      available: existingUsers.length === 0
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Register new user (legacy - kept for backward compatibility)
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
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

    const { username, email, password, first_name, last_name, phone } = req.body;

    // Check if username or email already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get student role ID (default for registration)
    const [studentRole] = await pool.execute(
      'SELECT id FROM roles WHERE name = "student"'
    );

    if (studentRole.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Student role not found'
      });
    }

    // Generate student ID
    const year = new Date().getFullYear();
    const [lastStudent] = await pool.execute(
      'SELECT student_id FROM users WHERE student_id LIKE ? ORDER BY student_id DESC LIMIT 1',
      [`${year}%`]
    );

    let nextNumber = 1;
    if (lastStudent.length > 0) {
      const lastNumber = parseInt(lastStudent[0].student_id.slice(-4));
      nextNumber = lastNumber + 1;
    }

    const student_id = `${year}${nextNumber.toString().padStart(4, '0')}`;

    // Create user
    const [result] = await pool.execute(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role_id, student_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [username, email, hashedPassword, first_name, last_name, phone, studentRole[0].id, student_id]);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: result.insertId,
        username,
        email,
        first_name,
        last_name,
        student_id
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    let user = null;

    const defaultEmails = [
      'reponse@gmail.com',
      'reponsekdz06@gmail.com',
      'dod@reponsekdz06.com',
      'accountant@reponsekdz06@gmail.com',
      'dos@reponsekdz06.com',
      'advisor@reponsekdz06.com',
      'headmaster@reponsekdz06.com',
      'stockmanager@reponsekdz06.com'
    ];

    // Try admin_users first
    const [adminUsers] = await pool.execute(
      'SELECT id, username, email, role, first_name, last_name FROM admin_users WHERE id = ?',
      [req.user.id]
    );
    if (adminUsers.length > 0) {
      const au = adminUsers[0];
      const [auWithFlag] = await pool.execute('SELECT must_change_password FROM admin_users WHERE id = ?', [req.user.id]).catch(() => [[]]);
      const dbMustChange = auWithFlag[0] && (auWithFlag[0].must_change_password === 1 || auWithFlag[0].must_change_password === true);
      user = {
        ...au,
        user_type: 'admin',
        must_change_password: dbMustChange || defaultEmails.includes((au.email || '').trim().toLowerCase())
      };
    } else {
      const [users] = await pool.execute(`
        SELECT u.*, COALESCE(r.name, u.role) as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `, [req.user.id]);

      if (users.length > 0) {
        const u0 = users[0];
        const dbMustChange = u0.must_change_password === 1 || u0.must_change_password === true;
        user = {
          id: u0.id,
          username: u0.username,
          email: u0.email,
          first_name: u0.first_name,
          last_name: u0.last_name,
          student_id: u0.student_id,
          role: u0.role_name,
          user_type: 'user',
          must_change_password: dbMustChange || defaultEmails.includes((u0.email || '').trim().toLowerCase())
        };
        delete user.password_hash;
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Force change email & password (staff first login – blocking; credentials stored in DB)
router.put('/force-change-credentials', [
  authenticateToken,
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_email').isEmail().withMessage('Valid new email is required'),
  body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0]?.msg || 'Validation failed' });
    }
    const userId = req.user.userId || req.user.id;
    const { current_password, new_email, new_password } = req.body;

    const [adminUsers] = await pool.execute('SELECT id, password FROM admin_users WHERE id = ?', [userId]);
    if (adminUsers.length > 0) {
      const valid = await bcrypt.compare(current_password, adminUsers[0].password);
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }
      const hashed = await bcrypt.hash(new_password, 10);
      await pool.execute(
        'UPDATE admin_users SET email = ?, password = ?, updated_at = NOW(), must_change_password = 0 WHERE id = ?',
        [new_email.trim(), hashed, userId]
      ).catch(() => pool.execute('UPDATE admin_users SET email = ?, password = ?, updated_at = NOW() WHERE id = ?', [new_email.trim(), hashed, userId]));
      const [updated] = await pool.execute('SELECT id, username, email, role, first_name, last_name FROM admin_users WHERE id = ?', [userId]);
      return res.json({
        success: true,
        message: 'Email and password updated. Please sign in with your new credentials.',
        user: { ...updated[0], user_type: 'admin', must_change_password: false }
      });
    }

    const [users] = await pool.execute('SELECT id, password_hash FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const valid = await bcrypt.compare(current_password, users[0].password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    const hashed = await bcrypt.hash(new_password, 10);
    await pool.execute(
      'UPDATE users SET email = ?, password_hash = ?, updated_at = COALESCE(updated_at, NOW()), must_change_password = 0 WHERE id = ?',
      [new_email.trim(), hashed, userId]
    ).catch(() => pool.execute(
      'UPDATE users SET email = ?, password_hash = ?, updated_at = COALESCE(updated_at, NOW()) WHERE id = ?',
      [new_email.trim(), hashed, userId]
    ));
    const [updated] = await pool.execute(`
      SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.student_id, COALESCE(r.name, u.role) as role
      FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?
    `, [userId]);
    const out = { ...updated[0], user_type: 'user', must_change_password: false };
    return res.json({
      success: true,
      message: 'Email and password updated. Please sign in with your new credentials.',
      user: out
    });
  } catch (error) {
    console.error('Force change credentials error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Update profile with password change capability
router.put('/profile', [
  authenticateToken,
  upload.single('profile_image'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional()
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

    const { email, name, phone } = req.body;
    const userId = req.user.userId;
    const updateFields = [];
    const updateValues = [];

    // Check if user is admin or regular user
    const [adminUsers] = await pool.execute(
      'SELECT id FROM admin_users WHERE id = ?',
      [userId]
    );

    let updateTable = adminUsers.length > 0 ? 'admin_users' : 'users';

    // Build update query
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (name) {
      if (updateTable === 'admin_users') {
        updateFields.push('username = ?');
      } else {
        updateFields.push('first_name = ?');
      }
      updateValues.push(name);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone || null);
    }
    if (req.file) {
      const profile_image = `/uploads/profiles/${req.file.filename}`;
      updateFields.push('profile_image = ?');
      updateValues.push(profile_image);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(userId);
    const query = `UPDATE ${updateTable} SET ${updateFields.join(', ')} WHERE id = ?`;
    await pool.execute(query, updateValues);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Change password
router.put('/change-password', [
  authenticateToken,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
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

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Check if user is admin or regular user
    const [adminUsers] = await pool.execute(
      'SELECT password FROM admin_users WHERE id = ?',
      [userId]
    );

    let currentHashedPassword = null;
    let updateTable = '';
    let passwordField = '';

    if (adminUsers.length > 0) {
      currentHashedPassword = adminUsers[0].password;
      updateTable = 'admin_users';
      passwordField = 'password';
    } else {
      const [users] = await pool.execute(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId]
      );

      if (users.length > 0) {
        currentHashedPassword = users[0].password_hash;
        updateTable = 'users';
        passwordField = 'password_hash';
      }
    }

    if (!currentHashedPassword) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, currentHashedPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.execute(
      `UPDATE ${updateTable} SET ${passwordField} = ? WHERE id = ?`,
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Student serial code login (serial_code + password)
router.post('/login/student', [
  body('serial_code').notEmpty().withMessage('Serial code is required'),
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

    const { serial_code, password } = req.body;

    const [users] = await pool.execute(`
      SELECT u.*, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE (u.student_id = ? OR u.serial_code = ?) AND r.name = 'student' AND u.is_active = true
    `, [serial_code, serial_code]);

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

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    res.json({
      success: true,
      message: 'Student login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        student_id: user.student_id,
        role: 'student',
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: 'student'
      }
    });

  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Parent phone-based login (phone + password)
router.post('/login/parent', [
  body('phone').notEmpty().withMessage('Phone number is required'),
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

    const { phone, password } = req.body;

    const [users] = await pool.execute(`
      SELECT u.*, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.phone = ? AND r.name = 'parent' AND u.is_active = true
    `, [phone]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: 'parent' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    const [children] = await pool.execute(`
      SELECT COUNT(*) as child_count
      FROM parent_student WHERE parent_id = ?
    `, [user.id]);

    res.json({
      success: true,
      message: 'Parent login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: 'parent',
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: 'parent',
        linked_children: children[0].child_count
      }
    });

  } catch (error) {
    console.error('Parent login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Parent phone-based registration (phone + password + district + province + relationship)
router.post('/register/parent-phone', [
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Valid email required if provided'),
  body('district').notEmpty().withMessage('District is required'),
  body('province').notEmpty().withMessage('Province is required'),
  body('relationship_type').isIn(['father', 'mother', 'guardian']).withMessage('Relationship type must be father, mother, or guardian'),
  body('address').optional()
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

    const { phone, password, first_name, last_name, email, district, province, relationship_type, address } = req.body;

    const [existingPhone] = await pool.execute(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );

    if (existingPhone.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered'
      });
    }

    if (email) {
      const [existingEmail] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [parentRole] = await pool.execute(
      'SELECT id FROM roles WHERE name = "parent"'
    );

    if (parentRole.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Parent role not found in system'
      });
    }

    const username = `parent_${phone.replace(/[^0-9]/g, '')}`;
    const parentEmail = email || `${username}@parent.gardentvet.com`;

    const [result] = await pool.execute(`
      INSERT INTO users (
        username, email, password_hash, first_name, last_name, phone, address, 
        district, province, relationship_type, role_id, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
    `, [username, parentEmail, hashedPassword, first_name, last_name, phone, address,
      district, province, relationship_type, parentRole[0].id]);

    const token = jwt.sign(
      { userId: result.insertId, username, role: 'parent' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: 'Parent account created successfully',
      token,
      user: {
        id: result.insertId,
        username,
        email: parentEmail,
        phone,
        district,
        province,
        relationship_type,
        role: 'parent',
        first_name,
        last_name,
        user_type: 'parent'
      }
    });

  } catch (error) {
    console.error('Parent phone registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update profile for all user types
router.put('/profile/update', authenticateToken, upload.single('profile_image'), [
  body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
  body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
  body('address').optional(),
  body('current_password').optional(),
  body('new_password').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
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

    const userId = req.user.userId;
    const userType = req.user.userType || 'user';
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      current_password,
      new_password,
      date_of_birth,
      gender,
      emergency_contact,
      medical_info
    } = req.body;

    // Determine which table to update
    const isAdminUser = ['admin', 'headmaster', 'dos', 'dod', 'accountant', 'stockmanager', 'patron', 'advisor'].includes(req.user.role);
    const tableName = isAdminUser ? 'admin_users' : 'users';

    // Get current user data
    const [currentUser] = await connection.execute(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [userId]
    );

    if (currentUser.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = currentUser[0];
    const updates = [];
    const values = [];
    const changes = [];

    // Validate email uniqueness if being changed
    if (email && email !== user.email) {
      const [existingEmail] = await connection.execute(
        `SELECT id FROM ${tableName} WHERE email = ? AND id != ?`,
        [email, userId]
      );

      if (existingEmail.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another user'
        });
      }

      updates.push('email = ?');
      values.push(email);
      changes.push({ field: 'email', old_value: user.email, new_value: email });
    }

    // Update basic fields
    if (first_name && first_name !== user.first_name) {
      updates.push('first_name = ?');
      values.push(first_name);
      changes.push({ field: 'first_name', old_value: user.first_name, new_value: first_name });
    }

    if (last_name && last_name !== user.last_name) {
      updates.push('last_name = ?');
      values.push(last_name);
      changes.push({ field: 'last_name', old_value: user.last_name, new_value: last_name });
    }

    if (phone && phone !== user.phone) {
      updates.push('phone = ?');
      values.push(phone);
      changes.push({ field: 'phone', old_value: user.phone, new_value: phone });
    }

    // Update extended fields (only for users table)
    if (!isAdminUser) {
      if (address && address !== user.address) {
        updates.push('address = ?');
        values.push(address);
        changes.push({ field: 'address', old_value: user.address, new_value: address });
      }

      if (date_of_birth && date_of_birth !== user.date_of_birth) {
        updates.push('date_of_birth = ?');
        values.push(date_of_birth);
        changes.push({ field: 'date_of_birth', old_value: user.date_of_birth, new_value: date_of_birth });
      }

      if (gender && gender !== user.gender) {
        updates.push('gender = ?');
        values.push(gender);
        changes.push({ field: 'gender', old_value: user.gender, new_value: gender });
      }

      if (emergency_contact && emergency_contact !== user.emergency_contact) {
        updates.push('emergency_contact = ?');
        values.push(emergency_contact);
        changes.push({ field: 'emergency_contact', old_value: user.emergency_contact, new_value: emergency_contact });
      }

      if (medical_info && medical_info !== user.medical_info) {
        updates.push('medical_info = ?');
        values.push(medical_info);
        changes.push({ field: 'medical_info', old_value: user.medical_info, new_value: medical_info });
      }
    }

    // Handle profile image upload
    if (req.file) {
      const imagePath = `/uploads/profiles/${req.file.filename}`;
      updates.push('profile_image = ?');
      values.push(imagePath);
      changes.push({ field: 'profile_image', old_value: user.profile_image, new_value: imagePath });
    }

    // Handle password change
    if (new_password) {
      if (!current_password) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set new password'
        });
      }

      // Verify current password
      const passwordField = isAdminUser ? 'password' : 'password_hash';
      const isValidPassword = await bcrypt.compare(current_password, user[passwordField]);

      if (!isValidPassword) {
        await connection.rollback();
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      const hashedNewPassword = await bcrypt.hash(new_password, 10);
      updates.push(`${passwordField} = ?`);
      values.push(hashedNewPassword);
      changes.push({ field: 'password', old_value: '***', new_value: '***' });

      // Update password field for users table too if it exists
      if (!isAdminUser) {
        updates.push('password = ?');
        values.push(hashedNewPassword);
      }
    }

    // Perform update if there are changes
    if (updates.length > 0) {
      values.push(userId);
      await connection.execute(
        `UPDATE ${tableName} SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );

      // Log profile changes
      for (const change of changes) {
        await connection.execute(
          `INSERT INTO profile_edit_history (user_id, field_changed, old_value, new_value, ip_address, user_agent)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            userId,
            change.field,
            change.old_value,
            change.new_value,
            req.ip,
            req.get('user-agent')
          ]
        );
      }
    }

    await connection.commit();

    // Fetch updated user data
    const [updatedUser] = await connection.execute(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser[0].id,
        username: updatedUser[0].username,
        email: updatedUser[0].email,
        first_name: updatedUser[0].first_name,
        last_name: updatedUser[0].last_name,
        phone: updatedUser[0].phone,
        profile_image: updatedUser[0].profile_image,
        role: req.user.role
      },
      changes_made: changes.length
    });

  } catch (error) {
    await connection.rollback();
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Get profile information
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const isAdminUser = ['admin', 'headmaster', 'dos', 'dod', 'accountant', 'stockmanager', 'patron', 'advisor'].includes(req.user.role);
    const tableName = isAdminUser ? 'admin_users' : 'users';

    const [user] = await pool.execute(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = user[0];
    const profile = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      profile_image: userData.profile_image,
      role: req.user.role,
      is_active: userData.is_active,
      last_login: userData.last_login,
      created_at: userData.created_at
    };

    // Add extended fields for regular users
    if (!isAdminUser) {
      profile.student_id = userData.student_id;
      profile.date_of_birth = userData.date_of_birth;
      profile.gender = userData.gender;
      profile.address = userData.address;
      profile.emergency_contact = userData.emergency_contact;
      profile.medical_info = userData.medical_info;
    }

    res.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

// Get profile edit history
router.get('/profile/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;

    const [history] = await pool.execute(
      `SELECT * FROM profile_edit_history 
       WHERE user_id = ? 
       ORDER BY changed_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      history,
      count: history.length
    });

  } catch (error) {
    console.error('Get profile history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile history',
      error: error.message
    });
  }
});

module.exports = router;
