const express = require('express');
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/database');
const router = express.Router();

// Validation functions
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^(\+250|0)[7][0-9]{8}$/;
  return phoneRegex.test(phone);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateNationalId = (nationalId) => {
  const idRegex = /^[0-9]{16}$/;
  return idRegex.test(nationalId);
};

const validateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 14 && age <= 35;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/applications/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// Submit application with comprehensive validation
router.post('/submit', upload.array('documents', 10), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const errors = [];
    const requiredFields = ['first_name', 'last_name', 'date_of_birth', 'gender', 'phone', 'province_id', 'district_id', 'sector_id', 'parent_name', 'parent_phone', 'previous_school', 'trade_code', 'level_number', 'reason_for_applying'];
    
    // Validation
    requiredFields.forEach(field => {
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        errors.push(`${field} is required`);
      }
    });
    
    if (req.body.phone && !validatePhoneNumber(req.body.phone)) {
      errors.push('Invalid phone number format');
    }
    
    if (req.body.parent_phone && !validatePhoneNumber(req.body.parent_phone)) {
      errors.push('Invalid parent phone number format');
    }
    
    if (req.body.email && !validateEmail(req.body.email)) {
      errors.push('Invalid email format');
    }
    
    if (req.body.national_id && !validateNationalId(req.body.national_id)) {
      errors.push('National ID must be 16 digits');
    }
    
    if (req.body.date_of_birth && !validateAge(req.body.date_of_birth)) {
      errors.push('Age must be between 14 and 35 years');
    }
    
    // Check for duplicate applications
    if (req.body.phone) {
      const [existing] = await connection.execute(`
        SELECT id FROM student_applications 
        WHERE phone = ? AND status IN ('pending', 'under_review', 'approved')
      `, [req.body.phone]);
      
      if (existing.length > 0) {
        errors.push('An application with this phone number already exists');
      }
    }
    
    if (errors.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Generate application number
    const applicationNumber = 'APP' + Date.now() + Math.floor(Math.random() * 1000);
    
    // Insert application
    const [result] = await connection.execute(`
      INSERT INTO student_applications (
        application_number, first_name, last_name, date_of_birth, gender, phone, email, 
        national_id, address, province_id, district_id, sector_id, cell_id, village_id,
        parent_name, parent_phone, parent_email, parent_occupation, parent_address, 
        emergency_contact, emergency_phone, previous_school, education_level, completion_year, 
        previous_grades, trade_code, level_number, preferred_start_date, reason_for_applying, 
        career_goals, special_needs, medical_conditions, languages_spoken, computer_skills, 
        work_experience, fee_payment_method, sponsor_name, sponsor_phone, financial_support, 
        application_date, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [
      applicationNumber, req.body.first_name, req.body.last_name, req.body.date_of_birth,
      req.body.gender, req.body.phone, req.body.email || null, req.body.national_id || null, 
      req.body.address, req.body.province_id, req.body.district_id, req.body.sector_id,
      req.body.cell_id || null, req.body.village_id || null, req.body.parent_name,
      req.body.parent_phone, req.body.parent_email || null, req.body.parent_occupation || null,
      req.body.parent_address || null, req.body.emergency_contact || null, req.body.emergency_phone || null,
      req.body.previous_school, req.body.education_level, req.body.completion_year || null,
      req.body.previous_grades || null, req.body.trade_code, req.body.level_number,
      req.body.preferred_start_date || null, req.body.reason_for_applying, req.body.career_goals || null,
      req.body.special_needs || null, req.body.medical_conditions || null, req.body.languages_spoken || null,
      req.body.computer_skills || null, req.body.work_experience || null, req.body.fee_payment_method || null,
      req.body.sponsor_name || null, req.body.sponsor_phone || null, req.body.financial_support || null,
      new Date().toISOString().split('T')[0]
    ]);
    
    const applicationId = result.insertId;
    
    // Insert documents
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await connection.execute(`
          INSERT INTO application_documents (application_id, document_name, document_path, document_type, file_size, uploaded_at)
          VALUES (?, ?, ?, ?, ?, NOW())
        `, [applicationId, file.originalname, file.path, file.mimetype, file.size]);
      }
    }
    
    // Log status change
    await connection.execute(`
      INSERT INTO application_status_history (application_id, old_status, new_status, change_reason, changed_at)
      VALUES (?, NULL, 'pending', 'Application submitted', NOW())
    `, [applicationId]);
    
    // Update analytics
    await connection.execute(`
      INSERT INTO application_analytics (date, total_applications, pending_applications)
      VALUES (CURDATE(), 1, 1)
      ON DUPLICATE KEY UPDATE 
        total_applications = total_applications + 1,
        pending_applications = pending_applications + 1
    `);
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Application submitted successfully',
      application_number: applicationNumber,
      application_id: applicationId
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Application submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Get applications with advanced filtering
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
      date_to
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];

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

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM student_applications sa
      ${whereClause}
    `, queryParams);

// Get applications with location and trade details
    const [applications] = await pool.execute(`
      SELECT 
        sa.*,
        t.name as trade_name,
        COUNT(ad.id) as document_count,
        DATEDIFF(NOW(), sa.created_at) as days_since_application
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.code
      LEFT JOIN application_documents ad ON sa.id = ad.application_id
      ${whereClause}
      GROUP BY sa.id
      ORDER BY sa.${sort_by} ${sort_order}
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    const totalPages = Math.ceil(countResult[0].total / limit);

    res.json({
      success: true,
      data: applications,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_records: countResult[0].total,
        per_page: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// Get single application with full details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [applications] = await pool.execute(`
      SELECT 
        sa.*,
        p.name as province_name,
        d.name as district_name,
        s.name as sector_name,
        c.name as cell_name,
        v.name as village_name,
        t.name as trade_name,
        t.description as trade_description,
        t.duration as trade_duration,
        t.requirements as trade_requirements
      FROM student_applications sa
      LEFT JOIN provinces p ON sa.province_id = p.id
      LEFT JOIN districts d ON sa.district_id = d.id
      LEFT JOIN sectors s ON sa.sector_id = s.id
      LEFT JOIN cells c ON sa.cell_id = c.id
      LEFT JOIN villages v ON sa.village_id = v.id
      LEFT JOIN trades t ON sa.trade_code = t.code
      WHERE sa.id = ?
    `, [id]);

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Get documents
    const [documents] = await pool.execute(`
      SELECT * FROM application_documents WHERE application_id = ?
    `, [id]);

    // Get status history
    const [statusHistory] = await pool.execute(`
      SELECT * FROM application_status_history 
      WHERE application_id = ? 
      ORDER BY changed_at DESC
    `, [id]);

    // Get reviews/comments
    const [reviews] = await pool.execute(`
      SELECT ar.*, u.name as reviewer_name
      FROM application_reviews ar
      LEFT JOIN users u ON ar.reviewer_id = u.id
      WHERE ar.application_id = ?
      ORDER BY ar.created_at DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...applications[0],
        documents,
        status_history: statusHistory,
        reviews
      }
    });

  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: error.message
    });
  }
});

