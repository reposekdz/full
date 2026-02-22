const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { body, validationResult, query } = require('express-validator');
const smsService = require('../services/smsService');
const WebSocket = require('ws');

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'school_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// WebSocket broadcast function
const broadcastUpdate = (type, data) => {
  if (global.wss) {
    const message = JSON.stringify({
      channel: 'global-student-sheets',
      type,
      data,
      timestamp: new Date().toISOString()
    });
    
    global.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
};

// Get all students with filters
router.get('/', [
  query('trade_id').optional().isString(),
  query('level_id').optional().isInt(),
  query('level_suffix').optional().isString(),
  query('search').optional().isString(),
  query('conduct_min').optional().isInt({ min: 0, max: 40 }),
  query('conduct_max').optional().isInt({ min: 0, max: 40 }),
  query('attendance_min').optional().isInt({ min: 0, max: 100 }),
  query('attendance_max').optional().isInt({ min: 0, max: 100 }),
  query('payment_status').optional().isIn(['all', 'paid', 'pending', 'overdue']),
  query('gender').optional().isIn(['all', 'Male', 'Female']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      trade_id,
      level_id,
      level_suffix,
      search,
      conduct_min = 0,
      conduct_max = 40,
      attendance_min = 0,
      attendance_max = 100,
      payment_status = 'all',
      gender = 'all',
      page = 1,
      limit = 50
    } = req.query;

    let query = `
      SELECT 
        s.*,
        COALESCE(c.conduct_score, 40) as conduct_score,
        COALESCE(a.attendance_percentage, 100) as attendance_percentage,
        COALESCE(p.payment_status, 'pending') as payment_status,
        COUNT(pl.id) as parent_count
      FROM global_student_sheets s
      LEFT JOIN student_conduct_records c ON s.id = c.student_id
      LEFT JOIN student_attendance a ON s.id = a.student_id
      LEFT JOIN student_payments p ON s.id = p.student_id
      LEFT JOIN parent_child_links pl ON s.id = pl.student_id
      WHERE 1=1
    `;

    const queryParams = [];

    if (trade_id) {
      query += ' AND s.trade_code = ?';
      queryParams.push(trade_id);
    }

    if (level_id) {
      query += ' AND s.level_number = ?';
      queryParams.push(level_id);
    }

    if (level_suffix) {
      query += ' AND s.level_suffix = ?';
      queryParams.push(level_suffix);
    }

    if (search) {
      query += ' AND (CONCAT(s.first_name, " ", s.last_name) LIKE ? OR s.student_code LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (gender !== 'all') {
      query += ' AND s.gender = ?';
      queryParams.push(gender);
    }

    query += ' GROUP BY s.id';

    if (conduct_min !== undefined || conduct_max !== undefined) {
      query += ` HAVING conduct_score BETWEEN ${conduct_min} AND ${conduct_max}`;
    }

    if (attendance_min !== undefined || attendance_max !== undefined) {
      query += ` AND attendance_percentage BETWEEN ${attendance_min} AND ${attendance_max}`;
    }

    if (payment_status !== 'all') {
      query += ` AND payment_status = '${payment_status}'`;
    }

    query += ' ORDER BY s.first_name, s.last_name';

    const offset = (page - 1) * limit;
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const [students] = await pool.execute(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT s.id) as total
      FROM global_student_sheets s
      LEFT JOIN student_conduct_records c ON s.id = c.student_id
      LEFT JOIN student_attendance a ON s.id = a.student_id
      LEFT JOIN student_payments p ON s.id = p.student_id
      WHERE 1=1
    `;

    const countParams = queryParams.slice(0, -2); // Remove LIMIT and OFFSET params
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: students,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: offset + students.length < total
      }
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students'
    });
  }
});

// Add new student
router.post('/', [
  body('first_name').notEmpty().trim().isLength({ min: 1, max: 50 }),
  body('last_name').notEmpty().trim().isLength({ min: 1, max: 50 }),
  body('email').optional().isEmail(),
  body('phone').optional().isMobilePhone(),
  body('gender').isIn(['Male', 'Female']),
  body('trade_code').notEmpty(),
  body('level_number').isInt({ min: 1, max: 6 }),
  body('student_code').notEmpty(),
  body('date_of_birth').optional().isISO8601(),
  body('address').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const studentData = req.body;
    
    const insertQuery = `
      INSERT INTO global_student_sheets 
      (first_name, last_name, email, phone, gender, trade_code, level_number, 
       level_suffix, student_code, date_of_birth, address, conduct_score, 
       attendance_percentage, payment_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const [result] = await pool.execute(insertQuery, [
      studentData.first_name,
      studentData.last_name,
      studentData.email || null,
      studentData.phone || null,
      studentData.gender,
      studentData.trade_code,
      studentData.level_number,
      studentData.level_suffix || '',
      studentData.student_code,
      studentData.date_of_birth || null,
      studentData.address || null,
      studentData.conduct_score || 40,
      studentData.attendance_percentage || 100,
      studentData.payment_status || 'pending'
    ]);

    const newStudent = {
      id: result.insertId,
      ...studentData
    };

    // Broadcast real-time update
    broadcastUpdate('student_added', {
      student: newStudent,
      message: `New student ${studentData.first_name} ${studentData.last_name} added`
    });

    res.status(201).json({
      success: true,
      data: newStudent,
      message: 'Student added successfully'
    });

  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add student'
    });
  }
});

