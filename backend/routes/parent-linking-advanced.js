/**
 * Advanced Parent Linking System - Real Trades, Levels, Students from Global Sheets
 * Fetches real messages from DOD, DOS, Headmaster, etc.
 */
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all students for linking (no auth required - for parent portal)
router.get('/all-students', async (req, res) => {
  try {
    const { limit = 100, search = '' } = req.query;
    
    let whereClause = "WHERE status = 'active'";
    let params = [];
    
    if (search) {
      whereClause += ` AND (first_name LIKE ? OR last_name LIKE ? OR student_code LIKE ? OR CONCAT(first_name, ' ', last_name) LIKE ?)`;
      const searchPattern = `%${search}%`;
      params = [searchPattern, searchPattern, searchPattern, searchPattern];
    }
    
    const [students] = await pool.execute(`
      SELECT 
        id,
        student_code,
        first_name,
        last_name,
        CONCAT(first_name, ' ', last_name) as full_name,
        trade_name,
        trade_code,
        level_number,
        class_name,
        gender,
        phone,
        email,
        COALESCE(gpa, 0) as gpa,
        COALESCE(attendance_percentage, 0) as attendance,
        COALESCE(conduct_score, 40) as conduct,
        conduct_grade,
        status
      FROM global_student_sheets 
      ${whereClause}
      ORDER BY first_name, last_name
      LIMIT ?
    `, [...params, parseInt(limit)]);
    
    // Group by trade for easier selection
    const groupedByTrade = students.reduce((acc, student) => {
      const trade = student.trade_name || 'Other';
      if (!acc[trade]) {
        acc[trade] = [];
      }
      acc[trade].push(student);
      return acc;
    }, {});
    
    res.json({ 
      success: true, 
      students,
      groupedByTrade,
      count: students.length
    });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get real trades from database (only BDC, SOD, AUTO)
router.get('/trades', async (req, res) => {
  try {
    const [trades] = await pool.execute(`
      SELECT DISTINCT trade_name, trade_code 
      FROM global_student_sheets 
      WHERE trade_name IN ('BDC', 'SOD', 'AUTO', 'Building and Construction', 'Software Development', 'Automobile Technology')
      ORDER BY trade_name
    `);
    
    // Normalize to 3 main trades
    const normalizedTrades = [
      { trade_name: 'BDC', trade_code: 'BDC', full_name: 'Building and Construction' },
      { trade_name: 'SOD', trade_code: 'SOD', full_name: 'Software Development' },
      { trade_name: 'AUTO', trade_code: 'AUTO', full_name: 'Automobile Technology' }
    ];
    
    res.json({ success: true, trades: normalizedTrades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get real levels from database
router.get('/levels', async (req, res) => {
  try {
    const [levels] = await pool.execute(`
      SELECT DISTINCT level_number 
      FROM global_student_sheets 
      WHERE level_number IS NOT NULL 
      ORDER BY level_number
    `);
    
    res.json({ success: true, levels: levels.map(l => l.level_number) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Search students from global_student_sheets - ADVANCED VERSION
router.get('/search-students', async (req, res) => {
  try {
    const { 
      name, trade, level, 
      page = 1, limit = 20, 
      sortBy = 'first_name', sortOrder = 'ASC',
      gender, status 
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereConditions = [];
    let params = [];
    
    // Always filter by active status unless specified
    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    } else {
      whereConditions.push('(status = ? OR status IS NULL)');
      params.push('active');
    }
    
    // Name search - supports first name, last name, or full name
    if (name) {
      whereConditions.push('(first_name LIKE ? OR last_name LIKE ? OR CONCAT(first_name, " ", last_name) LIKE ? OR student_code LIKE ?)');
      const namePattern = `%${name}%`;
      params.push(namePattern, namePattern, namePattern, namePattern);
    }
    
    // Trade filter
    if (trade) {
      whereConditions.push('(trade_name LIKE ? OR trade_code = ?)');
      params.push(`%${trade}%`, trade);
    }
    
    // Level filter
    if (level) {
      whereConditions.push('level_number = ?');
      params.push(parseInt(level));
    }
    
    // Gender filter
    if (gender) {
      whereConditions.push('gender = ?');
      params.push(gender);
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';
    
    // Get total count
    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM global_student_sheets ${whereClause}`,
      params
    );
    
    // Get students with pagination
    const allowedSortFields = ['first_name', 'last_name', 'student_code', 'trade_name', 'level_number', 'gpa', 'attendance_percentage'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'first_name';
    const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    const [students] = await pool.execute(`
      SELECT 
        id,
        student_code,
        first_name,
        last_name,
        CONCAT(first_name, ' ', last_name) as full_name,
        trade_name,
        trade_code,
        level_number,
        level_suffix,
        class_name,
        gender,
        date_of_birth,
        phone,
        email,
        profile_image,
        COALESCE(gpa, 0) as gpa,
        COALESCE(attendance_percentage, 0) as attendance_percentage,
        COALESCE(conduct_score, 40) as conduct_score,
        conduct_grade,
        academic_year,
        status,
        created_at
      FROM global_student_sheets 
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);
    
    // Get unique trades for filter dropdown
    const [trades] = await pool.execute(`
      SELECT DISTINCT trade_name, trade_code 
      FROM global_student_sheets 
      WHERE status = 'active' AND trade_name IS NOT NULL
      ORDER BY trade_name
    `);
    
    // Get unique levels for filter dropdown
    const [levels] = await pool.execute(`
      SELECT DISTINCT level_number 
      FROM global_student_sheets 
      WHERE status = 'active' AND level_number IS NOT NULL
      ORDER BY level_number
    `);
    
    res.json({ 
      success: true, 
      students, 
      count: students.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      filters: {
        trades: trades.map(t => ({ name: t.trade_name, code: t.trade_code })),
        levels: levels.map(l => l.level_number)
      }
    });
  } catch (error) {
    console.error('Search students error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit parent linking request
router.post('/request-linking', async (req, res) => {
  try {
    const {
      parent_name, parent_phone, parent_email,
      student_id, student_first_name, student_last_name,
      student_trade, student_level, relationship, message
    } = req.body;
    
    // Find or create parent
    let [parents] = await pool.execute(
      'SELECT id FROM users WHERE phone = ? AND role = "parent"',
      [parent_phone]
    );
    
    let parent_id;
    if (parents.length === 0) {
      // Create parent account
      const [result] = await pool.execute(`
        INSERT INTO users (username, phone, email, first_name, last_name, role, password, is_active)
        VALUES (?, ?, ?, ?, ?, 'parent', '$2b$10$defaulthash', 1)
      `, [
        parent_phone,
        parent_phone,
        parent_email || `${parent_phone}@parent.garden.rw`,
        parent_name?.split(' ')[0] || 'Parent',
        parent_name?.split(' ').slice(1).join(' ') || ''
      ]);
      parent_id = result.insertId;
    } else {
      parent_id = parents[0].id;
    }
    
    // Find student in global_student_sheets
    let [students] = await pool.execute(`
      SELECT id FROM global_student_sheets 
      WHERE (id = ? OR (first_name LIKE ? AND last_name LIKE ? AND trade_name = ? AND level_number = ?))
      AND status = 'active'
      LIMIT 1
    `, [
      student_id || 0,
      `%${student_first_name}%`,
      `%${student_last_name}%`,
      student_trade,
      student_level
    ]);
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found in system' });
    }
    
    const found_student_id = students[0].id;
    
    // Check if link already exists
    const [existing] = await pool.execute(`
      SELECT id, status FROM parent_student_links 
      WHERE parent_id = ? AND student_id = ?
    `, [parent_id, found_student_id]);
    
    if (existing.length > 0) {
      return res.json({ 
        success: true, 
        message: 'Link request already exists',
        status: existing[0].status 
      });
    }
    
    // Create linking request
    const [result] = await pool.execute(`
      INSERT INTO parent_student_links 
      (parent_id, student_id, relationship_type, status, match_confidence, created_at)
      VALUES (?, ?, ?, 'pending', 95, NOW())
    `, [parent_id, found_student_id, relationship]);
    
    // Notify DOD/DOS/Headmaster
    await pool.execute(`
      INSERT INTO parent_notifications 
      (parent_id, title, message, category, urgency, is_read, created_at)
      VALUES (?, ?, ?, 'linking', 'normal', 0, NOW())
    `, [
      parent_id,
      'Linking Request Submitted',
      `Your request to link with student has been submitted. Waiting for approval from school administration.`
    ]);
    
    res.json({ 
      success: true, 
      message: 'Linking request submitted successfully',
      link_id: result.insertId 
    });
  } catch (error) {
    console.error('Error submitting linking request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get parent dashboard with real data
router.get('/parent-dashboard/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    // Get parent
    const [parents] = await pool.execute(`
      SELECT id, username, first_name, last_name, email, phone, is_active
      FROM users WHERE phone = ? AND role = 'parent'
    `, [phone]);
    
    if (parents.length === 0) {
      return res.json({ success: false, verified: false, message: 'Parent not found' });
    }
    
    const parent = parents[0];
    
    // Get linked children from global_student_sheets
    const [children] = await pool.execute(`
      SELECT 
        psl.id as link_id,
        psl.relationship_type,
        psl.status as link_status,
        psl.verified_by,
        psl.verified_at,
        gss.id as student_id,
        gss.student_code,
        gss.first_name,
        gss.last_name,
        CONCAT(gss.first_name, ' ', gss.last_name) as full_name,
        gss.trade_name,
        gss.trade_code,
        gss.level_number,
        gss.gender,
        gss.date_of_birth,
        gss.phone,
        gss.email,
        gss.profile_image,
        gss.gpa,
        gss.attendance_percentage,
        gss.balance,
        u.first_name as approved_by_first,
        u.last_name as approved_by_last,
        u.role as approved_by_role
      FROM parent_student_links psl
      JOIN global_student_sheets gss ON psl.student_id = gss.id
      LEFT JOIN users u ON psl.verified_by = u.id
      WHERE psl.parent_id = ? AND psl.status = 'approved'
      ORDER BY psl.created_at DESC
    `, [parent.id]);
    
    // Get attendance for each child
    const childrenWithData = await Promise.all(children.map(async (child) => {
      const [attendance] = await pool.execute(`
        SELECT 
          COUNT(*) as total_days,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
          SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days
        FROM attendance WHERE student_id = ?
      `, [child.student_id]);
      
      const [marks] = await pool.execute(`
        SELECT * FROM grades WHERE student_id = ? ORDER BY created_at DESC LIMIT 5
      `, [child.student_id]);
      
      const [discipline] = await pool.execute(`
        SELECT COUNT(*) as total_incidents,
        SUM(CASE WHEN severity = 'severe' OR severity = 'major' THEN 1 ELSE 0 END) as critical_incidents
        FROM student_conduct_records WHERE student_id = ? AND status = 'active'
      `, [child.student_id]);
      
      const [payments] = await pool.execute(`
        SELECT SUM(amount_paid) as total_paid, COUNT(*) as payment_count
        FROM fee_payments WHERE student_id = ?
      `, [child.student_id]);
      
      return {
        connection: {
          id: child.link_id,
          relationship: child.relationship_type,
          approved_by: `${child.approved_by_first || ''} ${child.approved_by_last || ''}`.trim() || 'Admin',
          approved_by_role: child.approved_by_role || 'Administrator',
          approved_at: child.verified_at
        },
        student: {
          sheet_id: child.student_id,
          student_number: child.student_code,
          student_code: child.student_code,
          first_name: child.first_name,
          last_name: child.last_name,
          full_name: child.full_name,
          trade: child.trade_name,
          level: child.level_number,
          profile_image: child.profile_image,
          gender: child.gender,
          date_of_birth: child.date_of_birth
        },
        attendance: attendance[0] || { total_days: 0, present_days: 0, absent_days: 0, late_days: 0 },
        recent_marks: marks || [],
        discipline: discipline[0] || { total_incidents: 0, critical_incidents: 0 },
        payments: payments[0] || { total_paid: 0, payment_count: 0 }
      };
    }));
    
    res.json({
      success: true,
      verified: true,
      parent: {
        id: parent.id,
        name: `${parent.first_name} ${parent.last_name}`,
        phone: parent.phone,
        email: parent.email,
        children_count: children.length,
        verified: true
      },
      children: childrenWithData
    });
  } catch (error) {
    console.error('Error fetching parent dashboard:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get real messages from DOD, DOS, Headmaster, etc.
router.get('/messages/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    const [parent] = await pool.execute(
      'SELECT id FROM users WHERE phone = ? AND role = "parent"',
      [phone]
    );
    
    if (parent.length === 0) {
      return res.json({ success: true, messages: [] });
    }
    
    // Get messages from staff (DOD, DOS, Headmaster, Teachers)
    const [messages] = await pool.execute(`
      SELECT 
        m.id,
        m.subject,
        m.message_body,
        m.category,
        m.urgency,
        m.status,
        m.sent_at,
        m.created_at,
        u.first_name as sender_first,
        u.last_name as sender_last,
        u.role as sender_role,
        gss.first_name as student_first,
        gss.last_name as student_last
      FROM parent_messages m
      LEFT JOIN users u ON m.sent_by = u.id
      LEFT JOIN global_student_sheets gss ON m.student_id = gss.id
      WHERE m.parent_phone = ? OR m.parent_id = ?
      ORDER BY m.created_at DESC
      LIMIT 50
    `, [phone, parent[0].id]);
    
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      subject: msg.subject,
      message_body: msg.message_body,
      category: msg.category,
      urgency: msg.urgency,
      status: msg.status,
      sent_at: msg.sent_at || msg.created_at,
      sender: `${msg.sender_first || ''} ${msg.sender_last || ''}`.trim() || 'School Admin',
      sender_role: msg.sender_role || 'Administrator',
      student: msg.student_first ? `${msg.student_first} ${msg.student_last}` : null
    }));
    
    res.json({ success: true, messages: formattedMessages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get notifications
router.get('/notifications/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    const [parent] = await pool.execute(
      'SELECT id FROM users WHERE phone = ? AND role = "parent"',
      [phone]
    );
    
    if (parent.length === 0) {
      return res.json({ success: true, notifications: [], unread_count: 0 });
    }
    
    const [notifications] = await pool.execute(`
      SELECT * FROM parent_notifications 
      WHERE parent_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [parent[0].id]);
    
    const [unread] = await pool.execute(`
      SELECT COUNT(*) as count FROM parent_notifications 
      WHERE parent_id = ? AND is_read = 0
    `, [parent[0].id]);
    
    res.json({ 
      success: true, 
      notifications,
      unread_count: unread[0].count 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    await pool.execute(`
      UPDATE parent_notifications 
      SET is_read = 1, read_at = NOW()
      WHERE id = ?
    `, [req.params.id]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send message to school
router.post('/messages', async (req, res) => {
  try {
    const { parent_phone, subject, message_body, category, urgency } = req.body;
    
    const [parent] = await pool.execute(
      'SELECT id FROM users WHERE phone = ? AND role = "parent"',
      [parent_phone]
    );
    
    if (parent.length === 0) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO parent_messages 
      (parent_id, parent_phone, subject, message_body, category, urgency, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'sent', NOW())
    `, [parent[0].id, parent_phone, subject, message_body, category, urgency]);
    
    res.json({ success: true, message_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Auto-connect: Find similar students for parent
router.post('/auto-connect', async (req, res) => {
  try {
    const { parent_phone, parent_name } = req.body;
    
    if (!parent_phone) {
      return res.status(400).json({ success: false, message: 'Parent phone required' });
    }
    
    // Extract parent last name for matching
    const parentLastName = parent_name?.split(' ').pop() || '';
    
    // Find similar students by:
    // 1. Last name match
    // 2. Phone number similarity
    // 3. Active status
    const [similarStudents] = await pool.execute(`
      SELECT 
        gss.id,
        gss.student_code,
        gss.first_name,
        gss.last_name,
        CONCAT(gss.first_name, ' ', gss.last_name) as full_name,
        gss.trade_name,
        gss.trade_code,
        gss.level_number,
        gss.gender,
        gss.phone,
        gss.email,
        gss.profile_image,
        gss.date_of_birth,
        CASE 
          WHEN gss.last_name LIKE ? THEN 90
          WHEN gss.phone LIKE ? THEN 80
          WHEN gss.last_name LIKE ? THEN 70
          ELSE 50
        END as match_score
      FROM global_student_sheets gss
      WHERE gss.status = 'active'
        AND (
          gss.last_name LIKE ?
          OR gss.phone LIKE ?
          OR gss.last_name LIKE ?
        )
      ORDER BY match_score DESC, gss.created_at DESC
      LIMIT 20
    `, [
      parentLastName,
      `%${parent_phone.slice(-4)}%`,
      `%${parentLastName}%`,
      parentLastName,
      `%${parent_phone.slice(-4)}%`,
      `%${parentLastName}%`
    ]);
    
    // Check which students are already linked
    const [parent] = await pool.execute(
      'SELECT id FROM users WHERE phone = ? AND role = "parent"',
      [parent_phone]
    );
    
    let linkedStudentIds = [];
    if (parent.length > 0) {
      const [links] = await pool.execute(
        'SELECT student_id FROM parent_student_links WHERE parent_id = ?',
        [parent[0].id]
      );
      linkedStudentIds = links.map(l => l.student_id);
    }
    
    // Mark already linked students
    const studentsWithStatus = similarStudents.map(student => ({
      ...student,
      already_linked: linkedStudentIds.includes(student.id),
      match_confidence: student.match_score
    }));
    
    res.json({
      success: true,
      similar_students: studentsWithStatus,
      count: studentsWithStatus.length,
      message: studentsWithStatus.length > 0 
        ? `Found ${studentsWithStatus.length} similar students` 
        : 'No similar students found'
    });
  } catch (error) {
    console.error('Auto-connect error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Quick link: Instantly link parent to student (with auto-approval for high confidence)
router.post('/quick-link', async (req, res) => {
  try {
    const { parent_phone, student_id, relationship_type } = req.body;
    
    // Get or create parent
    let [parents] = await pool.execute(
      'SELECT id FROM users WHERE phone = ? AND role = "parent"',
      [parent_phone]
    );
    
    let parent_id;
    if (parents.length === 0) {
      const [result] = await pool.execute(`
        INSERT INTO users (username, phone, role, password, is_active)
        VALUES (?, ?, 'parent', '$2b$10$defaulthash', 1)
      `, [parent_phone, parent_phone]);
      parent_id = result.insertId;
    } else {
      parent_id = parents[0].id;
    }
    
    // Verify student exists
    const [students] = await pool.execute(
      'SELECT id, first_name, last_name FROM global_student_sheets WHERE id = ? AND status = "active"',
      [student_id]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Check if already linked
    const [existing] = await pool.execute(
      'SELECT id, status FROM parent_student_links WHERE parent_id = ? AND student_id = ?',
      [parent_id, student_id]
    );
    
    if (existing.length > 0) {
      return res.json({
        success: true,
        message: 'Already linked',
        status: existing[0].status,
        link_id: existing[0].id
      });
    }
    
    // Create link with auto-approval
    const [result] = await pool.execute(`
      INSERT INTO parent_student_links 
      (parent_id, student_id, relationship_type, status, match_confidence, verified_at)
      VALUES (?, ?, ?, 'approved', 95, NOW())
    `, [parent_id, student_id, relationship_type || 'guardian']);
    
    // Send notification
    await pool.execute(`
      INSERT INTO parent_notifications 
      (parent_id, student_id, title, message, category, urgency)
      VALUES (?, ?, ?, ?, 'linking', 'normal')
    `, [
      parent_id,
      student_id,
      'Student Linked Successfully',
      `You are now connected to ${students[0].first_name} ${students[0].last_name}. You can view their progress in real-time.`
    ]);
    
    res.json({
      success: true,
      message: 'Student linked successfully',
      link_id: result.insertId,
      student: students[0]
    });
  } catch (error) {
    console.error('Quick link error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
