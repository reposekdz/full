// ═══════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE STUDENT ACTIVITY SMS NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════
// Enhanced SMS notifications for ALL student activities and events
// ═══════════════════════════════════════════════════════════════════════════

const { pool } = require('../config/database');
const { sendSMS } = require('../utils/smsService');

/**
 * Send SMS for attendance issues
 */
const sendAttendanceAlertSMS = async (studentId, attendanceType, date, reason = '') => {
  try {
    // Get student info
    const [[student]] = await pool.execute(
      'SELECT first_name, last_name, student_code, trade_name, level_number FROM global_student_sheets WHERE id = ?',
      [studentId]
    );

    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    // Get all linked parents
    const [parents] = await pool.execute(`
      SELECT DISTINCT u.id, u.phone, u.first_name
      FROM parent_child_links pcl
      JOIN users u ON pcl.parent_id = u.id
      WHERE pcl.student_id = ? AND pcl.status = 'active' AND u.phone IS NOT NULL
    `, [studentId]);

    const results = [];

    for (const parent of parents) {
      const attendanceTypeKiny = {
        'absent': 'Ntabwo yaje',
        'late': 'Yatinze',
        'sick': 'Yarwaye',
        'excused': 'Yemerewe'
      }[attendanceType.toLowerCase()] || attendanceType;

      const message = `🎓 Garden TVET: ${parent.first_name},

📅 KWIGA: Umwana ${student.first_name} ${student.last_name} - ${attendanceTypeKiny}

📋 AMAKURU:
• Itariki: ${date}
• Uko byagenze: ${attendanceTypeKiny}
• Kode y'umwana: ${student.student_code}
• Umwuga: ${student.trade_name}
• Urwego: ${student.level_number}${reason ? `
• Impamvu: ${reason}` : ''}

👨👩👧👦 ICYIFUZO: Mwirinde umwana mwanyu akajya ku ishuri buri munsi.

📞 HAMAGARA: +250783407691 niba mufite ibibazo.

Murakoze! 🙏`;

      const smsResult = await sendSMS(parent.phone, message);
      results.push({ parentId: parent.id, ...smsResult });

      // Log notification
      await pool.execute(`
        INSERT INTO parent_notifications_log 
        (parent_id, student_id, notification_type, message, phone_number, 
         delivery_status, provider, message_id, created_at)
        VALUES (?, ?, 'attendance_alert', ?, ?, ?, ?, ?, NOW())
      `, [
        parent.id, studentId, message, parent.phone,
        smsResult.success ? 'sent' : 'failed',
        smsResult.provider || 'unknown',
        smsResult.messageId || null
      ]);
    }

    return { success: true, results, parentsNotified: results.filter(r => r.success).length };
  } catch (error) {
    console.error('Attendance alert SMS error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send SMS for grade/exam results
 */
const sendGradeUpdateSMS = async (studentId, examType, subject, score, grade, totalMarks) => {
  try {
    // Get student info
    const [[student]] = await pool.execute(
      'SELECT first_name, last_name, student_code, trade_name, level_number FROM global_student_sheets WHERE id = ?',
      [studentId]
    );

    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    // Get all linked parents
    const [parents] = await pool.execute(`
      SELECT DISTINCT u.id, u.phone, u.first_name
      FROM parent_child_links pcl
      JOIN users u ON pcl.parent_id = u.id
      WHERE pcl.student_id = ? AND pcl.status = 'active' AND u.phone IS NOT NULL
    `, [studentId]);

    const results = [];

    for (const parent of parents) {
      const gradeComment = {
        'A': 'Byiza cyane! 🌟',
        'B': 'Byiza! 👍',
        'C': 'Bifatika 👌',
        'D': 'Buragufi - Akwiye gukora cyane 📚',
        'F': 'Bibi - Akeneye ubufasha 📖'
      }[grade] || '';

      const message = `🎓 Garden TVET: ${parent.first_name},

📊 AMANOTA: Umwana ${student.first_name} ${student.last_name} yakiriye amanota

📋 AMAKURU Y'AMANOTA:
• Ikizamini: ${examType}
• Icyiciro: ${subject}
• Amanota: ${score}/${totalMarks}
• Igipimo: ${grade} ${gradeComment}
• Kode y'umwana: ${student.student_code}

${grade === 'A' || grade === 'B' ? '🎉 Muramushimire! Arakora neza.' : '📚 Mufashe umwana mwanyu kwiga cyane.'}

📞 HAMAGARA: +250783407691 niba mufite ibibazo.

Murakoze! 🙏`;

      const smsResult = await sendSMS(parent.phone, message);
      results.push({ parentId: parent.id, ...smsResult });

      // Log notification
      await pool.execute(`
        INSERT INTO parent_notifications_log 
        (parent_id, student_id, notification_type, message, phone_number, 
         delivery_status, provider, message_id, created_at)
        VALUES (?, ?, 'grade_update', ?, ?, ?, ?, ?, NOW())
      `, [
        parent.id, studentId, message, parent.phone,
        smsResult.success ? 'sent' : 'failed',
        smsResult.provider || 'unknown',
        smsResult.messageId || null
      ]);
    }

    return { success: true, results, parentsNotified: results.filter(r => r.success).length };
  } catch (error) {
    console.error('Grade update SMS error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send SMS for fee reminders
 */
const sendFeeReminderSMS = async (studentId, amountDue, dueDate, feeType = 'School fees') => {
  try {
    // Get student info
    const [[student]] = await pool.execute(
      'SELECT first_name, last_name, student_code, trade_name, level_number FROM global_student_sheets WHERE id = ?',
      [studentId]
    );

    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    // Get all linked parents
    const [parents] = await pool.execute(`
      SELECT DISTINCT u.id, u.phone, u.first_name
      FROM parent_child_links pcl
      JOIN users u ON pcl.parent_id = u.id
      WHERE pcl.student_id = ? AND pcl.status = 'active' AND u.phone IS NOT NULL
    `, [studentId]);

    const results = [];

    for (const parent of parents) {
      const message = `🎓 Garden TVET: ${parent.first_name},

💰 AMAFARANGA: Umwana ${student.first_name} ${student.last_name} afite amafaranga yo kwishyura

📋 AMAKURU Y'AMAFARANGA:
• Ubwoko: ${feeType}
• Amafaranga: ${amountDue.toLocaleString()} RWF
• Itariki yo kwishyura: ${dueDate}
• Kode y'umwana: ${student.student_code}
• Umwuga: ${student.trade_name}

💳 KWISHYURA: Mwishyure vuba kugira ngo umwana akomeze kwiga neza.

📞 HAMAGARA: +250783407691 kugira ngo mubonane n'umunyamabanga.

Murakoze! 🙏`;

      const smsResult = await sendSMS(parent.phone, message);
      results.push({ parentId: parent.id, ...smsResult });

      // Log notification
      await pool.execute(`
        INSERT INTO parent_notifications_log 
        (parent_id, student_id, notification_type, message, phone_number, 
         delivery_status, provider, message_id, created_at)
        VALUES (?, ?, 'fee_reminder', ?, ?, ?, ?, ?, NOW())
      `, [
        parent.id, studentId, message, parent.phone,
        smsResult.success ? 'sent' : 'failed',
        smsResult.provider || 'unknown',
        smsResult.messageId || null
      ]);
    }

    return { success: true, results, parentsNotified: results.filter(r => r.success).length };
  } catch (error) {
    console.error('Fee reminder SMS error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send SMS for general school announcements
 */
const sendSchoolAnnouncementSMS = async (studentId, title, message, priority = 'normal') => {
  try {
    // Get student info
    const [[student]] = await pool.execute(
      'SELECT first_name, last_name, student_code, trade_name, level_number FROM global_student_sheets WHERE id = ?',
      [studentId]
    );

    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    // Get all linked parents
    const [parents] = await pool.execute(`
      SELECT DISTINCT u.id, u.phone, u.first_name
      FROM parent_child_links pcl
      JOIN users u ON pcl.parent_id = u.id
      WHERE pcl.student_id = ? AND pcl.status = 'active' AND u.phone IS NOT NULL
    `, [studentId]);

    const results = [];

    for (const parent of parents) {
      const priorityIcon = priority === 'high' ? '🚨' : priority === 'urgent' ? '⚠️' : '📢';
      
      const smsMessage = `🎓 Garden TVET: ${parent.first_name},

${priorityIcon} ${title.toUpperCase()}

${message}

👨👩👧👦 Umwana: ${student.first_name} ${student.last_name} (${student.student_code})

📞 HAMAGARA: +250783407691 niba mufite ibibazo.

Murakoze! 🙏`;

      const smsResult = await sendSMS(parent.phone, smsMessage);
      results.push({ parentId: parent.id, ...smsResult });

      // Log notification
      await pool.execute(`
        INSERT INTO parent_notifications_log 
        (parent_id, student_id, notification_type, message, phone_number, 
         delivery_status, provider, message_id, created_at)
        VALUES (?, ?, 'school_announcement', ?, ?, ?, ?, ?, NOW())
      `, [
        parent.id, studentId, smsMessage, parent.phone,
        smsResult.success ? 'sent' : 'failed',
        smsResult.provider || 'unknown',
        smsResult.messageId || null
      ]);
    }

    return { success: true, results, parentsNotified: results.filter(r => r.success).length };
  } catch (error) {
    console.error('School announcement SMS error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendAttendanceAlertSMS,
  sendGradeUpdateSMS,
  sendFeeReminderSMS,
  sendSchoolAnnouncementSMS
};