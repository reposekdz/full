const cron = require('node-cron');
const { pool } = require('../config/database');

// Email Configuration (optional)
let emailTransporter = null;
try {
  const nodemailer = require('nodemailer');
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
} catch (error) {
  console.log('⚠️  Email service not configured');
}

// SMS Service (optional)
let sendSMSFunc = null;
try {
  const smsService = require('./smsService');
  sendSMSFunc = smsService.sendSMS;
} catch (error) {
  console.log('⚠️  SMS service not configured');
}

// Daily Reminder: Attendance (8:00 AM)
cron.schedule('0 8 * * 1-5', async () => {
  console.log('Running daily attendance reminder...');
  try {
    const [teachers] = await pool.query(
      'SELECT id, first_name, last_name, phone, email FROM users WHERE role = "teacher"'
    );
    
    for (const teacher of teachers) {
      await createNotification(
        teacher.id,
        'Attendance Reminder',
        'Please mark today\'s attendance for your classes.',
        'reminder',
        'high',
        true,
        true
      );
    }
  } catch (error) {
    console.error('Attendance reminder error:', error);
  }
});

// Daily Reminder: Assignment Deadlines (6:00 PM)
cron.schedule('0 18 * * *', async () => {
  console.log('Running assignment deadline reminder...');
  try {
    const [assignments] = await pool.query(`
      SELECT a.*, u.id as student_id, u.first_name, u.last_name, u.phone, u.email 
      FROM assignments a
      JOIN student_assignments sa ON a.id = sa.assignment_id
      JOIN users u ON sa.student_id = u.id
      WHERE a.due_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      AND sa.status != 'submitted'
    `);
    
    for (const assignment of assignments) {
      await createNotification(
        assignment.student_id,
        'Assignment Due Tomorrow',
        `Assignment "${assignment.title}" is due tomorrow!`,
        'reminder',
        'high',
        true,
        true
      );
    }
  } catch (error) {
    console.error('Assignment reminder error:', error);
  }
});

// Daily Reminder: Exam Preparation (7:00 AM)
cron.schedule('0 7 * * *', async () => {
  console.log('Running exam preparation reminder...');
  try {
    const [exams] = await pool.query(`
      SELECT e.*, u.id as student_id, u.first_name, u.last_name, u.phone, u.email
      FROM exams e
      JOIN student_exams se ON e.id = se.exam_id
      JOIN users u ON se.student_id = u.id
      WHERE e.exam_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
    `);
    
    for (const exam of exams) {
      const examDate = new Date(exam.exam_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      examDate.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
      
      await createNotification(
        exam.student_id,
        'Exam Reminder',
        `Your ${exam.subject || 'upcoming'} exam is in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Start preparing!`,
        'reminder',
        'high',
        true,
        true
      );
    }
  } catch (error) {
    console.error('Exam reminder error:', error);
  }
});

// Daily Reminder: Fee Payment (9:00 AM on 1st of month)
cron.schedule('0 9 1 * *', async () => {
  console.log('Running monthly fee reminder...');
  try {
    const [students] = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.phone, u.email, p.amount_due
      FROM users u
      JOIN student_payments p ON u.id = p.student_id
      WHERE u.role = 'student' AND p.status = 'pending'
    `);
    
    for (const student of students) {
      await createNotification(
        student.id,
        'Fee Payment Reminder',
        `Your school fee of ${student.amount_due} RWF is due. Please make payment.`,
        'payment',
        'high',
        true,
        true
      );
    }
  } catch (error) {
    console.error('Fee reminder error:', error);
  }
});

// Weekly Report: Parent Updates (Friday 5:00 PM)
cron.schedule('0 17 * * 5', async () => {
  console.log('Running weekly parent report...');
  try {
    const [parents] = await pool.query(`
      SELECT DISTINCT p.id, p.first_name, p.last_name, p.phone, p.email, s.id as student_id, s.first_name as student_first, s.last_name as student_last
      FROM users p
      JOIN parent_student_link psl ON p.id = psl.parent_id
      JOIN users s ON psl.student_id = s.id
      WHERE p.role = 'parent'
    `);
    
    for (const parent of parents) {
      const [attendance] = await pool.query(
        'SELECT COUNT(*) as present FROM attendance WHERE student_id = ? AND status = "present" AND DATE(date) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)',
        [parent.student_id]
      );
      
      const presentDays = attendance[0]?.present || 0;
      const studentName = `${parent.student_first} ${parent.student_last}`;
      
      await createNotification(
        parent.id,
        'Weekly Student Report',
        `${parent.student_name} attended ${presentDays} days this week.`,
        'report',
        'normal',
        true,
        true
      );
    }
  } catch (error) {
    console.error('Parent report error:', error);
  }
});

// Daily Reminder: Sports Practice (3:00 PM)
cron.schedule('0 15 * * 1,3,5', async () => {
  console.log('Running sports practice reminder...');
  try {
    const [players] = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.phone, u.email, st.name as team_name
      FROM sports_players sp
      JOIN users u ON sp.student_id = u.id
      JOIN sports_teams st ON sp.team_id = st.id
      WHERE sp.is_active = 1
    `);
    
    for (const player of players) {
      await createNotification(
        player.id,
        'Sports Practice Reminder',
        `${player.team_name} practice today at 4:00 PM. Don't be late!`,
        'reminder',
        'normal',
        true,
        false
      );
    }
  } catch (error) {
    console.error('Sports reminder error:', error);
  }
});

// Cleanup old notifications (Daily at midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('Cleaning up old notifications...');
  try {
    const [result] = await pool.query(
      'DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );
    console.log(`Cleaned up ${result.affectedRows} old notifications`);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
});

// Helper function to create notification
async function createNotification(userId, title, message, type, priority, sendSMSFlag, sendEmailFlag) {
  if (!userId || !title || !message) {
    console.error('Missing required notification parameters');
    return;
  }
  
  try {
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type, priority, is_read, created_at) VALUES (?, ?, ?, ?, ?, 0, NOW())',
      [userId, title, message, type || 'info', priority || 'normal']
    );
    
    const [users] = await pool.query('SELECT phone, email FROM users WHERE id = ?', [userId]);
    if (users.length > 0) {
      const user = users[0];
      
      if (sendSMSFlag && user.phone && sendSMSFunc) {
        try {
          await sendSMSFunc(user.phone, `${title}: ${message}`, 1, { notification: true });
        } catch (err) {
          console.log('SMS send failed:', err.message);
        }
      }
      
      if (sendEmailFlag && user.email && emailTransporter) {
        try {
          await emailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: title,
            html: `<h2>${title}</h2><p>${message}</p>`
          });
        } catch (err) {
          console.log('Email send failed:', err.message);
        }
      }
    }
  } catch (error) {
    console.error('Notification error:', error);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down cron jobs...');
  cron.getTasks().forEach(task => task.stop());
  process.exit(0);
});

console.log('✅ Cron jobs initialized successfully!');

module.exports = { createNotification };
