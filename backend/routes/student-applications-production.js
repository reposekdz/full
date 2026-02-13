const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { pool } = require('../config/database');
const router = express.Router();

// Enhanced validation functions
const validators = {
  phone: (phone) => /^(\+250|0)[7][0-9]{8}$/.test(phone),
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  nationalId: (id) => /^[0-9]{16}$/.test(id),
  age: (dob) => {
    const age = Math.floor((new Date() - new Date(dob)) / 31557600000);
    return age >= 14 && age <= 35;
  },
  name: (name) => /^[a-zA-Z\s'-]{2,100}$/.test(name),
  applicationNumber: (num) => /^APP[0-9]{13,15}$/.test(num)
};

// Sanitize input
const sanitize = (str) => {
  if (!str) return str;
  return str.toString().trim().replace(/[<>]/g, '');
};

// Generate unique application number
const generateApplicationNumber = () => {
  return 'APP' + Date.now() + Math.floor(Math.random() * 1000);
};

// Generate verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Configure multer with security
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/applications/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
  }
});

// Rate limiting helper
const rateLimitMap = new Map();
const checkRateLimit = (identifier, maxRequests = 5, windowMs = 900000) => {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);
  return true;
};

// Submit application
router.post('/submit', upload.array('documents', 10), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Rate limiting
    const identifier = req.body.phone || req.ip;
    if (!checkRateLimit(identifier, 3, 3600000)) {
      return res.status(429).json({
        success: false,
        message: 'Too many applications. Please try again later.'
      });
    }

    await connection.beginTransaction();
    
    const errors = [];
    const requiredFields = [
      'first_name', 'last_name', 'date_of_birth', 'gender', 'phone',
      'address', 'province_id', 'district_id', 'sector_id',
      'parent_name', 'parent_phone', 'previous_school', 'education_level',
      'trade_code', 'level_number', 'reason_for_applying'
    ];
    
    // Validate required fields
    requiredFields.forEach(field => {
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        errors.push(`${field.replace(/_/g, ' ')} is required`);
      }
    });
    
    // Validate formats
    if (req.body.phone && !validators.phone(req.body.phone)) {
      errors.push('Invalid phone number format (use +250XXXXXXXXX or 07XXXXXXXX)');
    }
    
    if (req.body.parent_phone && !validators.phone(req.body.parent_phone)) {
      errors.push('Invalid parent phone number format');
    }
    
    if (req.body.email && !validators.email(req.body.email)) {
      errors.push('Invalid email format');
    }
    
    if (req.body.national_id && !validators.nationalId(req.body.national_id)) {
      errors.push('National ID must be exactly 16 digits');
    }
    
    if (req.body.date_of_birth && !validators.age(req.body.date_of_birth)) {
      errors.push('Applicant must be between 14 and 35 years old');
    }
    
    if (req.body.first_name && !validators.name(req.body.first_name)) {
      errors.push('Invalid first name format');
    }
    
    if (req.body.last_name && !validators.name(req.body.last_name)) {
      errors.push('Invalid last name format');
    }
    
    // Check for duplicate applications
    if (req.body.phone) {
      const [existing] = await connection.execute(`
        SELECT id, application_number, status FROM student_applications 
        WHERE phone = ? AND status IN ('pending', 'under_review', 'approved', 'waitlisted')
        AND deleted_at IS NULL
      `, [req.body.phone]);
      
      if (existing.length > 0) {
        errors.push(`Active application already exists: ${existing[0].application_number}`);
      }
    }
    
    // Check if national ID already used
    if (req.body.national_id) {
      const [existingId] = await connection.execute(`
        SELECT id FROM student_applications 
        WHERE national_id = ? AND status IN ('approved', 'enrolled')
        AND deleted_at IS NULL
      `, [req.body.national_id]);
      
      if (existingId.length > 0) {
        errors.push('This National ID is already registered');
      }
    }
    
    // Validate trade and level exist
    const [tradeCheck] = await connection.execute(
      'SELECT code FROM trades WHERE code = ? AND active = 1',
      [req.body.trade_code]
    );
    
    if (tradeCheck.length === 0) {
      errors.push('Invalid trade selected');
    }
    
    if (errors.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Sanitize inputs
    const sanitizedData = {
      first_name: sanitize(req.body.first_name),
      last_name: sanitize(req.body.last_name),
      date_of_birth: req.body.date_of_birth,
      gender: req.body.gender,
      phone: req.body.phone,
      email: sanitize(req.body.email) || null,
      national_id: req.body.national_id || null,
      passport_number: sanitize(req.body.passport_number) || null,
      address: sanitize(req.body.address),
      province_id: parseInt(req.body.province_id),
      district_id: parseInt(req.body.district_id),
      sector_id: parseInt(req.body.sector_id),
      cell_id: req.body.cell_id ? parseInt(req.body.cell_id) : null,
      village_id: req.body.village_id ? parseInt(req.body.village_id) : null,
      parent_name: sanitize(req.body.parent_name),
      parent_phone: req.body.parent_phone,
      parent_email: sanitize(req.body.parent_email) || null,
      parent_occupation: sanitize(req.body.parent_occupation) || null,
      parent_address: sanitize(req.body.parent_address) || null,
      parent_national_id: req.body.parent_national_id || null,
      emergency_contact: sanitize(req.body.emergency_contact) || null,
      emergency_phone: req.body.emergency_phone || null,
      emergency_relationship: sanitize(req.body.emergency_relationship) || null,
      previous_school: sanitize(req.body.previous_school),
      education_level: req.body.education_level,
      completion_year: req.body.completion_year || null,
      previous_grades: sanitize(req.body.previous_grades) || null,
      academic_certificates: sanitize(req.body.academic_certificates) || null,
      trade_code: req.body.trade_code,
      level_number: parseInt(req.body.level_number),
      preferred_start_date: req.body.preferred_start_date || null,
      second_choice_trade: req.body.second_choice_trade || null,
      reason_for_applying: sanitize(req.body.reason_for_applying),
      career_goals: sanitize(req.body.career_goals) || null,
      special_needs: sanitize(req.body.special_needs) || null,
      medical_conditions: sanitize(req.body.medical_conditions) || null,
      languages_spoken: sanitize(req.body.languages_spoken) || null,
      computer_skills: sanitize(req.body.computer_skills) || null,
      work_experience: sanitize(req.body.work_experience) || null,
      extracurricular_activities: sanitize(req.body.extracurricular_activities) || null,
      references: sanitize(req.body.references) || null,
      fee_payment_method: req.body.fee_payment_method || 'parent',
      sponsor_name: sanitize(req.body.sponsor_name) || null,
      sponsor_phone: req.body.sponsor_phone || null,
      sponsor_email: sanitize(req.body.sponsor_email) || null,
      financial_support: sanitize(req.body.financial_support) || null,
      scholarship_applied: req.body.scholarship_applied === 'true' || req.body.scholarship_applied === true,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      submission_source: 'web'
    };
    
    const applicationNumber = generateApplicationNumber();
    const verificationCode = generateVerificationCode();
    
    // Insert application
    const [result] = await connection.execute(`
      INSERT INTO student_applications (
        application_number, first_name, last_name, date_of_birth, gender, phone, email,
        national_id, passport_number, address, province_id, district_id, sector_id, cell_id, village_id,
        parent_name, parent_phone, parent_email, parent_occupation, parent_address, parent_national_id,
        emergency_contact, emergency_phone, emergency_relationship,
        previous_school, education_level, completion_year, previous_grades, academic_certificates,
        trade_code, level_number, preferred_start_date, second_choice_trade,
        reason_for_applying, career_goals, special_needs, medical_conditions,
        languages_spoken, computer_skills, work_experience, extracurricular_activities, references,
        fee_payment_method, sponsor_name, sponsor_phone, sponsor_email, financial_support, scholarship_applied,
        application_date, status, verification_code, ip_address, user_agent, submission_source,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'pending', ?, ?, ?, ?, NOW())
    `, [
      applicationNumber, sanitizedData.first_name, sanitizedData.last_name, sanitizedData.date_of_birth,
      sanitizedData.gender, sanitizedData.phone, sanitizedData.email, sanitizedData.national_id,
      sanitizedData.passport_number, sanitizedData.address, sanitizedData.province_id, sanitizedData.district_id,
      sanitizedData.sector_id, sanitizedData.cell_id, sanitizedData.village_id, sanitizedData.parent_name,
      sanitizedData.parent_phone, sanitizedData.parent_email, sanitizedData.parent_occupation,
      sanitizedData.parent_address, sanitizedData.parent_national_id, sanitizedData.emergency_contact,
      sanitizedData.emergency_phone, sanitizedData.emergency_relationship, sanitizedData.previous_school,
      sanitizedData.education_level, sanitizedData.completion_year, sanitizedData.previous_grades,
      sanitizedData.academic_certificates, sanitizedData.trade_code, sanitizedData.level_number,
      sanitizedData.preferred_start_date, sanitizedData.second_choice_trade, sanitizedData.reason_for_applying,
      sanitizedData.career_goals, sanitizedData.special_needs, sanitizedData.medical_conditions,
      sanitizedData.languages_spoken, sanitizedData.computer_skills, sanitizedData.work_experience,
      sanitizedData.extracurricular_activities, sanitizedData.references, sanitizedData.fee_payment_method,
      sanitizedData.sponsor_name, sanitizedData.sponsor_phone, sanitizedData.sponsor_email,
      sanitizedData.financial_support, sanitizedData.scholarship_applied, verificationCode,
      sanitizedData.ip_address, sanitizedData.user_agent, sanitizedData.submission_source
    ]);
    
    const applicationId = result.insertId;
    
    // Insert documents
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await connection.execute(`
          INSERT INTO application_documents (
            application_id, document_name, document_path, document_type, 
            file_size, mime_type, uploaded_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [
          applicationId, 
          file.originalname, 
          file.path, 
          file.fieldname || 'other',
          file.size, 
          file.mimetype
        ]);
      }
    }
    
    // Send SMS notification
    await connection.execute(`
      INSERT INTO sms_queue (phone_number, message, type, priority, created_at)
      VALUES (?, ?, 'application_confirmation', 'high', NOW())
    `, [
      sanitizedData.phone,
      `Thank you for applying to Garden TVET School! Your application number is ${applicationNumber}. We will review your application and contact you soon.`
    ]);
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application_number: applicationNumber,
        application_id: applicationId,
        status: 'pending'
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Application submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
});

module.exports = router;

// Get applications with advanced filtering and pagination
router.get('/list', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      trade_code,
      level_number,
      province_id,
      district_id,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC',
      date_from,
      date_to,
      priority
    } = req.query;

    const offset = (page - 1) * limit;
    const whereConditions = ['sa.deleted_at IS NULL'];
    const queryParams = [];

    if (status) {
      whereConditions.push('sa.status = ?');
      queryParams.push(status);
    }
    if (trade_code) {
      whereConditions.push('sa.trade_code = ?');
      queryParams.push(trade_code);
    }
    if (level_number) {
      whereConditions.push('sa.level_number = ?');
      queryParams.push(level_number);
    }
    if (province_id) {
      whereConditions.push('sa.province_id = ?');
      queryParams.push(province_id);
    }
    if (district_id) {
      whereConditions.push('sa.district_id = ?');
      queryParams.push(district_id);
    }
    if (priority) {
      whereConditions.push('sa.priority = ?');
      queryParams.push(priority);
    }
    if (search) {
      whereConditions.push('(sa.first_name LIKE ? OR sa.last_name LIKE ? OR sa.phone LIKE ? OR sa.application_number LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (date_from) {
      whereConditions.push('DATE(sa.created_at) >= ?');
      queryParams.push(date_from);
    }
    if (date_to) {
      whereConditions.push('DATE(sa.created_at) <= ?');
      queryParams.push(date_to);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');
    
    const allowedSortFields = ['created_at', 'application_number', 'first_name', 'last_name', 'status', 'application_date'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total FROM student_applications sa ${whereClause}
    `, queryParams);

    const [applications] = await pool.execute(`
      SELECT 
        sa.id, sa.application_number, sa.first_name, sa.last_name, sa.phone, sa.email,
        sa.date_of_birth, sa.gender, sa.status, sa.priority, sa.application_date,
        sa.created_at, sa.reviewed_at,
        p.name as province_name, d.name as district_name, s.name as sector_name,
        t.name as trade_name, sa.level_number,
        COUNT(DISTINCT ad.id) as document_count,
        DATEDIFF(NOW(), sa.created_at) as days_pending,
        u.name as reviewed_by_name
      FROM student_applications sa
      LEFT JOIN provinces p ON sa.province_id = p.id
      LEFT JOIN districts d ON sa.district_id = d.id
      LEFT JOIN sectors s ON sa.sector_id = s.id
      LEFT JOIN trades t ON sa.trade_code = t.code
      LEFT JOIN application_documents ad ON sa.id = ad.application_id
      LEFT JOIN users u ON sa.reviewed_by = u.id
      ${whereClause}
      GROUP BY sa.id
      ORDER BY sa.${sortField} ${sortDirection}
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    res.json({
      success: true,
      data: applications,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(countResult[0].total / limit),
        total_records: countResult[0].total,
        per_page: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
});

// Get single application details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [applications] = await pool.execute(`
      SELECT 
        sa.*,
        p.name as province_name, d.name as district_name, s.name as sector_name,
        c.name as cell_name, v.name as village_name,
        t.name as trade_name, t.description as trade_description,
        u.name as reviewed_by_name, u.email as reviewer_email
      FROM student_applications sa
      LEFT JOIN provinces p ON sa.province_id = p.id
      LEFT JOIN districts d ON sa.district_id = d.id
      LEFT JOIN sectors s ON sa.sector_id = s.id
      LEFT JOIN cells c ON sa.cell_id = c.id
      LEFT JOIN villages v ON sa.village_id = v.id
      LEFT JOIN trades t ON sa.trade_code = t.code
      LEFT JOIN users u ON sa.reviewed_by = u.id
      WHERE sa.id = ? AND sa.deleted_at IS NULL
    `, [id]);

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const [documents] = await pool.execute(
      'SELECT * FROM application_documents WHERE application_id = ? ORDER BY uploaded_at DESC',
      [id]
    );

    const [statusHistory] = await pool.execute(`
      SELECT ash.*, u.name as changed_by_name
      FROM application_status_history ash
      LEFT JOIN users u ON ash.changed_by = u.id
      WHERE ash.application_id = ?
      ORDER BY ash.changed_at DESC
    `, [id]);

    const [reviews] = await pool.execute(`
      SELECT ar.*, u.name as reviewer_name, u.email as reviewer_email
      FROM application_reviews ar
      LEFT JOIN users u ON ar.reviewer_id = u.id
      WHERE ar.application_id = ?
      ORDER BY ar.created_at DESC
    `, [id]);

    const [interviews] = await pool.execute(`
      SELECT ai.*, u.name as interviewer_name
      FROM application_interviews ai
      LEFT JOIN users u ON ai.interviewer_id = u.id
      WHERE ai.application_id = ?
      ORDER BY ai.interview_date DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...applications[0],
        documents,
        status_history: statusHistory,
        reviews,
        interviews
      }
    });

  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application details'
    });
  }
});

