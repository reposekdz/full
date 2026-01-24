const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/admissions');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/knowledge-base', async (req, res) => {
  try {
    const { search = '', category, status = 'published', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT kb.*, 
             CONCAT(u.first_name, ' ', u.last_name) as author_name,
             u.email as author_email
      FROM knowledge_base kb
      LEFT JOIN users u ON kb.author_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (kb.title LIKE ? OR kb.content LIKE ? OR kb.tags LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      query += ' AND kb.category = ?';
      params.push(category);
    }

    if (status) {
      query += ' AND kb.status = ?';
      params.push(status);
    }

    const countQuery = query.replace(/SELECT kb\.\*,[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0] ? countResult[0].total : 0;

    query += ' ORDER BY kb.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [articles] = await pool.query(query, params);

    res.json({
      success: true,
      data: articles,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch knowledge base', error: error.message });
  }
});

router.post('/knowledge-base', async (req, res) => {
  try {
    const { title, content, category, tags, status, authorId, metaDescription, featured } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const [result] = await pool.query(`
      INSERT INTO knowledge_base (title, content, category, tags, status, author_id, meta_description, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, content, category, tags, status || 'draft', authorId, metaDescription, featured || false]);

    const [newArticle] = await pool.query('SELECT * FROM knowledge_base WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Knowledge base article created successfully',
      data: newArticle[0]
    });
  } catch (error) {
    console.error('Error creating knowledge base article:', error);
    res.status(500).json({ success: false, message: 'Failed to create article', error: error.message });
  }
});

router.put('/knowledge-base/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags, status, metaDescription, featured } = req.body;

    const [existing] = await pool.query('SELECT * FROM knowledge_base WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const updates = [];
    const params = [];

    if (title) { updates.push('title = ?'); params.push(title); }
    if (content) { updates.push('content = ?'); params.push(content); }
    if (category) { updates.push('category = ?'); params.push(category); }
    if (tags !== undefined) { updates.push('tags = ?'); params.push(tags); }
    if (status) { 
      updates.push('status = ?'); 
      params.push(status);
      if (status === 'published' && !existing[0].published_at) {
        updates.push('published_at = NOW()');
      }
    }
    if (metaDescription !== undefined) { updates.push('meta_description = ?'); params.push(metaDescription); }
    if (featured !== undefined) { updates.push('featured = ?'); params.push(featured); }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE knowledge_base SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await pool.query('SELECT * FROM knowledge_base WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Knowledge base article updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating knowledge base article:', error);
    res.status(500).json({ success: false, message: 'Failed to update article', error: error.message });
  }
});

router.post('/knowledge-base/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, isHelpful, comment } = req.body;

    const [article] = await pool.query('SELECT id FROM knowledge_base WHERE id = ?', [id]);
    if (article.length === 0) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    await pool.query(`
      INSERT INTO kb_feedback (article_id, user_id, is_helpful, comment)
      VALUES (?, ?, ?, ?)
    `, [id, userId, isHelpful, comment]);

    if (isHelpful === true) {
      await pool.query('UPDATE knowledge_base SET helpful_count = helpful_count + 1 WHERE id = ?', [id]);
    }

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ success: false, message: 'Failed to submit feedback', error: error.message });
  }
});

router.get('/notifications', async (req, res) => {
  try {
    const { userId, type, priority, isRead, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];

    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (isRead !== undefined) {
      query += ' AND is_read = ?';
      params.push(isRead === 'true' ? 1 : 0);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [notifications] = await pool.query(query, params);

    res.json({
      success: true,
      data: notifications,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
});

router.post('/notifications', async (req, res) => {
  try {
    const { userId, title, message, type, priority, actionUrl, actionText, data, scheduledFor } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({ success: false, message: 'User ID, title, and message are required' });
    }

    const [result] = await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, priority, action_url, action_text, data, scheduled_for)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, title, message, type || 'info', priority || 'normal', actionUrl, actionText, JSON.stringify(data), scheduledFor]);

    const [notification] = await pool.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification[0]
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, message: 'Failed to create notification', error: error.message });
  }
});

router.put('/notifications/:id/mark-read', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read', error: error.message });
  }
});

router.put('/notifications/user/:userId/mark-all-read', async (req, res) => {
  try {
    const { userId } = req.params;

    await pool.query('UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0', [userId]);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all notifications as read', error: error.message });
  }
});

router.get('/admission-sessions', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM admission_sessions WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY start_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [sessions] = await pool.query(query, params);

    res.json({
      success: true,
      data: sessions,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching admission sessions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admission sessions', error: error.message });
  }
});

router.post('/admission-sessions', async (req, res) => {
  try {
    const { name, academicYear, startDate, endDate, status, description, requirements, feeAmount, maxApplications, createdBy } = req.body;

    if (!name || !academicYear || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Name, academic year, start date, and end date are required' });
    }

    const [result] = await pool.query(`
      INSERT INTO admission_sessions (name, academic_year, start_date, end_date, status, description, requirements, fee_amount, max_applications, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, academicYear, startDate, endDate, status || 'draft', description, JSON.stringify(requirements), feeAmount, maxApplications, createdBy]);

    const [newSession] = await pool.query('SELECT * FROM admission_sessions WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Admission session created successfully',
      data: newSession[0]
    });
  } catch (error) {
    console.error('Error creating admission session:', error);
    res.status(500).json({ success: false, message: 'Failed to create admission session', error: error.message });
  }
});

router.get('/admission-applications', async (req, res) => {
  try {
    const { sessionId, status, search = '', page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT aa.*, aas.name as session_name, aas.academic_year
      FROM admission_applications aa
      LEFT JOIN admission_sessions aas ON aa.session_id = aas.id
      WHERE 1=1
    `;
    const params = [];

    if (sessionId) {
      query += ' AND aa.session_id = ?';
      params.push(sessionId);
    }

    if (status) {
      query += ' AND aa.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (aa.student_first_name LIKE ? OR aa.student_last_name LIKE ? OR aa.parent_email LIKE ? OR aa.application_number LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY aa.submitted_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [applications] = await pool.query(query, params);

    res.json({
      success: true,
      data: applications,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching admission applications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications', error: error.message });
  }
});

router.post('/admission-applications', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      sessionId, studentFirstName, studentLastName, studentDob, studentGender,
      gradeApplyingFor, previousSchool, parentName, parentEmail, parentPhone,
      parentAddress, emergencyContact, medicalInfo
    } = req.body;

    if (!sessionId || !studentFirstName || !studentLastName || !parentEmail) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const applicationNumber = 'APP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const [result] = await connection.query(`
      INSERT INTO admission_applications (
        application_number, session_id, student_first_name, student_last_name, student_dob,
        student_gender, grade_applying_for, previous_school, parent_name, parent_email,
        parent_phone, parent_address, emergency_contact, medical_info, status, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', NOW())
    `, [
      applicationNumber, sessionId, studentFirstName, studentLastName, studentDob,
      studentGender, gradeApplyingFor, previousSchool, parentName, parentEmail,
      parentPhone, parentAddress, JSON.stringify(emergencyContact), JSON.stringify(medicalInfo)
    ]);

    await connection.commit();

    const [newApplication] = await connection.query('SELECT * FROM admission_applications WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: newApplication[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating admission application:', error);
    res.status(500).json({ success: false, message: 'Failed to create application', error: error.message });
  } finally {
    connection.release();
  }
});

router.put('/admission-applications/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { status, reviewedBy, decisionNotes, interviewScheduled } = req.body;

    const [existing] = await connection.query('SELECT * FROM admission_applications WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const updates = [];
    const params = [];

    if (status) { 
      updates.push('status = ?'); 
      params.push(status);
      if (!existing[0].reviewed_at) {
        updates.push('reviewed_at = NOW()');
      }
    }
    if (reviewedBy) { updates.push('reviewed_by = ?'); params.push(reviewedBy); }
    if (decisionNotes !== undefined) { updates.push('decision_notes = ?'); params.push(decisionNotes); }
    if (interviewScheduled) { updates.push('interview_scheduled = ?'); params.push(interviewScheduled); }

    if (updates.length > 0) {
      params.push(id);
      await connection.query(`UPDATE admission_applications SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    await connection.commit();

    const [updated] = await connection.query('SELECT * FROM admission_applications WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: updated[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating admission application:', error);
    res.status(500).json({ success: false, message: 'Failed to update application', error: error.message });
  } finally {
    connection.release();
  }
});

router.post('/admission-applications/:id/documents', upload.single('document'), async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType, notes } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Document file is required' });
    }

    const [result] = await pool.query(`
      INSERT INTO admission_documents (application_id, document_type, filename, file_path, file_size)
      VALUES (?, ?, ?, ?, ?)
    `, [id, documentType, req.file.filename, `/uploads/admissions/${req.file.filename}`, req.file.size]);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: { id: result.insertId, filename: req.file.filename, path: `/uploads/admissions/${req.file.filename}` }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ success: false, message: 'Failed to upload document', error: error.message });
  }
});

router.get('/exam-sessions', async (req, res) => {
  try {
    const { academicYear, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM exam_sessions WHERE 1=1';
    const params = [];

    if (academicYear) {
      query += ' AND academic_year = ?';
      params.push(academicYear);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY start_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [sessions] = await pool.query(query, params);

    res.json({
      success: true,
      data: sessions,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching exam sessions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch exam sessions', error: error.message });
  }
});

router.post('/exam-sessions', async (req, res) => {
  try {
    const { name, academicYear, startDate, endDate, description, status } = req.body;

    if (!name || !academicYear || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Name, academic year, start date, and end date are required' });
    }

    const [result] = await pool.query(`
      INSERT INTO exam_sessions (name, academic_year, start_date, end_date, description, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, academicYear, startDate, endDate, description, status || 'draft']);

    const [newSession] = await pool.query('SELECT * FROM exam_sessions WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Exam session created successfully',
      data: newSession[0]
    });
  } catch (error) {
    console.error('Error creating exam session:', error);
    res.status(500).json({ success: false, message: 'Failed to create exam session', error: error.message });
  }
});

module.exports = router;