// Update student
router.put('/:id', [
  body('first_name').optional().trim().isLength({ min: 1, max: 50 }),
  body('last_name').optional().trim().isLength({ min: 1, max: 50 }),
  body('email').optional().isEmail(),
  body('phone').optional().isMobilePhone(),
  body('gender').optional().isIn(['Male', 'Female']),
  body('date_of_birth').optional().isISO8601(),
  body('address').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const studentId = req.params.id;
    const updates = req.body;

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(studentId);

    const updateQuery = `
      UPDATE global_student_sheets 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    const [result] = await pool.execute(updateQuery, updateValues);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Get updated student data
    const [updatedStudent] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE id = ?',
      [studentId]
    );

    // Broadcast real-time update
    broadcastUpdate('student_updated', {
      studentId: parseInt(studentId),
      studentName: `${updatedStudent[0].first_name} ${updatedStudent[0].last_name}`,
      updates,
      message: 'Student information updated'
    });

    res.json({
      success: true,
      data: updatedStudent[0],
      message: 'Student updated successfully'
    });

  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update student'
    });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const studentId = req.params.id;

    // Get student info before deletion
    const [student] = await pool.execute(
      'SELECT first_name, last_name FROM global_student_sheets WHERE id = ?',
      [studentId]
    );

    if (student.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Delete student (cascade deletes should handle related records)
    const [result] = await pool.execute(
      'DELETE FROM global_student_sheets WHERE id = ?',
      [studentId]
    );

    // Broadcast real-time update
    broadcastUpdate('student_deleted', {
      studentId: parseInt(studentId),
      studentName: `${student[0].first_name} ${student[0].last_name}`,
      message: 'Student removed'
    });

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete student'
    });
  }
});

// Link parent to student
router.post('/:id/link-parent', [
  body('parent_phone').isMobilePhone(),
  body('student_name').notEmpty(),
  body('trade').optional(),
  body('level').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const studentId = req.params.id;
    const { parent_phone, student_name, trade, level } = req.body;

    // Check if parent already exists
    let [existingParent] = await pool.execute(
      'SELECT id FROM parents WHERE phone = ?',
      [parent_phone]
    );

    let parentId;
    if (existingParent.length > 0) {
      parentId = existingParent[0].id;
    } else {
      // Create new parent
      const [parentResult] = await pool.execute(
        'INSERT INTO parents (phone, created_at) VALUES (?, NOW())',
        [parent_phone]
      );
      parentId = parentResult.insertId;
    }

    // Create parent-child link
    await pool.execute(
      'INSERT INTO parent_child_links (parent_id, student_id, created_at) VALUES (?, ?, NOW())',
      [parentId, studentId]
    );

    // Send SMS notification
    try {
      await smsService.sendSMS({
        to: parent_phone,
        message: `Mwiriwe! Mwashyizweho kuri sisitemu ya Garden TVET kugira ngo mukurikire amakuru y'umwana wanyu ${student_name}. Murakoze!`,
        type: 'parent_linked'
      });
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
    }

    // Broadcast real-time update
    broadcastUpdate('parent_linked', {
      studentId: parseInt(studentId),
      studentName: student_name,
      parentPhone: parent_phone,
      message: 'Parent linked successfully'
    });

    res.json({
      success: true,
      data: { parentId },
      message: 'Parent linked successfully'
    });

  } catch (error) {
    console.error('Error linking parent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to link parent'
    });
  }
});

