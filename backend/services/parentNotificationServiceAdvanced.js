/**
 * Ultra-Advanced Parent Notification Service
 * Real SMS integration + Database logging
 * Automatic notifications for all student changes
 */
const { pool } = require('../config/database');
const { sendRealSMS, sendBulkSMS } = require('./smsService');

/**
 * Get all parents linked to a student with their preferences
 */
async function getLinkedParents(studentId) {
  try {
    const [parents] = await pool.execute(`
      SELECT 
        u.id as parent_id,
        u.phone,
        u.email,
        u.first_name,
        u.last_name,
        psl.relationship_type,
        psl.can_view_discipline,
        psl.can_view_marks,
        psl.can_view_attendance
      FROM parent_student_links psl
      JOIN users u ON psl.parent_id = u.id
      WHERE psl.student_id = ? 
        AND psl.status = 'approved'
        AND u.phone IS NOT NULL
        AND u.phone != ''
    `, [studentId]);
    
    return parents;
  } catch (error) {
    console.error('Error getting parents:', error);
    return [];
  }
}

/**
 * Create rich SMS message for conduct removal
 */
function createConductMessage(student, conductData, staffName) {
  const schoolName = process.env.SCHOOL_NAME || 'GARDEN TVET SCHOOL';
  const schoolPhone = process.env.SCHOOL_PHONE || '+250 788 123 456';
  
  return `
🏫 ${schoolName}

Mwaramutse/Mwiriwe,

Umwana wanyu ${student.first_name} ${student.last_name} (${student.student_code}) yakiriye igihano:

📋 Icyaha: ${conductData.incident_type}
⚠️ Ukurikije: ${conductData.severity}
📝 Ibisobanuro: ${conductData.description || 'N/A'}
🎯 Amanota yakuweho: ${conductData.points_deducted}/40
📊 Amanota asigaye: ${conductData.new_conduct_score}/40
🎓 Igipimo: ${conductData.grade}

Yakiriye igihano na: ${staffName}
📅 Itariki: ${new Date().toLocaleDateString('rw-RW')}
⏰ Igihe: ${new Date().toLocaleTimeString('rw-RW')}

Murakoze,
${schoolName}
📞 ${schoolPhone}
  `.trim();
}

/**
 * Create rich SMS message for grade update
 */
function createGradeMessage(student, gradeData) {
  const schoolName = process.env.SCHOOL_NAME || 'GARDEN TVET SCHOOL';
  
  return `
🏫 ${schoolName}

Umwana wanyu ${student.first_name} ${student.last_name} yakiriye amanota:

📚 Isomo: ${gradeData.subject}
📊 Amanota: ${gradeData.marks}/${gradeData.total}
🎯 Igipimo: ${gradeData.grade}
📈 Icy'umwaka: ${gradeData.percentage}%

Yatanzwe na: ${gradeData.teacher_name}
📅 ${new Date().toLocaleDateString('rw-RW')}

${schoolName}
  `.trim();
}

/**
 * Create rich SMS message for attendance
 */
function createAttendanceMessage(student, attendanceData) {
  const schoolName = process.env.SCHOOL_NAME || 'GARDEN TVET SCHOOL';
  const status = attendanceData.status === 'absent' ? 'NTIYITABYE' : 'YITABYE';
  
  return `
🏫 ${schoolName}

Umwana wanyu ${student.first_name} ${student.last_name} ${status}:

📅 Itariki: ${attendanceData.date}
⏰ Igihe: ${attendanceData.time}
${attendanceData.reason ? `📝 Impamvu: ${attendanceData.reason}` : ''}

${schoolName}
  `.trim();
}

/**
 * Create rich SMS message for leave approval
 */
function createLeaveMessage(student, leaveData) {
  const schoolName = process.env.SCHOOL_NAME || 'GARDEN TVET SCHOOL';
  
  return `
🏫 ${schoolName}

Umwana wanyu ${student.first_name} ${student.last_name} yahawe uruhushya:

📋 Ubwoko: ${leaveData.leave_type}
📝 Impamvu: ${leaveData.reason}
📅 Kuva: ${leaveData.start_time}
📅 Kugeza: ${leaveData.end_time}
✅ Yemejwe na: ${leaveData.approved_by_name}

${schoolName}
  `.trim();
}

/**
 * Notify parents about conduct removal (ULTRA-ADVANCED)
 */
