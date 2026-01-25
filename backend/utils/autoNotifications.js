const pool = require('../config/database');

// Auto-send notification on any data change
const sendAutoNotification = async (eventType, data) => {
  try {
    const notifications = [];
    
    switch (eventType) {
      case 'STUDENT_ENROLLED':
        notifications.push(...await notifyStudentEnrollment(data));
        break;
      case 'GRADE_UPDATED':
        notifications.push(...await notifyGradeUpdate(data));
        break;
      case 'ATTENDANCE_MARKED':
        notifications.push(...await notifyAttendance(data));
        break;
      case 'CONDUCT_REMOVED':
        notifications.push(...await notifyConductRemoval(data));
        break;
      case 'LEAVE_APPROVED':
        notifications.push(...await notifyLeaveApproval(data));
        break;
      case 'EXAM_SCHEDULED':
        notifications.push(...await notifyExamSchedule(data));
        break;
      case 'ASSIGNMENT_POSTED':
        notifications.push(...await notifyAssignment(data));
        break;
      case 'FEE_PAYMENT':
        notifications.push(...await notifyFeePayment(data));
        break;
      case 'ANNOUNCEMENT':
        notifications.push(...await notifyAnnouncement(data));
        break;
      case 'MEETING_SCHEDULED':
        notifications.push(...await notifyMeeting(data));
        break;
      case 'REPORT_CARD':
        notifications.push(...await notifyReportCard(data));
        break;
      case 'HOMEWORK_ASSIGNED':
        notifications.push(...await notifyHomework(data));
        break;
      case 'EVENT_CREATED':
        notifications.push(...await notifyEvent(data));
        break;
      case 'STOCK_LOW':
        notifications.push(...await notifyStockAlert(data));
        break;
      case 'USER_CREATED':
        notifications.push(...await notifyUserCreation(data));
        break;
    }
    
    // Send all notifications
    for (const notif of notifications) {
      await sendNotification(notif);
    }
    
    return { success: true, count: notifications.length };
  } catch (error) {
    console.error('Auto-notification error:', error);
    return { success: false, error: error.message };
  }
};

// Student enrollment notification
const notifyStudentEnrollment = async (data) => {
  const { studentId, studentName, className, parentIds } = data;
  const notifications = [];
  
  // Notify parents
  for (const parentId of parentIds || []) {
    notifications.push({
      userId: parentId,
      type: 'enrollment',
      title: 'Kwandikisha Umwana',
      message: `${studentName} yanditswe mu ishuri muri ${className}`,
      priority: 'high',
      link: `/students/${studentId}`
    });
  }
  
  // Notify admin & headmaster
  const [admins] = await pool.execute(`SELECT id FROM users WHERE role IN ('admin', 'headmaster') AND is_active = true`);
  for (const admin of admins) {
    notifications.push({
      userId: admin.id,
      type: 'enrollment',
      title: 'Umunyeshuri Mushya',
      message: `${studentName} yanditswe mu ${className}`,
      priority: 'normal',
      link: `/students/${studentId}`
    });
  }
  
  return notifications;
};

// Grade update notification
const notifyGradeUpdate = async (data) => {
  const { studentId, studentName, subject, grade, teacherName, parentIds } = data;
  const notifications = [];
  
  // Notify parents
  for (const parentId of parentIds || []) {
    notifications.push({
      userId: parentId,
      type: 'grade',
      title: 'Amanota Mashya',
      message: `${studentName} yahawe ${grade} muri ${subject} na ${teacherName}`,
      priority: 'high',
      link: `/grades/${studentId}`
    });
  }
  
  // Notify student
  notifications.push({
    userId: studentId,
    type: 'grade',
    title: 'Amanota Yawe',
    message: `Wahawe ${grade} muri ${subject}`,
    priority: 'high',
    link: `/my-grades`
  });
  
  return notifications;
};