// Update application status
router.put('/:id/status', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { status, reason, reviewer_id, notes } = req.body;
    
    const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'waitlisted', 'enrolled', 'withdrawn'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const [currentApp] = await connection.execute(
      'SELECT * FROM student_applications WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    
    if (currentApp.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    const oldStatus = currentApp[0].status;
    
    await connection.execute(`
      UPDATE student_applications 
      SET status = ?, reviewed_by = ?, reviewed_at = NOW(), 
          approval_notes = ?, rejection_reason = ?, updated_at = NOW()
      WHERE id = ?
    `, [status, reviewer_id, status === 'approved' ? notes : null, status === 'rejected' ? reason : null, id]);
    
    await connection.execute(`
      INSERT INTO application_status_history 
      (application_id, old_status, new_status, change_reason, changed_by, ip_address, changed_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [id, oldStatus, status, reason, reviewer_id, req.ip]);
    
    if (notes) {
      await connection.execute(`
        INSERT INTO application_reviews 
        (application_id, reviewer_id, review_text, created_at)
        VALUES (?, ?, ?, NOW())
      `, [id, reviewer_id, notes]);
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Application status updated successfully'
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status'
    });
  } finally {
    connection.release();
  }
});

// Check application status (public endpoint)
router.post('/check-status', async (req, res) => {
  try {
    const { phone, application_number } = req.body;
    
    if (!phone && !application_number) {
      return res.status(400).json({
        success: false,
        message: 'Phone number or application number is required'
      });
    }
    
    let query = `
      SELECT 
        sa.application_number, sa.first_name, sa.last_name, sa.status,
        sa.created_at, sa.reviewed_at, t.name as trade_name, sa.level_number
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.code
      WHERE sa.deleted_at IS NULL AND 
    `;
    
    const params = [];
    
    if (application_number) {
      query += 'sa.application_number = ?';
      params.push(application_number);
    } else {
      query += 'sa.phone = ?';
      params.push(phone);
    }
    
    const [applications] = await pool.execute(query, params);
    
    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No application found with the provided information'
      });
    }
    
    const [statusHistory] = await pool.execute(`
      SELECT old_status, new_status, change_reason, changed_at
      FROM application_status_history 
      WHERE application_id = (SELECT id FROM student_applications WHERE application_number = ?)
      ORDER BY changed_at DESC
    `, [applications[0].application_number]);
    
    res.json({
      success: true,
      data: {
        ...applications[0],
        status_history: statusHistory
      }
    });
    
  } catch (error) {
    console.error('Check status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check application status'
    });
  }
});

// Get analytics
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    const [overallStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN status = 'waitlisted' THEN 1 END) as waitlisted,
        COUNT(CASE WHEN status = 'enrolled' THEN 1 END) as enrolled,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today,
        COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as this_week
      FROM student_applications
      WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND deleted_at IS NULL
    `, [period]);
    
    const [tradeStats] = await pool.execute(`
      SELECT 
        sa.trade_code, t.name as trade_name,
        COUNT(*) as application_count,
        COUNT(CASE WHEN sa.status = 'approved' THEN 1 END) as approved_count
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.code
      WHERE DATE(sa.created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND sa.deleted_at IS NULL
      GROUP BY sa.trade_code, t.name
      ORDER BY application_count DESC
      LIMIT 10
    `, [period]);
    
    const [locationStats] = await pool.execute(`
      SELECT 
        p.name as province_name,
        COUNT(*) as application_count
      FROM student_applications sa
      LEFT JOIN provinces p ON sa.province_id = p.id
      WHERE DATE(sa.created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND sa.deleted_at IS NULL
      GROUP BY sa.province_id, p.name
      ORDER BY application_count DESC
    `, [period]);
    
    const [dailyTrend] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as applications,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved
      FROM student_applications
      WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND deleted_at IS NULL
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [period]);
    
    res.json({
      success: true,
      data: {
        overall: overallStats[0],
        by_trade: tradeStats,
        by_location: locationStats,
        daily_trend: dailyTrend
      }
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// Location endpoints
router.get('/locations/provinces', async (req, res) => {
  try {
    const [provinces] = await pool.execute('SELECT * FROM provinces ORDER BY name');
    res.json({ success: true, data: provinces });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch provinces' });
  }
});

router.get('/locations/districts/:provinceId', async (req, res) => {
  try {
    const [districts] = await pool.execute(
      'SELECT * FROM districts WHERE province_id = ? ORDER BY name',
      [req.params.provinceId]
    );
    res.json({ success: true, data: districts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch districts' });
  }
});

router.get('/locations/sectors/:districtId', async (req, res) => {
  try {
    const [sectors] = await pool.execute(
      'SELECT * FROM sectors WHERE district_id = ? ORDER BY name',
      [req.params.districtId]
    );
    res.json({ success: true, data: sectors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sectors' });
  }
});

router.get('/trades', async (req, res) => {
  try {
    const [trades] = await pool.execute(`
      SELECT code, name, description, duration, requirements, level_1, level_2, level_3
      FROM trades WHERE active = 1 ORDER BY name
    `);
    res.json({ success: true, data: trades });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch trades' });
  }
});
