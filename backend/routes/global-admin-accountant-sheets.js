const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ============================================
// GLOBAL STUDENT SHEETS - ADMIN & ACCOUNTANT
// ============================================
// Full access to all student data with Excel export
// Accessible by: Admin, Accountant, School Owner

// GET all students with full details (Excel-like view)
router.get('/students/full', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin or accountant role
    const allowedRoles = ['admin', 'accountant', 'school_owner', 'director_study', 'director_discipline', 'headmaster'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { 
      trade, 
      level, 
      search, 
      status,
      sortBy = 'id', 
      sortOrder = 'ASC',
      page = 1, 
      limit = 100 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let params = [];
    
    if (trade) {
      whereConditions.push('s.trade = ?');
      params.push(trade);
    }
    if (level) {
      whereConditions.push('s.level = ?');
      params.push(level);
    }
    if (status) {
      whereConditions.push('s.status = ?');
      params.push(status);
    }
    if (search) {
      whereConditions.push('(s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_id LIKE ? OR s.email LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM students s ${whereClause}`,
      params
    );
    const total = countResult[0].total;
    
    // Get students with full details
    const [students] = await db.query(`
      SELECT 
        s.*,
        COALESCE((
          SELECT SUM(COALESCE(fp.amount, 0))
          FROM fee_payments fp 
          WHERE fp.student_id = s.id AND fp.status = 'completed'
        ), 0) as total_paid,
        COALESCE((
          SELECT SUM(COALESCE(f.amount, 0))
          FROM fees f 
          WHERE f.student_id = s.id
        ), 0) as total_fees,
        COALESCE((
          SELECT ROUND(AVG(g.marks), 2)
          FROM grades g 
          WHERE g.student_id = s.id
        ), 0) as average_marks,
        COALESCE((
          SELECT COUNT(*) 
          FROM grades g 
          WHERE g.student_id = s.id
        ), 0) as total_subjects
      FROM students s
      ${whereClause}
      ORDER BY s.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);
    
    res.json({
      success: true,
      data: students,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching full student data:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET single student full details
router.get('/students/:id/full', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'accountant', 'school_owner', 'director_study', 'director_discipline', 'headmaster'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { id } = req.params;
    
    const [students] = await db.query(`
      SELECT 
        s.*,
        COALESCE((
          SELECT SUM(COALESCE(fp.amount, 0))
          FROM fee_payments fp 
          WHERE fp.student_id = s.id AND fp.status = 'completed'
        ), 0) as total_paid,
        COALESCE((
          SELECT SUM(COALESCE(f.amount, 0))
          FROM fees f 
          WHERE f.student_id = s.id
        ), 0) as total_fees,
        COALESCE((
          SELECT ROUND(AVG(g.marks), 2)
          FROM grades g 
          WHERE g.student_id = s.id
        ), 0) as average_marks
      FROM students s
      WHERE s.id = ?
    `, [id]);
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Get fee history
    const [feeHistory] = await db.query(`
      SELECT * FROM fee_payments 
      WHERE student_id = ? 
      ORDER BY payment_date DESC
    `, [id]);
    
    // Get grades
    const [grades] = await db.query(`
      SELECT g.*, c.course_name 
      FROM grades g
      LEFT JOIN courses c ON g.course_id = c.id
      WHERE g.student_id = ?
      ORDER BY g.created_at DESC
    `, [id]);
    
    // Get attendance
    const [attendance] = await db.query(`
      SELECT * FROM attendance 
      WHERE student_id = ?
      ORDER BY date DESC
      LIMIT 30
    `, [id]);
    
    res.json({
      success: true,
      data: {
        ...students[0],
        fee_history: feeHistory,
        grades: grades,
        attendance: attendance
      }
    });
  } catch (error) {
    console.error('Error fetching student full details:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET students for Excel export
router.get('/students/export/excel', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'accountant', 'school_owner', 'director_study', 'director_discipline', 'headmaster'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { trade, level, status, academic_year } = req.query;
    
    let whereConditions = [];
    let params = [];
    
    if (trade) {
      whereConditions.push('s.trade = ?');
      params.push(trade);
    }
    if (level) {
      whereConditions.push('s.level = ?');
      params.push(level);
    }
    if (status) {
      whereConditions.push('s.status = ?');
      params.push(status);
    }
    if (academic_year) {
      whereConditions.push('s.academic_year = ?');
      params.push(academic_year);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    const [students] = await db.query(`
      SELECT 
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
        COALESCE((
          SELECT SUM(COALESCE(fp.amount, 0))
          FROM fee_payments fp 
          WHERE fp.student_id = s.id AND fp.status = 'completed'
        ), 0) as total_paid,
        COALESCE((
          SELECT SUM(COALESCE(f.amount, 0))
          FROM fees f 
          WHERE f.student_id = s.id
        ), 0) as total_fees,
        COALESCE((
          SELECT SUM(COALESCE(fp.amount, 0))
          FROM fee_payments fp 
          WHERE fp.student_id = s.id AND fp.status = 'completed'
        ), 0) - COALESCE((
          SELECT SUM(COALESCE(f.amount, 0))
          FROM fees f 
          WHERE f.student_id = s.id
        ), 0) as balance,
        COALESCE((
          SELECT ROUND(AVG(g.marks), 2)
          FROM grades g 
          WHERE g.student_id = s.id
        ), 0) as average_marks,
        s.created_at
      FROM students s
      ${whereClause}
      ORDER BY s.trade, s.level, s.last_name
    `, params);
    
    // Format for Excel - add headers
    const excelData = students.map(s => ({
      'Student ID': s.student_id,
      'First Name': s.first_name,
      'Last Name': s.last_name,
      'Email': s.email,
      'Phone': s.phone,
      'Date of Birth': s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString() : '',
      'Gender': s.gender,
      'Address': s.address,
      'Province': s.province,
      'District': s.district,
      'Sector': s.sector,
      'Cell': s.cell,
      'Village': s.village,
      'Trade': s.trade,
      'Level': s.level,
      'Academic Year': s.academic_year,
      'Enrollment Date': s.enrollment_date ? new Date(s.enrollment_date).toLocaleDateString() : '',
      'Status': s.status,
      'Guardian Name': s.guardian_name,
      'Guardian Phone': s.guardian_phone,
      'Guardian Relationship': s.guardian_relationship,
      'Total Fees': s.total_fees,
      'Total Paid': s.total_paid,
      'Balance': s.balance,
      'Average Marks': s.average_marks
    }));
    
    res.json({
      success: true,
      data: excelData,
      count: excelData.length,
      format: 'excel-ready'
    });
  } catch (error) {
    console.error('Error exporting students:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET financial summary for all students
router.get('/students/financial-summary', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'accountant', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { trade, level, academic_year } = req.query;
    
    let whereConditions = [];
    let params = [];
    
    if (trade) {
      whereConditions.push('s.trade = ?');
      params.push(trade);
    }
    if (level) {
      whereConditions.push('s.level = ?');
      params.push(level);
    }
    if (academic_year) {
      whereConditions.push('s.academic_year = ?');
      params.push(academic_year);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    const [summary] = await db.query(`
      SELECT 
        COUNT(DISTINCT s.id) as total_students,
        COALESCE(SUM((
          SELECT SUM(COALESCE(f.amount, 0))
          FROM fees f 
          WHERE f.student_id = s.id
        )), 0) as total_expected_fees,
        COALESCE(SUM((
          SELECT SUM(COALESCE(fp.amount, 0))
          FROM fee_payments fp 
          WHERE fp.student_id = s.id AND fp.status = 'completed'
        )), 0) as total_collected,
        COALESCE(SUM((
          SELECT SUM(COALESCE(fp.amount, 0))
          FROM fee_payments fp 
          WHERE fp.student_id = s.id AND fp.status = 'completed'
        )), 0) - COALESCE(SUM((
          SELECT SUM(COALESCE(f.amount, 0))
          FROM fees f 
          WHERE f.student_id = s.id
        )), 0) as total_balance
      FROM students s
      ${whereClause}
    `, params);
    
    // Get payment status breakdown
    const [statusBreakdown] = await db.query(`
      SELECT 
        CASE 
          WHEN COALESCE((
            SELECT SUM(COALESCE(fp.amount, 0))
            FROM fee_payments fp 
            WHERE fp.student_id = s.id AND fp.status = 'completed'
          ), 0) >= COALESCE((
            SELECT SUM(COALESCE(f.amount, 0))
            FROM fees f 
            WHERE f.student_id = s.id
          ), 0) THEN 'paid'
          WHEN COALESCE((
            SELECT SUM(COALESCE(fp.amount, 0))
            FROM fee_payments fp 
            WHERE fp.student_id = s.id AND fp.status = 'completed'
          ), 0) > 0 THEN 'partial'
          ELSE 'unpaid'
        END as payment_status,
        COUNT(*) as count
      FROM students s
      ${whereClause}
      GROUP BY payment_status
    `, params);
    
    res.json({
      success: true,
      summary: summary[0],
      status_breakdown: statusBreakdown
    });
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET all unique trades and levels
router.get('/filters', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'accountant', 'school_owner', 'director_study', 'director_discipline', 'headmaster', 'teacher'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [trades] = await db.query(`
      SELECT DISTINCT trade FROM students WHERE trade IS NOT NULL ORDER BY trade
    `);
    
    const [levels] = await db.query(`
      SELECT DISTINCT level FROM students WHERE level IS NOT NULL ORDER BY level
    `);
    
    const [academicYears] = await db.query(`
      SELECT DISTINCT academic_year FROM students WHERE academic_year IS NOT NULL ORDER BY academic_year DESC
    `);
    
    res.json({
      success: true,
      data: {
        trades: trades.map(t => t.trade),
        levels: levels.map(l => l.level),
        academic_years: academicYears.map(a => a.academic_year)
      }
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// UPDATE student (admin/accountant only)
router.put('/students/:id', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'accountant', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { id } = req.params;
    const updates = req.body;
    
    // Remove protected fields
    delete updates.id;
    delete updates.password;
    delete updates.created_at;
    
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    
    await db.query(
      `UPDATE students SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );
    
    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// DELETE student (admin only)
router.delete('/students/:id', authenticateToken, async (req, res) => {
  try {
    if (!['admin', 'school_owner'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { id } = req.params;
    
    await db.query('DELETE FROM students WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// CREATE new student (admin/accountant only)
router.post('/students', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'accountant', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const student = req.body;
    
    // Generate student ID if not provided
    if (!student.student_id) {
      const year = new Date().getFullYear();
      const [count] = await db.query('SELECT COUNT(*) as count FROM students');
      student.student_id = `STU${year}${(count[0].count + 1).toString().padStart(4, '0')}`;
    }
    
    const fields = Object.keys(student);
    const values = Object.values(student);
    const placeholders = fields.map(() => '?').join(', ');
    
    const [result] = await db.query(
      `INSERT INTO students (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Student created successfully',
      student_id: result.insertId
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET student payments history
router.get('/students/:id/payments', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'accountant', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const [payments] = await db.query(`
      SELECT 
        fp.*,
        CASE 
          WHEN fp.payment_method = 'mobile_money' THEN 'Mobile Money'
          WHEN fp.payment_method = 'bank_transfer' THEN 'Bank Transfer'
          WHEN fp.payment_method = 'cash' THEN 'Cash'
          ELSE fp.payment_method
        END as payment_method_display
      FROM fee_payments fp
      WHERE fp.student_id = ?
      ORDER BY fp.payment_date DESC
      LIMIT ? OFFSET ?
    `, [id, parseInt(limit), parseInt(offset)]);
    
    const [totals] = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_paid,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as payment_count
      FROM fee_payments
      WHERE student_id = ?
    `, [id]);
    
    res.json({
      success: true,
      payments: payments,
      totals: totals[0]
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