async function notifyParentsConductRemoved(studentId, conductData, staffName) {
  try {
    // Get student info
    const [students] = await pool.execute(`
      SELECT 
        id, first_name, last_name, student_code, conduct_score, 
        conduct_grade, trade_name, level_number
      FROM global_student_sheets
      WHERE id = ?
    `, [studentId]);
    
    if (students.length === 0) {
      console.log('⚠️ Student not found:', studentId);
      return { success: false, message: 'Student not found' };
    }
    
    const student = students[0];
    const parents = await getLinkedParents(studentId);
    
    if (parents.length === 0) {
      console.log('⚠️ No parents linked to:', student.first_name, student.last_name);
      return { success: true, parentCount: 0, message: 'No parents linked' };
    }
    
    // Filter parents who can view discipline
    const eligibleParents = parents.filter(p => p.can_view_discipline);
    
    if (eligibleParents.length === 0) {
      console.log('⚠️ No parents with discipline view permission');
      return { success: true, parentCount: 0, message: 'No eligible parents' };
    }
    
    // Create rich message
    const message = createConductMessage(student, {
      ...conductData,
      grade: student.conduct_grade
    }, staffName);
    
    // Send SMS to all eligible parents
    const recipients = eligibleParents.map(parent => ({
      phone: parent.phone,
      message: message
    }));
    
    const results = await sendBulkSMS(recipients);
    
    // Log notification in database
    for (const parent of eligibleParents) {
      await pool.execute(`
        INSERT INTO parent_notifications 
        (parent_id, student_id, notification_type, title, message, sent_via, created_at)
        VALUES (?, ?, 'conduct_removed', 'Conduct Removed', ?, 'sms', NOW())
      `, [parent.parent_id, studentId, message]);
    }
    
    console.log(`✅ Notified ${eligibleParents.length} parent(s) about conduct removal`);
    
    return { 
      success: true, 
      parentCount: eligibleParents.length,
      results: results
    };
  } catch (error) {
    console.error('❌ Error notifying parents:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notify parents about grade changes
 */
async function notifyParentsGradeChanged(studentId, gradeData) {
  try {
    const [students] = await pool.execute(`
      SELECT first_name, last_name, student_code
      FROM global_student_sheets
      WHERE id = ?
    `, [studentId]);
    
    if (students.length === 0) return { success: false };
    
    const student = students[0];
    const parents = await getLinkedParents(studentId);
    const eligibleParents = parents.filter(p => p.can_view_marks);
    
    if (eligibleParents.length === 0) return { success: true, parentCount: 0 };
    
    const message = createGradeMessage(student, gradeData);
    
    const recipients = eligibleParents.map(parent => ({
      phone: parent.phone,
      message: message
    }));
    
    const results = await sendBulkSMS(recipients);
    
    // Log notifications
    for (const parent of eligibleParents) {
      await pool.execute(`
        INSERT INTO parent_notifications 
        (parent_id, student_id, notification_type, title, message, sent_via, created_at)
        VALUES (?, ?, 'grade_updated', 'Grade Updated', ?, 'sms', NOW())
      `, [parent.parent_id, studentId, message]);
    }
    
    return { success: true, parentCount: eligibleParents.length, results };
  } catch (error) {
    console.error('Error notifying parents:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notify parents about attendance
 */
async function notifyParentsAttendanceChanged(studentId, attendanceData) {
  try {
    const [students] = await pool.execute(`
      SELECT first_name, last_name, student_code
      FROM global_student_sheets
      WHERE id = ?
    `, [studentId]);
    
    if (students.length === 0) return { success: false };
    
    const student = students[0];
    const parents = await getLinkedParents(studentId);
    const eligibleParents = parents.filter(p => p.can_view_attendance);
    
    if (eligibleParents.length === 0) return { success: true, parentCount: 0 };
    
    const message = createAttendanceMessage(student, attendanceData);
    
    const recipients = eligibleParents.map(parent => ({
      phone: parent.phone,
      message: message
    }));
    
    const results = await sendBulkSMS(recipients);
    
    // Log notifications
    for (const parent of eligibleParents) {
      await pool.execute(`
        INSERT INTO parent_notifications 
        (parent_id, student_id, notification_type, title, message, sent_via, created_at)
        VALUES (?, ?, 'attendance_updated', 'Attendance Updated', ?, 'sms', NOW())
      `, [parent.parent_id, studentId, message]);
    }
    
    return { success: true, parentCount: eligibleParents.length, results };
  } catch (error) {
    console.error('Error notifying parents:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notify parents about leave approval
 */
async function notifyParentsLeaveApproved(studentId, leaveData) {
  try {
    const [students] = await pool.execute(`
      SELECT first_name, last_name, student_code
      FROM global_student_sheets
      WHERE id = ?
    `, [studentId]);
    
    if (students.length === 0) return { success: false };
    
    const student = students[0];
    const parents = await getLinkedParents(studentId);
    
    if (parents.length === 0) return { success: true, parentCount: 0 };
    
    const message = createLeaveMessage(student, leaveData);
    
    const recipients = parents.map(parent => ({
      phone: parent.phone,
      message: message
    }));
    
    const results = await sendBulkSMS(recipients);
    
    // Log notifications
    for (const parent of parents) {
      await pool.execute(`
        INSERT INTO parent_notifications 
        (parent_id, student_id, notification_type, title, message, sent_via, created_at)
        VALUES (?, ?, 'leave_approved', 'Leave Approved', ?, 'sms', NOW())
      `, [parent.parent_id, studentId, message]);
    }
    
    return { success: true, parentCount: parents.length, results };
  } catch (error) {
    console.error('Error notifying parents:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  notifyParentsConductRemoved,
  notifyParentsGradeChanged,
  notifyParentsAttendanceChanged,
  notifyParentsLeaveApproved,
  getLinkedParents
};
