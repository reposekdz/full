const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sendSMS, sendBulkSMS } = require('../services/smsService');

const router = express.Router();

// ======================
// AUTOMATED NOTIFICATION SYSTEM
// Event-driven messaging based on system changes
// ======================

// Notification Templates Management
router.get('/templates', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const [templates] = await pool.execute(`
      SELECT * FROM notification_templates 
      ORDER BY category, event_type
    `);

    res.json({
      success: true,
      data: templates
    });

  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch templates' });
  }
});

// Create notification template
router.post('/templates', authenticateToken, requireRole('admin'), [
  body('event_type').notEmpty().withMessage('Event type is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('title_template').notEmpty().withMessage('Title template is required'),
  body('message_template').notEmpty().withMessage('Message template is required'),
  body('sms_template').optional(),
  body('target_audience').isIn(['parent', 'student', 'staff', 'all']).withMessage('Invalid audience')
], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await connection.rollback();
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { event_type, category, title_template, message_template, sms_template, 
            target_audience, priority, send_sms, send_email } = req.body;

    const [result] = await connection.execute(`
      INSERT INTO notification_templates (
        event_type, category, title_template, message_template, sms_template,
        target_audience, priority, send_sms, send_email, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true, NOW())
    `, [event_type, category, title_template, message_template, sms_template || null,
        target_audience, priority || 'normal', send_sms || false, send_email || false]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Template created successfully',
      data: { id: result.insertId }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create template error:', error);
    res.status(500).json({ success: false, message: 'Failed to create template' });
  } finally {
    connection.release();
  }
});

// Trigger notification based on event
async function triggerNotification(event_type, data, connection) {
  try {
    // Get active templates for this event
    const [templates] = await connection.execute(`
      SELECT * FROM notification_templates 
      WHERE event_type = ? AND is_active = true
    `, [event_type]);

    if (templates.length === 0) return;

    for (const template of templates) {
      // Replace placeholders in templates
      let title = template.title_template;
      let message = template.message_template;
      let sms_message = template.sms_template;

      Object.keys(data).forEach(key => {
        const placeholder = `{{${key}}}`;
        title = title.replace(new RegExp(placeholder, 'g'), data[key]);
        message = message.replace(new RegExp(placeholder, 'g'), data[key]);
        if (sms_message) {
          sms_message = sms_message.replace(new RegExp(placeholder, 'g'), data[key]);
        }
      });

      // Get recipients based on target audience
      let recipients = [];
      
      if (template.target_audience === 'parent' || template.target_audience === 'all') {
        if (data.student_id) {
          // Get parents of specific student
          const [parents] = await connection.execute(`
            SELECT p.id, p.phone, p.has_smartphone,
                   (SELECT id FROM users WHERE serial_code = p.parent_code) as user_id
            FROM parents p
            JOIN parent_student ps ON p.id = ps.parent_id
            WHERE ps.student_id = ? AND p.status = 'active'
          `, [data.student_id]);
          recipients.push(...parents);
        } else if (data.class_id) {
          // Get all parents in class
          const [parents] = await connection.execute(`
            SELECT DISTINCT p.id, p.phone, p.has_smartphone,
                   (SELECT id FROM users WHERE serial_code = p.parent_code) as user_id
            FROM parents p
            JOIN parent_student ps ON p.id = ps.parent_id
            JOIN students s ON ps.student_id = s.id
            WHERE s.class_id = ? AND p.status = 'active'
          `, [data.class_id]);
          recipients.push(...parents);
        }
      }

      if (template.target_audience === 'student' && data.student_id) {
        const [student] = await connection.execute(
          'SELECT id as user_id, phone FROM users WHERE student_id = ?',
          [data.student_id]
        );
        recipients.push(...student);
      }

      if (template.target_audience === 'staff' || template.target_audience === 'all') {
        const [staff] = await connection.execute(`
          SELECT u.id as user_id, s.phone
          FROM users u
          JOIN staff s ON u.id = s.user_id
          WHERE u.role IN ('staff', 'teacher', 'admin') AND u.is_active = true
        `);
        recipients.push(...staff);
      }

      // Send notifications
      const smsRecipients = [];

      for (const recipient of recipients) {
        // Create in-app notification
        if (recipient.user_id) {
          await connection.execute(`
            INSERT INTO notifications (
              user_id, type, title, message, priority, reference_id, 
              reference_type, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          `, [recipient.user_id, template.category, title, message, 
              template.priority, data.reference_id || null, 
              data.reference_type || null]);
        }

        // Collect SMS recipients
        if (template.send_sms && recipient.phone && !recipient.has_smartphone) {
          smsRecipients.push(recipient.phone);
        }
      }

      // Send bulk SMS
      if (smsRecipients.length > 0 && sms_message) {
        await sendBulkSMS(smsRecipients, sms_message, 1, {
          type: 'automated_notification',
          event_type,
          template_id: template.id
        });
      }

      // Log notification event
      await connection.execute(`
        INSERT INTO notification_logs (
          event_type, template_id, recipients_count, sms_sent, 
          data, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `, [event_type, template.id, recipients.length, smsRecipients.length, 
          JSON.stringify(data)]);
    }

  } catch (error) {
    console.error('Trigger notification error:', error);
    throw error;
  }
}

