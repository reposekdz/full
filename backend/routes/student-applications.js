const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { authenticateToken, requireRole } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let uploadDir;
    if (file.fieldname === 'profile_photo') {
      uploadDir = path.join(__dirname, '../uploads/applications/photos');
    } else if (file.fieldname === 'report_card') {
      uploadDir = path.join(__dirname, '../uploads/applications/report-cards');
    } else {
      uploadDir = path.join(__dirname, '../uploads/applications/documents');
    }
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, JPG, PNG files are allowed'));
    }  }
});

// ============================================
// PUBLIC ENDPOINTS - Application Submission
// ============================================

// Submit new application
router.post('/submit', upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'report_card', maxCount: 1 },
  { name: 'documents', maxCount: 10 }
]), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Generate application number
    const [appNumResult] = await connection.execute('CALL generate_application_number(@app_number)');
    const [[{ '@app_number': applicationNumber }]] = await connection.execute('SELECT @app_number');
    
    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'date_of_birth', 'gender', 'phone', 
                           'parent_name', 'parent_phone', 'previous_school', 'education_level',
                           'trade_code', 'level_number', 'reason_for_applying', 'address'];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        errors: missingFields.map(f => `${f} is required`)
      });
    }
    
    // Validate age (14-35 years)
    const birthDate = new Date(req.body.date_of_birth);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 14 || age > 35) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Age must be between 14 and 35 years'
      });
    }
    
    // Validate phone number format
    const phoneRegex = /^(\+250|0)[7][0-9]{8}$/;
    if (!phoneRegex.test(req.body.phone)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }
    
    // Get uploaded files
    const profilePhoto = req.files?.profile_photo?.[0];
    const reportCard = req.files?.report_card?.[0];
    const documents = req.files?.documents || [];
    
    // Insert application
    const [result] = await connection.execute(`
      INSERT INTO student_applications (
        application_number, first_name, last_name, date_of_birth, gender, phone, email,
        national_id, profile_photo, address, province_id, district_id, sector_id, cell_id, village_id,
        parent_name, parent_phone, parent_email, parent_occupation, parent_address,
        emergency_contact, emergency_phone, previous_school, education_level, completion_year,
        previous_grades, report_card_image, trade_code, level_number, preferred_start_date, reason_for_applying,
        career_goals, special_needs, medical_conditions, languages_spoken, computer_skills,
        work_experience, fee_payment_method, sponsor_name, sponsor_phone, financial_support,
        application_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      applicationNumber, req.body.first_name, req.body.last_name, req.body.date_of_birth,
      req.body.gender, req.body.phone, req.body.email || null, req.body.national_id || null,
      profilePhoto ? profilePhoto.path : null,
      req.body.address, req.body.province_id || null, req.body.district_id || null,
      req.body.sector_id || null, req.body.cell_id || null, req.body.village_id || null,
      req.body.parent_name, req.body.parent_phone, req.body.parent_email || null,
      req.body.parent_occupation || null, req.body.parent_address || null,
      req.body.emergency_contact || null, req.body.emergency_phone || null,
      req.body.previous_school, req.body.education_level, req.body.completion_year || null,
      req.body.previous_grades || null,
      reportCard ? reportCard.path : null,
      req.body.trade_code, req.body.level_number,
      req.body.preferred_start_date || null, req.body.reason_for_applying,
      req.body.career_goals || null, req.body.special_needs || null,
      req.body.medical_conditions || null, req.body.languages_spoken || null,
      req.body.computer_skills || null, req.body.work_experience || null,
      req.body.fee_payment_method || null, req.body.sponsor_name || null,
      req.body.sponsor_phone || null, req.body.financial_support || null,
      new Date().toISOString().split('T')[0]
    ]);
    
    const applicationId = result.insertId;
    
    // Save uploaded documents
    if (documents && documents.length > 0) {
      for (const file of documents) {
        await connection.execute(`
          INSERT INTO application_documents (application_id, document_type, document_name, file_path, file_size, mime_type)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [applicationId, 'general', file.originalname, file.path, file.size, file.mimetype]);
      }
    }
    
    // Send confirmation SMS/Email
    await connection.execute(`
      INSERT INTO application_notifications (application_id, recipient_type, recipient_phone, notification_type, message, sent_via)
      VALUES (?, 'applicant', ?, 'application_received', ?, 'sms')
    `, [
      applicationId,
      req.body.phone,
      `Mwaramutse! Ibyifuzo byawe byo kwiga muri Garden TVET byakiriwe neza. Nomero yawe: ${applicationNumber}. Tuzabamenyesha mu gihe cya wiki 2.`
    ]);
    
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

