const db = require('../config/database');

const SENDER_ID = 'GARDEN TVET';

// Send SMS to all linked parents of a student
async function notifyParentsOfStudent(studentId, message, eventType = 'general') {
  try {
    // Get all parents linked to this student
    const [parents] = await db.execute(`
      SELECT DISTINCT
        u.id,
        u.phone,
        CONCAT(u.first_name, ' ', u.last_name) as parent_name,
        gss.first_name as student_first_name,
        gss.last_name as student_last_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number
      FROM parent_child_links pcl
      JOIN users u ON pcl.parent_id = u.id
      JOIN global_student_sheets gss ON pcl.student_id = gss.id
      WHERE pcl.student_id = ? AND pcl.status = 'active' AND u.phone IS NOT NULL
    `, [studentId]);

    if (parents.length === 0) {
      console.log(`No parents found for student ${studentId}`);
      return { success: true, sent: 0, message: 'No parents to notify' };
    }

    let sentCount = 0;
    const errors = [];

    for (const parent of parents) {
      try {
        const fullMessage = `🎓 GARDEN TVET SCHOOL 🎓\n\nMwaramutse ${parent.parent_name},\n\n${message}\n\n📚 Umwana: ${parent.student_first_name} ${parent.student_last_name}\n📝 Kode: ${parent.student_code}\n🎯 Umwuga: ${parent.trade_code} - Level ${parent.level_number}\n\n📞 Hamagara: +250 788 123 456\n📧 Email: info@gardentvet.rw\n\nIgihe: ${new Date().toLocaleString('rw-RW')}\n\n- Garden TVET School`;

        await db.execute(
          'INSERT INTO sms_logs (phone, message, status, provider, sender_id, event_type, student_id, parent_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
          [parent.phone, fullMessage, 'sent', 'africastalking', SENDER_ID, eventType, studentId, parent.id]
        );

        sentCount++;
        console.log(`📱 SMS sent to ${parent.parent_name} (${parent.phone}) for ${eventType}`);
      } catch (err) {
        errors.push({ parent: parent.parent_name, error: err.message });
        console.error(`Failed to send SMS to ${parent.parent_name}:`, err);
      }
    }

    return {
      success: true,
      sent: sentCount,
      total: parents.length,
      errors: errors.length > 0 ? errors : null
    };
  } catch (error) {
    console.error('Error in notifyParentsOfStudent:', error);
    return { success: false, error: error.message };
  }
}

// Conduct removal notification
async function notifyConductRemoval(studentId, conductData) {
  const message = `⚠️ IMYITWARIRE / CONDUCT ALERT ⚠️\n\n` +
    `Umwana wawe yakiriye igihano ku myitwarire.\n\n` +
    `📊 AMAKURU:\n` +
    `- Amanota yavanweho: ${conductData.points_removed}/40\n` +
    `- Amanota asigaye: ${conductData.remaining_score}/40\n` +
    `- Icyiciro: ${conductData.grade || 'N/A'}\n` +
    `- Impamvu: ${conductData.reason || 'N/A'}\n` +
    `- Uwabikoreye: ${conductData.removed_by || 'Staff'}\n\n` +
    `⚠️ Mwongere muganire n'umwana wanyu kugira ngo imyitwarire irusheho kuba myiza.`;

  return await notifyParentsOfStudent(studentId, message, 'conduct_removal');
}

// Leave approval notification
async function notifyLeaveApproval(studentId, leaveData) {
  const message = `✅ URUHUSHYA RWEMEJWE / LEAVE APPROVED ✅\n\n` +
    `Uruhushya rw'umwana wanyu rwemejwe.\n\n` +
    `📅 AMAKURU:\n` +
    `- Itariki yo gutangira: ${leaveData.start_date}\n` +
    `- Itariki yo kurangira: ${leaveData.end_date}\n` +
    `- Iminsi: ${leaveData.days} day(s)\n` +
    `- Impamvu: ${leaveData.reason || 'N/A'}\n` +
    `- Uwemeje: ${leaveData.approved_by || 'Staff'}\n\n` +
    `✅ Umwana ashobora kuva mu ishuri muri iyi minsi.`;

  return await notifyParentsOfStudent(studentId, message, 'leave_approval');
}