// Remove conduct (single student)
router.post('/:id/remove-conduct', [
  body('points_removed').isInt({ min: 1, max: 40 }),
  body('incident_type').notEmpty(),
  body('description').notEmpty(),
  body('severity').isIn(['minor', 'moderate', 'major', 'severe']),
  body('action_taken').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const studentId = req.params.id;
    const { points_removed, incident_type, description, severity, action_taken } = req.body;

    // Get current conduct score
    const [student] = await pool.execute(
      'SELECT first_name, last_name, conduct_score FROM global_student_sheets WHERE id = ?',
      [studentId]
    );

    if (student.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    const currentScore = student[0].conduct_score || 40;
    const newScore = Math.max(0, currentScore - points_removed);

    // Update conduct score
    await pool.execute(
      'UPDATE global_student_sheets SET conduct_score = ? WHERE id = ?',
      [newScore, studentId]
    );

    // Record conduct incident
    await pool.execute(
      `INSERT INTO student_conduct_records 
       (student_id, incident_type, description, severity, points_removed, action_taken, recorded_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [studentId, incident_type, description, severity, points_removed, action_taken || 'Conduct points removed', req.user?.id || 1]
    );

    // Send SMS to parents
    const [parents] = await pool.execute(
      `SELECT p.phone FROM parents p 
       JOIN parent_child_links pcl ON p.id = pcl.parent_id 
       WHERE pcl.student_id = ?`,
      [studentId]
    );

    const studentName = `${student[0].first_name} ${student[0].last_name}`;
    
    for (const parent of parents) {
      try {
        await smsService.sendSMS({
          to: parent.phone,
          message: `Mwiriwe! Umwana wanyu ${studentName} yakiriye igihano. Amanota: ${newScore}/40. Impamvu: ${description}. Garden TVET`,
          type: 'conduct_removed'
        });
      } catch (smsError) {
        console.error('SMS sending failed:', smsError);
      }
    }

    // Broadcast real-time update
    broadcastUpdate('conduct_updated', {
      studentId: parseInt(studentId),
      studentName,
      pointsRemoved: points_removed,
      newScore,
      reason: description,
      message: 'Conduct points removed'
    });

    res.json({
      success: true,
      data: { newScore, pointsRemoved: points_removed },
      message: 'Conduct removed successfully'
    });

  } catch (error) {
    console.error('Error removing conduct:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove conduct'
    });
  }
});

// Grant leave (single student)
router.post('/:id/grant-leave', [
  body('leave_type').notEmpty(),
  body('start_date').isISO8601(),
  body('end_date').isISO8601(),
  body('reason').notEmpty(),
  body('approved_by').optional(),
  body('status').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const studentId = req.params.id;
    const { leave_type, start_date, end_date, reason, approved_by, status } = req.body;

    // Get student info
    const [student] = await pool.execute(
      'SELECT first_name, last_name FROM global_student_sheets WHERE id = ?',
      [studentId]
    );

    if (student.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Create leave record
    const [leaveResult] = await pool.execute(
      `INSERT INTO student_leave_requests 
       (student_id, leave_type, start_date, end_date, reason, approved_by, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [studentId, leave_type, start_date, end_date, reason, approved_by || 'DOD', status || 'approved']
    );

    // Send SMS to parents
    const [parents] = await pool.execute(
      `SELECT p.phone FROM parents p 
       JOIN parent_child_links pcl ON p.id = pcl.parent_id 
       WHERE pcl.student_id = ?`,
      [studentId]
    );

    const studentName = `${student[0].first_name} ${student[0].last_name}`;
    const startDate = new Date(start_date).toLocaleDateString();
    const endDate = new Date(end_date).toLocaleDateString();
    
    for (const parent of parents) {
      try {
        await smsService.sendSMS({
          to: parent.phone,
          message: `Mwiriwe! Umwana wanyu ${studentName} yahawe uruhushya kuva ${startDate} kugeza ${endDate}. Impamvu: ${reason}. Garden TVET`,
          type: 'leave_approved'
        });
      } catch (smsError) {
        console.error('SMS sending failed:', smsError);
      }
    }

    res.json({
      success: true,
      data: { leaveId: leaveResult.insertId },
      message: 'Leave granted successfully'
    });

  } catch (error) {
    console.error('Error granting leave:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to grant leave'
    });
  }
});

