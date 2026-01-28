const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== ADMISSION SESSIONS ====================

router.get('/sessions', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT s.*, ay.name as academic_year_name 
      FROM admissions_sessions s
      LEFT JOIN academic_years ay ON s.academic_year_id = ay.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }

    query += ' ORDER BY s.start_date DESC';
    const [sessions] = await pool.execute(query, params);

    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Get admission sessions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sessions', error: error.message });
  }
});

router.post('/sessions', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { session_name, academic_year_id, start_date, end_date, status, description } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO admissions_sessions (session_name, academic_year_id, start_date, end_date, status, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [session_name, academic_year_id, start_date, end_date, status || 'upcoming', description]
    );

    res.status(201).json({ success: true, message: 'Admission session created', id: result.insertId });
  } catch (error) {
    console.error('Create admission session error:', error);
    res.status(500).json({ success: false, message: 'Failed to create session', error: error.message });
  }
});

router.put('/sessions/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { session_name, academic_year_id, start_date, end_date, status, description } = req.body;

    await pool.execute(
      `UPDATE admissions_sessions 
       SET session_name = ?, academic_year_id = ?, start_date = ?, end_date = ?, status = ?, description = ?
       WHERE id = ?`,
      [session_name, academic_year_id, start_date, end_date, status, description, id]
    );

    res.json({ success: true, message: 'Session updated successfully' });
  } catch (error) {
    console.error('Update admission session error:', error);
    res.status(500).json({ success: false, message: 'Failed to update session', error: error.message });
  }
});

// ==================== ADMISSION APPLICATIONS ====================

router.get('/applications', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { session_id, status, course_id, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, 
        s.session_name,
        c.name as course_name,
        r.first_name as reviewer_first_name, r.last_name as reviewer_last_name
      FROM admission_applications a
      LEFT JOIN admissions_sessions s ON a.session_id = s.id
      LEFT JOIN courses c ON a.course_id = c.id
      LEFT JOIN users r ON a.reviewed_by = r.id
      WHERE 1=1
    `;
    const params = [];

    if (session_id) {
      query += ' AND a.session_id = ?';
      params.push(session_id);
    }
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    if (course_id) {
      query += ' AND a.course_id = ?';
      params.push(course_id);
    }
    if (search) {
      query += ' AND (a.first_name LIKE ? OR a.last_name LIKE ? OR a.email LIKE ? OR a.application_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Get total count
    const countQuery = query.replace('SELECT a.*, s.session_name, c.name as course_name, r.first_name as reviewer_first_name, r.last_name as reviewer_last_name', 'SELECT COUNT(*) as total');
    const [[{ total }]] = await pool.execute(countQuery, params);

    // Get paginated results
    query += ' ORDER BY a.application_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [applications] = await pool.execute(query, params);

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
    console.error('Get applications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications', error: error.message });
  }
});

router.get('/applications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [applications] = await pool.execute(`
      SELECT a.*, 
        s.session_name,
        c.name as course_name,
        r.first_name as reviewer_first_name, r.last_name as reviewer_last_name
      FROM admission_applications a
      LEFT JOIN admissions_sessions s ON a.session_id = s.id
      LEFT JOIN courses c ON a.course_id = c.id
      LEFT JOIN users r ON a.reviewed_by = r.id
      WHERE a.id = ?
    `, [id]);

    if (applications.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Get comments
    const [comments] = await pool.execute(`
      SELECT c.*, u.first_name, u.last_name
      FROM admission_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.application_id = ?
      ORDER BY c.created_at DESC
    `, [id]);

    // Get interviews
    const [interviews] = await pool.execute(`
      SELECT i.*, u.first_name as interviewer_first_name, u.last_name as interviewer_last_name
      FROM admission_interviews i
      LEFT JOIN users u ON i.interviewer_id = u.id
      WHERE i.application_id = ?
      ORDER BY i.interview_date DESC
    `, [id]);

    // Get workflow history
    const [workflow] = await pool.execute(`
      SELECT w.*, u.first_name as reviewer_first_name, u.last_name as reviewer_last_name
      FROM admission_workflow w
      LEFT JOIN users u ON w.reviewer_id = u.id
      WHERE w.application_id = ?
      ORDER BY w.created_at DESC
    `, [id]);

    res.json({
      success: true,
      application: applications[0],
      comments,
      interviews,
      workflow
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch application', error: error.message });
  }
});

router.post('/applications', async (req, res) => {
  try {
    const {
      session_id, first_name, last_name, email, phone, date_of_birth,
      gender, address, course_id, previous_education, documents
    } = req.body;

    // Generate application number
    const year = new Date().getFullYear();
    const [countResult] = await pool.execute('SELECT COUNT(*) as count FROM admission_applications WHERE YEAR(application_date) = ?', [year]);
    const applicationNumber = `APP${year}${String(countResult[0].count + 1).padStart(5, '0')}`;

    const [result] = await pool.execute(
      `INSERT INTO admission_applications 
       (session_id, application_number, first_name, last_name, email, phone, date_of_birth, 
        gender, address, course_id, previous_education, documents, status, application_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURDATE())`,
      [session_id, applicationNumber, first_name, last_name, email, phone, date_of_birth,
       gender, address, course_id, previous_education, JSON.stringify(documents)]
    );

    // Create initial workflow entry
    await pool.execute(
      `INSERT INTO admission_workflow (application_id, stage, status, notes) 
       VALUES (?, 'application_submitted', 'pending', 'Application submitted')`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationNumber,
      id: result.insertId
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit application', error: error.message });
  }
});

router.put('/applications/:id/status', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, review_notes } = req.body;
    const reviewed_by = req.user.id;

    await pool.execute(
      `UPDATE admission_applications 
       SET status = ?, review_notes = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [status, review_notes, reviewed_by, id]
    );

    // Add to workflow
    await pool.execute(
      `INSERT INTO admission_workflow (application_id, stage, status, reviewer_id, notes) 
       VALUES (?, 'status_update', ?, ?, ?)`,
      [id, status, reviewed_by, review_notes]
    );

    res.json({ success: true, message: 'Application status updated' });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
});

