const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ========================================
// GLOBAL STUDENT MANAGEMENT SYSTEM
// Centralized student data for all staff roles
// ========================================

// Get all students from global sheet (with advanced filtering)
router.get('/students', authenticateToken, async (req, res) => {
  try {
    const {
      search, class_id, level, trade, status, gender, 
      scholarship_status, academic_year, page = 1, limit = 50,
      sortBy = 'created_at', sortOrder = 'DESC'
    } = req.query;

    let query = `
      SELECT gs.*, 
             tc.name as class_name,
             COUNT(DISTINCT sp.id) as parent_count,
             (SELECT COUNT(*) FROM student_attendance WHERE student_id = gs.id AND status = 'Present') as total_present,
             (SELECT COUNT(*) FROM student_attendance WHERE student_id = gs.id) as total_attendance_records
      FROM global_students gs
      LEFT JOIN trade_classes tc ON gs.current_class_id = tc.id
      LEFT JOIN student_parents sp ON sp.student_id = gs.id
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND (gs.first_name LIKE ? OR gs.last_name LIKE ? OR gs.student_id LIKE ? OR gs.admission_number LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (class_id) {
      query += ` AND gs.current_class_id = ?`;
      params.push(class_id);
    }

    if (level) {
      query += ` AND gs.current_level = ?`;
      params.push(level);
    }

    if (trade) {
      query += ` AND gs.current_trade = ?`;
      params.push(trade);
    }

    if (status) {
      query += ` AND gs.academic_status = ?`;
      params.push(status);
    }

    if (gender) {
      query += ` AND gs.gender = ?`;
      params.push(gender);
    }

    if (scholarship_status) {
      query += ` AND gs.scholarship_status = ?`;
      params.push(scholarship_status);
    }

    if (academic_year) {
      query += ` AND gs.academic_year = ?`;
      params.push(academic_year);
    }

    query += ` GROUP BY gs.id`;
    query += ` ORDER BY gs.${sortBy} ${sortOrder}`;
    
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [students] = await db.query(query, params);

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(DISTINCT gs.id) as total FROM global_students gs WHERE 1=1` + 
      (search ? ` AND (gs.first_name LIKE ? OR gs.last_name LIKE ? OR gs.student_id LIKE ? OR gs.admission_number LIKE ?)` : ''),
      search ? [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`] : []
    );

    res.json({
      success: true,
      students,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students', error: error.message });
  }
});

// Get single student with complete details
router.get('/students/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [students] = await db.query(`
      SELECT gs.*, tc.name as class_name
      FROM global_students gs
      LEFT JOIN trade_classes tc ON gs.current_class_id = tc.id
      WHERE gs.id = ?
    `, [id]);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const student = students[0];

    // Get parents
    const [parents] = await db.query(`
      SELECT * FROM student_parents WHERE student_id = ? AND is_active = true
    `, [id]);

    // Get academic records
    const [academicRecords] = await db.query(`
      SELECT * FROM student_academic_records 
      WHERE student_id = ? 
      ORDER BY academic_year DESC, term DESC
      LIMIT 10
    `, [id]);

    // Get attendance summary
    const [attendanceSummary] = await db.query(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late_days
      FROM student_attendance
      WHERE student_id = ?
    `, [id]);

    // Get recent discipline records
    const [disciplineRecords] = await db.query(`
      SELECT * FROM student_discipline_records 
      WHERE student_id = ? 
      ORDER BY incident_date DESC
      LIMIT 5
    `, [id]);

    // Get fee payment summary
    const [feePayments] = await db.query(`
      SELECT 
        SUM(amount_paid) as total_paid,
        COUNT(*) as payment_count
      FROM student_fee_payments
      WHERE student_id = ? AND approval_status = 'Approved'
    `, [id]);

    // Get activities
    const [activities] = await db.query(`
      SELECT * FROM student_activities 
      WHERE student_id = ? AND is_active = true
    `, [id]);

    // Get recent health records
    const [healthRecords] = await db.query(`
      SELECT * FROM student_health_records 
      WHERE student_id = ? 
      ORDER BY visit_date DESC
      LIMIT 5
    `, [id]);

    res.json({
      success: true,
      student: {
        ...student,
        parents,
        academicRecords,
        attendanceSummary: attendanceSummary[0] || {},
        disciplineRecords,
        feePayments: feePayments[0] || { total_paid: 0, payment_count: 0 },
        activities,
        healthRecords
      }
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student details', error: error.message });
  }
});

// Create new student (Admin, Headmaster)
router.post('/students', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const studentData = req.body;
    
    const [result] = await db.query(`
      INSERT INTO global_students (
        student_id, admission_number, first_name, middle_name, last_name,
        date_of_birth, gender, nationality, national_id, phone, email,
        address, district, sector, cell, village, emergency_contact_name,
        emergency_contact_phone, emergency_contact_relationship, current_class_id,
        current_level, current_trade, academic_year, enrollment_date,
        academic_status, blood_group, allergies, medical_conditions,
        special_needs, disability_status, scholarship_status, scholarship_percentage,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      studentData.student_id, studentData.admission_number, studentData.first_name,
      studentData.middle_name || null, studentData.last_name, studentData.date_of_birth,
      studentData.gender, studentData.nationality || 'Rwandan', studentData.national_id || null,
      studentData.phone || null, studentData.email || null, studentData.address || null,
      studentData.district || null, studentData.sector || null, studentData.cell || null,
      studentData.village || null, studentData.emergency_contact_name || null,
      studentData.emergency_contact_phone || null, studentData.emergency_contact_relationship || null,
      studentData.current_class_id || null, studentData.current_level || null,
      studentData.current_trade || null, studentData.academic_year || null,
      studentData.enrollment_date || new Date(), studentData.academic_status || 'Active',
      studentData.blood_group || null, studentData.allergies || null,
      studentData.medical_conditions || null, studentData.special_needs || null,
      studentData.disability_status || 'None', studentData.scholarship_status || 'None',
      studentData.scholarship_percentage || 0, req.user.id
    ]);

    // Log staff action
    await db.query(`
      INSERT INTO staff_student_actions (
        staff_id, staff_role, staff_name, student_id, action_type,
        action_category, action_description, context_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id, req.user.role, req.user.name, result.insertId,
      'Student Registration', 'Academic',
      `New student ${studentData.first_name} ${studentData.last_name} registered`,
      JSON.stringify({ admission_number: studentData.admission_number })
    ]);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      studentId: result.insertId
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ success: false, message: 'Failed to create student', error: error.message });
  }
});