// Event handlers - These are called from other routes when events occur

// Attendance marked
router.post('/events/attendance-marked', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { student_id, status, date, class_name, student_name } = req.body;

    if (status === 'absent') {
      await triggerNotification('student_absent', {
        student_id,
        student_name,
        class_name,
        date,
        reference_id: student_id,
        reference_type: 'attendance'
      }, connection);
    }

    await connection.commit();
    res.json({ success: true, message: 'Attendance notification sent' });

  } catch (error) {
    await connection.rollback();
    console.error('Attendance event error:', error);
    res.status(500).json({ success: false, message: 'Failed to process event' });
  } finally {
    connection.release();
  }
});

// Grade posted
router.post('/events/grade-posted', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { student_id, student_name, subject, grade, score, teacher_name } = req.body;

    await triggerNotification('grade_posted', {
      student_id,
      student_name,
      subject,
      grade,
      score,
      teacher_name,
      reference_id: student_id,
      reference_type: 'grade'
    }, connection);

    await connection.commit();
    res.json({ success: true, message: 'Grade notification sent' });

  } catch (error) {
    await connection.rollback();
    console.error('Grade event error:', error);
    res.status(500).json({ success: false, message: 'Failed to process event' });
  } finally {
    connection.release();
  }
});

// Assignment created
router.post('/events/assignment-created', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { assignment_id, title, subject, due_date, class_id, class_name, teacher_name } = req.body;

    await triggerNotification('assignment_created', {
      class_id,
      title,
      subject,
      due_date,
      class_name,
      teacher_name,
      reference_id: assignment_id,
      reference_type: 'assignment'
    }, connection);

    await connection.commit();
    res.json({ success: true, message: 'Assignment notification sent' });

  } catch (error) {
    await connection.rollback();
    console.error('Assignment event error:', error);
    res.status(500).json({ success: false, message: 'Failed to process event' });
  } finally {
    connection.release();
  }
});

// Fee reminder
router.post('/events/fee-reminder', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { student_id, student_name, amount_due, due_date, term } = req.body;

    await triggerNotification('fee_reminder', {
      student_id,
      student_name,
      amount_due,
      due_date,
      term,
      reference_id: student_id,
      reference_type: 'fee'
    }, connection);

    await connection.commit();
    res.json({ success: true, message: 'Fee reminder sent' });

  } catch (error) {
    await connection.rollback();
    console.error('Fee reminder error:', error);
    res.status(500).json({ success: false, message: 'Failed to send reminder' });
  } finally {
    connection.release();
  }
});

// Discipline incident
router.post('/events/discipline-incident', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { student_id, student_name, incident_type, description, action_taken, severity } = req.body;

    await triggerNotification('discipline_incident', {
      student_id,
      student_name,
      incident_type,
      description,
      action_taken,
      severity,
      reference_id: student_id,
      reference_type: 'discipline'
    }, connection);

    await connection.commit();
    res.json({ success: true, message: 'Discipline notification sent' });

  } catch (error) {
    await connection.rollback();
    console.error('Discipline event error:', error);
    res.status(500).json({ success: false, message: 'Failed to process event' });
  } finally {
    connection.release();
  }
});

// Exam scheduled
router.post('/events/exam-scheduled', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { exam_id, title, subject, exam_date, duration, class_id, class_name } = req.body;

    await triggerNotification('exam_scheduled', {
      class_id,
      title,
      subject,
      exam_date,
      duration,
      class_name,
      reference_id: exam_id,
      reference_type: 'exam'
    }, connection);

    await connection.commit();
    res.json({ success: true, message: 'Exam notification sent' });

  } catch (error) {
    await connection.rollback();
    console.error('Exam event error:', error);
    res.status(500).json({ success: false, message: 'Failed to process event' });
  } finally {
    connection.release();
  }
});

// School event announcement
router.post('/events/school-event', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { event_name, event_date, location, description } = req.body;

    await triggerNotification('school_event', {
      event_name,
      event_date,
      location,
      description,
      reference_type: 'event'
    }, connection);

    await connection.commit();
    res.json({ success: true, message: 'Event notification sent' });

  } catch (error) {
    await connection.rollback();
    console.error('School event error:', error);
    res.status(500).json({ success: false, message: 'Failed to process event' });
  } finally {
    connection.release();
  }
});

// Payment received
router.post('/events/payment-received', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { student_id, student_name, amount, payment_method, balance } = req.body;

    await triggerNotification('payment_received', {
      student_id,
      student_name,
      amount,
      payment_method,
      balance,
      reference_id: student_id,
      reference_type: 'payment'
    }, connection);

    await connection.commit();
    res.json({ success: true, message: 'Payment notification sent' });

  } catch (error) {
    await connection.rollback();
    console.error('Payment event error:', error);
    res.status(500).json({ success: false, message: 'Failed to process event' });
  } finally {
    connection.release();
  }
});

