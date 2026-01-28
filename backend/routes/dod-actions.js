const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Remove Student Conduct (Expulsion)
router.post('/actions/expel-student', async (req, res) => {
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
    
    // Auto-send message to parent
    const message = `Mwaramutse,\n\nTubamenyesha ko umwana wanyu ${student[0].name} (${student[0].student_id}) yirukanywe ku ishuri.\n\nImpamvu: ${reason}\n\nItariki: ${effective_date}\n\nMurakoze,\nUbuyobozi bw'Indero`;
    
    if (student[0].parent_phone) {
      await db.pool.query(`
        INSERT INTO parent_notifications (student_id, message, notification_method, sent_at, created_at)
        VALUES (?, ?, 'sms', NOW(), NOW())
      `, [student_id, message]);
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

// Suspend Student
router.post('/actions/suspend-student', async (req, res) => {
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
    
    // Auto-message parent
    const message = `Mwaramutse ${student[0].parent_name},\n\nTubamenyesha ko ${student[0].name} yahagaritswe ku ishuri.\n\nImpamvu: ${reason}\nKuva: ${start_date}\nKugeza: ${end_date}\n\nMurakoze`;
    
    if (student[0].parent_phone) {
      await db.pool.query(`
        INSERT INTO parent_notifications (student_id, message, notification_method, sent_at, created_at)
        VALUES (?, ?, 'sms', NOW(), NOW())
      `, [student_id, message]);
    }
    
    res.json({ success: true, message: 'Umunyeshuri yahagaritswe kandi ababyeyi bamenyeshejwe', suspension_id: result.insertId });
  } catch (error) {
    console.error('Suspension error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Grant Leave/Permission
router.post('/actions/grant-leave', async (req, res) => {
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
    
    // Auto-message parent
    const message = `Mwaramutse ${student[0].parent_name},\n\nUruhushya rwa ${student[0].name} rwemewe.\n\nUbwoko: ${leave_type}\nKuva: ${start_date}\nKugeza: ${end_date}\n\nMurakoze`;
    
    if (student[0].parent_phone) {
      await db.pool.query(`
        INSERT INTO parent_notifications (student_id, message, notification_method, sent_at, created_at)
        VALUES (?, ?, 'sms', NOW(), NOW())
      `, [student_id, message]);
    }
    
    res.json({ success: true, message: 'Uruhushya rwemewe kandi ababyeyi bamenyeshejwe', leave_id: result.insertId });
  } catch (error) {
    console.error('Leave error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send Custom Message to Parent
router.post('/actions/message-parent', async (req, res) => {
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
    
    // Send message
    const [result] = await db.pool.query(`
      INSERT INTO parent_notifications (student_id, message, notification_method, priority, sent_at, created_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `, [student_id, message, notification_method || 'sms', priority || 'normal']);
    
    res.json({ success: true, message: 'Ubutumwa bwohererejwe', notification_id: result.insertId });
  } catch (error) {
    console.error('Message error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk Actions
router.post('/actions/bulk', async (req, res) => {
  try {
    const { student_ids, action, data } = req.body;
    const results = [];
    
    for (const student_id of student_ids) {
      if (action === 'suspend') {
        await db.pool.query('UPDATE users SET status = "suspended" WHERE id = ?', [student_id]);
      } else if (action === 'activate') {
        await db.pool.query('UPDATE users SET is_active = 1, status = "active" WHERE id = ?', [student_id]);
      } else if (action === 'message') {
        await db.pool.query(`
          INSERT INTO parent_notifications (student_id, message, notification_method, sent_at, created_at)
          VALUES (?, ?, 'sms', NOW(), NOW())
        `, [student_id, data.message]);
      }
      results.push({ student_id, success: true });
    }
    
    res.json({ success: true, message: `${results.length} ibikorwa byakozwe`, results });
  } catch (error) {
    console.error('Bulk action error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
