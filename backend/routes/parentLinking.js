const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all students with parent linking info
router.get('/students', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        s.student_id, s.student_code, s.first_name, s.last_name, s.email, s.phone,
        s.trade_code, s.level_number, s.gender, s.date_of_birth, s.admission_date,
        GROUP_CONCAT(DISTINCT CONCAT(p.parent_id, ':', p.first_name, ' ', p.last_name, ':', p.phone, ':', p.relationship) SEPARATOR '||') as parents
      FROM students s
      LEFT JOIN student_parents sp ON s.student_id = sp.student_id
      LEFT JOIN parents p ON sp.parent_id = p.parent_id
      GROUP BY s.student_id
      ORDER BY s.first_name, s.last_name
    `;
    const [students] = await db.query(query);
    
    const formatted = students.map(s => ({
      ...s,
      parents: s.parents ? s.parents.split('||').map(p => {
        const [id, name, phone, rel] = p.split(':');
        return { parent_id: id, name, phone, relationship: rel };
      }) : []
    }));
    
    res.json({ success: true, students: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Link parent to student (auto-create parent if needed) - WITH AUTO SMS
router.post('/link', authenticateToken, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    const { student_id, parent_name, parent_phone, parent_email, relationship, national_id } = req.body;
    const dodId = req.user.userId || req.user.id;
    
    // Get student details
    const [students] = await conn.query('SELECT * FROM global_student_sheets WHERE id = ?', [student_id]);
    if (students.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const student = students[0];
    
    // Check if parent exists by phone
    let [parents] = await conn.query('SELECT * FROM parents WHERE phone = ?', [parent_phone]);
    let parent_id;
    let isNewParent = false;
    
    if (parents.length > 0) {
      parent_id = parents[0].parent_id;
    } else {
      // Create new parent with login credentials
      const [firstName, ...lastNameParts] = parent_name.trim().split(' ');
      const lastName = lastNameParts.join(' ') || firstName;
      const bcrypt = require('bcryptjs');
      const tempPassword = `parent${Math.random().toString(36).slice(-6)}`;
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      const [result] = await conn.query(
        `INSERT INTO parents (first_name, last_name, phone, email, national_id, password, role, status, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, 'parent', 'active', NOW())`,
        [firstName, lastName, parent_phone, parent_email || null, national_id || null, hashedPassword]
      );
      parent_id = result.insertId;
      isNewParent = true;
      
      // Store temp password
      await conn.query('INSERT INTO parent_credentials (parent_id, temp_password, created_at) VALUES (?, ?, NOW())', [parent_id, tempPassword]);
    }
    
    // Link parent to student with full permissions
    await conn.query(
      `INSERT INTO parent_child_links (parent_id, student_id, relationship_type, linked_by, linked_at, status, permissions)
       VALUES (?, ?, ?, ?, NOW(), 'active', 'full')
       ON DUPLICATE KEY UPDATE status = 'active', linked_by = ?, permissions = 'full'`,
      [parent_id, student_id, relationship, dodId, dodId]
    );
    
    // Get DOD name
    const [dodUsers] = await conn.query('SELECT first_name, last_name FROM users WHERE user_id = ?', [dodId]);
    const dodName = dodUsers.length > 0 ? `${dodUsers[0].first_name} ${dodUsers[0].last_name}` : 'DOD';
    
    await conn.commit();
    
    // Send automatic SMS
    const smsMessage = isNewParent
      ? `Muraho! Mwahawe konti ya Parent Portal - Garden TVET\n\nUmwana: ${student.first_name} ${student.last_name}\nCode: ${student.student_code}\nTrade: ${student.trade_name} L${student.level_number}\n\nLOGIN: ${parent_phone}\nPassword: [Check SMS]\n\nMurakoze!\nBy: ${dodName}`
      : `Muraho! Mwahujwe n'umwana wanyu - Garden TVET\n\nUmwana: ${student.first_name} ${student.last_name}\nConduct: ${student.conduct_score}/40\nAttendance: ${student.attendance_percentage}%\nBalance: ${student.balance} RWF\n\nInjira kuri portal!\nBy: ${dodName}`;
    
    try {
      const smsService = require('../services/smsService');
      await smsService.sendSMS({ to: parent_phone, message: smsMessage, type: 'parent_link', priority: 'high' });
    } catch (smsError) {
      console.error('SMS error:', smsError);
    }
    
    res.json({ success: true, parent_id, message: 'Parent linked successfully and SMS sent', is_new_parent: isNewParent, sms_sent: true });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ success: false, error: error.message });
  } finally {
    conn.release();
  }
});

