// ═══════════════════════════════════════════════════════════════════════════
// PARENT NOTIFICATION SERVICE - COMPREHENSIVE SMS SYSTEM
// ═══════════════════════════════════════════════════════════════════════════
// Features:
// 1. Rich SMS notifications for all parent-child interactions
// 2. Multiple SMS providers (Twilio, Africa's Talking, HTTP Gateway)
// 3. Automatic fallback and retry mechanisms
// 4. Complete audit trail and logging
// 5. Kinyarwanda language support
// ═══════════════════════════════════════════════════════════════════════════

const { pool } = require('../config/database');
const { sendSMS, sendParentWelcomeSMS, sendAutoLinkSuccessSMS } = require('../utils/smsService');

/**
 * Send SMS when parent registers/creates account
 */
const sendParentRegistrationSMS = async (parentId) => {
  try {
    const [[parent]] = await pool.execute(
      'SELECT phone, first_name, last_name FROM users WHERE id = ?',
      [parentId]
    );

    if (!parent || !parent.phone) {
      return { success: false, error: 'Missing parent phone' };
    }

    // Send welcome SMS
    const smsResult = await sendParentWelcomeSMS(parent.phone, parent.first_name);

    // Log notification
    await pool.execute(`
      INSERT INTO parent_notifications_log 
      (parent_id, notification_type, message, phone_number, 
       delivery_status, provider, message_id, created_at)
      VALUES (?, 'registration_welcome', ?, ?, ?, ?, ?, NOW())
    `, [
      parentId, 
      `Welcome message sent to ${parent.first_name}`,
      parent.phone,
      smsResult.success ? 'sent' : 'failed',
      smsResult.provider || 'unknown',
      smsResult.messageId || null
    ]);

    return smsResult;
  } catch (error) {
    console.error('Parent registration SMS error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send SMS when parent gets automatically linked to student
 */
const sendAutoLinkNotificationSMS = async (parentId, studentId) => {
  try {
    // Get parent and student info
    const [[parent]] = await pool.execute(
      'SELECT phone, first_name, last_name FROM users WHERE id = ?',
      [parentId]
    );
    
    const [[student]] = await pool.execute(
      'SELECT first_name, last_name, student_code, trade_name, level_number FROM global_student_sheets WHERE id = ?',
      [studentId]
    );

    if (!parent || !parent.phone || !student) {
      return { success: false, error: 'Missing contact information' };
    }

    // Send auto-link success SMS
    const smsResult = await sendAutoLinkSuccessSMS(
      parent.phone, 
      parent.first_name, 
      `${student.first_name} ${student.last_name}`,
      student.student_code,
      student.trade_name,
      student.level_number
    );

    // Log notification
    await pool.execute(`
      INSERT INTO parent_notifications_log 
      (parent_id, student_id, notification_type, message, phone_number, 
       delivery_status, provider, message_id, created_at)
      VALUES (?, ?, 'auto_link_success', ?, ?, ?, ?, ?, NOW())
    `, [
      parentId, studentId,
      `Auto-link success: ${student.first_name} ${student.last_name}`,
      parent.phone,
      smsResult.success ? 'sent' : 'failed',
      smsResult.provider || 'unknown',
      smsResult.messageId || null
    ]);

    return smsResult;
  } catch (error) {
    console.error('Auto link notification SMS error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send SMS when parent-child link is approved
 */
const sendLinkApprovalSMS = async (parentId, studentId, applicationId) => {
  try {
    // Get parent and student info
    const [[parent]] = await pool.execute(
      'SELECT phone, first_name, last_name FROM users WHERE id = ?',
      [parentId]
    );
    
    const [[student]] = await pool.execute(
      'SELECT first_name, last_name, student_code, trade_name, level_number FROM global_student_sheets WHERE id = ?',
      [studentId]
    );

    if (!parent || !parent.phone || !student) {
      console.log('⚠️ Missing parent phone or student info for SMS');
      return { success: false, error: 'Missing contact information' };
    }

    // Create rich SMS message
    const message = `🎓 Garden TVET: Murakaza neza ${parent.first_name}!

✅ BYEMEJWE: Icyifuzo cyo guhuza umwana ${student.first_name} ${student.last_name} cyemejwe!

📋 Amakuru y'umwana:
• Amazina: ${student.first_name} ${student.last_name}
• Kode: ${student.student_code || 'ID-' + studentId}
• Umwuga: ${student.trade_name || 'N/A'}
• Urwego: ${student.level_number || 'N/A'}

🔍 Ubu mwashobora kureba:
• Amanota n'ibizamini
• Kwiga no kutabara
• Imyitwarire (conduct)
• Amafaranga (fees)
• Ubutumwa bw'ishuri

📱 Mwinjire muri sisitemu yacu kugira ngo mubone amakuru yose!

Murakoze kubana natwe! 🙏`;

    // Send SMS
    const smsResult = await sendSMS(parent.phone, message);

    // Log notification
    await pool.execute(`
      INSERT INTO parent_notifications_log 
      (parent_id, student_id, notification_type, message, phone_number, 
       delivery_status, provider, message_id, application_id, created_at)
      VALUES (?, ?, 'link_approved', ?, ?, ?, ?, ?, ?, NOW())
    `, [
      parentId, studentId, message, parent.phone,
      smsResult.success ? 'sent' : 'failed',
      smsResult.provider || 'unknown',
      smsResult.messageId || null,
      applicationId
    ]);

    return smsResult;
  } catch (error) {
    console.error('Link approval SMS error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send SMS when parent manually linked to student
 */
const sendManualLinkSMS = async (parentId, studentId, isNewParent = false) => {
  try {
    // Get parent and student info
    const [[parent]] = await pool.execute(
      'SELECT phone, first_name, last_name FROM users WHERE id = ?',
      [parentId]
    );
    
    const [[student]] = await pool.execute(
      'SELECT first_name, last_name, student_code, trade_name, level_number FROM global_student_sheets WHERE id = ?',
      [studentId]
    );

    if (!parent || !parent.phone || !student) {
      return { success: false, error: 'Missing contact information' };
    }

    // Create message based on whether parent is new or existing
    const message = isNewParent 
      ? `🎓 Garden TVET: Murakaza neza ${parent.first_name}!

🆕 KONTI NSHYA: Konti yanyu yashyizweho neza!

👨‍👩‍👧‍👦 MWAHUYE N'UMWANA:
• Amazina: ${student.first_name} ${student.last_name}
• Kode: ${student.student_code || 'ID-' + studentId}
• Umwuga: ${student.trade_name || 'N/A'}
• Urwego: ${student.level_number || 'N/A'}

🔍 Mwashobora kureba:
• Amanota n'ibizamini
• Kwiga no kutabara  
• Imyitwarire (conduct)
• Amafaranga (fees)
• Ubutumwa bw'ishuri

📱 Mwinjire muri sisitemu yacu kugira ngo mubone amakuru yose!

Murakoze kubana natwe! 🙏`
      : `🎓 Garden TVET: Murakaza neza ${parent.first_name}!

✅ MWAHUYE N'UMWANA MUSHYA:
• Amazina: ${student.first_name} ${student.last_name}
• Kode: ${student.student_code || 'ID-' + studentId}
• Umwuga: ${student.trade_name || 'N/A'}
• Urwego: ${student.level_number || 'N/A'}

🔍 Ubu mwashobora kureba amakuru yabo yose: amanota, kwiga, imyitwarire, amafaranga n'ibindi.

📱 Mwinjire muri sisitemu yacu!

Murakoze! 🙏`;

    // Send SMS
    const smsResult = await sendSMS(parent.phone, message);

    // Log notification
    await pool.execute(`
      INSERT INTO parent_notifications_log 
      (parent_id, student_id, notification_type, message, phone_number, 
       delivery_status, provider, message_id, created_at)
      VALUES (?, ?, 'manual_link', ?, ?, ?, ?, ?, NOW())
    `, [
      parentId, studentId, message, parent.phone,
      smsResult.success ? 'sent' : 'failed',
      smsResult.provider || 'unknown',
      smsResult.messageId || null
    ]);

    return smsResult;
  } catch (error) {
    console.error('Manual link SMS error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send SMS when application is submitted
 */
const sendApplicationSubmittedSMS = async (parentId, childName, applicationId) => {
  try {
    const [[parent]] = await pool.execute(
      'SELECT phone, first_name FROM users WHERE id = ?',
      [parentId]
    );

    if (!parent || !parent.phone) {
      return { success: false, error: 'Missing parent phone' };
    }

    const message = `🎓 Garden TVET: Murakoze ${parent.first_name}!

📝 ICYIFUZO CYOHEREJWE: Icyifuzo cyo guhuza umwana ${childName} cyoherejwe neza.

⏳ TEGEREZA: Abakozi b'ishuri bazasuzuma icyifuzo cyanyu hanyuma bakabamenyesha.

📱 Muzabona ubutumwa bw'inyemezwa vuba.

Murakoze guhitamo Garden TVET! 🙏`;

    const smsResult = await sendSMS(parent.phone, message);

    // Log notification
    await pool.execute(`
      INSERT INTO parent_notifications_log 
      (parent_id, notification_type, message, phone_number, 
       delivery_status, provider, message_id, application_id, created_at)
      VALUES (?, 'application_submitted', ?, ?, ?, ?, ?, ?, NOW())
    `, [
      parentId, message, parent.phone,
      smsResult.success ? 'sent' : 'failed',
      smsResult.provider || 'unknown',
      smsResult.messageId || null,
      applicationId
    ]);

    return smsResult;
  } catch (error) {
    console.error('Application submitted SMS error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send SMS when application is rejected
 */
const sendApplicationRejectedSMS = async (parentId, childName, rejectionReason, applicationId) => {
  try {
    const [[parent]] = await pool.execute(
      'SELECT phone, first_name FROM users WHERE id = ?',
      [parentId]
    );

    if (!parent || !parent.phone) {
      return { success: false, error: 'Missing parent phone' };
    }

    const message = `🎓 Garden TVET: ${parent.first_name},

❌ ICYIFUZO CYANZE: Icyifuzo cyo guhuza umwana ${childName} cyanze.

📋 IMPAMVU: ${rejectionReason}

🔄 ONGERA UGERAGEZE: Mwashobora kongera gusaba nyuma yo gukosora ibibazo byavuzwe.

📞 HAMAGARA: Muhamagare ishuri kuri +250783407691 kugira ngo mubonane n'abakozi.

Murakoze! 🙏`;

    const smsResult = await sendSMS(parent.phone, message);

    // Log notification
    await pool.execute(`
      INSERT INTO parent_notifications_log 
      (parent_id, notification_type, message, phone_number, 
       delivery_status, provider, message_id, application_id, created_at)
      VALUES (?, 'application_rejected', ?, ?, ?, ?, ?, ?, NOW())
    `, [
      parentId, message, parent.phone,
      smsResult.success ? 'sent' : 'failed',
      smsResult.provider || 'unknown',
      smsResult.messageId || null,
      applicationId
    ]);

    return smsResult;
  } catch (error) {
    console.error('Application rejected SMS error:', error);
    return { success: false, error: error.message };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CONDUCT & DISCIPLINE NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Send SMS when conduct is removed
 */
const sendConductRemovalSMS = async (studentId, conductType, pointsDeducted, newScore, description) => {
  try {
    // Get student info
    const [[student]] = await pool.execute(
      'SELECT first_name, last_name FROM global_student_sheets WHERE id = ?',
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

⚠️ IGIHANO: Umwana ${student.first_name} ${student.last_name} yakiriye igihano.

📋 AMAKURU:
• Ubwoko: ${conductType}
• Amanota yakuweho: ${pointsDeducted}
• Amanota ashya: ${newScore}/40
• Impamvu: ${description}

👨‍👩‍👧‍👦 MUFASHE UMWANA: Muganire n'umwana mwanyu mukamwigisha imyitwarire myiza.

📞 HAMAGARA: +250783407691 niba mufite ibibazo.

Murakoze! 🙏`;

      const smsResult = await sendSMS(parent.phone, message);
      results.push({ parentId: parent.id, ...smsResult });

      // Log notification
      await pool.execute(`
        INSERT INTO parent_notifications_log 
        (parent_id, student_id, notification_type, message, phone_number, 
         delivery_status, provider, message_id, created_at)
        VALUES (?, ?, 'conduct_removal', ?, ?, ?, ?, ?, NOW())
      `, [
        parent.id, studentId, message, parent.phone,
        smsResult.success ? 'sent' : 'failed',
        smsResult.provider || 'unknown',
        smsResult.messageId || null
      ]);
    }

    return { success: true, results, parentsNotified: results.filter(r => r.success).length };
  } catch (error) {
    console.error('Conduct removal SMS error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send SMS when leave is approved
 */
const sendLeaveApprovalSMS = async (studentId, leaveType, reason, startTime, endTime, approvedBy) => {
  try {
    // Get student info
    const [[student]] = await pool.execute(
      'SELECT first_name, last_name FROM global_student_sheets WHERE id = ?',
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

✅ URUHUSHYA: Umwana ${student.first_name} ${student.last_name} yemerewe gusohoka.

📋 AMAKURU:
• Ubwoko: ${leaveType}
• Impamvu: ${reason}
• Igihe: ${startTime}${endTime && endTime !== startTime ? ' - ' + endTime : ''}
• Byemejwe na: ${approvedBy}

⚠️ MWIRINDE: Mwirinde umwana mwanyu akagera mu nzira nziza.

📞 HAMAGARA: +250783407691 niba mufite ibibazo.

Murakoze! 🙏`;

      const smsResult = await sendSMS(parent.phone, message);
      results.push({ parentId: parent.id, ...smsResult });

      // Log notification
      await pool.execute(`
        INSERT INTO parent_notifications_log 
        (parent_id, student_id, notification_type, message, phone_number, 
         delivery_status, provider, message_id, created_at)
        VALUES (?, ?, 'leave_approval', ?, ?, ?, ?, ?, NOW())
      `, [
        parent.id, studentId, message, parent.phone,
        smsResult.success ? 'sent' : 'failed',
        smsResult.provider || 'unknown',
        smsResult.messageId || null
      ]);
    }

    return { success: true, results, parentsNotified: results.filter(r => r.success).length };
  } catch (error) {
    console.error('Leave approval SMS error:', error);
    return { success: false, error: error.message };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get SMS notification statistics
 */
const getSMSStats = async () => {
  try {
    const [[stats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_notifications,
        SUM(CASE WHEN delivery_status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN delivery_status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN delivery_status = 'pending' THEN 1 ELSE 0 END) as pending,
        COUNT(DISTINCT parent_id) as unique_parents,
        COUNT(DISTINCT student_id) as unique_students
      FROM parent_notifications_log
      WHERE DATE(created_at) = CURDATE()
    `);

    return { success: true, stats };
  } catch (error) {
    console.error('SMS stats error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Retry failed SMS notifications
 */
const retryFailedSMS = async (limit = 10) => {
  try {
    const [failedNotifications] = await pool.execute(`
      SELECT * FROM parent_notifications_log 
      WHERE delivery_status = 'failed' 
      AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY created_at DESC 
      LIMIT ?
    `, [limit]);

    const results = [];

    for (const notification of failedNotifications) {
      const smsResult = await sendSMS(notification.phone_number, notification.message);
      
      if (smsResult.success) {
        await pool.execute(`
          UPDATE parent_notifications_log 
          SET delivery_status = 'sent', provider = ?, message_id = ?, updated_at = NOW()
          WHERE id = ?
        `, [smsResult.provider, smsResult.messageId, notification.id]);
      }

      results.push({ notificationId: notification.id, ...smsResult });
    }

    return { success: true, results, retried: results.length };
  } catch (error) {
    console.error('Retry failed SMS error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendLinkApprovalSMS,
  sendManualLinkSMS,
  sendApplicationSubmittedSMS,
  sendApplicationRejectedSMS,
  sendConductRemovalSMS,
  sendLeaveApprovalSMS,
  sendParentRegistrationSMS,
  sendAutoLinkNotificationSMS,
  getSMSStats,
  retryFailedSMS
};