// Bulk remove conduct
router.post('/bulk-remove-conduct', [
  body('studentIds').isArray({ min: 1 }),
  body('points_removed').isInt({ min: 1, max: 40 }),
  body('incident_type').notEmpty(),
  body('description').notEmpty(),
  body('severity').isIn(['minor', 'moderate', 'major', 'severe'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { studentIds, points_removed, incident_type, description, severity } = req.body;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      for (const studentId of studentIds) {
        // Update conduct score
        await connection.execute(
          'UPDATE global_student_sheets SET conduct_score = GREATEST(0, conduct_score - ?) WHERE id = ?',
          [points_removed, studentId]
        );

        // Record conduct incident
        await connection.execute(
          `INSERT INTO student_conduct_records 
           (student_id, incident_type, description, severity, points_removed, action_taken, recorded_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [studentId, incident_type, description, severity, points_removed, 'Bulk conduct removal', req.user?.id || 1]
        );
      }

      await connection.commit();

      // Send SMS notifications (async)
      setImmediate(async () => {
        for (const studentId of studentIds) {
          try {
            const [student] = await pool.execute(
              'SELECT first_name, last_name, conduct_score FROM global_student_sheets WHERE id = ?',
              [studentId]
            );

            const [parents] = await pool.execute(
              `SELECT p.phone FROM parents p 
               JOIN parent_child_links pcl ON p.id = pcl.parent_id 
               WHERE pcl.student_id = ?`,
              [studentId]
            );

            const studentName = `${student[0].first_name} ${student[0].last_name}`;
            const newScore = student[0].conduct_score;

            for (const parent of parents) {
              await smsService.sendSMS({
                to: parent.phone,
                message: `Mwiriwe! Umwana wanyu ${studentName} yakiriye igihano. Amanota: ${newScore}/40. Impamvu: ${description}. Garden TVET`,
                type: 'conduct_removed'
              });
            }
          } catch (error) {
            console.error('Error sending SMS for student', studentId, error);
          }
        }
      });

      // Broadcast real-time update
      broadcastUpdate('bulk_update', {
        type: 'conduct_removed',
        studentIds,
        pointsRemoved: points_removed,
        reason: description,
        message: `Conduct removed from ${studentIds.length} students`
      });

      res.json({
        success: true,
        data: { affectedStudents: studentIds.length },
        message: 'Bulk conduct removal completed'
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error in bulk conduct removal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove conduct'
    });
  }
});

// Bulk grant leave
router.post('/bulk-grant-leave', [
  body('studentIds').isArray({ min: 1 }),
  body('leave_type').notEmpty(),
  body('start_date').isISO8601(),
  body('end_date').isISO8601(),
  body('reason').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { studentIds, leave_type, start_date, end_date, reason } = req.body;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      for (const studentId of studentIds) {
        await connection.execute(
          `INSERT INTO student_leave_requests 
           (student_id, leave_type, start_date, end_date, reason, approved_by, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [studentId, leave_type, start_date, end_date, reason, 'DOD', 'approved']
        );
      }

      await connection.commit();

      // Send SMS notifications (async)
      setImmediate(async () => {
        const startDate = new Date(start_date).toLocaleDateString();
        const endDate = new Date(end_date).toLocaleDateString();

        for (const studentId of studentIds) {
          try {
            const [student] = await pool.execute(
              'SELECT first_name, last_name FROM global_student_sheets WHERE id = ?',
              [studentId]
            );

            const [parents] = await pool.execute(
              `SELECT p.phone FROM parents p 
               JOIN parent_child_links pcl ON p.id = pcl.parent_id 
               WHERE pcl.student_id = ?`,
              [studentId]
            );

            const studentName = `${student[0].first_name} ${student[0].last_name}`;

            for (const parent of parents) {
              await smsService.sendSMS({
                to: parent.phone,
                message: `Mwiriwe! Umwana wanyu ${studentName} yahawe uruhushya kuva ${startDate} kugeza ${endDate}. Impamvu: ${reason}. Garden TVET`,
                type: 'leave_approved'
              });
            }
          } catch (error) {
            console.error('Error sending SMS for student', studentId, error);
          }
        }
      });

      // Broadcast real-time update
      broadcastUpdate('bulk_update', {
        type: 'leave_granted',
        studentIds,
        leaveType: leave_type,
        startDate: start_date,
        endDate: end_date,
        reason,
        message: `Leave granted to ${studentIds.length} students`
      });

      res.json({
        success: true,
        data: { affectedStudents: studentIds.length },
        message: 'Bulk leave grant completed'
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error in bulk leave grant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to grant leave'
    });
  }
});

// Send SMS to parents
router.post('/send-sms-parents', [
  body('studentIds').isArray({ min: 1 }),
  body('message').notEmpty().isLength({ min: 1, max: 500 }),
  body('priority').optional().isIn(['low', 'normal', 'high']),
  body('type').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { studentIds, message, priority = 'normal', type = 'custom' } = req.body;

    let successCount = 0;
    let failureCount = 0;

    for (const studentId of studentIds) {
      try {
        const [student] = await pool.execute(
          'SELECT first_name, last_name FROM global_student_sheets WHERE id = ?',
          [studentId]
        );

        const [parents] = await pool.execute(
          `SELECT p.phone FROM parents p 
           JOIN parent_child_links pcl ON p.id = pcl.parent_id 
           WHERE pcl.student_id = ?`,
          [studentId]
        );

        const studentName = `${student[0].first_name} ${student[0].last_name}`;

        for (const parent of parents) {
          await smsService.sendSMS({
            to: parent.phone,
            message: `Mwiriwe! ${message} - ${studentName}. Garden TVET`,
            type,
            priority
          });
          successCount++;
        }
      } catch (error) {
        console.error('Error sending SMS for student', studentId, error);
        failureCount++;
      }
    }

    res.json({
      success: true,
      data: { successCount, failureCount },
      message: `SMS sent successfully to ${successCount} recipients`
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send SMS'
    });
  }
});

// Get student details
router.get('/:id/details', async (req, res) => {
  try {
    const studentId = req.params.id;

    const [student] = await pool.execute(`
      SELECT 
        s.*,
        COALESCE(c.conduct_score, 40) as conduct_score,
        COALESCE(a.attendance_percentage, 100) as attendance_percentage,
        COALESCE(p.payment_status, 'pending') as payment_status,
        COUNT(pl.id) as parent_count
      FROM global_student_sheets s
      LEFT JOIN student_conduct_records c ON s.id = c.student_id
      LEFT JOIN student_attendance a ON s.id = a.student_id
      LEFT JOIN student_payments p ON s.id = p.student_id
      LEFT JOIN parent_child_links pl ON s.id = pl.student_id
      WHERE s.id = ?
      GROUP BY s.id
    `, [studentId]);

    if (student.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student[0]
    });

  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student details'
    });
  }
});