// Attendance notification
const notifyAttendance = async (data) => {
  const { studentId, studentName, status, date, parentIds } = data;
  const notifications = [];
  
  if (status === 'absent' || status === 'late') {
    // Notify parents only for absences/late
    for (const parentId of parentIds || []) {
      notifications.push({
        userId: parentId,
        type: 'attendance',
        title: status === 'absent' ? 'Kuba Atahari' : 'Gutinda',
        message: `${studentName} ${status === 'absent' ? 'ntiyahari' : 'yatinze'} ku wa ${date}`,
        priority: 'urgent',
        link: `/attendance/${studentId}`
      });
    }
  }
  
  return notifications;
};

// Conduct removal notification
const notifyConductRemoval = async (data) => {
  const { studentId, studentName, reason, points, parentIds } = data;
  const notifications = [];
  
  // Notify parents
  for (const parentId of parentIds || []) {
    notifications.push({
      userId: parentId,
      type: 'discipline',
      title: 'Imyitwarire Yakuweho',
      message: `${studentName} yakuweho amanota ${points} kubera ${reason}`,
      priority: 'urgent',
      link: `/discipline/${studentId}`
    });
  }
  
  // Notify student
  notifications.push({
    userId: studentId,
    type: 'discipline',
    title: 'Imyitwarire',
    message: `Wakuweho amanota ${points} kubera ${reason}`,
    priority: 'urgent',
    link: `/my-conduct`
  });
  
  // Notify DOD & Patron
  const [staff] = await pool.execute(`SELECT id FROM users WHERE role IN ('dod', 'patron') AND is_active = true`);
  for (const member of staff) {
    notifications.push({
      userId: member.id,
      type: 'discipline',
      title: 'Imyitwarire Yakuweho',
      message: `${studentName} yakuweho amanota ${points}`,
      priority: 'normal',
      link: `/discipline/${studentId}`
    });
  }
  
  return notifications;
};

// Leave approval notification
const notifyLeaveApproval = async (data) => {
  const { studentId, studentName, leaveType, startDate, endDate, status, parentIds } = data;
  const notifications = [];
  
  // Notify parents
  for (const parentId of parentIds || []) {
    notifications.push({
      userId: parentId,
      type: 'leave',
      title: status === 'approved' ? 'Uruhushya Rwemewe' : 'Uruhushya Rwanze',
      message: `Uruhushya rwa ${studentName} (${leaveType}) ${status === 'approved' ? 'rwemewe' : 'rwanze'} kuva ${startDate} kugeza ${endDate}`,
      priority: 'high',
      link: `/leaves/${studentId}`
    });
  }
  
  // Notify student
  notifications.push({
    userId: studentId,
    type: 'leave',
    title: status === 'approved' ? 'Uruhushya Rwemewe' : 'Uruhushya Rwanze',
    message: `Uruhushya rwawe ${status === 'approved' ? 'rwemewe' : 'rwanze'}`,
    priority: 'high',
    link: `/my-leaves`
  });
  
  return notifications;
};

// Exam schedule notification
const notifyExamSchedule = async (data) => {
  const { examName, subject, date, time, classIds } = data;
  const notifications = [];
  
  // Get all students in classes
  const [students] = await pool.execute(`
    SELECT DISTINCT u.id, u.name FROM users u
    WHERE u.role = 'student' AND u.class_id IN (${classIds.map(() => '?').join(',')}) AND u.is_active = true
  `, classIds);
  
  for (const student of students) {
    notifications.push({
      userId: student.id,
      type: 'exam',
      title: 'Ikizamini Gishya',
      message: `${examName} - ${subject} ku wa ${date} saa ${time}`,
      priority: 'high',
      link: `/exams`
    });
  }
  
  // Notify parents
  const [parents] = await pool.execute(`
    SELECT DISTINCT p.id FROM users p
    INNER JOIN student_parents sp ON p.id = sp.parent_id
    INNER JOIN users s ON sp.student_id = s.id
    WHERE s.class_id IN (${classIds.map(() => '?').join(',')}) AND p.is_active = true
  `, classIds);
  
  for (const parent of parents) {
    notifications.push({
      userId: parent.id,
      type: 'exam',
      title: 'Ikizamini Gishya',
      message: `${examName} - ${subject} ku wa ${date}`,
      priority: 'high',
      link: `/exams`
    });
  }
  
  return notifications;
};