// Unlink parent from student
router.delete('/unlink/:student_id/:parent_id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM student_parents WHERE student_id = ? AND parent_id = ?', 
      [req.params.student_id, req.params.parent_id]);
    res.json({ success: true, message: 'Parent unlinked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all parents
router.get('/parents', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        p.parent_id, p.first_name, p.last_name, p.phone, p.email, p.national_id,
        COUNT(DISTINCT sp.student_id) as children_count,
        GROUP_CONCAT(DISTINCT CONCAT(s.first_name, ' ', s.last_name) SEPARATOR ', ') as children_names
      FROM parents p
      LEFT JOIN student_parents sp ON p.parent_id = sp.parent_id
      LEFT JOIN students s ON sp.student_id = s.student_id
      GROUP BY p.parent_id
      ORDER BY p.first_name, p.last_name
    `;
    const [parents] = await db.query(query);
    res.json({ success: true, parents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit parent application
router.post('/apply', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    const {
      // Parent info
      parent_first_name, parent_last_name, parent_phone, parent_email, parent_national_id,
      parent_address, parent_occupation, parent_income,
      // Student info
      student_first_name, student_last_name, student_dob, student_gender,
      student_previous_school, student_previous_grade,
      // Application details
      desired_trade, desired_level, application_reason, emergency_contact,
      has_disabilities, disability_details, medical_conditions
    } = req.body;
    
    // Create parent
    const [parentResult] = await conn.query(
      `INSERT INTO parents (first_name, last_name, phone, email, national_id, address, occupation, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [parent_first_name, parent_last_name, parent_phone, parent_email, parent_national_id, parent_address, parent_occupation]
    );
    const parent_id = parentResult.insertId;
    
    // Create application
    const app_number = `APP${Date.now()}`;
    const [appResult] = await conn.query(
      `INSERT INTO parent_applications (
        application_number, parent_id, student_first_name, student_last_name, student_dob, student_gender,
        previous_school, previous_grade, desired_trade, desired_level, application_reason,
        emergency_contact, has_disabilities, disability_details, medical_conditions,
        parent_income, status, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        app_number, parent_id, student_first_name, student_last_name, student_dob, student_gender,
        student_previous_school, student_previous_grade, desired_trade, desired_level, application_reason,
        emergency_contact, has_disabilities || 0, disability_details, medical_conditions,
        parent_income
      ]
    );
    
    await conn.commit();
    res.json({ 
      success: true, 
      application_id: appResult.insertId,
      application_number: app_number,
      message: 'Application submitted successfully' 
    });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ success: false, error: error.message });
  } finally {
    conn.release();
  }
});

// Get all applications
router.get('/applications', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        pa.*, 
        CONCAT(p.first_name, ' ', p.last_name) as parent_name,
        p.phone as parent_phone, p.email as parent_email
      FROM parent_applications pa
      JOIN parents p ON pa.parent_id = p.parent_id
      ORDER BY pa.submitted_at DESC
    `;
    const [applications] = await db.query(query);
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update application status
router.put('/applications/:id/status', authenticateToken, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    const { status, review_notes, reviewed_by } = req.body;
    
    await conn.query(
      `UPDATE parent_applications 
       SET status = ?, review_notes = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE application_id = ?`,
      [status, review_notes, reviewed_by, req.params.id]
    );
    
    // If approved, create student record
    if (status === 'approved') {
      const [app] = await conn.query('SELECT * FROM parent_applications WHERE application_id = ?', [req.params.id]);
      if (app.length > 0) {
        const student_code = `STD${Date.now()}`;
        const [studentResult] = await conn.query(
          `INSERT INTO students (
            student_code, first_name, last_name, date_of_birth, gender,
            trade_code, level_number, email, phone, admission_date, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'active')`,
          [
            student_code, app[0].student_first_name, app[0].student_last_name,
            app[0].student_dob, app[0].student_gender, app[0].desired_trade,
            app[0].desired_level, null, null
          ]
        );
        
        // Link parent to student
        await conn.query(
          `INSERT INTO student_parents (student_id, parent_id, relationship, is_primary)
           VALUES (?, ?, 'parent', 1)`,
          [studentResult.insertId, app[0].parent_id]
        );
      }
    }
    
    await conn.commit();
    res.json({ success: true, message: 'Application status updated' });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ success: false, error: error.message });
  } finally {
    conn.release();
  }
});

// Get statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM parents) as total_parents,
        (SELECT COUNT(*) FROM student_parents) as total_links,
        (SELECT COUNT(*) FROM parent_applications WHERE status = 'pending') as pending_applications,
        (SELECT COUNT(*) FROM parent_applications WHERE status = 'approved') as approved_applications,
        (SELECT COUNT(*) FROM parent_applications WHERE status = 'rejected') as rejected_applications
    `);
    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