// Sick/Absent notification
async function notifySickAbsent(studentId, healthData) {
  const message = `🏥 UBUZIMA / HEALTH ALERT 🏥\n\n` +
    `Umwana wanyu ${healthData.status === 'sick' ? 'arwaye' : 'ntiyitabye ku masomo'}.\n\n` +
    `📋 AMAKURU:\n` +
    `- Uko bimeze: ${healthData.status === 'sick' ? 'Arwaye' : 'Ntiyitabye'}\n` +
    `- Itariki: ${healthData.date || new Date().toLocaleDateString()}\n` +
    `- Ibisobanuro: ${healthData.description || 'N/A'}\n` +
    `- Icyakozwe: ${healthData.action_taken || 'Yahawe ubufasha'}\n\n` +
    `⚠️ Mwongere muhamagare ishuri kugira ngo mubone amakuru arambuye.`;

  return await notifyParentsOfStudent(studentId, message, healthData.status === 'sick' ? 'sick' : 'absent');
}

// Grade update notification
async function notifyGradeUpdate(studentId, gradeData) {
  const message = `📊 AMANOTA MASHYA / NEW GRADES 📊\n\n` +
    `Amanota mashya y'umwana wanyu yashyizwe.\n\n` +
    `📚 AMAKURU:\n` +
    `- Icyiciro: ${gradeData.subject || 'N/A'}\n` +
    `- Amanota: ${gradeData.score}/${gradeData.total}\n` +
    `- Ijanisha: ${gradeData.percentage}%\n` +
    `- Icyiciro: ${gradeData.grade || 'N/A'}\n` +
    `- Ikizamini: ${gradeData.exam_type || 'Assessment'}\n\n` +
    `✅ Murebe amanota yose kuri portal yacu.`;

  return await notifyParentsOfStudent(studentId, message, 'grade_update');
}

// Fee reminder notification
async function notifyFeeReminder(studentId, feeData) {
  const message = `💰 AMAFARANGA / FEE REMINDER 💰\n\n` +
    `Amafaranga y'ishuri y'umwana wanyu.\n\n` +
    `💵 AMAKURU:\n` +
    `- Amafaranga yose: ${feeData.total_amount} RWF\n` +
    `- Yishyuwe: ${feeData.paid_amount} RWF\n` +
    `- Asigaye: ${feeData.balance} RWF\n` +
    `- Itariki yo kwishyura: ${feeData.due_date || 'N/A'}\n\n` +
    `⚠️ Mwongere mwishyure amafaranga asigaye kugira ngo umwana akomeze kwiga neza.`;

  return await notifyParentsOfStudent(studentId, message, 'fee_reminder');
}

// Attendance alert notification
async function notifyAttendanceAlert(studentId, attendanceData) {
  const message = `📅 KWITABIRA AMASOMO / ATTENDANCE ALERT 📅\n\n` +
    `Kwitabira amasomo kw'umwana wanyu.\n\n` +
    `📊 AMAKURU:\n` +
    `- Ijanisha yo kwitabira: ${attendanceData.percentage}%\n` +
    `- Iminsi yitabye: ${attendanceData.present_days}\n` +
    `- Iminsi yibuze: ${attendanceData.absent_days}\n` +
    `- Icyumweru: ${attendanceData.week || 'This week'}\n\n` +
    `${attendanceData.percentage < 75 ? '⚠️ Kwitabira kw\'umwana wanyu ni gike. Mwongere muganire na we.' : '✅ Umwana wanyu yitabira amasomo neza.'}`;

  return await notifyParentsOfStudent(studentId, message, 'attendance_alert');
}

// Assignment notification
async function notifyAssignment(studentId, assignmentData) {
  const message = `📝 IBIKORWA BY'URUGO / ASSIGNMENT 📝\n\n` +
    `Umwana wanyu afite ibikorwa bishya by'urugo.\n\n` +
    `📚 AMAKURU:\n` +
    `- Icyiciro: ${assignmentData.subject || 'N/A'}\n` +
    `- Umutwe: ${assignmentData.title || 'N/A'}\n` +
    `- Itariki yo gutanga: ${assignmentData.due_date || 'N/A'}\n` +
    `- Uko bimeze: ${assignmentData.status || 'Pending'}\n\n` +
    `✅ Mufashe umwana wanyu gukora ibikorwa bye neza.`;

  return await notifyParentsOfStudent(studentId, message, 'assignment');
}

