const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const fs = require('fs');

/**
 * ====================================
 * TEACHER CONTENT MANAGEMENT SYSTEM
 * ====================================
 * Comprehensive upload and management system for:
 * - Study notes and materials
 * - Class works and assignments  
 * - Holiday packages
 * - Quizzes and assessments
 * - Educational resources
 */

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
const notesDir = path.join(uploadsDir, 'notes');
const worksDir = path.join(uploadsDir, 'works');
const holidayDir = path.join(uploadsDir, 'holiday');
const quizzesDir = path.join(uploadsDir, 'quizzes');

[uploadsDir, notesDir, worksDir, holidayDir, quizzesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = notesDir;
    
    if (req.path.includes('/works')) uploadPath = worksDir;
    else if (req.path.includes('/holiday')) uploadPath = holidayDir;
    else if (req.path.includes('/quiz')) uploadPath = quizzesDir;
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only documents, images, and archives are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter
});

// =====================================
// NOTES & MATERIALS MANAGEMENT
// =====================================

// Upload study notes
router.post('/notes/upload', authenticateToken, requireRole(['teacher', 'dos', 'admin']), 
  upload.array('files', 10), async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { title, description, subject_id, trade_code, level_number, level_suffix, topic, category } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    
    const files = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype
    }));
    
    const [result] = await pool.execute(`
      INSERT INTO teacher_notes (
        teacher_id, title, description, subject_id, trade_code, level_number, 
        level_suffix, topic, category, files, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW())
    `, [teacherId, title, description, subject_id, trade_code, level_number, 
        level_suffix || '', topic, category || 'general', JSON.stringify(files)]);
    
    res.status(201).json({
      success: true,
      message: 'Notes uploaded successfully',
      note_id: result.insertId,
      files: files.length
    });
  } catch (error) {
    console.error('Upload notes error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all notes by teacher
router.get('/notes/my-notes', authenticateToken, requireRole(['teacher', 'dos', 'admin']), async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { subject_id, trade_code, level_number } = req.query;
    
    let query = `
      SELECT 
        tn.*,
        s.name as subject_name,
        s.code as subject_code,
        COUNT(DISTINCT ns.student_id) as view_count
      FROM teacher_notes tn
      LEFT JOIN subjects s ON tn.subject_id = s.id
      LEFT JOIN note_views ns ON tn.id = ns.note_id
      WHERE tn.teacher_id = ?
    `;
    
    const params = [teacherId];
    
    if (subject_id) {
      query += ' AND tn.subject_id = ?';
      params.push(subject_id);
    }
    if (trade_code) {
      query += ' AND tn.trade_code = ?';
      params.push(trade_code);
    }
    if (level_number) {
      query += ' AND tn.level_number = ?';
      params.push(level_number);
    }
    
    query += ' GROUP BY tn.id ORDER BY tn.created_at DESC';
    
    const [notes] = await pool.execute(query, params);
    
    res.json({
      success: true,
      notes: notes.map(note => ({
        ...note,
        files: JSON.parse(note.files || '[]')
      }))
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get notes for students by trade/level
router.get('/notes/student-view', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const { trade_code, level_number, level_suffix, subject_id } = req.query;
    
    let query = `
      SELECT 
        tn.*,
        s.name as subject_name,
        u.first_name as teacher_first_name,
        u.last_name as teacher_last_name
      FROM teacher_notes tn
      LEFT JOIN subjects s ON tn.subject_id = s.id
      LEFT JOIN users u ON tn.teacher_id = u.id
      WHERE tn.status = 'published'
    `;
    
    const params = [];
    
    if (trade_code) {
      query += ' AND tn.trade_code = ?';
      params.push(trade_code);
    }
    if (level_number) {
      query += ' AND tn.level_number = ?';
      params.push(level_number);
    }
    if (level_suffix) {
      query += ' AND tn.level_suffix = ?';
      params.push(level_suffix);
    }
    if (subject_id) {
      query += ' AND tn.subject_id = ?';
      params.push(subject_id);
    }
    
    query += ' ORDER BY tn.created_at DESC';
    
    const [notes] = await pool.execute(query, params);
    
    res.json({
      success: true,
      notes: notes.map(note => ({
        ...note,
        files: JSON.parse(note.files || '[]')
      }))
    });
  } catch (error) {
    console.error('Get student notes error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete note
router.delete('/notes/:id', authenticateToken, requireRole(['teacher', 'dos', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    
    const [notes] = await pool.execute(
      'SELECT * FROM teacher_notes WHERE id = ? AND teacher_id = ?',
      [id, teacherId]
    );
    
    if (notes.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found or unauthorized' });
    }
    
    const files = JSON.parse(notes[0].files || '[]');
    files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    
    await pool.execute('DELETE FROM teacher_notes WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// WORKS & ASSIGNMENTS MANAGEMENT
// =====================================

// Upload class work
router.post('/works/upload', authenticateToken, requireRole(['teacher', 'dos', 'admin']), 
  upload.array('files', 10), async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { 
      title, description, subject_id, trade_code, level_number, level_suffix,
      work_type, total_marks, due_date, instructions, submission_required
    } = req.body;
    
    const files = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype
    })) : [];
    
    const [result] = await pool.execute(`
      INSERT INTO teacher_works (
        teacher_id, title, description, subject_id, trade_code, level_number, 
        level_suffix, work_type, total_marks, due_date, instructions, 
        submission_required, files, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW())
    `, [teacherId, title, description, subject_id, trade_code, level_number, 
        level_suffix || '', work_type || 'assignment', total_marks || 100, 
        due_date, instructions, submission_required ? 1 : 0, JSON.stringify(files)]);
    
    res.status(201).json({
      success: true,
      message: 'Work uploaded successfully',
      work_id: result.insertId,
      files: files.length
    });
  } catch (error) {
    console.error('Upload work error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all works by teacher
router.get('/works/my-works', authenticateToken, requireRole(['teacher', 'dos', 'admin']), async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { subject_id, work_type, status } = req.query;
    
    let query = `
      SELECT 
        tw.*,
        s.name as subject_name,
        COUNT(DISTINCT ws.student_id) as submission_count
      FROM teacher_works tw
      LEFT JOIN subjects s ON tw.subject_id = s.id
      LEFT JOIN work_submissions ws ON tw.id = ws.work_id
      WHERE tw.teacher_id = ?
    `;
    
    const params = [teacherId];
    
    if (subject_id) {
      query += ' AND tw.subject_id = ?';
      params.push(subject_id);
    }
    if (work_type) {
      query += ' AND tw.work_type = ?';
      params.push(work_type);
    }
    if (status) {
      query += ' AND tw.status = ?';
      params.push(status);
    }
    
    query += ' GROUP BY tw.id ORDER BY tw.created_at DESC';
    
    const [works] = await pool.execute(query, params);
    
    res.json({
      success: true,
      works: works.map(work => ({
        ...work,
        files: JSON.parse(work.files || '[]')
      }))
    });
  } catch (error) {
    console.error('Get works error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get works for students
router.get('/works/student-view', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const { trade_code, level_number, subject_id } = req.query;
    
    let query = `
      SELECT 
        tw.*,
        s.name as subject_name,
        u.first_name as teacher_first_name,
        u.last_name as teacher_last_name,
        ws.id as submission_id,
        ws.submitted_at,
        ws.marks_obtained,
        ws.status as submission_status
      FROM teacher_works tw
      LEFT JOIN subjects s ON tw.subject_id = s.id
      LEFT JOIN users u ON tw.teacher_id = u.id
      LEFT JOIN work_submissions ws ON tw.id = ws.work_id AND ws.student_id = ?
      WHERE tw.status = 'published'
    `;
    
    const params = [studentId];
    
    if (trade_code) {
      query += ' AND tw.trade_code = ?';
      params.push(trade_code);
    }
    if (level_number) {
      query += ' AND tw.level_number = ?';
      params.push(level_number);
    }
    if (subject_id) {
      query += ' AND tw.subject_id = ?';
      params.push(subject_id);
    }
    
    query += ' ORDER BY tw.due_date DESC';
    
    const [works] = await pool.execute(query, params);
    
    res.json({
      success: true,
      works: works.map(work => ({
        ...work,
        files: JSON.parse(work.files || '[]')
      }))
    });
  } catch (error) {
    console.error('Get student works error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit work (student)
router.post('/works/:id/submit', authenticateToken, requireRole(['student']), 
  upload.array('files', 5), async (req, res) => {
  try {
    const workId = req.params.id;
    const studentId = req.user.id;
    const { submission_text, notes } = req.body;
    
    const [works] = await pool.execute('SELECT * FROM teacher_works WHERE id = ?', [workId]);
    
    if (works.length === 0) {
      return res.status(404).json({ success: false, message: 'Work not found' });
    }
    
    const work = works[0];
    const isLate = new Date() > new Date(work.due_date);
    
    const files = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      size: file.size
    })) : [];
    
    const [result] = await pool.execute(`
      INSERT INTO work_submissions (
        work_id, student_id, submission_text, notes, files, is_late, 
        status, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'submitted', NOW())
      ON DUPLICATE KEY UPDATE 
        submission_text = ?, notes = ?, files = ?, submitted_at = NOW(), status = 'submitted'
    `, [workId, studentId, submission_text, notes, JSON.stringify(files), isLate ? 1 : 0,
        submission_text, notes, JSON.stringify(files)]);
    
    res.json({
      success: true,
      message: 'Work submitted successfully',
      submission_id: result.insertId,
      is_late: isLate
    });
  } catch (error) {
    console.error('Submit work error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Grade work submission
router.post('/works/submissions/:id/grade', authenticateToken, requireRole(['teacher', 'dos', 'admin']), 
  async (req, res) => {
  try {
    const submissionId = req.params.id;
    const { marks_obtained, feedback, status } = req.body;
    const gradedBy = req.user.id;
    
    await pool.execute(`
      UPDATE work_submissions 
      SET marks_obtained = ?, feedback = ?, status = ?, graded_by = ?, graded_at = NOW()
      WHERE id = ?
    `, [marks_obtained, feedback, status || 'graded', gradedBy, submissionId]);
    
    res.json({
      success: true,
      message: 'Work graded successfully'
    });
  } catch (error) {
    console.error('Grade work error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// HOLIDAY PACKAGES ENHANCED
// =====================================

// Upload holiday package with files
router.post('/holiday/upload', authenticateToken, requireRole(['teacher', 'dos', 'admin']), 
  upload.array('files', 15), async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { 
      title, description, trade_code, level_number, level_suffix, subject_id,
      package_type, estimated_days, difficulty_level, instructions,
      start_date, end_date
    } = req.body;
    
    const files = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      size: file.size
    })) : [];
    
    const [result] = await pool.execute(`
      INSERT INTO holiday_packages (
        teacher_id, title, description, trade_code, level_number, level_suffix,
        subject_id, package_type, estimated_days, difficulty_level, 
        instructions, files, start_date, end_date, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW())
    `, [teacherId, title, description, trade_code, level_number, level_suffix || '',
        subject_id, package_type || 'revision', estimated_days || 7, 
        difficulty_level || 'medium', instructions, JSON.stringify(files), 
        start_date, end_date]);
    
    res.status(201).json({
      success: true,
      message: 'Holiday package uploaded successfully',
      package_id: result.insertId,
      files: files.length
    });
  } catch (error) {
    console.error('Upload holiday package error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get holiday packages
router.get('/holiday/packages', authenticateToken, async (req, res) => {
  try {
    const { trade_code, level_number, subject_id, status } = req.query;
    const isTeacher = ['teacher', 'dos', 'admin'].includes(req.user.role);
    
    let query = `
      SELECT 
        hp.*,
        s.name as subject_name,
        u.first_name as teacher_first_name,
        u.last_name as teacher_last_name
      FROM holiday_packages hp
      LEFT JOIN subjects s ON hp.subject_id = s.id
      LEFT JOIN users u ON hp.teacher_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (!isTeacher) {
      query += ' AND hp.status = "published"';
    }
    
    if (trade_code) {
      query += ' AND hp.trade_code = ?';
      params.push(trade_code);
    }
    if (level_number) {
      query += ' AND hp.level_number = ?';
      params.push(level_number);
    }
    if (subject_id) {
      query += ' AND hp.subject_id = ?';
      params.push(subject_id);
    }
    if (status) {
      query += ' AND hp.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY hp.start_date DESC';
    
    const [packages] = await pool.execute(query, params);
    
    res.json({
      success: true,
      packages: packages.map(pkg => ({
        ...pkg,
        files: JSON.parse(pkg.files || '[]')
      }))
    });
  } catch (error) {
    console.error('Get holiday packages error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// DOWNLOAD FILE
// =====================================

router.get('/download/:type/:filename', authenticateToken, async (req, res) => {
  try {
    const { type, filename } = req.params;
    
    let filePath;
    switch(type) {
      case 'notes':
        filePath = path.join(notesDir, filename);
        break;
      case 'works':
        filePath = path.join(worksDir, filename);
        break;
      case 'holiday':
        filePath = path.join(holidayDir, filename);
        break;
      case 'quizzes':
        filePath = path.join(quizzesDir, filename);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid file type' });
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    
    res.download(filePath);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// STATISTICS
// =====================================

router.get('/statistics', authenticateToken, requireRole(['teacher', 'dos', 'admin']), async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    const [notesCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM teacher_notes WHERE teacher_id = ?',
      [teacherId]
    );
    
    const [worksCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM teacher_works WHERE teacher_id = ?',
      [teacherId]
    );
    
    const [packagesCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM holiday_packages WHERE teacher_id = ?',
      [teacherId]
    );
    
    const [submissionsCount] = await pool.execute(`
      SELECT COUNT(DISTINCT ws.id) as count
      FROM work_submissions ws
      JOIN teacher_works tw ON ws.work_id = tw.id
      WHERE tw.teacher_id = ?
    `, [teacherId]);
    
    res.json({
      success: true,
      statistics: {
        notes_uploaded: notesCount[0].count,
        works_created: worksCount[0].count,
        holiday_packages: packagesCount[0].count,
        submissions_received: submissionsCount[0].count
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
