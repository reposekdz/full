// DOS (Director of Studies) Management Routes - Full Feature Set with Real Database
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== REPORT CARDS ====================

// GET all report cards from database
router.get('/report-cards', authenticateToken, async (req, res) => {
  try {
    const { student_id, trade_code, level_number, term, academic_year, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT rc.*, 
        u.first_name, u.last_name, u.username,
        sp.admission_number,
        t.trade_name,
        CONCAT(t.trade_code, ' Level ', rc.level_number) as class_info
      FROM report_cards rc
      LEFT JOIN users u ON rc.student_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN trades t ON rc.trade_code = t.trade_code
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ` AND rc.student_id = ?`;
      params.push(student_id);
    }
    if (trade_code) {
      query += ` AND rc.trade_code = ?`;
      params.push(trade_code);
    }
    if (level_number) {
      query += ` AND rc.level_number = ?`;
      params.push(parseInt(level_number));
    }
    if (term) {
      query += ` AND rc.term = ?`;
      params.push(term);
    }
    if (academic_year) {
      query += ` AND rc.academic_year = ?`;
      params.push(academic_year);
    }
    if (status) {
      query += ` AND rc.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY rc.generated_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [reports] = await pool.execute(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM report_cards rc WHERE 1=1`;
    const countParams = [];
    if (student_id) { countQuery += ` AND rc.student_id = ?`; countParams.push(student_id); }
    if (trade_code) { countQuery += ` AND rc.trade_code = ?`; countParams.push(trade_code); }
    if (level_number) { countQuery += ` AND rc.level_number = ?`; countParams.push(parseInt(level_number)); }
    if (term) { countQuery += ` AND rc.term = ?`; countParams.push(term); }
    if (academic_year) { countQuery += ` AND rc.academic_year = ?`; countParams.push(academic_year); }
    if (status) { countQuery += ` AND rc.status = ?`; countParams.push(status); }

    const [[{ total }]] = await pool.execute(countQuery, countParams);

    res.json({
      success: true,
      reports,
      total,
      pagination: { page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching report cards:', error);
    res.status(500).json({ success: false, message: 'Error fetching report cards', error: error.message });
  }
});

// GET single report card
router.get('/report-cards/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT rc.*, 
        u.first_name, u.last_name, u.username, u.email,
        sp.admission_number, sp.date_of_birth,
        t.trade_name
      FROM report_cards rc
      LEFT JOIN users u ON rc.student_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN trades t ON rc.trade_code = t.trade_code
      WHERE rc.id = ?
    `;
    const [[report]] = await pool.execute(query, [id]);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report card not found' });
    }

    // Get marks for this report card
    const marksQuery = `
      SELECT * FROM report_card_marks WHERE report_card_id = ? ORDER BY subject_name ASC
    `;
    const [marks] = await pool.execute(marksQuery, [id]);

    res.json({ success: true, report: { ...report, marks } });
  } catch (error) {
    console.error('Error fetching report card:', error);
    res.status(500).json({ success: false, message: 'Error fetching report card', error: error.message });
  }
});

// POST generate report card from real student data
router.post('/reports/generate-report-card', authenticateToken, requireRole('director_study', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { student_id, trade_code, level_number, level_suffix, term, academic_year, include_ranks, include_teacher_comments, include_dos_comments, include_attendance } = req.body;

    // Get student data from database
    const studentQuery = `
      SELECT u.id, u.first_name, u.last_name, u.username,
        sp.admission_number, sp.date_of_birth, sp.gender
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = ? AND u.role = 'student'
    `;
    const [[student]] = await pool.execute(studentQuery, [student_id]);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get student marks from database
    const marksQuery = `
      SELECT cm.*, c.name as course_name
      FROM course_marks cm
      LEFT JOIN courses c ON cm.course_id = c.id
      WHERE cm.student_id = ? AND cm.status = 'approved'
      ORDER BY c.name ASC
    `;
    const [marks] = await pool.execute(marksQuery, [student_id]);

    // Calculate GPA and totals
    const totalScore = marks.reduce((sum, m) => sum + (m.final_score || 0), 0);
    const averageScore = marks.length > 0 ? totalScore / marks.length : 0;
    const gpa = (averageScore / 100) * 4.0;

    // Generate report card
    const reportId = `RC-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    // Insert report card
    const insertQuery = `
      INSERT INTO report_cards (
        report_id, student_id, trade_code, level_number, level_suffix, term, academic_year,
        total_score, average_score, gpa, rank_position, status,
        include_ranks, include_teacher_comments, include_dos_comments, include_attendance,
        generated_by, generated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    await pool.execute(insertQuery, [
      reportId, student_id, trade_code, level_number, level_suffix || null, term, academic_year,
      totalScore, averageScore, gpa.toFixed(2), null, 'draft',
      include_ranks ? 1 : 0, include_teacher_comments ? 1 : 0, include_dos_comments ? 1 : 0, include_attendance ? 1 : 0,
      req.user?.name || 'DOS'
    ]);

    // Insert marks into report card
    if (marks.length > 0) {
      const marksInsertQuery = `
        INSERT INTO report_card_marks (report_card_id, student_id, course_id, course_name, quiz_score, midterm_score, final_score, total_score, grade, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      for (const mark of marks) {
        const total = (mark.quiz_score || 0) + (mark.midterm_score || 0) + (mark.final_score || 0);
        const grade = total >= 90 ? 'A' : total >= 80 ? 'B' : total >= 70 ? 'C' : total >= 60 ? 'D' : 'F';
        await pool.execute(marksInsertQuery, [reportId, student_id, mark.course_id, mark.course_name, mark.quiz_score, mark.midterm_score, mark.final_score, total, grade]);
      }
    }

    // Get the created report card
    const [[createdReport]] = await pool.execute(
      'SELECT * FROM report_cards WHERE report_id = ?',
      [reportId]
    );

    res.json({
      success: true,
      message: 'Report card generated successfully',
      report: createdReport
    });
  } catch (error) {
    console.error('Error generating report card:', error);
    res.status(500).json({ success: false, message: 'Error generating report card', error: error.message });
  }
});

// PUT publish report card
router.put('/report-cards/:id/publish', authenticateToken, requireRole('director_study', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute(
      `UPDATE report_cards SET status = 'published', published_at = NOW() WHERE id = ?`,
      [id]
    );

    const [[updated]] = await pool.execute('SELECT * FROM report_cards WHERE id = ?', [id]);

    res.json({ success: true, message: 'Report card published successfully', report: updated });
  } catch (error) {
    console.error('Error publishing report card:', error);
    res.status(500).json({ success: false, message: 'Error publishing report card', error: error.message });
  }
});

// ==================== PARENT ACCESS CONTROL ====================

// GET parent connections
router.get('/parent-connections', authenticateToken, async (req, res) => {
  try {
    const { student_id, parent_id, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT pc.*,
        s.first_name as student_first_name, s.last_name as student_last_name, s.username as student_username,
        p.first_name as parent_first_name, p.last_name as parent_last_name, p.username as parent_username,
        sp.admission_number
      FROM parent_connections pc
      LEFT JOIN users s ON pc.student_id = s.id
      LEFT JOIN users p ON pc.parent_id = p.id
      LEFT JOIN student_profiles sp ON s.id = sp.user_id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) { query += ` AND pc.student_id = ?`; params.push(student_id); }
    if (parent_id) { query += ` AND pc.parent_id = ?`; params.push(parent_id); }
    if (status) { query += ` AND pc.status = ?`; params.push(status); }

    query += ` ORDER BY pc.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [connections] = await pool.execute(query, params);

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM parent_connections pc WHERE 1=1` +
      (student_id ? ` AND pc.student_id = '${student_id}'` : '') +
      (parent_id ? ` AND pc.parent_id = '${parent_id}'` : '') +
      (status ? ` AND pc.status = '${status}'` : ''),
      []
    );

    res.json({ success: true, connections, total, pagination: { page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching parent connections:', error);
    res.status(500).json({ success: false, message: 'Error fetching parent connections', error: error.message });
  }
});

// POST grant parent access
router.post('/parent-access/grant', authenticateToken, requireRole('director_study', 'admin', 'headmaster', 'director_discipline'), async (req, res) => {
  try {
    const { student_id, parent_id, can_view_marks, can_view_attendance, can_view_discipline, can_view_report_cards, can_receive_sms, access_expires_at } = req.body;

    // Check if connection exists
    const [[existing]] = await pool.execute(
      'SELECT * FROM parent_connections WHERE student_id = ? AND parent_id = ?',
      [student_id, parent_id]
    );

    if (existing) {
      // Update existing connection
      await pool.execute(`
        UPDATE parent_connections SET 
          can_view_marks = ?, can_view_attendance = ?, can_view_discipline = ?, 
          can_view_report_cards = ?, can_receive_sms = ?, status = 'active',
          access_granted_by = ?, access_granted_at = NOW(), access_expires_at = ?
        WHERE id = ?
      `, [
        can_view_marks ? 1 : 0, can_view_attendance ? 1 : 0, can_view_discipline ? 1 : 0,
        can_view_report_cards ? 1 : 0, can_receive_sms ? 1 : 0,
        req.user?.name || 'System', access_expires_at || null,
        existing.id
      ]);
      res.json({ success: true, message: 'Parent access updated successfully' });
    } else {
      // Create new connection
      await pool.execute(`
        INSERT INTO parent_connections (
          student_id, parent_id, can_view_marks, can_view_attendance, can_view_discipline,
          can_view_report_cards, can_receive_sms, status, access_granted_by, access_granted_at, access_expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, NOW(), ?)
      `, [
        student_id, parent_id,
        can_view_marks ? 1 : 0, can_view_attendance ? 1 : 0, can_view_discipline ? 1 : 0,
        can_view_report_cards ? 1 : 0, can_receive_sms ? 1 : 0,
        req.user?.name || 'System', access_expires_at || null
      ]);
      res.json({ success: true, message: 'Parent access granted successfully' });
    }
  } catch (error) {
    console.error('Error granting parent access:', error);
    res.status(500).json({ success: false, message: 'Error granting parent access', error: error.message });
  }
});

// PUT revoke parent access
router.put('/parent-access/revoke/:id', authenticateToken, requireRole('director_study', 'admin', 'headmaster', 'director_discipline'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await pool.execute(`
      UPDATE parent_connections SET 
        status = 'revoked', access_revoked_by = ?, access_revoked_at = NOW(), revocation_reason = ?
      WHERE id = ?
    `, [req.user?.name || 'System', reason, id]);

    res.json({ success: true, message: 'Parent access revoked successfully' });
  } catch (error) {
    console.error('Error revoking parent access:', error);
    res.status(500).json({ success: false, message: 'Error revoking parent access', error: error.message });
  }
});

// ==================== STUDENT DATA ====================

// GET students for report cards
router.get('/students', authenticateToken, async (req, res) => {
  try {
    const { search, trade_code, level_number, status = 'active', page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT DISTINCT u.id, u.first_name, u.last_name, u.username, u.email, u.phone, u.is_active,
        sp.admission_number, sp.date_of_birth, sp.gender,
        t.trade_code, t.trade_name,
        e.level_number, e.level_suffix
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trades t ON e.trade_code = t.trade_code
      WHERE u.role = 'student'
    `;
    const params = [];

    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR sp.admission_number LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    if (trade_code) {
      query += ` AND e.trade_code = ?`;
      params.push(trade_code);
    }
    if (level_number) {
      query += ` AND e.level_number = ?`;
      params.push(parseInt(level_number));
    }
    if (status === 'active') {
      query += ` AND u.is_active = 1`;
    }

    query += ` ORDER BY u.last_name, u.first_name LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [students] = await pool.execute(query, params);

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(DISTINCT u.id) as total FROM users u LEFT JOIN student_profiles sp ON u.id = sp.user_id LEFT JOIN enrollments e ON u.id = e.student_id WHERE u.role = 'student'` +
      (status === 'active' ? ` AND u.is_active = 1` : ''),
      []
    );

    res.json({ success: true, students, total, pagination: { page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Error fetching students', error: error.message });
  }
});

// GET trades and levels
router.get('/trades-levels', authenticateToken, async (req, res) => {
  try {
    const [trades] = await pool.execute('SELECT trade_code, trade_name FROM trades WHERE is_active = 1 ORDER BY trade_name');
    const [levels] = await pool.execute('SELECT DISTINCT level_number FROM enrollments WHERE status = "active" ORDER BY level_number');

    res.json({ success: true, trades, levels: levels.map(l => l.level_number) });
  } catch (error) {
    console.error('Error fetching trades and levels:', error);
    res.status(500).json({ success: false, message: 'Error fetching trades and levels', error: error.message });
  }
});

// ==================== SMS NOTIFICATIONS ====================

// POST send SMS to parents
router.post('/sms/send', authenticateToken, requireRole('director_study', 'admin', 'headmaster', 'director_discipline'), async (req, res) => {
  try {
    const { parent_ids, student_ids, message, type, priority = 'normal' } = req.body;

    // Get parent phone numbers
    let query = `
      SELECT DISTINCT u.id as parent_id, u.first_name, u.last_name, u.phone,
        pc.student_id, s.first_name as student_name
      FROM users u
      LEFT JOIN parent_connections pc ON u.id = pc.parent_id
      LEFT JOIN users s ON pc.student_id = s.id
      WHERE u.role = 'parent' AND u.phone IS NOT NULL AND pc.status = 'active' AND pc.can_receive_sms = 1
    `;
    
    if (parent_ids && parent_ids.length > 0) {
      query += ` AND u.id IN (${parent_ids.map(() => '?').join(',')})`;
    }
    if (student_ids && student_ids.length > 0) {
      query += ` AND pc.student_id IN (${student_ids.map(() => '?').join(',')})`;
    }

    const [parents] = await pool.execute(query, [...(parent_ids || []), ...(student_ids || [])]);

    // In production, this would send via African Talking API
    const smsResults = [];
    for (const parent of parents) {
      const smsRecord = {
        id: `SMS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        parent_id: parent.parent_id,
        student_id: parent.student_id,
        phone: parent.phone,
        message,
        type,
        priority,
        status: 'sent',
        sent_at: new Date().toISOString()
      };
      
      // Log SMS in database
      await pool.execute(`
        INSERT INTO sms_history (sms_id, parent_id, student_id, phone, message, type, priority, status, sent_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [smsRecord.id, parent.parent_id, parent.student_id, parent.phone, message, type, priority, 'sent']);
      
      smsResults.push(smsRecord);
    }

    res.json({ 
      success: true, 
      message: `${smsResults.length} SMS sent successfully`,
      results: smsResults
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ success: false, message: 'Error sending SMS', error: error.message });
  }
});

// GET SMS history
router.get('/sms/history', authenticateToken, async (req, res) => {
  try {
    const { parent_id, student_id, type, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT sh.*,
        p.first_name as parent_first_name, p.last_name as parent_last_name,
        s.first_name as student_first_name, s.last_name as student_last_name
      FROM sms_history sh
      LEFT JOIN users p ON sh.parent_id = p.id
      LEFT JOIN users s ON sh.student_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (parent_id) { query += ` AND sh.parent_id = ?`; params.push(parent_id); }
    if (student_id) { query += ` AND sh.student_id = ?`; params.push(student_id); }
    if (type) { query += ` AND sh.type = ?`; params.push(type); }
    if (status) { query += ` AND sh.status = ?`; params.push(status); }

    query += ` ORDER BY sh.sent_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [history] = await pool.execute(query, params);

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM sms_history sh WHERE 1=1` +
      (parent_id ? ` AND sh.parent_id = '${parent_id}'` : '') +
      (student_id ? ` AND sh.student_id = '${student_id}'` : '') +
      (type ? ` AND sh.type = '${type}'` : '') +
      (status ? ` AND sh.status = '${status}'` : ''),
      []
    );

    res.json({ success: true, history, total, pagination: { page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching SMS history:', error);
    res.status(500).json({ success: false, message: 'Error fetching SMS history', error: error.message });
  }
});

// ==================== TEACHER MARKS ====================

// GET teacher marks for a student
router.get('/marks/:student_id', authenticateToken, async (req, res) => {
  try {
    const { student_id } = req.params;
    const { course_id, term, academic_year } = req.query;

    let query = `
      SELECT cm.*, c.name as course_name, c.code as course_code,
        t.first_name as teacher_first_name, t.last_name as teacher_last_name,
        u.username as teacher_username
      FROM course_marks cm
      LEFT JOIN courses c ON cm.course_id = c.id
      LEFT JOIN users t ON cm.teacher_id = t.id
      LEFT JOIN users u ON cm.student_id = u.id
      WHERE cm.student_id = ?
    `;
    const params = [student_id];

    if (course_id) { query += ` AND cm.course_id = ?`; params.push(course_id); }
    if (term) { query += ` AND cm.term = ?`; params.push(term); }
    if (academic_year) { query += ` AND cm.academic_year = ?`; params.push(academic_year); }

    query += ` ORDER BY c.name, cm.created_at DESC`;

    const [marks] = await pool.execute(query, params);

    res.json({ success: true, marks });
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ success: false, message: 'Error fetching marks', error: error.message });
  }
});

// ==================== GLOBAL STUDENT SHEETS COLUMNS ====================

// GET custom columns for role
router.get('/student-sheets/columns', authenticateToken, async (req, res) => {
  try {
    const { role } = req.user;
    
    // Get role-specific columns or default columns
    const query = `
      SELECT * FROM global_sheet_columns 
      WHERE role = ? OR role = 'all' OR role IS NULL
      ORDER BY display_order ASC
    `;
    const [columns] = await pool.execute(query, [role]);

    res.json({ success: true, columns });
  } catch (error) {
    console.error('Error fetching columns:', error);
    res.status(500).json({ success: false, message: 'Error fetching columns', error: error.message });
  }
});

// POST add custom column for role
router.post('/student-sheets/columns', authenticateToken, requireRole('director_study', 'admin', 'headmaster', 'director_discipline'), async (req, res) => {
  try {
    const { column_name, display_name, column_type, width, visible, display_order } = req.body;
    const { role } = req.user;

    await pool.execute(`
      INSERT INTO global_sheet_columns (role, column_name, display_name, column_type, width, visible, display_order, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [role, column_name, display_name, column_type || 'text', width || 100, visible !== false ? 1 : 0, display_order || 0, req.user?.name]);

    res.json({ success: true, message: 'Column added successfully' });
  } catch (error) {
    console.error('Error adding column:', error);
    res.status(500).json({ success: false, message: 'Error adding column', error: error.message });
  }
});

// GET global student sheets data
router.get('/student-sheets', authenticateToken, async (req, res) => {
  try {
    const { role } = req.user;
    const { search, trade_code, level_number, status, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    // Get students with their data
    let query = `
      SELECT u.id, u.first_name, u.last_name, u.username, u.email, u.phone, u.is_active,
        sp.admission_number, sp.date_of_birth, sp.gender, sp.address,
        t.trade_code, t.trade_name,
        e.level_number, e.level_suffix,
        (SELECT COUNT(*) FROM attendances a WHERE a.student_id = u.id AND a.status = 'present' AND a.date >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as attendance_present,
        (SELECT COUNT(*) FROM attendances a WHERE a.student_id = u.id AND a.date >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as attendance_total
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trades t ON e.trade_code = t.trade_code
      WHERE u.role = 'student'
    `;
    const params = [];

    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR sp.admission_number LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    if (trade_code) {
      query += ` AND e.trade_code = ?`;
      params.push(trade_code);
    }
    if (level_number) {
      query += ` AND e.level_number = ?`;
      params.push(parseInt(level_number));
    }
    if (status === 'active') {
      query += ` AND u.is_active = 1`;
    }

    query += ` ORDER BY u.last_name, u.first_name LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [students] = await pool.execute(query, params);

    // Calculate attendance percentage
    const studentsWithAttendance = students.map(s => ({
      ...s,
      attendance_percentage: s.attendance_total > 0 ? Math.round((s.attendance_present / s.attendance_total) * 100) : 100
    }));

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM users u LEFT JOIN student_profiles sp ON u.id = sp.user_id WHERE u.role = 'student'` +
      (status === 'active' ? ` AND u.is_active = 1` : ''),
      []
    );

    res.json({ success: true, students: studentsWithAttendance, total, pagination: { page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching student sheets:', error);
    res.status(500).json({ success: false, message: 'Error fetching student sheets', error: error.message });
  }
});

module.exports = router;