// Update student information
router.put('/students/:id', authenticateToken, requireRole(['admin', 'headmaster', 'teacher']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const allowedFields = [
      'first_name', 'middle_name', 'last_name', 'date_of_birth', 'gender',
      'phone', 'email', 'address', 'district', 'sector', 'cell', 'village',
      'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
      'current_class_id', 'current_level', 'current_trade', 'academic_year',
      'academic_status', 'blood_group', 'allergies', 'medical_conditions',
      'special_needs', 'disability_status', 'profile_image'
    ];

    const updateFields = [];
    const updateValues = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    updateFields.push('updated_by = ?');
    updateValues.push(req.user.id);
    updateValues.push(id);

    await db.query(`
      UPDATE global_students 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    // Log staff action
    await db.query(`
      INSERT INTO staff_student_actions (
        staff_id, staff_role, staff_name, student_id, action_type,
        action_category, action_description, context_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id, req.user.role, req.user.name, id,
      'Student Information Update', 'Academic',
      `Updated student information: ${Object.keys(updates).join(', ')}`,
      JSON.stringify(updates)
    ]);

    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ success: false, message: 'Failed to update student', error: error.message });
  }
});

// ========================================
// PARENT MANAGEMENT
// ========================================

// Add parent/guardian to student
router.post('/students/:id/parents', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { id } = req.params;
    const parentData = req.body;

    const [result] = await db.query(`
      INSERT INTO student_parents (
        student_id, parent_type, first_name, last_name, national_id,
        phone, email, address, occupation, workplace,
        portal_access, can_make_payments, can_view_grades,
        can_view_attendance, can_communicate_teachers,
        sms_notifications, email_notifications, whatsapp_notifications,
        is_primary_contact
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, parentData.parent_type, parentData.first_name, parentData.last_name,
      parentData.national_id || null, parentData.phone, parentData.email || null,
      parentData.address || null, parentData.occupation || null, parentData.workplace || null,
      parentData.portal_access !== false, parentData.can_make_payments !== false,
      parentData.can_view_grades !== false, parentData.can_view_attendance !== false,
      parentData.can_communicate_teachers !== false, parentData.sms_notifications !== false,
      parentData.email_notifications !== false, parentData.whatsapp_notifications || false,
      parentData.is_primary_contact || false
    ]);

    // Log action
    await db.query(`
      INSERT INTO staff_student_actions (
        staff_id, staff_role, staff_name, student_id, action_type,
        action_category, action_description
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id, req.user.role, req.user.name, id,
      'Parent/Guardian Added', 'Academic',
      `Added ${parentData.parent_type}: ${parentData.first_name} ${parentData.last_name}`
    ]);

    res.status(201).json({
      success: true,
      message: 'Parent/guardian added successfully',
      parentId: result.insertId
    });
  } catch (error) {
    console.error('Error adding parent:', error);
    res.status(500).json({ success: false, message: 'Failed to add parent', error: error.message });
  }
});

