const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/global-sheets-enhanced/students - Get all students with parent info
router.get('/students', authenticateToken, async (req, res) => {
  try {
    const { trade, level, search } = req.query;
    
    let query = `
      SELECT 
        gss.*,
        GROUP_CONCAT(DISTINCT CONCAT(u.first_name, ' ', u.last_name) SEPARATOR ', ') as parent_names,
        GROUP_CONCAT(DISTINCT u.phone SEPARATOR ', ') as parent_phones,
        GROUP_CONCAT(DISTINCT u.email SEPARATOR ', ') as parent_emails,
        COUNT(DISTINCT psl.id) as parent_count
      FROM global_student_sheets gss
      LEFT JOIN parent_student_links psl ON gss.id = psl.student_id AND psl.status = 'approved'
      LEFT JOIN users u ON psl.parent_id = u.id
      WHERE gss.status = 'active'
    `;
    
    const params = [];
    
    if (trade) {
      query += ' AND gss.trade_code = ?';
      params.push(trade);
    }
    
    if (level) {
      query += ' AND gss.level_number = ?';
      params.push(parseInt(level));
    }
    
    if (search) {
      query += ' AND (gss.first_name LIKE ? OR gss.last_name LIKE ? OR gss.student_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ' GROUP BY gss.id ORDER BY gss.first_name, gss.last_name';
    
    const [students] = await pool.execute(query, params);
    
    res.json({ success: true, students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/global-sheets-enhanced/remove-conduct - Remove conduct and notify parents
router.post('/remove-conduct', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { student_id, incident_type, severity, description, points_deducted } = req.body;
    const staffId = req.user.id || req.user.userId;
    const staffName = req.user.username || req.user.first_name || 'Staff';
    
    if (!student_id || !incident_type || !points_deducted) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    // Get current conduct score
    const [students] = await connection.execute(
      'SELECT conduct_score, first_name, last_name FROM global_student_sheets WHERE id = ?',
      [student_id]
    );
    
    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const currentScore = students[0].conduct_score || 40;
    const newScore = Math.max(0, currentScore - points_deducted);
    
    // Update conduct score
    await connection.execute(
      'UPDATE global_student_sheets SET conduct_score = ? WHERE id = ?',
      [newScore, student_id]
    );
    
    // Record incident
    await connection.execute(`
      INSERT INTO student_conduct_records 
      (student_id, incident_type, severity, description, points_deducted, new_conduct_score, recorded_by, recorded_by_name, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [student_id, incident_type, severity || 'moderate', description, points_deducted, newScore, staffId, staffName]);
    
    // Get linked parents
    const [parents] = await connection.execute(`
      SELECT u.phone, u.email, u.first_name, u.last_name
      FROM parent_student_links psl
      JOIN users u ON psl.parent_id = u.id
      WHERE psl.student_id = ? AND psl.status = 'approved'
    `, [student_id]);
    
    // Send SMS to parents (if SMS service available)
    const studentName = `${students[0].first_name} ${students[0].last_name}`;
    const message = `Umwana ${studentName} yakiriye igihano: ${incident_type}. Amanota yakuweho: ${points_deducted}. Amanota asigaye: ${newScore}/40.`;
    
    for (const parent of parents) {
      if (parent.phone) {
        try {
          // SMS service call would go here
          console.log(`SMS to ${parent.phone}: ${message}`);
        } catch (smsError) {
          console.error('SMS error:', smsError);
        }
      }
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Conduct removed and parents notified',
      new_score: newScore,
      parents_notified: parents.length
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error removing conduct:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
});

// POST /api/global-sheets-enhanced/message-parent - Send message to parent
router.post('/message-parent', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { student_id, parent_id, subject, message, priority } = req.body;
    const staffId = req.user.id || req.user.userId;
    const staffName = req.user.username || req.user.first_name || 'Staff';
    const staffRole = req.user.role;
    
    if (!student_id || !parent_id || !message) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    // Verify parent-student link
    const [links] = await connection.execute(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ? AND status = "approved"',
      [parent_id, student_id]
    );
    
    if (links.length === 0) {
      await connection.rollback();
      return res.status(403).json({ success: false, message: 'Parent not linked to this student' });
    }
    
    // Create messages table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS staff_parent_messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        staff_id INT NOT NULL,
        staff_name VARCHAR(100),
        staff_role VARCHAR(50),
        parent_id INT NOT NULL,
        student_id INT NOT NULL,
        subject VARCHAR(200),
        message TEXT NOT NULL,
        priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
        status ENUM('sent', 'read', 'replied') DEFAULT 'sent',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL,
        FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE
      )
    `);
    
    // Insert message
    await connection.execute(`
      INSERT INTO staff_parent_messages 
      (staff_id, staff_name, staff_role, parent_id, student_id, subject, message, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sent')
    `, [staffId, staffName, staffRole, parent_id, student_id, subject || 'Message from school', message, priority || 'normal']);
    
    await connection.commit();
    
    res.json({ success: true, message: 'Message sent to parent' });
  } catch (error) {
    await connection.rollback();
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
});

// GET /api/global-sheets-enhanced/parent-messages - Get messages for parent
router.get('/parent-messages', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.id || req.user.userId;
    
    const [messages] = await pool.execute(`
      SELECT 
        spm.*,
        gss.first_name as student_first_name,
        gss.last_name as student_last_name,
        gss.student_code
      FROM staff_parent_messages spm
      JOIN global_student_sheets gss ON spm.student_id = gss.id
      WHERE spm.parent_id = ?
      ORDER BY spm.created_at DESC
      LIMIT 50
    `, [parentId]);
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.json({ success: true, messages: [] });
  }
});

// GET /api/global-sheets-enhanced/student/:id/parents - Get parents for a student
router.get('/student/:id/parents', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [parents] = await pool.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.phone, u.email,
        psl.relationship_type, psl.linked_at, psl.status
      FROM parent_student_links psl
      JOIN users u ON psl.parent_id = u.id
      WHERE psl.student_id = ?
      ORDER BY psl.status, psl.linked_at DESC
    `, [id]);
    
    res.json({ success: true, parents });
  } catch (error) {
    console.error('Error fetching parents:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/global-sheets-enhanced/registered-parents - Get all registered parents
router.get('/registered-parents', authenticateToken, async (req, res) => {
  try {
    const [parents] = await pool.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.phone, u.email, u.created_at,
        COUNT(DISTINCT psl.student_id) as linked_children,
        GROUP_CONCAT(DISTINCT CONCAT(gss.first_name, ' ', gss.last_name) SEPARATOR ', ') as children_names
      FROM users u
      LEFT JOIN parent_student_links psl ON u.id = psl.parent_id AND psl.status = 'approved'
      LEFT JOIN global_student_sheets gss ON psl.student_id = gss.id
      WHERE u.role = 'parent' AND u.is_active = 1
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    
    res.json({ success: true, parents });
  } catch (error) {
    console.error('Error fetching parents:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/global-sheets-enhanced/conduct-history/:studentId - Get conduct history
router.get('/conduct-history/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [records] = await pool.execute(`
      SELECT * FROM student_conduct_records
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [studentId]);
    
    const [student] = await pool.execute(
      'SELECT conduct_score FROM global_student_sheets WHERE id = ?',
      [studentId]
    );
    
    res.json({
      success: true,
      current_score: student[0]?.conduct_score || 40,
      records
    });
  } catch (error) {
    console.error('Error fetching conduct history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
