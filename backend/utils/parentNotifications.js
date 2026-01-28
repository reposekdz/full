const { pool } = require('../config/database');
const smsService = require('../services/smsService');

async function notifyParents(studentId, type, title, message, data = {}) {
  try {
    const [parents] = await pool.execute(`
      SELECT DISTINCT u.id, u.phone, u.first_name FROM users u
      INNER JOIN parent_student ps ON u.id = ps.parent_id
      WHERE ps.student_id = ? AND u.is_active = true
    `, [studentId]);

    for (const parent of parents) {
      // Internal notification
      await pool.execute(`
        INSERT INTO notifications (user_id, type, title, message, data, priority, is_read)
        VALUES (?, ?, ?, ?, ?, ?, false)
      `, [parent.id, type, title, message, JSON.stringify(data), data.priority || 'normal']);

      // Internal message
      await pool.execute(`
        INSERT INTO messages 
        (sender_id, sender_name, sender_role, recipient_id, recipient_role, recipient_type, subject, message, priority, status)
        VALUES (?, ?, ?, ?, ?, 'system', ?, ?, ?, 'sent')
      `, [0, 'Sisitemu', 'system', parent.id, 'parent', title, message, data.priority || 'normal']);

      // External WhatsApp/SMS notification
      if (parent.phone) {
        smsService.sendUniversalMessage(parent.phone, message, 0, {
          type: type,
          studentId: studentId,
          parentId: parent.id,
          preferredMethod: 'whatsapp'
        }).catch(err => console.error(`Failed to send ${type} message to parent ${parent.id}:`, err));
      }
    }

    return { success: true, notifiedParents: parents.length };
  } catch (error) {
    console.error('Error:', error);
    return { success: false };
  }
}

async function notifyConductRemoval(studentId, conductData, recordId) {
  const [student] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);
  if (student.length === 0) return;
  const s = student[0];
  const title = `Uburenganzira bwakuweho - ${s.name}`;
  const message = `Uburenganzira bw'umwana wawe ${s.name} bwakuweho.\n\nUbwoko: ${conductData.conduct_type}\nUkomeye: ${conductData.severity}\nIgisobanuro: ${conductData.description}\nIcyakozwe: ${conductData.action_taken || 'N/A'}`;
  
  // Insert into legacy discipline notifications table if it exists
  try {
    const [parents] = await pool.execute(`
      SELECT DISTINCT u.id FROM users u
      INNER JOIN parent_student ps ON u.id = ps.parent_id
      WHERE ps.student_id = ? AND u.is_active = true
    `, [studentId]);

    for (const parent of parents) {
      await pool.execute(`
        INSERT INTO parent_discipline_notifications 
        (parent_id, student_id, notification_type, title, message, record_id)
        VALUES (?, ?, 'conduct_removed', ?, ?, ?)
      `, [parent.id, studentId, title, message, recordId]);
    }
  } catch (err) {
    console.error('Failed to insert into legacy discipline notifications:', err.message);
  }

  return await notifyParents(studentId, 'conduct_removed', title, message, { 
    priority: conductData.severity === 'critical' ? 'urgent' : 'high',
    recordId: recordId 
  });
}

async function notifyLeaveApproval(studentId, leaveData, recordId) {
  const [student] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);
  if (student.length === 0) return;
  const s = student[0];
  const title = `Uruhushya rwemejwe - ${s.name}`;
  const message = `Umwana wawe ${s.name} yemerewe gusohoka.\n\nImpamvu: ${leaveData.leave_type}\nIgisobanuro: ${leaveData.reason}\nIgihe: ${new Date(leaveData.start_time).toLocaleString()}`;
  
  // Insert into legacy discipline notifications table if it exists
  try {
    const [parents] = await pool.execute(`
      SELECT DISTINCT u.id FROM users u
      INNER JOIN parent_student ps ON u.id = ps.parent_id
      WHERE ps.student_id = ? AND u.is_active = true
    `, [studentId]);

    for (const parent of parents) {
      await pool.execute(`
        INSERT INTO parent_discipline_notifications 
        (parent_id, student_id, notification_type, title, message, record_id)
        VALUES (?, ?, 'leave_approved', ?, ?, ?)
      `, [parent.id, studentId, title, message, recordId]);
    }
  } catch (err) {
    console.error('Failed to insert into legacy discipline notifications:', err.message);
  }

  return await notifyParents(studentId, 'leave_approved', title, message, { 
    priority: 'normal',
    recordId: recordId 
  });
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

async function notifyFeePayment(studentId, paymentData) {
  const [student] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);
  if (student.length === 0) return;
  const s = student[0];
  const title = `Kwishyura byemejwe - ${s.name}`;
  const message = `Kwishyura kw'umwana wawe ${s.name} kwemejwe.\n\nAmafaranga: ${paymentData.amount} RWF\nUbwoko: ${paymentData.payment_type || 'Fees'}\nIgihe: ${new Date().toLocaleDateString()}`;
  return await notifyParents(studentId, 'fee_payment', title, message, { priority: 'normal' });
}