// Report card ready
router.post('/events/report-card-ready', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { student_id, student_name, term, academic_year, average_grade } = req.body;

    await triggerNotification('report_card_ready', {
      student_id,
      student_name,
      term,
      academic_year,
      average_grade,
      reference_id: student_id,
      reference_type: 'report_card'
    }, connection);

    await connection.commit();
    res.json({ success: true, message: 'Report card notification sent' });

  } catch (error) {
    await connection.rollback();
    console.error('Report card event error:', error);
    res.status(500).json({ success: false, message: 'Failed to process event' });
  } finally {
    connection.release();
  }
});

// Scheduled notifications (run via cron job)
router.get('/scheduled/daily-reminders', authenticateToken, requireRole('admin'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check for upcoming assignments (due in 2 days)
    const [upcomingAssignments] = await connection.execute(`
      SELECT a.*, c.name as class_name, s.id as student_id, 
             s.first_name, s.last_name
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      JOIN students s ON s.class_id = c.id
      WHERE a.due_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 DAY)
      AND a.is_published = true
    `);

    for (const assignment of upcomingAssignments) {
      await triggerNotification('assignment_due_soon', {
        student_id: assignment.student_id,
        student_name: `${assignment.first_name} ${assignment.last_name}`,
        title: assignment.title,
        subject: assignment.subject,
        due_date: assignment.due_date,
        reference_id: assignment.id,
        reference_type: 'assignment'
      }, connection);
    }

    // Check for overdue fees
    const [overdueFees] = await connection.execute(`
      SELECT f.*, s.id as student_id, s.first_name, s.last_name
      FROM fees f
      JOIN students s ON f.student_id = s.id
      WHERE f.due_date < NOW() AND f.balance > 0 AND f.status != 'paid'
    `);

    for (const fee of overdueFees) {
      await triggerNotification('fee_overdue', {
        student_id: fee.student_id,
        student_name: `${fee.first_name} ${fee.last_name}`,
        amount_due: fee.balance,
        due_date: fee.due_date,
        term: fee.term,
        reference_id: fee.id,
        reference_type: 'fee'
      }, connection);
    }

    // Check for upcoming exams (within 5 days)
    const [upcomingExams] = await connection.execute(`
      SELECT e.*, c.name as class_name
      FROM exams e
      JOIN classes c ON e.class_id = c.id
      WHERE e.exam_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 5 DAY)
    `);

    for (const exam of upcomingExams) {
      await triggerNotification('exam_reminder', {
        class_id: exam.class_id,
        title: exam.title,
        subject: exam.subject,
        exam_date: exam.exam_date,
        duration: exam.duration,
        class_name: exam.class_name,
        reference_id: exam.id,
        reference_type: 'exam'
      }, connection);
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Daily reminders processed',
      data: {
        assignments: upcomingAssignments.length,
        fees: overdueFees.length,
        exams: upcomingExams.length
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Daily reminders error:', error);
    res.status(500).json({ success: false, message: 'Failed to process reminders' });
  } finally {
    connection.release();
  }
});

// Get notification logs
router.get('/logs', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50, event_type, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT nl.*, nt.title_template, nt.event_type as template_event
      FROM notification_logs nl
      LEFT JOIN notification_templates nt ON nl.template_id = nt.id
      WHERE 1=1
    `;
    const params = [];

    if (event_type) {
      query += ' AND nl.event_type = ?';
      params.push(event_type);
    }

    if (date_from) {
      query += ' AND nl.created_at >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND nl.created_at <= ?';
      params.push(date_to);
    }

    query += ' ORDER BY nl.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [logs] = await pool.execute(query, params);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch logs' });
  }
});

// Get notification statistics
router.get('/stats', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    let dateFilter = '';
    const params = [];

    if (date_from) {
      dateFilter += ' AND created_at >= ?';
      params.push(date_from);
    }

    if (date_to) {
      dateFilter += ' AND created_at <= ?';
      params.push(date_to);
    }

    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_notifications,
        SUM(recipients_count) as total_recipients,
        SUM(sms_sent) as total_sms_sent,
        COUNT(DISTINCT event_type) as unique_events,
        AVG(recipients_count) as avg_recipients_per_notification
      FROM notification_logs
      WHERE 1=1 ${dateFilter}
    `, params);

    const [eventBreakdown] = await pool.execute(`
      SELECT 
        event_type,
        COUNT(*) as count,
        SUM(recipients_count) as total_recipients,
        SUM(sms_sent) as total_sms
      FROM notification_logs
      WHERE 1=1 ${dateFilter}
      GROUP BY event_type
      ORDER BY count DESC
    `, params);

    res.json({
      success: true,
      data: {
        overview: stats[0],
        by_event: eventBreakdown
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

module.exports = router;
module.exports.triggerNotification = triggerNotification;