// Check application status (public)
router.get('/status/:applicationNumber', async (req, res) => {
  try {
    const [applications] = await pool.execute(`
      SELECT 
        application_number, first_name, last_name, trade_code, level_number,
        status, application_date, dos_reviewed_at, headmaster_reviewed_at,
        interview_scheduled, interview_date, final_decision, decision_date
      FROM student_applications
      WHERE application_number = ?
    `, [req.params.applicationNumber]);
    
    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    const application = applications[0];
    
    // Get status history
    const [history] = await pool.execute(`
      SELECT old_status, new_status, changed_at, comments
      FROM application_status_history
      WHERE application_id = (SELECT id FROM student_applications WHERE application_number = ?)
      ORDER BY changed_at DESC
    `, [req.params.applicationNumber]);
    
    res.json({
      success: true,
      application,
      history
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check status',
      error: error.message
    });
  }
});

// ============================================
// ADMIN ENDPOINTS - All Applications
// ============================================

// Get all applications (admin only)
router.get('/all', authenticateToken, requireRole(['admin', 'headmaster', 'director_of_study']), async (req, res) => {
  try {
    const { page = 1, limit = 50, search, trade_code, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        sa.*, 
        t.name,
        DATEDIFF(NOW(), sa.application_date) as days_pending
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.code
      WHERE 1=1
    `;
    
    const params = [];
    
    if (search) {
      query += ' AND (sa.first_name LIKE ? OR sa.last_name LIKE ? OR sa.application_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (trade_code) {
      query += ' AND sa.trade_code = ?';
      params.push(trade_code);
    }
    
    if (status && status !== 'all') {
      query += ' AND sa.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY sa.application_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const [applications] = await pool.execute(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM student_applications WHERE 1=1';
    const countParams = [];
    
    if (search) {
      countQuery += ' AND (first_name LIKE ? OR last_name LIKE ? OR application_number LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (trade_code) {
      countQuery += ' AND trade_code = ?';
      countParams.push(trade_code);
    }
    
    if (status && status !== 'all') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    const [[{ total }]] = await pool.execute(countQuery, countParams);
    
    res.json({
      success: true,
      applications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// Get single application details
router.get('/details/:id', authenticateToken, requireRole(['admin', 'headmaster', 'director_of_study']), async (req, res) => {
  try {
    const [applications] = await pool.execute(`
      SELECT 
        sa.*,
        t.name,
        p.name_rw as province_name,
        d.name_rw as district_name,
        s.name_rw as sector_name
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.code
      LEFT JOIN provinces p ON sa.province_id = p.id
      LEFT JOIN districts d ON sa.district_id = d.id
      LEFT JOIN sectors s ON sa.sector_id = s.id
      WHERE sa.id = ?
    `, [req.params.id]);
    
    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Get documents
    const [documents] = await pool.execute(
      'SELECT * FROM application_documents WHERE application_id = ?',
      [req.params.id]
    );
    
    // Get comments
    const [comments] = await pool.execute(`
      SELECT ac.*, u.first_name, u.last_name
      FROM application_comments ac
      LEFT JOIN users u ON ac.user_id = u.id
      WHERE ac.application_id = ?
      ORDER BY ac.created_at DESC
    `, [req.params.id]);
    
    // Get status history
    const [history] = await pool.execute(
      'SELECT * FROM application_status_history WHERE application_id = ? ORDER BY changed_at DESC',
      [req.params.id]
    );
    
    res.json({
      success: true,
      application: applications[0],
      documents,
      comments,
      history
    });
    
  } catch (error) {
    console.error('Get application details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application details',
      error: error.message
    });
  }
});

// ============================================
// DOS ENDPOINTS - Review Applications
// ============================================

// Get pending applications for DOS review
router.get('/dos/pending', authenticateToken, requireRole(['director_of_study', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { page = 1, limit = 20, trade_code, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        sa.*, 
        t.name,
        DATEDIFF(NOW(), sa.application_date) as days_pending
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.code
      WHERE sa.status IN ('pending', 'under_review_dos')
    `;
    
    const params = [];
    
    if (trade_code) {
      query += ' AND sa.trade_code = ?';
      params.push(trade_code);
    }
    
    if (search) {
      query += ' AND (sa.first_name LIKE ? OR sa.last_name LIKE ? OR sa.application_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY sa.application_date ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const [applications] = await pool.execute(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM student_applications WHERE status IN ("pending", "under_review_dos")';
    const countParams = [];
    
    if (trade_code) {
      countQuery += ' AND trade_code = ?';
      countParams.push(trade_code);
    }
    
    const [[{ total }]] = await pool.execute(countQuery, countParams);
    
    res.json({
      success: true,
      applications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get pending applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// DOS review application
router.post('/dos/review/:id', authenticateToken, requireRole(['director_of_study', 'admin']), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { recommendation, score, comments } = req.body;
    
    if (!['approve', 'reject', 'needs_interview'].includes(recommendation)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recommendation'
      });
    }
    
    const newStatus = recommendation === 'approve' ? 'approved_dos' : 
                     recommendation === 'reject' ? 'rejected_dos' : 'under_review_dos';
    
    await connection.execute(`
      UPDATE student_applications
      SET 
        status = ?,
        dos_reviewed_by = ?,
        dos_reviewed_at = NOW(),
        dos_comments = ?,
        dos_score = ?,
        dos_recommendation = ?
      WHERE id = ?
    `, [newStatus, req.user.id, comments, score, recommendation, req.params.id]);
    
    // Add comment
    await connection.execute(`
      INSERT INTO application_comments (application_id, user_id, user_role, comment_type, comment)
      VALUES (?, ?, 'director_of_study', 'recommendation', ?)
    `, [req.params.id, req.user.id, comments]);
    
    // Send notification
    const [[application]] = await connection.execute(
      'SELECT application_number, phone, first_name FROM student_applications WHERE id = ?',
      [req.params.id]
    );
    
    if (application) {
      const message = recommendation === 'approve' 
        ? `Mwaramutse ${application.first_name}! Ibyifuzo byawe (${application.application_number}) byemejwe na DOS. Bizasuzumwa n'Umuyobozi Mukuru.`
        : recommendation === 'reject'
        ? `Mwaramutse ${application.first_name}! Ibyifuzo byawe (${application.application_number}) ntibyemejwe na DOS. Mwahamagara kuri +250788000000.`
        : `Mwaramutse ${application.first_name}! Ibyifuzo byawe (${application.application_number}) birakeneye ikiganiro. Tuzabamenyesha itariki.`;
      
      await connection.execute(`
        INSERT INTO application_notifications (application_id, recipient_type, recipient_phone, notification_type, message, sent_via)
        VALUES (?, 'applicant', ?, 'dos_review', ?, 'sms')
      `, [req.params.id, application.phone, message]);
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Application reviewed successfully'
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('DOS review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review application',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// ============================================
// HEADMASTER ENDPOINTS - Final Approval
// ============================================

// Get applications pending headmaster review
router.get('/headmaster/pending', authenticateToken, requireRole(['headmaster', 'admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, trade_code } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        sa.*, 
        t.name,
        u.first_name as dos_first_name,
        u.last_name as dos_last_name,
        DATEDIFF(NOW(), sa.dos_reviewed_at) as days_since_dos_review
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.code
      LEFT JOIN users u ON sa.dos_reviewed_by = u.id
      WHERE sa.status IN ('approved_dos', 'under_review_headmaster')
    `;
    
    const params = [];
    
    if (trade_code) {
      query += ' AND sa.trade_code = ?';
      params.push(trade_code);
    }
    
    query += ' ORDER BY sa.dos_reviewed_at ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const [applications] = await pool.execute(query, params);
    
    const [[{ total }]] = await pool.execute(
      'SELECT COUNT(*) as total FROM student_applications WHERE status IN ("approved_dos", "under_review_headmaster")'
    );
    
    res.json({
      success: true,
      applications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get headmaster pending error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// Headmaster final decision
router.post('/headmaster/decide/:id', authenticateToken, requireRole(['headmaster', 'admin']), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { decision, comments, rejection_reason } = req.body;
    
    if (!['approved', 'rejected', 'needs_more_info'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid decision'
      });
    }
    
    const newStatus = decision === 'approved' ? 'approved' : 
                     decision === 'rejected' ? 'rejected' : 'under_review_headmaster';
    
    const finalDecision = decision === 'approved' ? 'accepted' : 
                         decision === 'rejected' ? 'rejected' : null;
    
    await connection.execute(`
      UPDATE student_applications
      SET 
        status = ?,
        headmaster_reviewed_by = ?,
        headmaster_reviewed_at = NOW(),
        headmaster_comments = ?,
        headmaster_decision = ?,
        final_decision = ?,
        decision_date = ?,
        rejection_reason = ?
      WHERE id = ?
    `, [
      newStatus, req.user.id, comments, decision, finalDecision,
      decision === 'approved' || decision === 'rejected' ? new Date().toISOString().split('T')[0] : null,
      rejection_reason || null,
      req.params.id
    ]);
    
    // Add comment
    await connection.execute(`
      INSERT INTO application_comments (application_id, user_id, user_role, comment_type, comment)
      VALUES (?, ?, 'headmaster', 'recommendation', ?)
    `, [req.params.id, req.user.id, comments]);
    
    // Send notification
    const [[application]] = await connection.execute(
      'SELECT application_number, phone, first_name, parent_phone FROM student_applications WHERE id = ?',
      [req.params.id]
    );
    
    if (application) {
      const message = decision === 'approved' 
        ? `Mwaramutse ${application.first_name}! Ibyifuzo byawe (${application.application_number}) byemejwe n'Umuyobozi Mukuru! Murakaza neza muri Garden TVET. Tuzabamenyesha igihe cyo kwiyandikisha.`
        : decision === 'rejected'
        ? `Mwaramutse ${application.first_name}! Ibyifuzo byawe (${application.application_number}) ntibyemejwe. Impamvu: ${rejection_reason || 'Hamagara +250788000000'}.`
        : `Mwaramutse ${application.first_name}! Ibyifuzo byawe (${application.application_number}) birakeneye amakuru y'inyongera. Tuzabamenyesha.`;
      
      // Send to applicant
      await connection.execute(`
        INSERT INTO application_notifications (application_id, recipient_type, recipient_phone, notification_type, message, sent_via)
        VALUES (?, 'applicant', ?, 'headmaster_decision', ?, 'sms')
      `, [req.params.id, application.phone, message]);
      
      // Send to parent
      await connection.execute(`
        INSERT INTO application_notifications (application_id, recipient_type, recipient_phone, notification_type, message, sent_via)
        VALUES (?, 'parent', ?, 'headmaster_decision', ?, 'sms')
      `, [req.params.id, application.parent_phone, message]);
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Decision recorded successfully'
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Headmaster decision error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record decision',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// ============================================
// STATISTICS & REPORTS
// ============================================

// Get application statistics
router.get('/statistics', authenticateToken, requireRole(['director_of_study', 'headmaster', 'admin']), async (req, res) => {
  try {
    const [[stats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status IN ('under_review_dos', 'approved_dos') THEN 1 ELSE 0 END) as under_review,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status IN ('rejected', 'rejected_dos') THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN enrolled = TRUE THEN 1 ELSE 0 END) as enrolled,
        AVG(DATEDIFF(decision_date, application_date)) as avg_processing_days
      FROM student_applications
      WHERE application_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    `);
    
    const [byTrade] = await pool.execute(`
      SELECT trade_code, COUNT(*) as count
      FROM student_applications
      WHERE application_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY trade_code
    `);
    
    const [byStatus] = await pool.execute(`
      SELECT status, COUNT(*) as count
      FROM student_applications
      WHERE application_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY status
    `);
    
    res.json({
      success: true,
      statistics: stats,
      by_trade: byTrade,
      by_status: byStatus
    });
    
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

module.exports = router;