// Assignment notification
const notifyAssignment = async (data) => {
  const { assignmentName, subject, dueDate, teacherName, classIds } = data;
  const notifications = [];
  
  // Get all students in classes
  const [students] = await pool.execute(`
    SELECT id FROM users WHERE role = 'student' AND class_id IN (${classIds.map(() => '?').join(',')}) AND is_active = true
  `, classIds);
  
  for (const student of students) {
    notifications.push({
      userId: student.id,
      type: 'assignment',
      title: 'Igikorwa Gishya',
      message: `${assignmentName} - ${subject} na ${teacherName}. Itariki: ${dueDate}`,
      priority: 'normal',
      link: `/assignments`
    });
  }
  
  return notifications;
};

// Fee payment notification
const notifyFeePayment = async (data) => {
  const { studentId, studentName, amount, paymentType, parentIds } = data;
  const notifications = [];
  
  // Notify parents
  for (const parentId of parentIds || []) {
    notifications.push({
      userId: parentId,
      type: 'payment',
      title: 'Kwishyura Byemejwe',
      message: `Kwishyura ${amount} RWF kwa ${studentName} (${paymentType}) byemejwe`,
      priority: 'high',
      link: `/payments/${studentId}`
    });
  }
  
  // Notify accountant
  const [accountants] = await pool.execute(`SELECT id FROM users WHERE role = 'accountant' AND is_active = true`);
  for (const acc of accountants) {
    notifications.push({
      userId: acc.id,
      type: 'payment',
      title: 'Kwishyura Gushya',
      message: `${studentName} yishyuye ${amount} RWF (${paymentType})`,
      priority: 'normal',
      link: `/payments/${studentId}`
    });
  }
  
  return notifications;
};

// Announcement notification
const notifyAnnouncement = async (data) => {
  const { title, message, targetRoles, priority } = data;
  const notifications = [];
  
  const [users] = await pool.execute(`
    SELECT id FROM users WHERE role IN (${targetRoles.map(() => '?').join(',')}) AND is_active = true
  `, targetRoles);
  
  for (const user of users) {
    notifications.push({
      userId: user.id,
      type: 'announcement',
      title: title,
      message: message,
      priority: priority || 'normal',
      link: `/announcements`
    });
  }
  
  return notifications;
};

// Meeting notification
const notifyMeeting = async (data) => {
  const { meetingTitle, date, time, location, attendeeIds } = data;
  const notifications = [];
  
  for (const userId of attendeeIds || []) {
    notifications.push({
      userId: userId,
      type: 'meeting',
      title: 'Inama Ishya',
      message: `${meetingTitle} ku wa ${date} saa ${time} i ${location}`,
      priority: 'high',
      link: `/meetings`
    });
  }
  
  return notifications;
};

// Report card notification
const notifyReportCard = async (data) => {
  const { studentId, studentName, term, year, parentIds } = data;
  const notifications = [];
  
  // Notify parents
  for (const parentId of parentIds || []) {
    notifications.push({
      userId: parentId,
      type: 'report',
      title: 'Raporo y\'Amanota',
      message: `Raporo y'amanota ya ${studentName} (${term} ${year}) irahari`,
      priority: 'high',
      link: `/reports/${studentId}`
    });
  }
  
  // Notify student
  notifications.push({
    userId: studentId,
    type: 'report',
    title: 'Raporo Yawe',
    message: `Raporo yawe (${term} ${year}) irahari`,
    priority: 'high',
    link: `/my-report`
  });
  
  return notifications;
};

