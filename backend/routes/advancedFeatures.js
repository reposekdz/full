const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const xlsx = require('xlsx');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/imports');
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /xlsx|xls|csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) and CSV files are allowed'));
    }
  }
});

// =============================== PARENT-STUDENT LINKING SYSTEM ===============================
router.post('/parent/generate-code', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster', 'director_discipline'),
  body('student_id').isInt().withMessage('Valid student ID required'),
  body('parent_phone').isMobilePhone().withMessage('Valid phone number required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { student_id, parent_phone } = req.body;

    // Get student details
    const [student] = await pool.execute(`
      SELECT u.first_name, u.last_name, u.student_id, c.name as course_name, ay.name as academic_year
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      JOIN classes cl ON e.class_id = cl.id
      JOIN courses c ON cl.course_id = c.id
      JOIN academic_years ay ON e.academic_year_id = ay.id
      WHERE u.id = ? AND u.role_id = (SELECT id FROM roles WHERE name = 'student')
      ORDER BY e.enrollment_date DESC LIMIT 1
    `, [student_id]);

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const studentData = student[0];
    const studentName = `${studentData.first_name} ${studentData.last_name}`;

    // Check if parent already linked to another student
    const [existingLink] = await pool.execute(`
      SELECT psl.*, u.first_name, u.last_name
      FROM parent_student_links psl
      JOIN users u ON psl.student_id = u.id
      WHERE psl.parent_id IN (SELECT id FROM users WHERE phone = ? AND role_id = (SELECT id FROM roles WHERE name = 'parent'))
    `, [parent_phone]);

    if (existingLink.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This parent phone number is already linked to another student',
        linked_student: `${existingLink[0].first_name} ${existingLink[0].last_name}`
      });
    }

    // Generate verification code
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Save code to database
    const [result] = await pool.execute(
      'INSERT INTO parent_student_codes (student_id, parent_phone, verification_code, student_name, student_level, student_trade, academic_year) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [student_id, parent_phone, verificationCode, studentName, 'N/A', studentData.course_name, studentData.academic_year]
    );

    res.status(201).json({
      success: true,
      message: 'Verification code generated successfully',
      code: verificationCode,
      student_name: studentName,
      expires_in: '24 hours'
    });
  } catch (error) {
    console.error('Generate parent code error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/parent/verify-code', [
  body('verification_code').notEmpty().withMessage('Verification code required'),
  body('parent_id').isInt().withMessage('Valid parent ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { verification_code, parent_id } = req.body;

    // Find valid code
    const [codes] = await pool.execute(
      'SELECT * FROM parent_student_codes WHERE verification_code = ? AND is_used = false AND expires_at > NOW()',
      [verification_code]
    );

    if (codes.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    const codeData = codes[0];

    // Check if parent already linked
    const [existingLink] = await pool.execute(
      'SELECT id FROM parent_student_links WHERE parent_id = ?',
      [parent_id]
    );

    if (existingLink.length > 0) {
      return res.status(400).json({ success: false, message: 'Parent is already linked to a student' });
    }

    // Create link
    const [result] = await pool.execute(
      'INSERT INTO parent_student_links (parent_id, student_id, relationship_type, linked_by) VALUES (?, ?, ?, ?)',
      [parent_id, codeData.student_id, 'guardian', null]
    );

    // Mark code as used
    await pool.execute(
      'UPDATE parent_student_codes SET is_used = true WHERE id = ?',
      [codeData.id]
    );

    // Get student details for response
    const [student] = await pool.execute(
      'SELECT first_name, last_name FROM users WHERE id = ?',
      [codeData.student_id]
    );

    res.json({
      success: true,
      message: 'Parent successfully linked to student',
      student: {
        id: codeData.student_id,
        name: `${student[0].first_name} ${student[0].last_name}`
      }
    });
  } catch (error) {
    console.error('Verify parent code error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/parent/my-student', [authenticateToken], async (req, res) => {
  try {
    const parentId = req.user.id;

    const [links] = await pool.execute(`
      SELECT psl.*, u.first_name, u.last_name, u.student_id as student_number,
             c.name as course_name, ay.name as academic_year
      FROM parent_student_links psl
      JOIN users u ON psl.student_id = u.id
      LEFT JOIN enrollments e ON u.id = e.student_id
      LEFT JOIN classes cl ON e.class_id = cl.id
      LEFT JOIN courses c ON cl.course_id = c.id
      LEFT JOIN academic_years ay ON e.academic_year_id = ay.id
      WHERE psl.parent_id = ? AND psl.status = 'active'
      ORDER BY e.enrollment_date DESC LIMIT 1
    `, [parentId]);

    if (links.length === 0) {
      return res.json({ success: true, linked: false, student: null });
    }

    res.json({
      success: true,
      linked: true,
      student: links[0]
    });
  } catch (error) {
    console.error('Get parent student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =============================== EXCEL IMPORT SYSTEM ===============================
router.post('/import/students', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'director_discipline'),
  upload.single('file')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { class_id, academic_year_id } = req.body;
    const filePath = req.file.path;
    const importedBy = req.user.id;

    // Read Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    // Create import record
    const [importResult] = await pool.execute(
      'INSERT INTO student_data_imports (filename, import_type, total_rows, imported_by, class_id, academic_year_id) VALUES (?, ?, ?, ?, ?, ?)',
      [req.file.originalname, 'excel', jsonData.length, importedBy, class_id || null, academic_year_id || null]
    );

    const importId = importResult.insertId;
    let successfulImports = 0;
    let failedImports = 0;
    const errors = [];

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      try {
        // Validate required fields
        if (!row.first_name || !row.last_name || !row.email) {
          throw new Error('Missing required fields: first_name, last_name, email');
        }

        // Check if student already exists
        const [existing] = await pool.execute(
          'SELECT id FROM users WHERE email = ? OR (first_name = ? AND last_name = ?)',
          [row.email, row.first_name, row.last_name]
        );

        if (existing.length > 0) {
          throw new Error('Student already exists');
        }

        // Generate username and student ID
        const username = `${row.first_name.toLowerCase()}.${row.last_name.toLowerCase()}`.replace(/\s+/g, '');
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
        const studentId = `${year}${nextNumber.toString().padStart(4, '0')}`;

        // Hash default password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('student123', 10);

        // Get student role ID
        const [role] = await pool.execute('SELECT id FROM roles WHERE name = ?', ['student']);

        // Create student
        await pool.execute(`
          INSERT INTO users (
            username, email, password_hash, first_name, last_name,
            phone, address, date_of_birth, gender, role_id, student_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          username, row.email, hashedPassword, row.first_name, row.last_name,
          row.phone || null, row.address || null, row.date_of_birth || null,
          row.gender || null, role[0].id, studentId
        ]);

        successfulImports++;
      } catch (error) {
        failedImports++;
        errors.push({
          row: i + 2, // +2 because Excel rows start at 1 and we have header
          error: error.message,
          data: row
        });

        // Log error
        await pool.execute(
          'INSERT INTO import_error_logs (import_id, row_number, error_message, raw_data) VALUES (?, ?, ?, ?)',
          [importId, i + 2, error.message, JSON.stringify(row)]
        );
      }
    }

    // Update import record
    await pool.execute(
      'UPDATE student_data_imports SET successful_imports = ?, failed_imports = ?, import_errors = ? WHERE id = ?',
      [successfulImports, failedImports, JSON.stringify(errors), importId]
    );

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: `Import completed: ${successfulImports} successful, ${failedImports} failed`,
      import_id: importId,
      results: {
        total: jsonData.length,
        successful: successfulImports,
        failed: failedImports,
        errors: errors.slice(0, 10) // Return first 10 errors
      }
    });
  } catch (error) {
    console.error('Import students error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/excel-views/students', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster', 'director_study', 'director_discipline', 'teacher')
], async (req, res) => {
  try {
    const { class_id, course_id, academic_year_id, view_id } = req.query;

    let whereClause = 'WHERE u.role_id = (SELECT id FROM roles WHERE name = "student")';
    const params = [];

    if (class_id) {
      whereClause += ' AND e.class_id = ?';
      params.push(class_id);
    }

    if (course_id) {
      whereClause += ' AND cl.course_id = ?';
      params.push(course_id);
    }

    if (academic_year_id) {
      whereClause += ' AND e.academic_year_id = ?';
      params.push(academic_year_id);
    }

    const [students] = await pool.execute(`
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.student_id,
        u.email,
        u.phone,
        u.date_of_birth,
        u.gender,
        cl.name as class_name,
        c.name as course_name,
        c.code as course_code,
        ay.name as academic_year,
        COALESCE(spm.average_grade, 0) as average_grade,
        COALESCE(spm.attendance_rate, 0) as attendance_rate,
        COALESCE(spm.conduct_rating, 0) as conduct_rating,
        COALESCE(spm.total_discipline_cases, 0) as discipline_cases,
        spm.risk_level,
        spm.improvement_trend
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN classes cl ON e.class_id = cl.id
      LEFT JOIN courses c ON cl.course_id = c.id
      LEFT JOIN academic_years ay ON e.academic_year_id = ay.id
      LEFT JOIN student_performance_metrics spm ON u.id = spm.student_id AND spm.academic_year_id = ay.id
      ${whereClause}
      ORDER BY u.last_name, u.first_name
    `, params);

    res.json({
      success: true,
      students,
      total: students.length,
      filters: {
        class_id,
        course_id,
        academic_year_id
      }
    });
  } catch (error) {
    console.error('Get student excel view error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =============================== DYNAMIC SETTINGS MANAGEMENT ===============================
router.get('/public/settings', async (req, res) => {
  try {
    const [settings] = await pool.execute(
      'SELECT setting_key, setting_value, setting_type FROM admin_editable_settings WHERE is_editable = true',
      []
    );

    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.setting_key] = setting.setting_value;
    });

    res.json({
      success: true,
      settings: settingsObj
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/public/page-content/:page', async (req, res) => {
  try {
    const { page } = req.params;

    const [content] = await pool.execute(
      'SELECT * FROM page_content WHERE page_key = ? AND is_active = true ORDER BY sort_order ASC',
      [page]
    );

    const contentObj = {};
    content.forEach(item => {
      contentObj[item.section_key] = {
        en: item.content_en,
        rw: item.content_rw,
        type: item.content_type,
        metadata: item.metadata
      };
    });

    res.json({
      success: true,
      content: contentObj
    });
  } catch (error) {
    console.error('Get page content error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =============================== ADMIN MANAGEMENT ENDPOINTS ===============================
router.get('/admin/settings', [
  authenticateToken,
  requireRole('admin', 'super_admin')
], async (req, res) => {
  try {
    const [settings] = await pool.execute(
      'SELECT * FROM admin_editable_settings ORDER BY category, setting_key'
    );

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get admin settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/admin/settings/:key', [
  authenticateToken,
  requireRole('admin', 'super_admin'),
  body('value').notEmpty().withMessage('Value is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.is_empty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { key } = req.params;
    const { value } = req.body;
    const updatedBy = req.user.id;

    await pool.execute(
      'UPDATE admin_editable_settings SET setting_value = ?, updated_by = ? WHERE setting_key = ?',
      [value, updatedBy, key]
    );

    res.json({
      success: true,
      message: 'Setting updated successfully'
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/admin/page-content/:page', [
  authenticateToken,
  requireRole('admin', 'super_admin')
], async (req, res) => {
  try {
    const { page } = req.params;

    const [content] = await pool.execute(
      'SELECT * FROM page_content WHERE page_key = ? ORDER BY sort_order ASC',
      [page]
    );

    res.json({
      success: true,
      content
    });
  } catch (error) {
    console.error('Get admin page content error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/admin/page-content/:page/:section', [
  authenticateToken,
  requireRole('admin', 'super_admin')
], async (req, res) => {
  try {
    const { page, section } = req.params;
    const { content_en, content_rw, is_active } = req.body;
    const updatedBy = req.user.id;

    await pool.execute(
      'UPDATE page_content SET content_en = ?, content_rw = ?, updated_by = ?, is_active = ? WHERE page_key = ? AND section_key = ?',
      [content_en, content_rw, updatedBy, is_active, page, section]
    );

    res.json({
      success: true,
      message: 'Page content updated successfully'
    });
  } catch (error) {
    console.error('Update page content error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/admin/import-history', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'director_discipline')
], async (req, res) => {
  try {
    const [imports] = await pool.execute(`
      SELECT sdi.*, u.first_name, u.last_name,
             cl.name as class_name, ay.name as academic_year
      FROM student_data_imports sdi
      JOIN users u ON sdi.imported_by = u.id
      LEFT JOIN classes cl ON sdi.class_id = cl.id
      LEFT JOIN academic_years ay ON sdi.academic_year_id = ay.id
      ORDER BY sdi.created_at DESC
    `);

    res.json({
      success: true,
      imports
    });
  } catch (error) {
    console.error('Get import history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/admin/parent-codes', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'director_discipline')
], async (req, res) => {
  try {
    const [codes] = await pool.execute(`
      SELECT psc.*, u.first_name, u.last_name
      FROM parent_student_codes psc
      JOIN users u ON psc.student_id = u.id
      ORDER BY psc.created_at DESC
    `);

    res.json({
      success: true,
      codes
    });
  } catch (error) {
    console.error('Get parent codes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
