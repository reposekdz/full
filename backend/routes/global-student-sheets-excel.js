const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { requireRole } = require('../middleware/auth');

// Global Student Sheets - Excel-like functionality for all roles
// Accessible by: Admin, DOS, DOD, Teacher, Accountant, Headmaster

// Get all students with Excel-like data structure
router.get('/students/excel-view', requireRole(['admin', 'dos', 'dod', 'teacher', 'accountant', 'headmaster']), async (req, res) => {
  try {
    const { trade, level, search, sortBy = 'student_id', sortOrder = 'ASC', page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        s.id,
        s.student_id,
        s.first_name,
        s.last_name,
        s.email,
        s.phone,
        s.date_of_birth,
        s.gender,
        s.address,
        s.province,
        s.district,
        s.sector,
        s.cell,
        s.village,
        s.trade,
        s.level,
        s.academic_year,
        s.enrollment_date,
        s.status,
        s.guardian_name,
        s.guardian_phone,
        s.guardian_relationship,
        s.medical_conditions,
        s.emergency_contact,
        s.photo_url,
        s.created_at,
        s.updated_at,
        -- Academic Performance
        COALESCE(AVG(g.marks), 0) as average_marks,
        COUNT(DISTINCT g.id) as total_assessments,
        -- Attendance
        COALESCE(att.attendance_percentage, 0) as attendance_percentage,
        -- Fees
        COALESCE(f.total_fees, 0) as total_fees,
        COALESCE(f.paid_amount, 0) as paid_amount,
        COALESCE(f.balance, 0) as balance,
        f.fee_status,
        -- Discipline
        COALESCE(d.total_incidents, 0) as discipline_incidents,
        d.conduct_grade,
        -- Parent Information
        p.first_name as parent_first_name,
        p.last_name as parent_last_name,
        p.phone as parent_phone,
        p.email as parent_email
      FROM students s
      LEFT JOIN grades g ON s.id = g.student_id
      LEFT JOIN (
        SELECT 
          student_id,
          ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
        FROM attendance 
        GROUP BY student_id
      ) att ON s.id = att.student_id
      LEFT JOIN (
        SELECT 
          student_id,
          SUM(amount) as total_fees,
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as balance,
          CASE 
            WHEN SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) = 0 THEN 'paid'
            WHEN SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) > 0 THEN 'partial'
            ELSE 'unpaid'
          END as fee_status
        FROM fees 
        GROUP BY student_id
      ) f ON s.id = f.student_id
      LEFT JOIN (
        SELECT 
          student_id,
          COUNT(*) as total_incidents,
          AVG(severity_level) as conduct_grade
        FROM discipline_records 
        GROUP BY student_id
      ) d ON s.id = d.student_id
      LEFT JOIN parent_student_links psl ON s.id = psl.student_id AND psl.status = 'approved'
      LEFT JOIN parents p ON psl.parent_id = p.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (trade) {
      query += ` AND s.trade = $${paramIndex}`;
      params.push(trade);
      paramIndex++;
    }

    if (level) {
      query += ` AND s.level = $${paramIndex}`;
      params.push(level);
      paramIndex++;
    }

    if (search) {
      query += ` AND (s.first_name ILIKE $${paramIndex} OR s.last_name ILIKE $${paramIndex} OR s.student_id ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` GROUP BY s.id, att.attendance_percentage, f.total_fees, f.paid_amount, f.balance, f.fee_status, d.total_incidents, d.conduct_grade, p.first_name, p.last_name, p.phone, p.email`;
    query += ` ORDER BY s.${sortBy} ${sortOrder}`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(DISTINCT s.id) as total FROM students s WHERE 1=1`;
    const countParams = [];
    let countParamIndex = 1;

    if (trade) {
      countQuery += ` AND s.trade = $${countParamIndex}`;
      countParams.push(trade);
      countParamIndex++;
    }

    if (level) {
      countQuery += ` AND s.level = $${countParamIndex}`;
      countParams.push(level);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (s.first_name ILIKE $${countParamIndex} OR s.last_name ILIKE $${countParamIndex} OR s.student_id ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await db.query(countQuery, countParams);
    const totalStudents = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalStudents / limit),
        totalStudents,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching student excel view:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student details for specific roles
router.get('/students/:id/details', requireRole(['admin', 'dos', 'dod', 'teacher', 'accountant', 'headmaster']), async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    let query = `
      SELECT 
        s.*,
        -- Academic Performance
        json_agg(DISTINCT jsonb_build_object(
          'subject', g.subject,
          'marks', g.marks,
          'grade', g.grade,
          'assessment_type', g.assessment_type,
          'date', g.created_at
        )) FILTER (WHERE g.id IS NOT NULL) as academic_records,
        -- Attendance Records
        json_agg(DISTINCT jsonb_build_object(
          'date', att.date,
          'status', att.status,
          'subject', att.subject,
          'remarks', att.remarks
        )) FILTER (WHERE att.id IS NOT NULL) as attendance_records,
        -- Fee Records
        json_agg(DISTINCT jsonb_build_object(
          'fee_type', f.fee_type,
          'amount', f.amount,
          'status', f.status,
          'due_date', f.due_date,
          'paid_date', f.paid_date
        )) FILTER (WHERE f.id IS NOT NULL) as fee_records,
        -- Discipline Records
        json_agg(DISTINCT jsonb_build_object(
          'incident_type', dr.incident_type,
          'description', dr.description,
          'action_taken', dr.action_taken,
          'severity_level', dr.severity_level,
          'date', dr.incident_date
        )) FILTER (WHERE dr.id IS NOT NULL) as discipline_records,
        -- Parent Information
        json_agg(DISTINCT jsonb_build_object(
          'parent_name', p.first_name || ' ' || p.last_name,
          'relationship', psl.relationship_type,
          'phone', p.phone,
          'email', p.email
        )) FILTER (WHERE p.id IS NOT NULL) as parent_info
      FROM students s
      LEFT JOIN grades g ON s.id = g.student_id
      LEFT JOIN attendance att ON s.id = att.student_id
      LEFT JOIN fees f ON s.id = f.student_id
      LEFT JOIN discipline_records dr ON s.id = dr.student_id
      LEFT JOIN parent_student_links psl ON s.id = psl.student_id AND psl.status = 'approved'
      LEFT JOIN parents p ON psl.parent_id = p.id
      WHERE s.id = $1
      GROUP BY s.id
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const student = result.rows[0];

    // Filter data based on user role
    const filteredData = {
      ...student,
      academic_records: userRole === 'teacher' || userRole === 'dos' || userRole === 'admin' ? student.academic_records : null,
      fee_records: userRole === 'accountant' || userRole === 'admin' ? student.fee_records : null,
      discipline_records: userRole === 'dod' || userRole === 'admin' ? student.discipline_records : null,
      attendance_records: userRole === 'teacher' || userRole === 'dos' || userRole === 'admin' ? student.attendance_records : null
    };

    res.json({
      success: true,
      data: filteredData
    });

  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add new student (Admin, DOS only)
router.post('/students', requireRole(['admin', 'dos']), async (req, res) => {
  try {
    const {
      student_id, first_name, last_name, email, phone, date_of_birth,
      gender, address, province, district, sector, cell, village,
      trade, level, academic_year, guardian_name, guardian_phone,
      guardian_relationship, medical_conditions, emergency_contact
    } = req.body;

    // Generate student ID if not provided
    const generatedStudentId = student_id || `STD${Date.now()}`;

    const query = `
      INSERT INTO students (
        student_id, first_name, last_name, email, phone, date_of_birth,
        gender, address, province, district, sector, cell, village,
        trade, level, academic_year, guardian_name, guardian_phone,
        guardian_relationship, medical_conditions, emergency_contact,
        status, enrollment_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20, $21, 'active', CURRENT_DATE
      ) RETURNING *
    `;

    const values = [
      generatedStudentId, first_name, last_name, email, phone, date_of_birth,
      gender, address, province, district, sector, cell, village,
      trade, level, academic_year, guardian_name, guardian_phone,
      guardian_relationship, medical_conditions, emergency_contact
    ];

    const result = await db.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error adding student:', error);
    if (error.code === '23505') {
      res.status(400).json({ success: false, message: 'Student ID or email already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
});

// Update student information
router.put('/students/:id', requireRole(['admin', 'dos']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'id') {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(updates[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const query = `
      UPDATE students 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    values.push(id);

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete student (Admin only)
router.delete('/students/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Bulk operations for Excel-like functionality
router.post('/students/bulk-update', requireRole(['admin', 'dos']), async (req, res) => {
  try {
    const { updates } = req.body; // Array of {id, ...fields}

    const results = [];
    
    for (const update of updates) {
      const { id, ...fields } = update;
      
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      Object.keys(fields).forEach(key => {
        if (fields[key] !== undefined) {
          updateFields.push(`${key} = $${paramIndex}`);
          values.push(fields[key]);
          paramIndex++;
        }
      });

      if (updateFields.length > 0) {
        const query = `
          UPDATE students 
          SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE id = $${paramIndex}
          RETURNING id, student_id, first_name, last_name
        `;
        values.push(id);

        const result = await db.query(query, values);
        results.push(result.rows[0]);
      }
    }

    res.json({
      success: true,
      message: `${results.length} students updated successfully`,
      data: results
    });

  } catch (error) {
    console.error('Error bulk updating students:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Export students data (Excel format)
router.get('/students/export', requireRole(['admin', 'dos', 'dod', 'teacher', 'accountant', 'headmaster']), async (req, res) => {
  try {
    const { format = 'json', trade, level } = req.query;

    let query = `
      SELECT 
        s.student_id as "Student ID",
        s.first_name as "First Name",
        s.last_name as "Last Name",
        s.email as "Email",
        s.phone as "Phone",
        s.date_of_birth as "Date of Birth",
        s.gender as "Gender",
        s.trade as "Trade",
        s.level as "Level",
        s.academic_year as "Academic Year",
        s.status as "Status",
        s.enrollment_date as "Enrollment Date",
        COALESCE(AVG(g.marks), 0) as "Average Marks",
        COALESCE(att.attendance_percentage, 0) as "Attendance %",
        COALESCE(f.balance, 0) as "Fee Balance",
        f.fee_status as "Fee Status"
      FROM students s
      LEFT JOIN grades g ON s.id = g.student_id
      LEFT JOIN (
        SELECT 
          student_id,
          ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
        FROM attendance 
        GROUP BY student_id
      ) att ON s.id = att.student_id
      LEFT JOIN (
        SELECT 
          student_id,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as balance,
          CASE 
            WHEN SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) = 0 THEN 'paid'
            WHEN SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) > 0 THEN 'partial'
            ELSE 'unpaid'
          END as fee_status
        FROM fees 
        GROUP BY student_id
      ) f ON s.id = f.student_id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (trade) {
      query += ` AND s.trade = $${paramIndex}`;
      params.push(trade);
      paramIndex++;
    }

    if (level) {
      query += ` AND s.level = $${paramIndex}`;
      params.push(level);
      paramIndex++;
    }

    query += ` GROUP BY s.id, att.attendance_percentage, f.balance, f.fee_status ORDER BY s.student_id`;

    const result = await db.query(query, params);

    if (format === 'csv') {
      // Convert to CSV format
      const headers = Object.keys(result.rows[0] || {});
      const csvContent = [
        headers.join(','),
        ...result.rows.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=students_export.csv');
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        data: result.rows,
        total: result.rows.length
      });
    }

  } catch (error) {
    console.error('Error exporting students:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get statistics for dashboard
router.get('/students/statistics', requireRole(['admin', 'dos', 'dod', 'teacher', 'accountant', 'headmaster']), async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_students,
        COUNT(CASE WHEN gender = 'male' THEN 1 END) as male_students,
        COUNT(CASE WHEN gender = 'female' THEN 1 END) as female_students,
        COUNT(DISTINCT trade) as total_trades,
        COUNT(DISTINCT level) as total_levels
      FROM students
    `);

    const tradeStats = await db.query(`
      SELECT 
        trade,
        COUNT(*) as student_count,
        COUNT(CASE WHEN gender = 'male' THEN 1 END) as male_count,
        COUNT(CASE WHEN gender = 'female' THEN 1 END) as female_count
      FROM students 
      WHERE status = 'active'
      GROUP BY trade
      ORDER BY student_count DESC
    `);

    const levelStats = await db.query(`
      SELECT 
        level,
        COUNT(*) as student_count
      FROM students 
      WHERE status = 'active'
      GROUP BY level
      ORDER BY level
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        by_trade: tradeStats.rows,
        by_level: levelStats.rows
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;