// Homework notification
const notifyHomework = async (data) => {
  const { homeworkTitle, subject, dueDate, classIds } = data;
  const notifications = [];
  
  const [students] = await pool.execute(`
    SELECT id FROM users WHERE role = 'student' AND class_id IN (${classIds.map(() => '?').join(',')}) AND is_active = true
  `, classIds);
  
  for (const student of students) {
    notifications.push({
      userId: student.id,
      type: 'homework',
      title: 'Igikorwa cyo Mu Rugo',
      message: `${homeworkTitle} - ${subject}. Itariki: ${dueDate}`,
      priority: 'normal',
      link: `/homework`
    });
  }
  
  return notifications;
};

// Event notification
const notifyEvent = async (data) => {
  const { eventName, date, time, location, targetRoles } = data;
  const notifications = [];
  
  const [users] = await pool.execute(`
    SELECT id FROM users WHERE role IN (${targetRoles.map(() => '?').join(',')}) AND is_active = true
  `, targetRoles);
  
  for (const user of users) {
    notifications.push({
      userId: user.id,
      type: 'event',
      title: 'Ibirori Bishya',
      message: `${eventName} ku wa ${date} saa ${time} i ${location}`,
      priority: 'normal',
      link: `/events`
    });
  }
  
  return notifications;
};

// Stock alert notification
const notifyStockAlert = async (data) => {
  const { itemName, currentStock, minStock } = data;
  const notifications = [];
  
  const [managers] = await pool.execute(`
    SELECT id FROM users WHERE role IN ('stock_manager', 'admin', 'headmaster') AND is_active = true
  `);
  
  for (const manager of managers) {
    notifications.push({
      userId: manager.id,
      type: 'stock',
      title: 'Ibikoresho Birangiye',
      message: `${itemName} birangiye (${currentStock}/${minStock})`,
      priority: 'urgent',
      link: `/stock`
    });
  }
  
  return notifications;
};

// User creation notification
const notifyUserCreation = async (data) => {
  const { userId, userName, role, email } = data;
  const notifications = [];
  
  // Notify new user
  notifications.push({
    userId: userId,
    type: 'account',
    title: 'Konti Yawe Yarakozwe',
    message: `Murakaza neza ${userName}! Konti yawe (${role}) yarakozwe. Email: ${email}`,
    priority: 'high',
    link: `/profile`
  });
  
  // Notify admin
  const [admins] = await pool.execute(`SELECT id FROM users WHERE role = 'admin' AND is_active = true`);
  for (const admin of admins) {
    notifications.push({
      userId: admin.id,
      type: 'account',
      title: 'Umukoresha Mushya',
      message: `${userName} (${role}) yarakozwe`,
      priority: 'normal',
      link: `/users/${userId}`
    });
  }
  
  return notifications;
};

// Send notification to database
const sendNotification = async (notif) => {
  try {
    // Insert into notifications table
    await pool.execute(`
      INSERT INTO notifications (user_id, type, title, message, priority, link, is_read)
      VALUES (?, ?, ?, ?, ?, ?, false)
    `, [notif.userId, notif.type, notif.title, notif.message, notif.priority, notif.link || null]);
    
    // Also insert into messages table for inbox
    await pool.execute(`
      INSERT INTO messages 
      (sender_id, sender_name, sender_role, recipient_id, subject, message, priority, status, is_read)
      VALUES (1, 'Sistema', 'system', ?, ?, ?, ?, 'sent', false)
    `, [notif.userId, notif.title, notif.message, notif.priority]);
    
    return { success: true };
  } catch (error) {
    console.error('Send notification error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendAutoNotification,
  notifyStudentEnrollment,
  notifyGradeUpdate,
  notifyAttendance,
  notifyConductRemoval,
  notifyLeaveApproval,
  notifyExamSchedule,
  notifyAssignment,
  notifyFeePayment,
  notifyAnnouncement,
  notifyMeeting,
  notifyReportCard,
  notifyHomework,
  notifyEvent,
  notifyStockAlert,
  notifyUserCreation
};