async function notifyMedicalRecord(studentId, medicalData) {
  const [student] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);
  if (student.length === 0) return;
  const s = student[0];
  const title = `Ubuzima: ${medicalData.record_type} - ${s.name}`;
  const message = `Umwana wawe ${s.name} yagiye kwivuza mu kigo nderabuzima cy'ishuri.\n\nUbwoko: ${medicalData.record_type}\nIbisobanuro: ${medicalData.description}\nUburyo yavuwe: ${medicalData.treatment || 'N/A'}\nUmuvuzi: ${medicalData.prescribed_by || 'N/A'}`;
  return await notifyParents(studentId, 'medical_record', title, message, { priority: 'high' });
}

async function notifyHostelAllocation(studentId, allocationData) {
  const [student] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);
  if (student.length === 0) return;
  const s = student[0];
  const title = `Icumbi: ${s.name}`;
  const message = `Umwana wawe ${s.name} yahawe icumbi.\n\nHostel: ${allocationData.hostel_name}\nIcyumba: ${allocationData.room_number}\nIgitanda: ${allocationData.bed_number || 'N/A'}\nItariki: ${new Date(allocationData.check_in_date).toLocaleDateString()}`;
  return await notifyParents(studentId, 'hostel_allocation', title, message, { priority: 'normal' });
}

async function notifyHostelCheckout(studentId, checkoutData) {
  const [student] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);
  if (student.length === 0) return;
  const s = student[0];
  const title = `Gusohoka mu cumbi: ${s.name}`;
  const message = `Umwana wawe ${s.name} yavuye mu muryango w'icumbi (hostel).\n\nHostel: ${checkoutData.hostel_name}\nIcyumba: ${checkoutData.room_number}\nItariki: ${new Date(checkoutData.check_out_date).toLocaleDateString()}`;
  return await notifyParents(studentId, 'hostel_checkout', title, message, { priority: 'normal' });
}

async function notifyExamResult(studentId, examData) {
  const [student] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);
  if (student.length === 0) return;
  const s = student[0];
  const title = `Amanota y'ikizamini: ${s.name}`;
  const message = `Umwana wawe ${s.name} yabonye amanota y'ikizamini.\n\nIkizamini: ${examData.title}\nAmanota: ${examData.obtained_marks}/${examData.total_marks} (${examData.percentage}%)\nIgihe: ${new Date().toLocaleDateString()}`;
  return await notifyParents(studentId, 'exam_result', title, message, { priority: examData.percentage < 50 ? 'high' : 'normal' });
}

async function broadcastAnnouncementToParents(announcementData) {
  try {
    const [parents] = await pool.execute(`
      SELECT DISTINCT phone FROM users 
      WHERE role = 'parent' AND is_active = true AND phone IS NOT NULL
    `);

    const message = `ITANGAZO: ${announcementData.title}\n\n${announcementData.content.substring(0, 300)}${announcementData.content.length > 300 ? '...' : ''}\n\nSura portal y'ishuri usome itangazo ryose.`;

    for (const parent of parents) {
      smsService.sendUniversalMessage(parent.phone, message, 0, {
        type: 'broadcast',
        preferredMethod: 'whatsapp'
      }).catch(err => console.error(`Failed to send broadcast to ${parent.phone}:`, err));
    }

    return { success: true, count: parents.length };
  } catch (error) {
    console.error('Broadcast error:', error);
    return { success: false };
  }
}

async function notifyLibraryBorrow(studentId, borrowData) {
  const [student] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);
  if (student.length === 0) return;
  const s = student[0];
  const title = `Igitabo: ${s.name}`;
  const message = `Umwana wawe ${s.name} yagurijwe igitabo mu nzu y'ibitabo.\n\nIgitabo: ${borrowData.title}\nItariki yo kugarura: ${new Date(borrowData.due_date).toLocaleDateString()}`;
  return await notifyParents(studentId, 'library_borrow', title, message, { priority: 'normal' });
}

async function notifyLibraryReturn(studentId, returnData) {
  const [student] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);
  if (student.length === 0) return;
  const s = student[0];
  const title = `Kugarura igitabo: ${s.name}`;
  const message = `Umwana wawe ${s.name} yagaruye igitabo mu nzu y'ibitabo.\n\nIgitabo: ${returnData.title}\nIgihe: ${new Date().toLocaleDateString()}`;
  return await notifyParents(studentId, 'library_return', title, message, { priority: 'normal' });
}

module.exports = { 
  notifyParents, 
  notifyConductRemoval, 
  notifyLeaveApproval, 
  notifyGradeUpdate, 
  notifyAttendance, 
  notifyFeePayment,
  notifyMedicalRecord,
  notifyHostelAllocation,
  notifyHostelCheckout,
  notifyExamResult,
  broadcastAnnouncementToParents,
  notifyLibraryBorrow,
  notifyLibraryReturn
};