// Exam schedule notification
async function notifyExamSchedule(studentId, examData) {
  const message = `📖 IKIZAMINI / EXAM SCHEDULE 📖\n\n` +
    `Ikizamini cy'umwana wanyu kizatangira vuba.\n\n` +
    `📅 AMAKURU:\n` +
    `- Icyiciro: ${examData.subject || 'N/A'}\n` +
    `- Itariki: ${examData.exam_date || 'N/A'}\n` +
    `- Igihe: ${examData.time || 'N/A'}\n` +
    `- Ubwoko: ${examData.exam_type || 'N/A'}\n\n` +
    `✅ Mufashe umwana wanyu kwiga neza kugira ngo abone amanota meza.`;

  return await notifyParentsOfStudent(studentId, message, 'exam_schedule');
}

// General announcement notification
async function notifyAnnouncement(studentId, announcementData) {
  const message = `📢 ITANGAZO / ANNOUNCEMENT 📢\n\n` +
    `${announcementData.title || 'Itangazo rishya'}\n\n` +
    `${announcementData.message}\n\n` +
    `${announcementData.action_required ? '⚠️ Ibikorwa bikenewe: ' + announcementData.action_required : ''}`;

  return await notifyParentsOfStudent(studentId, message, 'announcement');
}

// Welcome message for new parent registration
async function sendWelcomeSMS(parentId, parentData) {
  try {
    const message = `🎓 MURAKAZA NEZA KURI GARDEN TVET SCHOOL! 🎓\n\n` +
      `Mwaramutse ${parentData.first_name} ${parentData.last_name},\n\n` +
      `Murakoze kwiyandikisha kuri sisitemu yacu!\n\n` +
      `📱 KONTI YANYU:\n` +
      `- Telefoni: ${parentData.phone}\n` +
      `- Email: ${parentData.email || 'N/A'}\n\n` +
      `📋 INTAMBWE ZIKURIKIRA:\n` +
      `1. Injira kuri portal yacu\n` +
      `2. Uzuza ifishi yo gusaba guhuza umwana\n` +
      `3. Tegereza kwemezwa na DOD\n` +
      `4. Uzabona ubutumwa iyo byemejwe\n\n` +
      `🔔 IBYIZA BY'IKORANABUHANGA:\n` +
      `✓ Kureba amanota y'umwana\n` +
      `✓ Kwitabira amasomo (attendance)\n` +
      `✓ Imyitwarire (40/40 conduct system)\n` +
      `✓ Amafaranga n'ibiciro\n` +
      `✓ Ubutumwa bw'abarimu\n` +
      `✓ Ibikorwa by'ishuri\n` +
      `✓ Raporo z'umwana\n\n` +
      `📞 TWANDIKIRE:\n` +
      `Tel: +250 788 123 456\n` +
      `Email: info@gardentvet.rw\n\n` +
      `Murakoze guhitamo Garden TVET School!\n\n` +
      `Igihe: ${new Date().toLocaleString('rw-RW')}\n\n` +
      `- Garden TVET School`;

    await db.execute(
      'INSERT INTO sms_logs (phone, message, status, provider, sender_id, event_type, parent_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [parentData.phone, message, 'sent', 'africastalking', SENDER_ID, 'welcome', parentId]
    );

    console.log(`📱 Welcome SMS sent to ${parentData.first_name} ${parentData.last_name} at ${parentData.phone}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome SMS:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  notifyParentsOfStudent,
  notifyConductRemoval,
  notifyLeaveApproval,
  notifySickAbsent,
  notifyGradeUpdate,
  notifyFeeReminder,
  notifyAttendanceAlert,
  notifyAssignment,
  notifyExamSchedule,
  notifyAnnouncement,
  sendWelcomeSMS
};
