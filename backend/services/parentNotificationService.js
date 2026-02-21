/**
 * Automatic Parent Notification System
 * Sends SMS to parents when conduct is removed or any changes made
 */
const { pool } = require('../config/database');

/**
 * Send SMS to parent
 */
async function sendSMS(phone, message) {
  try {
    // TODO: Integrate with SMS provider (Africa's Talking, Twilio, etc.)
    console.log(`📱 SMS to ${phone}: ${message}`);
    
    // Log SMS in database
    await pool.execute(`
      INSERT INTO sms_logs (phone, message, status, sent_at)
      VALUES (?, ?, 'sent', NOW())
    `, [phone, message]);
    
    return { success: true };
  } catch (error) {
    console.error('SMS Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all parents linked to a student
 */
async function getLinkedParents(studentId) {
  try {
    const [parents] = await pool.execute(`
      SELECT 
        u.id as parent_id,
        u.phone,
        u.first_name,
        u.last_name,
        psl.relationship_type
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
 * Notify parents about conduct removal
 */
async function notifyParentsConductRemoved(studentId, conductData) {
  try {
    // Get student info
    const [students] = await pool.execute(`
      SELECT first_name, last_name, student_code, conduct_score, trade_name, level_number
      FROM global_student_sheets
      WHERE id = ?
    `, [studentId]);
    
    if (students.length === 0) return;
    
    const student = students[0];
    const parents = await getLinkedParents(studentId);
    
    if (parents.length === 0) {
      console.log('⚠️ No parents linked to student:', student.first_name, student.last_name);
      return;
    }
    
    // Create SMS message in Kinyarwanda
    const message = `
🏫 GARDEN TVET SCHOOL

Mwaramutse/Mwiriwe,

Umwana wanyu ${student.first_name} ${student.last_name} (${student.student_code}) yakiriye igihano:

📋 Icyaha: ${conductData.incident_type || 'N/A'}
⚠️ Ukurikije: ${conductData.severity || 'moderate'}
📝 Ibisobanuro: ${conductData.description || 'N/A'}
🎯 Amanota yakuweho: ${conductData.points_deducted || 0}/40
📊 Amanota asigaye: ${conductData.new_conduct_score || student.conduct_score}/40

Yakiriye igihano na: ${conductData.recorded_by_name || 'Staff'}
Itariki: ${new Date().toLocaleDateString('rw-RW')}

Murakoze,
Garden TVET School
📞 +250 788 123 456
    `.trim();
    
    // Send SMS to all linked parents
    for (const parent of parents) {
      await sendSMS(parent.phone, message);
      console.log(`✅ SMS sent to ${parent.first_name} ${parent.last_name} (${parent.phone})`);
    }
    
    // Log notification
    await pool.execute(`
      INSERT INTO parent_notifications 
      (student_id, notification_type, title, message, created_at)
      VALUES (?, 'conduct_removed', 'Conduct Removed', ?, NOW())
    `, [studentId, message]);
    
    return { success: true, parentCount: parents.length };
  } catch (error) {
    console.error('Error notifying parents:', error);
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
    
    if (students.length === 0) return;
    
    const student = students[0];
    const parents = await getLinkedParents(studentId);
    
    if (parents.length === 0) return;
    
    const message = `
🏫 GARDEN TVET SCHOOL

Umwana wanyu ${student.first_name} ${student.last_name} yakiriye amanota:

📚 Isomo: ${gradeData.subject || 'N/A'}
📊 Amanota: ${gradeData.marks || 0}/${gradeData.total || 100}
🎯 Igipimo: ${gradeData.grade || 'N/A'}

Itariki: ${new Date().toLocaleDateString('rw-RW')}

Garden TVET School
    `.trim();
    
    for (const parent of parents) {
      await sendSMS(parent.phone, message);
    }
    
    return { success: true, parentCount: parents.length };
  } catch (error) {
    console.error('Error notifying parents:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notify parents about attendance changes
 */
async function notifyParentsAttendanceChanged(studentId, attendanceData) {
  try {
    const [students] = await pool.execute(`
      SELECT first_name, last_name, student_code
      FROM global_student_sheets
      WHERE id = ?
    `, [studentId]);
    
    if (students.length === 0) return;
    
    const student = students[0];
    const parents = await getLinkedParents(studentId);
    
    if (parents.length === 0) return;
    
    const status = attendanceData.status === 'absent' ? 'NTIYITABYE' : 'YITABYE';
    
    const message = `
🏫 GARDEN TVET SCHOOL

Umwana wanyu ${student.first_name} ${student.last_name} ${status}:

📅 Itariki: ${attendanceData.date || new Date().toLocaleDateString('rw-RW')}
⏰ Igihe: ${attendanceData.time || 'N/A'}
${attendanceData.reason ? `📝 Impamvu: ${attendanceData.reason}` : ''}

Garden TVET School
    `.trim();
    
    for (const parent of parents) {
      await sendSMS(parent.phone, message);
    }
    
    return { success: true, parentCount: parents.length };
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
    
    if (students.length === 0) return;
    
    const student = students[0];
    const parents = await getLinkedParents(studentId);
    
    if (parents.length === 0) return;
    
    const message = `
🏫 GARDEN TVET SCHOOL

Umwana wanyu ${student.first_name} ${student.last_name} yahawe uruhushya:

📋 Ubwoko: ${leaveData.leave_type || 'N/A'}
📝 Impamvu: ${leaveData.reason || 'N/A'}
📅 Kuva: ${leaveData.start_time || 'N/A'}
📅 Kugeza: ${leaveData.end_time || 'N/A'}
✅ Yemejwe na: ${leaveData.approved_by_name || 'Staff'}

Garden TVET School
    `.trim();
    
    for (const parent of parents) {
      await sendSMS(parent.phone, message);
    }
    
    return { success: true, parentCount: parents.length };
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
  getLinkedParents,
  sendSMS
};