// Get parent contacts
router.get('/:id/parent-contacts', async (req, res) => {
  try {
    const studentId = req.params.id;

    const [parents] = await pool.execute(`
      SELECT p.id, p.phone, p.email, p.first_name, p.last_name
      FROM parents p
      JOIN parent_child_links pcl ON p.id = pcl.parent_id
      WHERE pcl.student_id = ?
    `, [studentId]);

    res.json({
      success: true,
      data: { parents }
    });

  } catch (error) {
    console.error('Error fetching parent contacts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch parent contacts'
    });
  }
});

// Export students
router.get('/export', [
  query('student_ids').optional(),
  query('trade_id').optional(),
  query('level_id').optional(),
  query('format').optional().isIn(['xlsx', 'csv', 'json'])
], async (req, res) => {
  try {
    const { student_ids, trade_id, level_id, format = 'xlsx' } = req.query;

    let query = `
      SELECT 
        s.*,
        COALESCE(c.conduct_score, 40) as conduct_score,
        COALESCE(a.attendance_percentage, 100) as attendance_percentage,
        COALESCE(p.payment_status, 'pending') as payment_status
      FROM global_student_sheets s
      LEFT JOIN student_conduct_records c ON s.id = c.student_id
      LEFT JOIN student_attendance a ON s.id = a.student_id
      LEFT JOIN student_payments p ON s.id = p.student_id
      WHERE 1=1
    `;

    const queryParams = [];

    if (student_ids) {
      const ids = Array.isArray(student_ids) ? student_ids : student_ids.split(',');
      query += ` AND s.id IN (${ids.map(() => '?').join(',')})`;
      queryParams.push(...ids);
    }

    if (trade_id) {
      query += ' AND s.trade_code = ?';
      queryParams.push(trade_id);
    }

    if (level_id) {
      query += ' AND s.level_number = ?';
      queryParams.push(level_id);
    }

    query += ' GROUP BY s.id ORDER BY s.first_name, s.last_name';

    const [students] = await pool.execute(query, queryParams);

    // For now, return JSON data (client can handle Excel generation)
    res.json({
      success: true,
      data: students,
      meta: {
        format,
        exportedAt: new Date().toISOString(),
        count: students.length
      }
    });

  } catch (error) {
    console.error('Error exporting students:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export students'
    });
  }
});

module.exports = router;