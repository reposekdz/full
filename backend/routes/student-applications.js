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
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 14 && age <= 35; // TVET age requirements
};

// Validate location hierarchy
const validateLocation = async (province_id, district_id, sector_id, cell_id, village_id) => {
  try {
    const [result] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM provinces p
      LEFT JOIN districts d ON p.id = d.province_id
      LEFT JOIN sectors s ON d.id = s.district_id
      LEFT JOIN cells c ON s.id = c.sector_id
      LEFT JOIN villages v ON c.id = v.cell_id
      WHERE p.id = ? AND (? IS NULL OR d.id = ?) 
        AND (? IS NULL OR s.id = ?) 
        AND (? IS NULL OR c.id = ?)
        AND (? IS NULL OR v.id = ?)
    `, [province_id, district_id, district_id, sector_id, sector_id, cell_id, cell_id, village_id, village_id]);
    
    return result[0].count > 0;
  } catch (error) {
    console.error('Location validation error:', error);
    return false;
  }
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

// Submit application
router.post('/submit', upload.array('documents', 10), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Comprehensive validation
    const errors = [];
    
    // Required fields validation
    const requiredFields = ['first_name', 'last_name', 'date_of_birth', 'gender', 'phone', 'province_id', 'district_id', 'sector_id', 'parent_name', 'parent_phone', 'previous_school', 'trade_code', 'level_number', 'reason_for_applying'];
    
    requiredFields.forEach(field => {
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        errors.push(`${field} is required`);
      }
    });
    
    // Phone validation
    if (req.body.phone && !validatePhoneNumber(req.body.phone)) {
      errors.push('Invalid phone number format. Use +250XXXXXXXXX or 07XXXXXXXX');
    }
    
    if (req.body.parent_phone && !validatePhoneNumber(req.body.parent_phone)) {
      errors.push('Invalid parent phone number format');
    }
    
    // Email validation
    if (req.body.email && !validateEmail(req.body.email)) {
      errors.push('Invalid email format');
    }
    
    // National ID validation
    if (req.body.national_id && !validateNationalId(req.body.national_id)) {
      errors.push('National ID must be 16 digits');
    }
    
    // Age validation
    if (req.body.date_of_birth && !validateAge(req.body.date_of_birth)) {
      errors.push('Age must be between 14 and 35 years');
    }
    
    // Location validation
    if (req.body.province_id && req.body.district_id && req.body.sector_id) {
      const isValidLocation = await validateLocation(
        req.body.province_id,
        req.body.district_id,
        req.body.sector_id,
        req.body.cell_id || null,
        req.body.village_id || null
      );
      
      if (!isValidLocation) {
        errors.push('Invalid location combination');
      }
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
    
    // Insert application with location data
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
    
    // Insert documents if any
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
    
    // Send application submitted notifications
    const { broadcastToRole } = require('../services/socketService');
    const { sendSMS } = require('../services/africanTalkingService');
    
    // Notify DOS about new application
    broadcastToRole('dos', 'application:new', {
      application_id: applicationId,
      application_number: applicationNumber,
      student_name: `${req.body.first_name} ${req.body.last_name}`,
      trade: req.body.trade_code,
      phone: req.body.phone
    });
    
    // Send confirmation SMS to student
    await sendSMS(req.body.phone, `Ibyifuzo byawe byakiriwe neza. Nomero: ${applicationNumber}. Uzahamagariwa mu gihe cya wiki 2.`);
    
    // Send SMS to parent if provided
    if (req.body.parent_phone) {
      await sendSMS(req.body.parent_phone, `Ibyifuzo bya ${req.body.first_name} byakiriwe neza. Nomero: ${applicationNumber}`);
    }
    
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
      application_id: applicationId,
      tracking_code: applicationNumber
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

// Check application status by tracking code
router.get('/status/:trackingCode', async (req, res) => {
  try {
    const { trackingCode } = req.params;
    
    const [applications] = await pool.execute(`
      SELECT sa.id, sa.application_number, sa.first_name, sa.last_name, sa.status, 
             sa.created_at, sa.updated_at, t.trade_name, tl.description as level_description
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.trade_code
      LEFT JOIN trade_levels tl ON sa.level_number = tl.level_number
      WHERE sa.application_number = ?
    `, [trackingCode]);
    
    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found. Please check your tracking code.'
      });
    }
    
    const application = applications[0];
    
    const statusMessages = {
      'pending': 'Your application is being processed. Please wait for review.',
      'under_review': 'Your application is currently under review by our admissions team.',
      'approved': 'Congratulations! Your application has been approved.',
      'rejected': 'Unfortunately, your application could not be approved at this time.'
    };
    
    res.json({
      success: true,
      application: {
        tracking_code: application.application_number,
        student_name: `${application.first_name} ${application.last_name}`,
        status: application.status,
        status_message: statusMessages[application.status],
        trade: application.trade_name,
        level: application.level_description,
        submitted_date: application.created_at,
        last_updated: application.updated_at
      }
    });
    
  } catch (error) {
    console.error('Error checking application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check application status',
      error: error.message
    });
  }
});

// Get all applications (for DOS/Headmaster)
router.get('/all', async (req, res) => {
  try {
    const { status, trade_code, level_number, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT sa.*, t.trade_name, tl.description as level_description,
             COUNT(ad.id) as document_count
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.trade_code
      LEFT JOIN trade_levels tl ON sa.level_number = tl.level_number
      LEFT JOIN application_documents ad ON sa.id = ad.application_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND sa.status = ?';
      params.push(status);
    }
    
    if (trade_code) {
      query += ' AND sa.trade_code = ?';
      params.push(trade_code);
    }
    
    if (level_number) {
      query += ' AND sa.level_number = ?';
      params.push(level_number);
    }
    
    query += ' GROUP BY sa.id ORDER BY sa.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [applications] = await pool.execute(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM student_applications WHERE 1=1';
    const countParams = [];
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    if (trade_code) {
      countQuery += ' AND trade_code = ?';
      countParams.push(trade_code);
    }
    
    if (level_number) {
      countQuery += ' AND level_number = ?';
      countParams.push(level_number);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      applications,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// Get single application details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [applications] = await pool.execute(`
      SELECT sa.*, t.trade_name, tl.description as level_description
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.trade_code
      LEFT JOIN trade_levels tl ON sa.level_number = tl.level_number
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
    
    // Get review history
    const [reviews] = await pool.execute(`
      SELECT ar.*, u.first_name, u.last_name, r.name as role_name
      FROM application_reviews ar
      LEFT JOIN users u ON ar.reviewed_by = u.id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE ar.application_id = ?
      ORDER BY ar.reviewed_at DESC
    `, [id]);
    
    res.json({
      success: true,
      application: applications[0],
      documents,
      reviews
    });
    
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: error.message
    });
  }
});

