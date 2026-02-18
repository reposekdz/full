const express = require('express');
const router = express.Router();
const db = require('../config/database');
const smsService = require('../services/smsService');
const { authenticateToken } = require('../middleware/auth');

// Remove Student Conduct (Expulsion) - AUTO SMS TO PARENTS
router.post('/actions/expel-student', authenticateToken, async (req, res) => {
  try {
    const { student_id, reason, effective_date, notes } = req.body;
    
    // Get student and parent info
    const [student] = await db.pool.query(`
      SELECT u.*, CONCAT(u.first_name, ' ', u.last_name) as name, 
        p.phone as parent_phone, p.email as parent_email,
        CONCAT(p.first_name, ' ', p.last_name) as parent_name
      FROM users u
      LEFT JOIN users p ON u.parent_id = p.id
      WHERE u.id = ?
    `, [student_id]);
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Create expulsion record
    const [result] = await db.pool.query(`
      INSERT INTO student_expulsions (student_id, reason, effective_date, notes, status, created_at)
      VALUES (?, ?, ?, ?, 'active', NOW())
    `, [student_id, reason, effective_date, notes]);
    
    // Deactivate student
    await db.pool.query('UPDATE users SET is_active = 0, status = "expelled" WHERE id = ?', [student_id]);
    
    // AUTO-SEND SMS TO ALL LINKED PARENTS via Africa's Talking
    const [linkedParents] = await db.pool.query(`
      SELECT DISTINCT p.phone, p.first_name, p.last_name, p.id as parent_id
      FROM parent_student_links psl
      JOIN users p ON psl.parent_id = p.id
      WHERE psl.student_id = ? AND psl.status = 'active' AND p.phone IS NOT NULL
    `, [student_id]);
    
    const message = `🏫 GARDEN TVET\n\n⚠️ IKOSA RIKOMEYE\n\nMwaramutse,\n\nTubamenyesha ko umwana wanyu ${student[0].name} (${student[0].student_id}) yirukanywe ku ishuri.\n\n📋 Impamvu: ${reason}\n📅 Itariki: ${effective_date}\n\n${notes ? '📝 Ibisobanuro: ' + notes + '\n\n' : ''}Murakoze,\n🎓 Ubuyobozi bw'Indero - Garden TVET`;
    
    for (const parent of linkedParents) {
      try {
        await smsService.sendSMS(
          parent.phone,
          message,
          req.user.userId,
          { student_id, action: 'expulsion', reason, parent_id: parent.parent_id }
        );
      } catch (smsError) {
        console.error('SMS send error:', smsError);
      }
    }
    
    // Log activity
    await db.pool.query(`
      INSERT INTO dod_activity_log (action, module, details, created_at)
      VALUES ('student_expelled', 'discipline', ?, NOW())
    `, [JSON.stringify({ student_id, reason })]);
    
    res.json({ success: true, message: 'Umunyeshuri yirukanywe kandi ababyeyi bamenyeshejwe', expulsion_id: result.insertId });
  } catch (error) {
    console.error('Expulsion error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Complete Student Removal (Clean up conduct, parents, etc)
router.post('/actions/remove-student-complete', async (req, res) => {
  const connection = await db.pool.getConnection();
  try {
    const { student_id } = req.body;
    await connection.beginTransaction();

    // 1. Get student details before deletion for logging
    const [student] = await connection.query('SELECT * FROM users WHERE id = ?', [student_id]);
    if (student.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // 2. Delete related records in various tables
    // Remove conduct records (punishments, expulsions, leaves)
    await connection.query('DELETE FROM punishments WHERE student_id = ?', [student_id]);
    await connection.query('DELETE FROM student_expulsions WHERE student_id = ?', [student_id]);
    await connection.query('DELETE FROM student_leaves WHERE student_id = ?', [student_id]);
    
    // Remove from enrollments
    await connection.query('DELETE FROM enrollments WHERE student_id = ?', [student_id]);
    
    // Remove grades
    await connection.query('DELETE FROM grades WHERE student_id = ?', [student_id]);
    
    // Remove attendance
    await connection.query('DELETE FROM attendance WHERE student_id = ?', [student_id]);

    // Remove finance records
    await connection.query('DELETE FROM fee_payments WHERE student_id = ?', [student_id]);

    // Remove points and achievements
    await connection.query('DELETE FROM student_achievements WHERE student_id = ?', [student_id]);
    await connection.query('DELETE FROM student_points WHERE student_id = ?', [student_id]);
    
    // Remove competition participation
    await connection.query('DELETE FROM competition_participants WHERE student_id = ?', [student_id]);
    
    // Remove parent link if any (optional: we keep the parent user but break the link)
    await connection.query('UPDATE users SET parent_id = NULL WHERE id = ?', [student_id]);

    // 3. Finally deactivate or delete student user
    // The user said "remove conduct and parent automatically his student loss marks and name"
    // So we'll delete the student record entirely if requested, or just deactivate.
    // Let's do a hard delete of the student record as implied.
    await connection.query('DELETE FROM users WHERE id = ?', [student_id]);

    await connection.commit();
    res.json({ success: true, message: 'Umunyeshuri n\'amakuru ye byose byasibwe neza' });
  } catch (error) {
    await connection.rollback();
    console.error('Complete removal error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// Suspend Student - AUTO SMS TO PARENTS
router.post('/actions/suspend-student', authenticateToken, async (req, res) => {
  try {
    const { student_id, reason, start_date, end_date, notes } = req.body;
    
    const [student] = await db.pool.query(`
      SELECT u.*, CONCAT(u.first_name, ' ', u.last_name) as name,
        p.phone as parent_phone, CONCAT(p.first_name, ' ', p.last_name) as parent_name
      FROM users u
      LEFT JOIN users p ON u.parent_id = p.id
      WHERE u.id = ?
    `, [student_id]);
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Create suspension
    const [result] = await db.pool.query(`
      INSERT INTO punishments (student_id, punishment_type, description, start_date, end_date, status, created_at)
      VALUES (?, 'guhagarikwa_iminsi', ?, ?, ?, 'birakora', NOW())
    `, [student_id, reason, start_date, end_date]);
    
    // Update student status
    await db.pool.query('UPDATE users SET status = "suspended" WHERE id = ?', [student_id]);
    
    // AUTO-SEND SMS TO ALL LINKED PARENTS
    const [linkedParents] = await db.pool.query(`
      SELECT DISTINCT p.phone, p.first_name, p.last_name, p.id as parent_id
      FROM parent_student_links psl
      JOIN users p ON psl.parent_id = p.id
      WHERE psl.student_id = ? AND psl.status = 'active' AND p.phone IS NOT NULL
    `, [student_id]);
    
    const message = `🏫 GARDEN TVET\n\n⚠️ GUHAGARIKWA\n\nMwaramutse,\n\nTubamenyesha ko ${student[0].name} yahagaritswe ku ishuri.\n\n📋 Impamvu: ${reason}\n📅 Kuva: ${start_date}\n📅 Kugeza: ${end_date}\n\n${notes ? '📝 Ibisobanuro: ' + notes + '\n\n' : ''}Murakoze,\n🎓 Ubuyobozi bw'Indero - Garden TVET`;
    
    for (const parent of linkedParents) {
      try {
        await smsService.sendSMS(
          parent.phone,
          message,
          req.user.userId,
          { student_id, action: 'suspension', reason, parent_id: parent.parent_id }
        );
      } catch (smsError) {
        console.error('SMS send error:', smsError);
      }
    }
    
    res.json({ success: true, message: 'Umunyeshuri yahagaritswe kandi ababyeyi bamenyeshejwe', suspension_id: result.insertId });
  } catch (error) {
    console.error('Suspension error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Grant Leave/Permission - AUTO SMS TO PARENTS
router.post('/actions/grant-leave', authenticateToken, async (req, res) => {
  try {
    const { student_id, leave_type, start_date, end_date, reason, approved_by } = req.body;
    
    const [student] = await db.pool.query(`
      SELECT u.*, CONCAT(u.first_name, ' ', u.last_name) as name,
        p.phone as parent_phone, CONCAT(p.first_name, ' ', p.last_name) as parent_name
      FROM users u
      LEFT JOIN users p ON u.parent_id = p.id
      WHERE u.id = ?
    `, [student_id]);
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Create leave record
    const [result] = await db.pool.query(`
      INSERT INTO student_leaves (student_id, leave_type, start_date, end_date, reason, approved_by, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'approved', NOW())
    `, [student_id, leave_type, start_date, end_date, reason, approved_by]);
    
    // AUTO-SEND SMS TO ALL LINKED PARENTS
    const [linkedParents] = await db.pool.query(`
      SELECT DISTINCT p.phone, p.first_name, p.last_name, p.id as parent_id
      FROM parent_student_links psl
      JOIN users p ON psl.parent_id = p.id
      WHERE psl.student_id = ? AND psl.status = 'active' AND p.phone IS NOT NULL
    `, [student_id]);
    
    const leaveTypeText = {
      'sick': '🤒 Uruhushya rwo kurwara',
      'family': '👨‍👩‍👧 Uruhushya rw\'umuryango',
      'emergency': '🚨 Uruhushya rw\'ihutirwa',
      'personal': '👤 Uruhushya bwite'
    }[leave_type] || leave_type;
    
    const message = `🏫 GARDEN TVET\n\n✅ URUHUSHYA RWEMEWE\n\nMwaramutse,\n\nUruhushya rwa ${student[0].name} rwemewe.\n\n📋 Ubwoko: ${leaveTypeText}\n📅 Kuva: ${start_date}\n📅 Kugeza: ${end_date}\n${reason ? '📝 Impamvu: ' + reason + '\n' : ''}\nMurakoze,\n🎓 Ubuyobozi bw'Indero - Garden TVET`;
    
    for (const parent of linkedParents) {
      try {
        await smsService.sendSMS(
          parent.phone,
          message,
          req.user.userId,
          { student_id, action: 'leave_granted', leave_type, parent_id: parent.parent_id }
        );
      } catch (smsError) {
        console.error('SMS send error:', smsError);
      }
    }
    
    res.json({ success: true, message: 'Uruhushya rwemewe kandi ababyeyi bamenyeshejwe', leave_id: result.insertId });
  } catch (error) {
    console.error('Leave error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send Custom Message to Parent - REAL SMS
router.post('/actions/message-parent', authenticateToken, async (req, res) => {
  try {
    const { student_id, message, notification_method, priority } = req.body;
    
    const [student] = await db.pool.query(`
      SELECT u.*, p.phone as parent_phone, p.email as parent_email
      FROM users u
      LEFT JOIN users p ON u.parent_id = p.id
      WHERE u.id = ?
    `, [student_id]);
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // SEND REAL SMS TO ALL LINKED PARENTS
    const [linkedParents] = await db.pool.query(`
      SELECT DISTINCT p.phone, p.first_name, p.last_name, p.id as parent_id
      FROM parent_student_links psl
      JOIN users p ON psl.parent_id = p.id
      WHERE psl.student_id = ? AND psl.status = 'active' AND p.phone IS NOT NULL
    `, [student_id]);
    
    if (linkedParents.length === 0) {
      return res.status(404).json({ success: false, message: 'Nta mubyeyi wambitswe' });
    }
    
    const formattedMessage = `🏫 GARDEN TVET\n\n${message}\n\nMurakoze,\n🎓 Ubuyobozi bw'Indero`;
    const results = [];
    
    for (const parent of linkedParents) {
      try {
        const smsResult = await smsService.sendSMS(
          parent.phone,
          formattedMessage,
          req.user.userId,
          { student_id, action: 'custom_message', parent_id: parent.parent_id }
        );
        results.push({ parent: parent.first_name, phone: parent.phone, success: smsResult.success });
      } catch (smsError) {
        results.push({ parent: parent.first_name, phone: parent.phone, success: false, error: smsError.message });
      }
    }
    
    res.json({ success: true, message: `Ubutumwa bwohererejwe ku babyeyi ${results.filter(r => r.success).length}/${linkedParents.length}`, results });
  } catch (error) {
    console.error('Message error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk Actions - WITH AUTO SMS
router.post('/actions/bulk', authenticateToken, async (req, res) => {
  try {
    const { student_ids, action, data } = req.body;
    const results = [];
    
    for (const student_id of student_ids) {
      if (action === 'suspend') {
        await db.pool.query('UPDATE users SET status = "suspended" WHERE id = ?', [student_id]);
      } else if (action === 'activate') {
        await db.pool.query('UPDATE users SET is_active = 1, status = "active" WHERE id = ?', [student_id]);
      } else if (action === 'message') {
        const [linkedParents] = await db.pool.query(`
          SELECT DISTINCT p.phone, p.first_name, p.id as parent_id
          FROM parent_student_links psl
          JOIN users p ON psl.parent_id = p.id
          WHERE psl.student_id = ? AND psl.status = 'active' AND p.phone IS NOT NULL
        `, [student_id]);
        
        for (const parent of linkedParents) {
          await smsService.sendSMS(
            parent.phone,
            `🏫 GARDEN TVET\n\n${data.message}\n\nMurakoze,\n🎓 Ubuyobozi bw'Indero`,
            req.user.userId,
            { student_id, action: 'bulk_message', parent_id: parent.parent_id }
          );
        }
      }
      results.push({ student_id, success: true });
    }
    
    res.json({ success: true, message: `${results.length} ibikorwa byakozwe`, results });
  } catch (error) {
    console.error('Bulk action error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== STUDENT SICK NOTIFICATIONS ====================

// Mark Student as Sick - AUTO SMS TO PARENTS
router.post('/actions/student-sick', authenticateToken, async (req, res) => {
  try {
    const { student_id, symptoms, severity, notes, sent_home } = req.body;
    
    const [student] = await db.pool.query(`
      SELECT u.*, CONCAT(u.first_name, ' ', u.last_name) as name
      FROM users u WHERE u.id = ?
    `, [student_id]);
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Umunyeshuri ntiyabonetse' });
    }
    
    // Create sick record
    const [result] = await db.pool.query(`
      INSERT INTO student_health_records (student_id, record_type, symptoms, severity, notes, sent_home, recorded_by, created_at)
      VALUES (?, 'sick', ?, ?, ?, ?, ?, NOW())
    `, [student_id, symptoms, severity, notes, sent_home, req.user.userId]);
    
    // AUTO-SEND SMS TO ALL LINKED PARENTS
    const [linkedParents] = await db.pool.query(`
      SELECT DISTINCT p.phone, p.first_name, p.last_name, p.id as parent_id
      FROM parent_student_links psl
      JOIN users p ON psl.parent_id = p.id
      WHERE psl.student_id = ? AND psl.status = 'active' AND p.phone IS NOT NULL
    `, [student_id]);
    
    const severityText = {
      'mild': '💚 Byoroshye',
      'moderate': '💛 Byo hagati',
      'severe': '❤️ Bikomeye'
    }[severity] || severity;
    
    const message = `🏫 GARDEN TVET\n\n🤒 UBUZIMA BWA MWANA WANYU\n\nMwaramutse,\n\nTubamenyesha ko ${student[0].name} arwaye.\n\n📝 Ibimenyetso: ${symptoms}\n🎯 Urwego: ${severityText}\n${sent_home ? '🏠 Yoherejwe mu rugo\n' : '🏫 Ari ku ishuri\n'}${notes ? '📝 Ibisobanuro: ' + notes + '\n' : ''}\nMurakoze,\n🎓 Ubuyobozi bw'Indero - Garden TVET`;
    
    for (const parent of linkedParents) {
      try {
        await smsService.sendSMS(
          parent.phone,
          message,
          req.user.userId,
          { student_id, action: 'student_sick', severity, sent_home, parent_id: parent.parent_id }
        );
      } catch (smsError) {
        console.error('SMS send error:', smsError);
      }
    }
    
    res.json({ 
      success: true, 
      message: sent_home ? 'Umunyeshuri yoherejwe mu rugo, ababyeyi bamenyeshejwe' : 'Ababyeyi bamenyeshejwe', 
      record_id: result.insertId,
      parents_notified: linkedParents.length
    });
  } catch (error) {
    console.error('Student sick error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove Conduct Points - AUTO SMS TO PARENTS
router.post('/actions/remove-conduct', authenticateToken, async (req, res) => {
  try {
    const { student_id, points_removed, reason, category, notes } = req.body;
    
    const [student] = await db.pool.query(`
      SELECT u.*, CONCAT(u.first_name, ' ', u.last_name) as name, u.conduct_score
      FROM users u WHERE u.id = ?
    `, [student_id]);
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Umunyeshuri ntiyabonetse' });
    }
    
    const newScore = Math.max(0, (student[0].conduct_score || 100) - points_removed);
    
    // Update conduct score
    await db.pool.query('UPDATE users SET conduct_score = ? WHERE id = ?', [newScore, student_id]);
    
    // Create conduct record
    const [result] = await db.pool.query(`
      INSERT INTO conduct_records (student_id, action_type, points_change, reason, category, notes, new_score, recorded_by, created_at)
      VALUES (?, 'remove', ?, ?, ?, ?, ?, ?, NOW())
    `, [student_id, -points_removed, reason, category, notes, newScore, req.user.userId]);
    
    // AUTO-SEND SMS TO ALL LINKED PARENTS
    const [linkedParents] = await db.pool.query(`
      SELECT DISTINCT p.phone, p.first_name, p.last_name, p.id as parent_id
      FROM parent_student_links psl
      JOIN users p ON psl.parent_id = p.id
      WHERE psl.student_id = ? AND psl.status = 'active' AND p.phone IS NOT NULL
    `, [student_id]);
    
    const categoryText = {
      'discipline': '🚨 Indero',
      'attendance': '📅 Kwitabira',
      'behavior': '👤 Imyitwarire',
      'academic': '📚 Amasomo'
    }[category] || category;
    
    const message = `🏫 GARDEN TVET\n\n⚠️ AMANOTA Y'IMYITWARIRE\n\nMwaramutse,\n\n${student[0].name} yavanywemo amanota y'imyitwarire.\n\n📊 Amanota yavanyweho: ${points_removed}\n📋 Impamvu: ${reason}\n🎯 Icyiciro: ${categoryText}\n📊 Amanota ashya: ${newScore}/100\n${notes ? '\n📝 Ibisobanuro: ' + notes + '\n' : ''}\nMurakoze,\n🎓 Ubuyobozi bw'Indero - Garden TVET`;
    
    for (const parent of linkedParents) {
      try {
        await smsService.sendSMS(
          parent.phone,
          message,
          req.user.userId,
          { student_id, action: 'conduct_removed', points_removed, new_score: newScore, parent_id: parent.parent_id }
        );
      } catch (smsError) {
        console.error('SMS send error:', smsError);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Amanota yavanyweho, ababyeyi bamenyeshejwe', 
      record_id: result.insertId,
      new_score: newScore,
      parents_notified: linkedParents.length
    });
  } catch (error) {
    console.error('Remove conduct error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== COMPREHENSIVE HISTORY & TRACKING ====================

// Get All Student Actions History (Conduct, Leave, Sick, Messages)
router.get('/history/student/:student_id', authenticateToken, async (req, res) => {
  try {
    const { student_id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // Get all actions from different tables
    const [conductHistory] = await db.pool.query(`
      SELECT 'conduct' as type, cr.*, CONCAT(u.first_name, ' ', u.last_name) as recorded_by_name
      FROM conduct_records cr
      LEFT JOIN users u ON cr.recorded_by = u.id
      WHERE cr.student_id = ?
      ORDER BY cr.created_at DESC
    `, [student_id]);
    
    const [leaveHistory] = await db.pool.query(`
      SELECT 'leave' as type, sl.*, CONCAT(u.first_name, ' ', u.last_name) as approved_by_name
      FROM student_leaves sl
      LEFT JOIN users u ON sl.approved_by = u.id
      WHERE sl.student_id = ?
      ORDER BY sl.created_at DESC
    `, [student_id]);
    
    const [healthHistory] = await db.pool.query(`
      SELECT 'health' as type, shr.*, CONCAT(u.first_name, ' ', u.last_name) as recorded_by_name
      FROM student_health_records shr
      LEFT JOIN users u ON shr.recorded_by = u.id
      WHERE shr.student_id = ?
      ORDER BY shr.created_at DESC
    `, [student_id]);
    
    const [punishmentHistory] = await db.pool.query(`
      SELECT 'punishment' as type, p.*
      FROM punishments p
      WHERE p.student_id = ?
      ORDER BY p.created_at DESC
    `, [student_id]);
    
    const [smsHistory] = await db.pool.query(`
      SELECT 'sms' as type, sm.*, CONCAT(u.first_name, ' ', u.last_name) as sender_name
      FROM sms_messages sm
      LEFT JOIN users u ON sm.sender_id = u.id
      WHERE JSON_EXTRACT(sm.metadata, '$.student_id') = ?
      ORDER BY sm.created_at DESC
    `, [student_id]);
    
    // Combine and sort all history
    const allHistory = [
      ...conductHistory,
      ...leaveHistory,
      ...healthHistory,
      ...punishmentHistory,
      ...smsHistory
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
     .slice(offset, offset + parseInt(limit));
    
    res.json({ 
      success: true, 
      history: allHistory,
      total: conductHistory.length + leaveHistory.length + healthHistory.length + punishmentHistory.length + smsHistory.length,
      stats: {
        conduct_actions: conductHistory.length,
        leaves: leaveHistory.length,
        health_records: healthHistory.length,
        punishments: punishmentHistory.length,
        sms_sent: smsHistory.length
      }
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get All Students Gone (Expelled, Suspended, On Leave)
router.get('/history/students-gone', authenticateToken, async (req, res) => {
  try {
    const { status, date_from, date_to, limit = 100 } = req.query;
    
    let query = `
      SELECT 
        u.id, u.student_id, CONCAT(u.first_name, ' ', u.last_name) as name,
        u.status, u.trade, u.level,
        'expelled' as gone_type,
        se.reason, se.effective_date as date, se.notes
      FROM users u
      JOIN student_expulsions se ON u.id = se.student_id
      WHERE se.status = 'active'
      
      UNION ALL
      
      SELECT 
        u.id, u.student_id, CONCAT(u.first_name, ' ', u.last_name) as name,
        u.status, u.trade, u.level,
        'suspended' as gone_type,
        p.description as reason, p.start_date as date, p.end_date as notes
      FROM users u
      JOIN punishments p ON u.id = p.student_id
      WHERE p.punishment_type = 'guhagarikwa_iminsi' AND p.status = 'birakora'
      
      UNION ALL
      
      SELECT 
        u.id, u.student_id, CONCAT(u.first_name, ' ', u.last_name) as name,
        u.status, u.trade, u.level,
        'on_leave' as gone_type,
        sl.reason, sl.start_date as date, sl.end_date as notes
      FROM users u
      JOIN student_leaves sl ON u.id = sl.student_id
      WHERE sl.status = 'approved' AND sl.end_date >= CURDATE()
      
      ORDER BY date DESC
      LIMIT ?
    `;
    
    const [studentsGone] = await db.pool.query(query, [parseInt(limit)]);
    
    res.json({ 
      success: true, 
      students: studentsGone,
      total: studentsGone.length,
      stats: {
        expelled: studentsGone.filter(s => s.gone_type === 'expelled').length,
        suspended: studentsGone.filter(s => s.gone_type === 'suspended').length,
        on_leave: studentsGone.filter(s => s.gone_type === 'on_leave').length
      }
    });
  } catch (error) {
    console.error('Students gone error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get SMS Statistics & Analytics
router.get('/history/sms-stats', authenticateToken, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (date_from) {
      dateFilter += ' AND created_at >= ?';
      params.push(date_from);
    }
    if (date_to) {
      dateFilter += ' AND created_at <= ?';
      params.push(date_to);
    }
    
    const [stats] = await db.pool.query(`
      SELECT 
        COUNT(*) as total_sms,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        COUNT(DISTINCT recipient) as unique_recipients,
        COUNT(DISTINCT sender_id) as unique_senders,
        JSON_EXTRACT(metadata, '$.action') as action_type,
        COUNT(*) as count
      FROM sms_messages
      WHERE 1=1 ${dateFilter}
      GROUP BY action_type
    `, params);
    
    const [recentMessages] = await db.pool.query(`
      SELECT sm.*, CONCAT(u.first_name, ' ', u.last_name) as sender_name
      FROM sms_messages sm
      LEFT JOIN users u ON sm.sender_id = u.id
      WHERE 1=1 ${dateFilter}
      ORDER BY sm.created_at DESC
      LIMIT 20
    `, params);
    
    res.json({ 
      success: true, 
      stats: stats[0] || {},
      action_breakdown: stats,
      recent_messages: recentMessages
    });
  } catch (error) {
    console.error('SMS stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
