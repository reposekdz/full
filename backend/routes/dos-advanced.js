const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');

// Configure multer for DOS uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === 'workshop_images' ? 'uploads/workshops/' : 'uploads/teachers/';
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image and PDF files allowed'));
  }
});

// Academic Year Management
router.get('/academic-years', async (req, res) => {
  try {
    const [years] = await db.query(`
      SELECT ay.*, 
             COUNT(DISTINCT e.student_id) as total_students,
             COUNT(DISTINCT c.id) as total_classes
      FROM academic_years ay
      LEFT JOIN enrollments e ON ay.id = e.academic_year_id
      LEFT JOIN classes c ON ay.id = c.academic_year_id
      GROUP BY ay.id
      ORDER BY ay.start_date DESC
    `);
    res.json({ success: true, years });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create academic year (Rwanda format: 2025-2026)
router.post('/academic-years', async (req, res) => {
  try {
    const { year_name, start_date, end_date, is_current } = req.body;
    
    if (is_current) {
      await db.query(`UPDATE academic_years SET is_current = 0`);
    }
    
    const [result] = await db.query(
      `INSERT INTO academic_years (year_name, start_date, end_date, is_current, status) 
       VALUES (?, ?, ?, ?, 'active')`,
      [year_name, start_date, end_date, is_current ? 1 : 0]
    );
    res.json({ success: true, yearId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Teacher Management
router.get('/teachers', async (req, res) => {
  try {
    const [teachers] = await db.query(`
      SELECT t.*, u.email, u.phone,
             COUNT(DISTINCT tc.class_id) as classes_count,
             COUNT(DISTINCT c.id) as courses_count
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN teacher_classes tc ON t.id = tc.teacher_id
      LEFT JOIN courses c ON t.id = c.teacher_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);
    res.json({ success: true, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add teacher with credentials
router.post('/teachers', upload.single('profile_image'), async (req, res) => {
  try {
    const { 
      first_name, last_name, email, phone, password, 
      specialization, qualification, experience_years, 
      date_of_birth, address, emergency_contact 
    } = req.body;
    
    const hashedPassword = await bcrypt.hash(password || '2026', 10);
    const profile_image = req.file ? `/uploads/teachers/${req.file.filename}` : null;
    
    // Create user account
    const [userResult] = await db.query(
      `INSERT INTO users (email, password, role, first_name, last_name, phone, profile_image) 
       VALUES (?, ?, 'teacher', ?, ?, ?, ?)`,
      [email, hashedPassword, first_name, last_name, phone, profile_image]
    );
    
    // Create teacher profile
    const [teacherResult] = await db.query(
      `INSERT INTO teachers (user_id, specialization, qualification, experience_years, date_of_birth, address, emergency_contact, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [userResult.insertId, specialization, qualification, experience_years, date_of_birth, address, emergency_contact]
    );
    
    res.json({ success: true, teacherId: teacherResult.insertId, userId: userResult.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update teacher
router.put('/teachers/:id', upload.single('profile_image'), async (req, res) => {
  try {
    const { specialization, qualification, experience_years, address, emergency_contact, status } = req.body;
    
    let query = `UPDATE teachers SET specialization = ?, qualification = ?, experience_years = ?, address = ?, emergency_contact = ?, status = ?`;
    const params = [specialization, qualification, experience_years, address, emergency_contact, status];
    
    query += ` WHERE id = ?`;
    params.push(req.params.id);
    
    await db.query(query, params);
    
    if (req.file) {
      const [teacher] = await db.query(`SELECT user_id FROM teachers WHERE id = ?`, [req.params.id]);
      await db.query(`UPDATE users SET profile_image = ? WHERE id = ?`, 
        [`/uploads/teachers/${req.file.filename}`, teacher[0].user_id]);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Class Management
router.get('/classes', async (req, res) => {
  try {
    const { academic_year_id } = req.query;
    let query = `
      SELECT c.*, ay.year_name,
             COUNT(DISTINCT e.student_id) as student_count,
             COUNT(DISTINCT tc.teacher_id) as teacher_count
      FROM classes c
      JOIN academic_years ay ON c.academic_year_id = ay.id
      LEFT JOIN enrollments e ON c.id = e.class_id
      LEFT JOIN teacher_classes tc ON c.id = tc.class_id
      WHERE 1=1
    `;
    const params = [];
    
    if (academic_year_id) {
      query += ` AND c.academic_year_id = ?`;
      params.push(academic_year_id);
    }
    
    query += ` GROUP BY c.id ORDER BY c.level, c.name`;
    const [classes] = await db.query(query, params);
    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create class
router.post('/classes', async (req, res) => {
  try {
    const { name, level, section, academic_year_id, trade_code, capacity, room_number } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO classes (name, level, section, academic_year_id, trade_code, capacity, room_number, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [name, level, section, academic_year_id, trade_code, capacity, room_number]
    );
    res.json({ success: true, classId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Assign teacher to class
router.post('/classes/:classId/teachers', async (req, res) => {
  try {
    const { teacher_id, subject, is_class_teacher } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO teacher_classes (teacher_id, class_id, subject, is_class_teacher) 
       VALUES (?, ?, ?, ?)`,
      [teacher_id, req.params.classId, subject, is_class_teacher ? 1 : 0]
    );
    res.json({ success: true, assignmentId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Workshop Management
router.get('/workshops', async (req, res) => {
  try {
    const [workshops] = await db.query(`
      SELECT w.*, 
             COUNT(DISTINCT wp.id) as participant_count,
             COUNT(DISTINCT wi.id) as image_count
      FROM workshops w
      LEFT JOIN workshop_participants wp ON w.id = wp.workshop_id
      LEFT JOIN workshop_images wi ON w.id = wi.workshop_id
      GROUP BY w.id
      ORDER BY w.start_date DESC
    `);
    res.json({ success: true, workshops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create workshop with images
router.post('/workshops', upload.array('workshop_images', 15), async (req, res) => {
  try {
    const { title, description, facilitator, start_date, end_date, venue, target_audience, max_participants } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO workshops (title, description, facilitator, start_date, end_date, venue, target_audience, max_participants, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
      [title, description, facilitator, start_date, end_date, venue, target_audience, max_participants]
    );
    
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(file => 
        db.query(
          `INSERT INTO workshop_images (workshop_id, image_url, caption) VALUES (?, ?, ?)`,
          [result.insertId, `/uploads/workshops/${file.filename}`, file.originalname]
        )
      );
      await Promise.all(imagePromises);
    }
    
    res.json({ success: true, workshopId: result.insertId, imagesUploaded: req.files?.length || 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get workshop images
router.get('/workshops/:id/images', async (req, res) => {
  try {
    const [images] = await db.query(
      `SELECT * FROM workshop_images WHERE workshop_id = ? ORDER BY uploaded_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Student Lifecycle Management
router.get('/students/lifecycle', async (req, res) => {
  try {
    const { status, academic_year_id, trade_code } = req.query;
    let query = `
      SELECT s.*, u.email, u.phone, u.first_name, u.last_name,
             e.academic_year_id, e.class_id, e.status as enrollment_status,
             c.name as class_name, ay.year_name,
             t.name as trade_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN enrollments e ON s.id = e.student_id
      LEFT JOIN classes c ON e.class_id = c.id
      LEFT JOIN academic_years ay ON e.academic_year_id = ay.id
      LEFT JOIN trades t ON s.trade_code = t.code
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ` AND s.status = ?`;
      params.push(status);
    }
    if (academic_year_id) {
      query += ` AND e.academic_year_id = ?`;
      params.push(academic_year_id);
    }
    if (trade_code) {
      query += ` AND s.trade_code = ?`;
      params.push(trade_code);
    }
    
    query += ` ORDER BY s.enrollment_date DESC`;
    const [students] = await db.query(query, params);
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Graduate students (mark as completed)
router.post('/students/graduate', async (req, res) => {
  try {
    const { student_ids, graduation_date, certificate_issued } = req.body;
    
    const updatePromises = student_ids.map(id => 
      db.query(
        `UPDATE students SET status = 'graduated', graduation_date = ?, certificate_issued = ? WHERE id = ?`,
        [graduation_date, certificate_issued ? 1 : 0, id]
      )
    );
    
    await Promise.all(updatePromises);
    
    // Update enrollments
    await db.query(
      `UPDATE enrollments SET status = 'completed' WHERE student_id IN (?)`,
      [student_ids]
    );
    
    res.json({ success: true, graduatedCount: student_ids.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Transfer student to different class/trade
router.post('/students/:id/transfer', async (req, res) => {
  try {
    const { new_class_id, new_trade_code, reason, effective_date } = req.body;
    
    // Log transfer
    await db.query(
      `INSERT INTO student_transfers (student_id, from_class_id, to_class_id, from_trade_code, to_trade_code, reason, effective_date) 
       SELECT ?, e.class_id, ?, s.trade_code, ?, ?, ?
       FROM students s
       LEFT JOIN enrollments e ON s.id = e.student_id
       WHERE s.id = ?`,
      [req.params.id, new_class_id, new_trade_code, reason, effective_date, req.params.id]
    );
    
    // Update student
    if (new_trade_code) {
      await db.query(`UPDATE students SET trade_code = ? WHERE id = ?`, [new_trade_code, req.params.id]);
    }
    
    // Update enrollment
    if (new_class_id) {
      await db.query(`UPDATE enrollments SET class_id = ? WHERE student_id = ?`, [new_class_id, req.params.id]);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DOS Dashboard Statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM teachers WHERE status = 'active') as active_teachers,
        (SELECT COUNT(*) FROM students WHERE status = 'active') as active_students,
        (SELECT COUNT(*) FROM classes WHERE status = 'active') as active_classes,
        (SELECT COUNT(*) FROM workshops WHERE status = 'scheduled' OR status = 'ongoing') as upcoming_workshops,
        (SELECT COUNT(*) FROM students WHERE status = 'graduated' AND YEAR(graduation_date) = YEAR(CURDATE())) as graduates_this_year
    `);
    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