// Update application status (DOS/Headmaster)
router.put('/:id/status', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { status, comments, reviewed_by, decision_reason } = req.body;
    
    // Update application status
    await connection.execute(`
      UPDATE student_applications 
      SET status = ?, updated_at = NOW() 
      WHERE id = ?
    `, [status, id]);
    
    // Add review record
    await connection.execute(`
      INSERT INTO application_reviews (
        application_id, status, comments, reviewed_by, decision_reason, reviewed_at
      ) VALUES (?, ?, ?, ?, ?, NOW())
    `, [id, status, comments, reviewed_by, decision_reason]);
    
    // If approved, create student record
    if (status === 'approved') {
      const [application] = await connection.execute(`
        SELECT * FROM student_applications WHERE id = ?
      `, [id]);
      
      if (application.length > 0) {
        const app = application[0];
        
        // Generate student ID
        const studentId = 'STD' + Date.now();
        
        // Create student account
        await connection.execute(`
          INSERT INTO students (
            student_id, first_name, last_name, date_of_birth, gender, phone, email,
            national_id, address, province_id, district_id, sector_id, cell_id, village_id,
            trade_code, level_number, enrollment_date, status, created_from_application
          ) SELECT 
            ?, first_name, last_name, date_of_birth, gender, phone, email,
            national_id, address, province_id, district_id, sector_id, cell_id, village_id,
            trade_code, level_number, NOW(), 'active', ?
          FROM student_applications WHERE id = ?
        `, [studentId, id, id]);
        
        // Send real-time notifications using existing services
        const { sendNotification, broadcastToRole } = require('../services/socketService');
        // SMS notification would be sent here
        
        // Send WebSocket notification to student
        sendNotification({
          type: 'application_approved',
          title: 'Application Approved!',
          message: `Congratulations! Your application has been approved. Student ID: ${studentId}`,
          priority: 'high',
          metadata: { application_id: id, student_id: studentId }
        }, [app.phone]);
        
        // Send SMS notification to student
        await sendSMS(app.phone, `Amashimwe! Ibyifuzo byawe byemewe. Student ID: ${studentId}. Uje ku ishuri vuba.`);
      }
    }
    
    // Send status change notifications for all status updates
    const { sendSMS } = require('../services/africanTalkingService');
    const [currentApp] = await connection.execute(`SELECT phone FROM student_applications WHERE id = ?`, [id]);
    
    if (currentApp.length > 0) {
      if (status === 'approved') {
        await sendSMS(currentApp[0].phone, 'Amashimwe! Ibyifuzo byawe byemewe.');
      } else if (status === 'rejected') {
        await sendSMS(currentApp[0].phone, `Ibyifuzo byawe ntibyemerewe. ${decision_reason || ''}`);
      } else if (status === 'under_review') {
        await sendSMS(currentApp[0].phone, 'Ibyifuzo byawe birasuzumwa. Uzahamagariwa vuba.');
      }
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Application status updated successfully',
      new_status: status
    });
  } catch (error) {
    await connection.rollback();
    console.error('Status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Get application analytics and statistics
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    // Overall statistics
    const [overallStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        AVG(DATEDIFF(COALESCE(updated_at, NOW()), created_at)) as avg_processing_days
      FROM student_applications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [period]);
    
    // Applications by province
    const [provinceStats] = await pool.execute(`
      SELECT p.name_en as province, COUNT(sa.id) as count
      FROM student_applications sa
      JOIN provinces p ON sa.province_id = p.id
      WHERE sa.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY p.id, p.name_en
      ORDER BY count DESC
    `, [period]);
    
    // Applications by trade
    const [tradeStats] = await pool.execute(`
      SELECT t.trade_name, COUNT(sa.id) as count
      FROM student_applications sa
      JOIN trades t ON sa.trade_code = t.trade_code
      WHERE sa.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY t.trade_code, t.trade_name
      ORDER BY count DESC
    `, [period]);
    
    // Daily applications trend
    const [dailyTrend] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as applications,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved
      FROM student_applications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [period]);
    
    // Recent applications requiring attention
    const [urgentApplications] = await pool.execute(`
      SELECT id, application_number, first_name, last_name, 
             DATEDIFF(NOW(), created_at) as days_pending
      FROM student_applications
      WHERE status = 'pending' AND created_at <= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY created_at ASC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      analytics: {
        overall: overallStats[0],
        by_province: provinceStats,
        by_trade: tradeStats,
        daily_trend: dailyTrend,
        urgent_applications: urgentApplications
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

// Bulk operations
router.post('/bulk/update-status', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { application_ids, status, comments, reviewed_by } = req.body;
    
    if (!application_ids || !Array.isArray(application_ids) || application_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Application IDs are required'
      });
    }
    
    const placeholders = application_ids.map(() => '?').join(',');
    
    // Update all applications
    await connection.execute(`
      UPDATE student_applications 
      SET status = ?, updated_at = NOW() 
      WHERE id IN (${placeholders})
    `, [status, ...application_ids]);
    
    // Add review records for each
    for (const appId of application_ids) {
      await connection.execute(`
        INSERT INTO application_reviews (
          application_id, status, comments, reviewed_by, reviewed_at
        ) VALUES (?, ?, ?, ?, NOW())
      `, [appId, status, comments, reviewed_by]);
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: `${application_ids.length} applications updated successfully`,
      updated_count: application_ids.length
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

// Export applications data
router.get('/export/csv', async (req, res) => {
  try {
    const { status, trade_code, province_id, date_from, date_to } = req.query;
    
    let query = `
      SELECT 
        sa.application_number, sa.first_name, sa.last_name, sa.date_of_birth,
        sa.gender, sa.phone, sa.email, sa.status, sa.created_at,
        p.name_en as province, d.name_en as district, s.name_en as sector,
        t.trade_name, sa.level_number, sa.reason_for_applying
      FROM student_applications sa
      LEFT JOIN provinces p ON sa.province_id = p.id
      LEFT JOIN districts d ON sa.district_id = d.id
      LEFT JOIN sectors s ON sa.sector_id = s.id
      LEFT JOIN trades t ON sa.trade_code = t.trade_code
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND sa.status = ?';
      params.push(status);
    }
    
    if (trade_code) {
      query += ' AND sa.trade_code = ?';
      params.push(trade_code);
    }
    
    if (province_id) {
      query += ' AND sa.province_id = ?';
      params.push(province_id);
    }
    
    if (date_from) {
      query += ' AND DATE(sa.created_at) >= ?';
      params.push(date_from);
    }
    
    if (date_to) {
      query += ' AND DATE(sa.created_at) <= ?';
      params.push(date_to);
    }
    
    query += ' ORDER BY sa.created_at DESC';
    
    const [applications] = await pool.execute(query, params);
    
    // Convert to CSV format
    const csvHeader = 'Application Number,First Name,Last Name,Date of Birth,Gender,Phone,Email,Status,Application Date,Province,District,Sector,Trade,Level,Reason\n';
    const csvData = applications.map(app => 
      `"${app.application_number}","${app.first_name}","${app.last_name}","${app.date_of_birth}","${app.gender}","${app.phone}","${app.email || ''}","${app.status}","${app.created_at}","${app.province || ''}","${app.district || ''}","${app.sector || ''}","${app.trade_name || ''}","${app.level_number || ''}","${app.reason_for_applying || ''}"`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="applications_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvHeader + csvData);
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export applications',
      error: error.message
    });
  }
});

module.exports = router;