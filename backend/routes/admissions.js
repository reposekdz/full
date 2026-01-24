const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/admissions'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Submit admission application
router.post('/apply', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'birth_certificate', maxCount: 1 },
  { name: 'academic_records', maxCount: 5 }
]), async (req, res) => {
  try {
    const { first_name, last_name, email, phone, dob, gender, address, guardian_name, guardian_phone, program, previous_school, grade_level } = req.body;
    
    const documents = {
      photo: req.files.photo?.[0]?.filename,
      birth_certificate: req.files.birth_certificate?.[0]?.filename,
      academic_records: req.files.academic_records?.map(f => f.filename)
    };
    
    const application_number = 'APP' + Date.now();
    
    const [result] = await db.query(
      `INSERT INTO admission_applications (application_number, first_name, last_name, email, phone, dob, gender, address, guardian_name, guardian_phone, program, previous_school, grade_level, documents, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [application_number, first_name, last_name, email, phone, dob, gender, address, guardian_name, guardian_phone, program, previous_school, grade_level, JSON.stringify(documents)]
    );
    
    // Create workflow tracking
    await db.query(
      'INSERT INTO admission_workflow (application_id, stage, status) VALUES (?, ?, ?)',
      [result.insertId, 'submitted', 'pending']
    );
    
    res.json({ success: true, application_id: result.insertId, application_number });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all applications
router.get('/applications', async (req, res) => {
  try {
    const { status, program, search } = req.query;
    let query = 'SELECT * FROM admission_applications WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (program) {
      query += ' AND program = ?';
      params.push(program);
    }
    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR application_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    const [applications] = await db.query(query, params);
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single application
router.get('/applications/:id', async (req, res) => {
  try {
    const [applications] = await db.query('SELECT * FROM admission_applications WHERE id = ?', [req.params.id]);
    if (applications.length === 0) return res.status(404).json({ success: false, message: 'Application not found' });
    
    const [workflow] = await db.query('SELECT * FROM admission_workflow WHERE application_id = ? ORDER BY created_at', [req.params.id]);
    const [comments] = await db.query('SELECT * FROM admission_comments WHERE application_id = ? ORDER BY created_at DESC', [req.params.id]);
    
    res.json({ success: true, application: applications[0], workflow, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update application status
router.put('/applications/:id/status', async (req, res) => {
  try {
    const { status, stage, reviewer_id, notes } = req.body;
    
    await db.query('UPDATE admission_applications SET status = ?, updated_at = NOW() WHERE id = ?', [status, req.params.id]);
    
    // Add workflow entry
    await db.query(
      'INSERT INTO admission_workflow (application_id, stage, status, reviewer_id, notes) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, stage, status, reviewer_id, notes]
    );
    
    // Send notification
    const [app] = await db.query('SELECT email, first_name FROM admission_applications WHERE id = ?', [req.params.id]);
    if (app[0] && global.io) {
      global.io.emit('admission_update', { application_id: req.params.id, status, stage });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add comment
router.post('/applications/:id/comments', async (req, res) => {
  try {
    const { user_id, comment } = req.body;
    
    await db.query(
      'INSERT INTO admission_comments (application_id, user_id, comment) VALUES (?, ?, ?)',
      [req.params.id, user_id, comment]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Schedule interview
router.post('/applications/:id/interview', async (req, res) => {
  try {
    const { interview_date, interview_time, interviewer_id, location, notes } = req.body;
    
    await db.query(
      'INSERT INTO admission_interviews (application_id, interview_date, interview_time, interviewer_id, location, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.id, interview_date, interview_time, interviewer_id, location, notes]
    );
    
    await db.query('UPDATE admission_applications SET status = ? WHERE id = ?', ['interview_scheduled', req.params.id]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const [total] = await db.query('SELECT COUNT(*) as count FROM admission_applications');
    const [byStatus] = await db.query('SELECT status, COUNT(*) as count FROM admission_applications GROUP BY status');
    const [byProgram] = await db.query('SELECT program, COUNT(*) as count FROM admission_applications GROUP BY program');
    const [recent] = await db.query('SELECT COUNT(*) as count FROM admission_applications WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
    
    res.json({ 
      success: true, 
      stats: {
        total: total[0].count,
        byStatus,
        byProgram,
        recentApplications: recent[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
