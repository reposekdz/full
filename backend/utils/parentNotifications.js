const { pool } = require('../config/database');

async function notifyParents(studentId, type, title, message, data = {}) {
  try {
    const [parents] = await pool.execute(`
      SELECT DISTINCT u.id FROM users u
      INNER JOIN parent_sheets ps ON u.id = ps.parent_id
      WHERE ps.student_id = ? AND u.is_active = true
    `, [studentId]);

    for (const parent of parents) {
      await pool.execute(`
        INSERT INTO notifications (user_id, type, title, message, data, priority, is_read)
        VALUES (?, ?, ?, ?, ?, ?, false)
      `, [parent.id, type, title, message, JSON.stringify(data), data.priority || 'normal']);

      await pool.execute(`
        INSERT INTO messages 
        (sender_id, sender_name, sender_role, recipient_id, recipient_role, recipient_type, subject, message, priority, status)
        VALUES (?, ?, ?, ?, ?, 'system', ?, ?, ?, 'sent')
      `, [0, 'Sisitemu', 'system', parent.id, 'parent', title, message, data.priority || 'normal']);
    }

    return { success: true, notifiedParents: parents.length };
  } catch (error) {
    console.error('Error:', error);
    return { success: false };
  }
}

async function notifyConductRemoval(studentId, conductData) {
  const [student] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);
  if (student.length === 0) return;
  const s = student[0];
  const title = `Uburenganzira bwakuweho - ${s.name}`;
  const message = `Uburenganzira bw'umwana wawe ${s.name} bwakuweho.\n\nUbwoko: ${conductData.conduct_type}\nUkomeye: ${conductData.severity}\nIgisobanuro: ${conductData.description}`;
  return await notifyParents(studentId, 'conduct_removed', title, message, { priority: conductData.severity === 'critical' ? 'urgent' : 'high' });
}

async function notifyLeaveApproval(studentId, leaveData) {
  const [student] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);
  if (student.length === 0) return;
  const s = student[0];
  const title = `Uruhushya rwemejwe - ${s.name}`;
  const message = `Umwana wawe ${s.name} yemerewe gusohoka.\n\nImpamvu: ${leaveData.leave_type}\nIgisobanuro: ${leaveData.reason}`;
  return await notifyParents(studentId, 'leave_approved', title, message, { priority: 'normal' });
}

async function notifyGradeUpdate(studentId, gradeData) {
  const [student] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);
  if (student.length === 0) return;
  const s = student[0];
  const percentage = Math.round((gradeData.obtained_marks / gradeData.max_marks) * 100);
  const title = `Amanota mashya - ${s.name}`;
  const message = `Umwana wawe ${s.name} yahawe amanota.\n\nIsomo: ${gradeData.subject_name}\nAmanota: ${gradeData.obtained_marks}/${gradeData.max_marks} (${percentage}%)`;
  return await notifyParents(studentId, 'grade_updated', title, message, { priority: percentage < 50 ? 'high' : 'normal' });
}

async function notifyAttendance(studentId, attendanceData) {
  if (attendanceData.status === 'present') return;
  const [student] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);
  if (student.length === 0) return;
  const s = student[0];
  const title = attendanceData.status === 'absent' ? `Kutaza - ${s.name}` : `Gutinda - ${s.name}`;
  const message = `Umwana wawe ${s.name} ${attendanceData.status === 'absent' ? 'ntiyaje' : 'yatinze'} uyu munsi.`;
  return await notifyParents(studentId, 'attendance_marked', title, message, { priority: attendanceData.status === 'absent' ? 'high' : 'normal' });
}

module.exports = { notifyParents, notifyConductRemoval, notifyLeaveApproval, notifyGradeUpdate, notifyAttendance };