// Get student parents
router.get('/students/:id/parents', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [parents] = await db.query(`
      SELECT * FROM student_parents 
      WHERE student_id = ? AND is_active = true
      ORDER BY is_primary_contact DESC, created_at ASC
    `, [id]);

    res.json({ success: true, parents });
  } catch (error) {
    console.error('Error fetching parents:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch parents', error: error.message });
  }
});

// ========================================
// ATTENDANCE MANAGEMENT
// ========================================

// Mark attendance (Teacher, Patron, Matron, Admin)
router.post('/attendance', authenticateToken, requireRole(['teacher', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { student_id, date, status, subject_id, period_number, class_id, remarks, verification_method } = req.body;

    const [result] = await db.query(`
      INSERT INTO student_attendance (
        student_id, date, day_of_week, status, time_in, subject_id,
        period_number, class_id, marked_by, remarks, verification_method, verified
      ) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        time_in = VALUES(time_in),
        marked_by = VALUES(marked_by),
        remarks = VALUES(remarks),
        verification_method = VALUES(verification_method),
        verified = VALUES(verified)
    `, [
      student_id, date || new Date().toISOString().split('T')[0],
      new Date(date || Date.now()).toLocaleDateString('en-US', { weekday: 'long' }),
      status, subject_id || null, period_number || null, class_id || null,
      req.user.id, remarks || null, verification_method || 'Manual', true
    ]);

    // Update student attendance percentage
    const [summary] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present
      FROM student_attendance WHERE student_id = ?
    `, [student_id]);

    const attendancePercentage = (summary[0].present / summary[0].total) * 100;

    await db.query(`
      UPDATE global_students 
      SET overall_attendance_percentage = ?
      WHERE id = ?
    `, [attendancePercentage, student_id]);

    // Log action
    await db.query(`
      INSERT INTO staff_student_actions (
        staff_id, staff_role, staff_name, student_id, action_type,
        action_category, action_description
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id, req.user.role, req.user.name, student_id,
      'Attendance Marked', 'Attendance',
      `Marked as ${status} for ${date}`
    ]);

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      attendancePercentage
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to mark attendance', error: error.message });
  }
});

// Bulk attendance marking
router.post('/attendance/bulk', authenticateToken, requireRole(['teacher', 'patron', 'matron', 'admin']), async (req, res) => {
  try {
    const { attendanceRecords } = req.body;

    for (const record of attendanceRecords) {
      await db.query(`
        INSERT INTO student_attendance (
          student_id, date, day_of_week, status, time_in, subject_id,
          period_number, class_id, marked_by, verification_method, verified
        ) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, 'Manual', true)
        ON DUPLICATE KEY UPDATE
          status = VALUES(status),
          marked_by = VALUES(marked_by)
      `, [
        record.student_id, record.date || new Date().toISOString().split('T')[0],
        new Date(record.date || Date.now()).toLocaleDateString('en-US', { weekday: 'long' }),
        record.status, record.subject_id || null, record.period_number || null,
        record.class_id || null, req.user.id
      ]);

      // Log action
      await db.query(`
        INSERT INTO staff_student_actions (
          staff_id, staff_role, staff_name, student_id, action_type,
          action_category, action_description
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        req.user.id, req.user.role, req.user.name, record.student_id,
        'Bulk Attendance Marked', 'Attendance',
        `Marked as ${record.status}`
      ]);
    }

    res.json({
      success: true,
      message: `Attendance marked for ${attendanceRecords.length} students`
    });
  } catch (error) {
    console.error('Error marking bulk attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to mark bulk attendance', error: error.message });
  }
});

// Get student attendance
router.get('/students/:id/attendance', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date, subject_id } = req.query;

    let query = `
      SELECT sa.*, s.name as subject_name, u.name as marked_by_name
      FROM student_attendance sa
      LEFT JOIN subjects s ON sa.subject_id = s.id
      LEFT JOIN users u ON sa.marked_by = u.id
      WHERE sa.student_id = ?
    `;
    const params = [id];

    if (start_date) {
      query += ` AND sa.date >= ?`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND sa.date <= ?`;
      params.push(end_date);
    }

    if (subject_id) {
      query += ` AND sa.subject_id = ?`;
      params.push(subject_id);
    }

    query += ` ORDER BY sa.date DESC, sa.period_number ASC`;

    const [attendance] = await db.query(query, params);

    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance', error: error.message });
  }
});

module.exports = router;