// Update application status with notifications
router.put('/:id/status', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { status, reason, reviewer_id, notes } = req.body;
    
    const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'waitlisted', 'enrolled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    // Get current application
    const [currentApp] = await connection.execute(
      'SELECT * FROM student_applications WHERE id = ?',
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
    
    // Update application status
    await connection.execute(`
      UPDATE student_applications 
      SET status = ?, updated_at = NOW(), reviewed_by = ?, reviewed_at = NOW()
      WHERE id = ?
    `, [status, reviewer_id, id]);
    
    // Log status change
    await connection.execute(`
      INSERT INTO application_status_history 
      (application_id, old_status, new_status, change_reason, changed_by, changed_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [id, oldStatus, status, reason, reviewer_id]);
    
    // Add review/notes if provided
    if (notes) {
      await connection.execute(`
        INSERT INTO application_reviews 
        (application_id, reviewer_id, review_text, rating, created_at)
        VALUES (?, ?, ?, NULL, NOW())
      `, [id, reviewer_id, notes]);
    }
    
    // Send notification
    if (status === 'approved' || status === 'rejected') {
      const message = status === 'approved' 
        ? `Congratulations! Your application ${currentApp[0].application_number} has been approved.`
        : `Your application ${currentApp[0].application_number} has been reviewed. Please contact the school for details.`;
      
      // Queue SMS notification
      await connection.execute(`
        INSERT INTO sms_queue (phone_number, message, type, priority, created_at)
        VALUES (?, ?, 'application_status', 'high', NOW())
      `, [currentApp[0].phone, message]);
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
      message: 'Failed to update application status',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Bulk status update
router.put('/bulk/status', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { application_ids, status, reason, reviewer_id } = req.body;
    
    if (!Array.isArray(application_ids) || application_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Application IDs are required'
      });
    }
    
    const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'waitlisted', 'enrolled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    let updatedCount = 0;
    
    for (const appId of application_ids) {
      // Get current status
      const [currentApp] = await connection.execute(
        'SELECT status, phone, application_number FROM student_applications WHERE id = ?',
        [appId]
      );
      
      if (currentApp.length > 0) {
        const oldStatus = currentApp[0].status;
        
        // Update status
        await connection.execute(`
          UPDATE student_applications 
          SET status = ?, updated_at = NOW(), reviewed_by = ?, reviewed_at = NOW()
          WHERE id = ?
        `, [status, reviewer_id, appId]);
        
        // Log status change
        await connection.execute(`
          INSERT INTO application_status_history 
          (application_id, old_status, new_status, change_reason, changed_by, changed_at)
          VALUES (?, ?, ?, ?, ?, NOW())
        `, [appId, oldStatus, status, reason, reviewer_id]);
        
        // Queue notification
        if (status === 'approved' || status === 'rejected') {
          const message = status === 'approved' 
            ? `Congratulations! Your application ${currentApp[0].application_number} has been approved.`
            : `Your application ${currentApp[0].application_number} has been reviewed. Please contact the school for details.`;
          
          await connection.execute(`
            INSERT INTO sms_queue (phone_number, message, type, priority, created_at)
            VALUES (?, ?, 'application_status', 'high', NOW())
          `, [currentApp[0].phone, message]);
        }
        
        updatedCount++;
      }
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: `${updatedCount} applications updated successfully`
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update applications',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Get comprehensive analytics
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    // Overall statistics
    const [overallStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN status = 'waitlisted' THEN 1 END) as waitlisted,
        COUNT(CASE WHEN status = 'enrolled' THEN 1 END) as enrolled,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_applications,
        COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as week_applications
      FROM student_applications
      WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    `, [period]);
    
    // Applications by trade
    const [tradeStats] = await pool.execute(`
      SELECT 
        sa.trade_code,
        t.name as trade_name,
        COUNT(*) as application_count,
        COUNT(CASE WHEN sa.status = 'approved' THEN 1 END) as approved_count
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.code
      WHERE DATE(sa.created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY sa.trade_code, t.name
      ORDER BY application_count DESC
      LIMIT 10
    `, [period]);
    
    // Applications by location
    const [locationStats] = await pool.execute(`
      SELECT 
        p.name as province_name,
        COUNT(*) as application_count
      FROM student_applications sa
      LEFT JOIN provinces p ON sa.province_id = p.id
      WHERE DATE(sa.created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY sa.province_id, p.name
      ORDER BY application_count DESC
    `, [period]);
    
    // Daily applications trend
    const [dailyTrend] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as applications,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved
      FROM student_applications
      WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
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
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

// Export applications to CSV
router.get('/export/csv', async (req, res) => {
  try {
    const { status, trade_code, date_from, date_to } = req.query;
    
    let whereConditions = [];
    let queryParams = [];
    
    if (status) {
      whereConditions.push('sa.status = ?');
      queryParams.push(status);
    }
    if (trade_code) {
      whereConditions.push('sa.trade_code = ?');
      queryParams.push(trade_code);
    }
    if (date_from) {
      whereConditions.push('DATE(sa.created_at) >= ?');
      queryParams.push(date_from);
    }
    if (date_to) {
      whereConditions.push('DATE(sa.created_at) <= ?');
      queryParams.push(date_to);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    const [applications] = await pool.execute(`
      SELECT 
        sa.application_number,
        sa.first_name,
        sa.last_name,
        sa.date_of_birth,
        sa.gender,
        sa.phone,
        sa.email,
        sa.national_id,
        p.name as province,
        d.name as district,
        s.name as sector,
        sa.parent_name,
        sa.parent_phone,
        sa.previous_school,
        t.name as trade,
        sa.level_number,
        sa.status,
        sa.created_at,
        sa.reviewed_at
      FROM student_applications sa
      LEFT JOIN provinces p ON sa.province_id = p.id
      LEFT JOIN districts d ON sa.district_id = d.id
      LEFT JOIN sectors s ON sa.sector_id = s.id
      LEFT JOIN trades t ON sa.trade_code = t.code
      ${whereClause}
      ORDER BY sa.created_at DESC
    `, queryParams);
    
    // Convert to CSV
    const csvHeader = 'Application Number,First Name,Last Name,Date of Birth,Gender,Phone,Email,National ID,Province,District,Sector,Parent Name,Parent Phone,Previous School,Trade,Level,Status,Applied Date,Reviewed Date\n';
    
    const csvData = applications.map(app => {
      return [
        app.application_number,
        app.first_name,
        app.last_name,
        app.date_of_birth,
        app.gender,
        app.phone,
        app.email || '',
        app.national_id || '',
        app.province,
        app.district,
        app.sector,
        app.parent_name,
        app.parent_phone,
        app.previous_school,
        app.trade,
        app.level_number,
        app.status,
        app.created_at,
        app.reviewed_at || ''
      ].map(field => `"${field}"`).join(',');
    }).join('\n');
    
    const csv = csvHeader + csvData;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=applications_${Date.now()}.csv`);
    res.send(csv);
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export applications',
      error: error.message
    });
  }
});

// Check application status by phone or application number
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
        sa.application_number,
        sa.first_name,
        sa.last_name,
        sa.status,
        sa.created_at,
        sa.reviewed_at,
        t.name as trade_name,
        sa.level_number
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.code
      WHERE 
    `;
    
    let params = [];
    
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
        message: 'No application found'
      });
    }
    
    // Get status history
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
      message: 'Failed to check application status',
      error: error.message
    });
  }
});

// Get location data
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
    const [districts] = await pool.execute('SELECT * FROM districts WHERE province_id = ? ORDER BY name', [req.params.provinceId]);
    res.json({ success: true, data: districts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch districts' });
  }
});

router.get('/locations/sectors/:districtId', async (req, res) => {
  try {
    const [sectors] = await pool.execute('SELECT * FROM sectors WHERE district_id = ? ORDER BY name', [req.params.districtId]);
    res.json({ success: true, data: sectors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sectors' });
  }
});

// Get available trades
router.get('/trades', async (req, res) => {
  try {
    const [trades] = await pool.execute(`
      SELECT code, name, description, duration, requirements, level_1, level_2, level_3
      FROM trades 
      WHERE active = 1 
      ORDER BY name
    `);
    res.json({ success: true, data: trades });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch trades' });
  }
});

module.exports = router;