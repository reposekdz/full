const express = require('express');
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/database');
const { broadcastToRole, sendNotification } = require('../services/socketService');
const { sendSMS } = require('../services/africanTalkingService');
const router = express.Router();

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
  limits: { fileSize: 5 * 1024 * 1024 },
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

// Submit application with real notifications
router.post('/submit', upload.array('documents', 10), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
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
    
    await connection.commit();
    
    // Send real-time notifications
    broadcastToRole('dos', 'application:new', {
      application_id: applicationId,
      application_number: applicationNumber,
      student_name: `${req.body.first_name} ${req.body.last_name}`,
      trade: req.body.trade_code,
      phone: req.body.phone
    });
    
    broadcastToRole('headmaster', 'application:new', {
      application_id: applicationId,
      application_number: applicationNumber,
      student_name: `${req.body.first_name} ${req.body.last_name}`
    });
    
    // Send SMS notifications
    await sendSMS(req.body.phone, `Ibyifuzo byawe byakiriwe neza. Nomero: ${applicationNumber}. Uzahamagariwa mu gihe cya wiki 2.`);
    
    if (req.body.parent_phone) {
      await sendSMS(req.body.parent_phone, `Ibyifuzo bya ${req.body.first_name} byakiriwe neza. Nomero: ${applicationNumber}`);
    }
    
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

// Update application status with real notifications
router.put('/:id/status', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { status, comments, reviewed_by, decision_reason } = req.body;
    
    // Get current application
    const [currentApp] = await connection.execute(`
      SELECT * FROM student_applications WHERE id = ?
    `, [id]);
    
    if (currentApp.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    const app = currentApp[0];
    const oldStatus = app.status;
    
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
    
    // Handle approval
    if (status === 'approved') {
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
      
      // Send approval notifications
      sendNotification({
        type: 'application_approved',
        title: 'Application Approved!',
        message: `Congratulations! Your application has been approved. Student ID: ${studentId}`,
        priority: 'high',
        metadata: { application_id: id, student_id: studentId }
      }, [app.phone]);
      
      broadcastToRole('dos', 'application:approved', {
        application_id: id,
        student_name: `${app.first_name} ${app.last_name}`,
        student_id: studentId
      });
      
      await sendSMS(app.phone, `Amashimwe! Ibyifuzo byawe byemewe. Student ID: ${studentId}. Uje ku ishuri vuba.`);
      
      if (app.parent_phone) {
        await sendSMS(app.parent_phone, `Amashimwe! Ibyifuzo bya ${app.first_name} byemewe. Student ID: ${studentId}.`);
      }
    } else if (status === 'rejected') {
      await sendSMS(app.phone, `Ibyifuzo byawe ntibyemerewe. ${decision_reason || 'Hamagara ishuri.'}`);
    } else if (status === 'under_review') {
      await sendSMS(app.phone, 'Ibyifuzo byawe birasuzumwa. Uzahamagariwa vuba.');
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Application status updated successfully',
      new_status: status,
      old_status: oldStatus
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

// Get all applications
router.get('/all', async (req, res) => {
  try {
    const { status, trade_code, level_number, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT sa.*, t.name, tl.description as level_description,
             p.name_en as province_name, d.name_en as district_name, 
             s.name_en as sector_name, COUNT(ad.id) as document_count
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.code
      LEFT JOIN trade_levels tl ON sa.level_number = tl.level_number
      LEFT JOIN provinces p ON sa.province_id = p.id
      LEFT JOIN districts d ON sa.district_id = d.id
      LEFT JOIN sectors s ON sa.sector_id = s.id
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
    
    res.json({
      success: true,
      applications
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

// Get single application
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [applications] = await pool.execute(`
      SELECT sa.*, t.name, tl.description as level_description,
             p.name_en as province_name, d.name_en as district_name,
             s.name_en as sector_name, c.name_en as cell_name, v.name_en as village_name
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.code
      LEFT JOIN trade_levels tl ON sa.level_number = tl.level_number
      LEFT JOIN provinces p ON sa.province_id = p.id
      LEFT JOIN districts d ON sa.district_id = d.id
      LEFT JOIN sectors s ON sa.sector_id = s.id
      LEFT JOIN cells c ON sa.cell_id = c.id
      LEFT JOIN villages v ON sa.village_id = v.id
      WHERE sa.id = ?
    `, [id]);
    
    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    const [documents] = await pool.execute(`
      SELECT * FROM application_documents WHERE application_id = ?
    `, [id]);
    
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

module.exports = router;