// ==================== ADMISSION COMMENTS ====================

router.post('/applications/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const user_id = req.user.id;

    const [result] = await pool.execute(
      'INSERT INTO admission_comments (application_id, user_id, comment) VALUES (?, ?, ?)',
      [id, user_id, comment]
    );

    res.status(201).json({ success: true, message: 'Comment added', id: result.insertId });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment', error: error.message });
  }
});

// ==================== ADMISSION INTERVIEWS ====================

router.post('/applications/:id/interviews', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const { interview_date, interview_time, interviewer_id, location, notes } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO admission_interviews 
       (application_id, interview_date, interview_time, interviewer_id, location, notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
      [id, interview_date, interview_time, interviewer_id, location, notes]
    );

    // Add to workflow
    await pool.execute(
      `INSERT INTO admission_workflow (application_id, stage, status, reviewer_id, notes) 
       VALUES (?, 'interview_scheduled', 'scheduled', ?, ?)`,
      [id, interviewer_id, `Interview scheduled for ${interview_date} at ${interview_time}`]
    );

    res.status(201).json({ success: true, message: 'Interview scheduled', id: result.insertId });
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({ success: false, message: 'Failed to schedule interview', error: error.message });
  }
});

router.put('/interviews/:id', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    await pool.execute(
      'UPDATE admission_interviews SET status = ?, notes = ? WHERE id = ?',
      [status, notes, id]
    );

    res.json({ success: true, message: 'Interview updated' });
  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({ success: false, message: 'Failed to update interview', error: error.message });
  }
});

// ==================== ADMISSION ANALYTICS ====================

router.get('/analytics', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { session_id } = req.query;
    let whereClause = session_id ? 'WHERE session_id = ?' : '';
    const params = session_id ? [session_id, session_id, session_id, session_id] : [];

    const [statusCounts] = await pool.execute(`
      SELECT status, COUNT(*) as count
      FROM admission_applications
      ${whereClause}
      GROUP BY status
    `, session_id ? [session_id] : []);

    const [courseCounts] = await pool.execute(`
      SELECT c.name as course_name, COUNT(a.id) as count
      FROM admission_applications a
      LEFT JOIN courses c ON a.course_id = c.id
      ${whereClause}
      GROUP BY a.course_id, c.name
      ORDER BY count DESC
    `, session_id ? [session_id] : []);

    const [genderCounts] = await pool.execute(`
      SELECT gender, COUNT(*) as count
      FROM admission_applications
      ${whereClause}
      GROUP BY gender
    `, session_id ? [session_id] : []);

    const [[totalApplicants]] = await pool.execute(`
      SELECT COUNT(*) as total FROM admission_applications ${whereClause}
    `, session_id ? [session_id] : []);

    res.json({
      success: true,
      analytics: {
        totalApplicants: totalApplicants.total,
        byStatus: statusCounts,
        byCourse: courseCounts,
        byGender: genderCounts
      }
    });
  } catch (error) {
    console.error('Admission analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
});

// ==================== BULK OPERATIONS ====================

router.post('/applications/bulk-update-status', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { application_ids, status, review_notes } = req.body;
    const reviewed_by = req.user.id;

    if (!Array.isArray(application_ids) || application_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Application IDs array is required' });
    }

    const placeholders = application_ids.map(() => '?').join(',');
    await pool.execute(
      `UPDATE admission_applications 
       SET status = ?, review_notes = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE id IN (${placeholders})`,
      [status, review_notes, reviewed_by, ...application_ids]
    );

    res.json({ success: true, message: `${application_ids.length} applications updated` });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update applications', error: error.message });
  }
});

module.exports = router;
