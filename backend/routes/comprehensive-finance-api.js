const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/fee-types', async (req, res) => {
  try {
    const { isActive } = req.query;
    
    let query = 'SELECT * FROM fee_types WHERE 1=1';
    const params = [];

    if (isActive !== undefined) {
      query += ' AND is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    query += ' ORDER BY name ASC';

    const [feeTypes] = await pool.query(query, params);

    res.json({ success: true, data: feeTypes });
  } catch (error) {
    console.error('Error fetching fee types:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fee types', error: error.message });
  }
});

router.post('/fee-types', async (req, res) => {
  try {
    const { name, description, defaultAmount, frequency, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const [result] = await pool.query(`
      INSERT INTO fee_types (name, description, default_amount, frequency, is_active)
      VALUES (?, ?, ?, ?, ?)
    `, [name, description, defaultAmount || 0, frequency || 'one_time', isActive !== undefined ? isActive : true]);

    const [newFeeType] = await pool.query('SELECT * FROM fee_types WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Fee type created successfully',
      data: newFeeType[0]
    });
  } catch (error) {
    console.error('Error creating fee type:', error);
    res.status(500).json({ success: false, message: 'Failed to create fee type', error: error.message });
  }
});

router.put('/fee-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, defaultAmount, frequency, isActive } = req.body;

    const [existing] = await pool.query('SELECT * FROM fee_types WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Fee type not found' });
    }

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (defaultAmount !== undefined) { updates.push('default_amount = ?'); params.push(defaultAmount); }
    if (frequency) { updates.push('frequency = ?'); params.push(frequency); }
    if (isActive !== undefined) { updates.push('is_active = ?'); params.push(isActive); }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE fee_types SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await pool.query('SELECT * FROM fee_types WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Fee type updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating fee type:', error);
    res.status(500).json({ success: false, message: 'Failed to update fee type', error: error.message });
  }
});

router.delete('/fee-types/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [existing] = await connection.query('SELECT * FROM fee_types WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Fee type not found' });
    }

    const [structureCheck] = await connection.query('SELECT COUNT(*) as count FROM fee_structures WHERE fee_type_id = ?', [id]);
    if (structureCheck[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete fee type with associated fee structures' 
      });
    }

    await connection.query('DELETE FROM fee_types WHERE id = ?', [id]);

    await connection.commit();

    res.json({ success: true, message: 'Fee type deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting fee type:', error);
    res.status(500).json({ success: false, message: 'Failed to delete fee type', error: error.message });
  } finally {
    connection.release();
  }
});

router.get('/fee-structures', async (req, res) => {
  try {
    const { courseId, academicYearId, feeTypeId, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT fs.*, 
             c.name as course_name, c.code as course_code,
             ay.name as academic_year_name,
             ft.name as fee_type_name
      FROM fee_structures fs
      LEFT JOIN courses c ON fs.course_id = c.id
      LEFT JOIN academic_years ay ON fs.academic_year_id = ay.id
      LEFT JOIN fee_types ft ON fs.fee_type_id = ft.id
      WHERE 1=1
    `;
    const params = [];

    if (courseId) {
      query += ' AND fs.course_id = ?';
      params.push(courseId);
    }

    if (academicYearId) {
      query += ' AND fs.academic_year_id = ?';
      params.push(academicYearId);
    }

    if (feeTypeId) {
      query += ' AND fs.fee_type_id = ?';
      params.push(feeTypeId);
    }

    const countQuery = query.replace(/SELECT fs\.\*,[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0] ? countResult[0].total : 0;

    query += ' ORDER BY fs.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [structures] = await pool.query(query, params);

    res.json({
      success: true,
      data: structures,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching fee structures:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fee structures', error: error.message });
  }
});

router.post('/fee-structures', async (req, res) => {
  try {
    const { courseId, academicYearId, feeTypeId, amount, dueDate, description } = req.body;

    if (!courseId || !academicYearId || !feeTypeId || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course ID, academic year ID, fee type ID, and amount are required' 
      });
    }

    const [result] = await pool.query(`
      INSERT INTO fee_structures (course_id, academic_year_id, fee_type_id, amount, due_date, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [courseId, academicYearId, feeTypeId, amount, dueDate, description]);

    const [newStructure] = await pool.query(`
      SELECT fs.*, 
             c.name as course_name,
             ay.name as academic_year_name,
             ft.name as fee_type_name
      FROM fee_structures fs
      LEFT JOIN courses c ON fs.course_id = c.id
      LEFT JOIN academic_years ay ON fs.academic_year_id = ay.id
      LEFT JOIN fee_types ft ON fs.fee_type_id = ft.id
      WHERE fs.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Fee structure created successfully',
      data: newStructure[0]
    });
  } catch (error) {
    console.error('Error creating fee structure:', error);
    res.status(500).json({ success: false, message: 'Failed to create fee structure', error: error.message });
  }
});

router.put('/fee-structures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId, academicYearId, feeTypeId, amount, dueDate, description } = req.body;

    const [existing] = await pool.query('SELECT * FROM fee_structures WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Fee structure not found' });
    }

    const updates = [];
    const params = [];

    if (courseId) { updates.push('course_id = ?'); params.push(courseId); }
    if (academicYearId) { updates.push('academic_year_id = ?'); params.push(academicYearId); }
    if (feeTypeId) { updates.push('fee_type_id = ?'); params.push(feeTypeId); }
    if (amount !== undefined) { updates.push('amount = ?'); params.push(amount); }
    if (dueDate !== undefined) { updates.push('due_date = ?'); params.push(dueDate); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE fee_structures SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await pool.query(`
      SELECT fs.*, 
             c.name as course_name,
             ay.name as academic_year_name,
             ft.name as fee_type_name
      FROM fee_structures fs
      LEFT JOIN courses c ON fs.course_id = c.id
      LEFT JOIN academic_years ay ON fs.academic_year_id = ay.id
      LEFT JOIN fee_types ft ON fs.fee_type_id = ft.id
      WHERE fs.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Fee structure updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating fee structure:', error);
    res.status(500).json({ success: false, message: 'Failed to update fee structure', error: error.message });
  }
});

router.delete('/fee-structures/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM fee_structures WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Fee structure not found' });
    }

    await pool.query('DELETE FROM fee_structures WHERE id = ?', [id]);

    res.json({ success: true, message: 'Fee structure deleted successfully' });
  } catch (error) {
    console.error('Error deleting fee structure:', error);
    res.status(500).json({ success: false, message: 'Failed to delete fee structure', error: error.message });
  }
});

router.get('/fee-payments', async (req, res) => {
  try {
    const { studentId, status, dateFrom, dateTo, page = 1, limit = 50, sortBy = 'payment_date', sortOrder = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT fp.*, 
             u.username, u.first_name, u.last_name, u.student_id as student_code,
             fs.amount as fee_amount,
             ft.name as fee_type_name,
             c.name as course_name
      FROM fee_payments fp
      INNER JOIN users u ON fp.student_id = u.id
      LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
      LEFT JOIN fee_types ft ON fs.fee_type_id = ft.id
      LEFT JOIN courses c ON fs.course_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (studentId) {
      query += ' AND fp.student_id = ?';
      params.push(studentId);
    }

    if (status) {
      query += ' AND fp.status = ?';
      params.push(status);
    }

    if (dateFrom) {
      query += ' AND fp.payment_date >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND fp.payment_date <= ?';
      params.push(dateTo);
    }

    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    const validSortFields = ['payment_date', 'amount', 'status', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'payment_date';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY fp.${sortField} ${order} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [payments] = await pool.query(query, params);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching fee payments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fee payments', error: error.message });
  }
});

router.get('/fee-payments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [payments] = await pool.query(`
      SELECT fp.*, 
             u.username, u.first_name, u.last_name, u.email, u.phone, u.student_id as student_code,
             fs.amount as fee_amount, fs.due_date,
             ft.name as fee_type_name,
             c.name as course_name,
             ay.name as academic_year_name
      FROM fee_payments fp
      INNER JOIN users u ON fp.student_id = u.id
      LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
      LEFT JOIN fee_types ft ON fs.fee_type_id = ft.id
      LEFT JOIN courses c ON fs.course_id = c.id
      LEFT JOIN academic_years ay ON fs.academic_year_id = ay.id
      WHERE fp.id = ?
    `, [id]);

    if (payments.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({ success: true, data: payments[0] });
  } catch (error) {
    console.error('Error fetching fee payment:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fee payment', error: error.message });
  }
});

router.post('/fee-payments', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { studentId, feeStructureId, amount, paymentDate, paymentMethod, transactionReference, status, notes } = req.body;

    if (!studentId || !feeStructureId || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student ID, fee structure ID, and amount are required' 
      });
    }

    const [studentCheck] = await connection.query('SELECT id FROM users WHERE id = ?', [studentId]);
    if (studentCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const [structureCheck] = await connection.query('SELECT * FROM fee_structures WHERE id = ?', [feeStructureId]);
    if (structureCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Fee structure not found' });
    }

    const [result] = await connection.query(`
      INSERT INTO fee_payments (
        student_id, fee_structure_id, amount, payment_date, payment_method,
        transaction_reference, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      studentId, feeStructureId, amount, paymentDate || new Date(), paymentMethod,
      transactionReference, status || 'pending', notes
    ]);

    await connection.commit();

    const [newPayment] = await connection.query(`
      SELECT fp.*, 
             u.username, u.first_name, u.last_name,
             ft.name as fee_type_name
      FROM fee_payments fp
      INNER JOIN users u ON fp.student_id = u.id
      LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
      LEFT JOIN fee_types ft ON fs.fee_type_id = ft.id
      WHERE fp.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: newPayment[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating fee payment:', error);
    res.status(500).json({ success: false, message: 'Failed to create fee payment', error: error.message });
  } finally {
    connection.release();
  }
});

router.put('/fee-payments/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { amount, paymentDate, paymentMethod, transactionReference, status, notes } = req.body;

    const [existing] = await connection.query('SELECT * FROM fee_payments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const updates = [];
    const params = [];

    if (amount !== undefined) { updates.push('amount = ?'); params.push(amount); }
    if (paymentDate) { updates.push('payment_date = ?'); params.push(paymentDate); }
    if (paymentMethod) { updates.push('payment_method = ?'); params.push(paymentMethod); }
    if (transactionReference !== undefined) { updates.push('transaction_reference = ?'); params.push(transactionReference); }
    if (status) { updates.push('status = ?'); params.push(status); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }

    if (updates.length > 0) {
      params.push(id);
      await connection.query(`UPDATE fee_payments SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    await connection.commit();

    const [updated] = await connection.query(`
      SELECT fp.*, 
             u.username, u.first_name, u.last_name,
             ft.name as fee_type_name
      FROM fee_payments fp
      INNER JOIN users u ON fp.student_id = u.id
      LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
      LEFT JOIN fee_types ft ON fs.fee_type_id = ft.id
      WHERE fp.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: updated[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating fee payment:', error);
    res.status(500).json({ success: false, message: 'Failed to update fee payment', error: error.message });
  } finally {
    connection.release();
  }
});

router.delete('/fee-payments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM fee_payments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    await pool.query('DELETE FROM fee_payments WHERE id = ?', [id]);

    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting fee payment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete fee payment', error: error.message });
  }
});

router.get('/fee-payments/student/:studentId/summary', async (req, res) => {
  try {
    const { studentId } = req.params;

    const [summary] = await pool.query(`
      SELECT 
        SUM(CASE WHEN fp.status = 'paid' THEN fp.amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN fp.status = 'pending' THEN fp.amount ELSE 0 END) as total_pending,
        SUM(CASE WHEN fp.status = 'failed' THEN fp.amount ELSE 0 END) as total_failed,
        SUM(fp.amount) as total_amount,
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN fp.status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN fp.status = 'pending' THEN 1 END) as pending_count
      FROM fee_payments fp
      WHERE fp.student_id = ?
    `, [studentId]);

    const [recentPayments] = await pool.query(`
      SELECT fp.*, ft.name as fee_type_name
      FROM fee_payments fp
      LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
      LEFT JOIN fee_types ft ON fs.fee_type_id = ft.id
      WHERE fp.student_id = ?
      ORDER BY fp.payment_date DESC
      LIMIT 10
    `, [studentId]);

    const [outstandingFees] = await pool.query(`
      SELECT fs.*, ft.name as fee_type_name, c.name as course_name,
             COALESCE(SUM(fp.amount), 0) as paid_amount,
             (fs.amount - COALESCE(SUM(fp.amount), 0)) as outstanding_amount
      FROM fee_structures fs
      LEFT JOIN fee_types ft ON fs.fee_type_id = ft.id
      LEFT JOIN courses c ON fs.course_id = c.id
      LEFT JOIN fee_payments fp ON fs.id = fp.fee_structure_id AND fp.student_id = ? AND fp.status = 'paid'
      WHERE fs.course_id IN (
        SELECT course_id FROM classes c
        INNER JOIN enrollments e ON c.id = e.class_id
        WHERE e.student_id = ?
      )
      GROUP BY fs.id
      HAVING outstanding_amount > 0
    `, [studentId, studentId]);

    res.json({
      success: true,
      data: {
        summary: summary[0],
        recentPayments,
        outstandingFees
      }
    });
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment summary', error: error.message });
  }
});

router.get('/financial-reports', async (req, res) => {
  try {
    const { reportType = 'overview', startDate, endDate, courseId, academicYearId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Start date and end date are required' 
      });
    }

    let reportData = {};

    if (reportType === 'overview' || reportType === 'all') {
      const [overview] = await pool.query(`
        SELECT 
          COUNT(DISTINCT student_id) as total_students,
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_revenue,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_revenue,
          SUM(amount) as expected_revenue,
          COUNT(*) as total_transactions,
          AVG(CASE WHEN status = 'paid' THEN amount END) as average_payment
        FROM fee_payments
        WHERE payment_date BETWEEN ? AND ?
      `, [startDate, endDate]);
      reportData.overview = overview[0];
    }

    if (reportType === 'by_course' || reportType === 'all') {
      const [byCourse] = await pool.query(`
        SELECT c.name as course_name, c.code as course_code,
               SUM(CASE WHEN fp.status = 'paid' THEN fp.amount ELSE 0 END) as revenue,
               COUNT(DISTINCT fp.student_id) as student_count,
               COUNT(fp.id) as transaction_count
        FROM fee_payments fp
        LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
        LEFT JOIN courses c ON fs.course_id = c.id
        WHERE fp.payment_date BETWEEN ? AND ?
        ${courseId ? 'AND c.id = ?' : ''}
        GROUP BY c.id
        ORDER BY revenue DESC
      `, courseId ? [startDate, endDate, courseId] : [startDate, endDate]);
      reportData.byCourse = byCourse;
    }

    if (reportType === 'by_fee_type' || reportType === 'all') {
      const [byFeeType] = await pool.query(`
        SELECT ft.name as fee_type_name,
               SUM(CASE WHEN fp.status = 'paid' THEN fp.amount ELSE 0 END) as revenue,
               COUNT(fp.id) as transaction_count
        FROM fee_payments fp
        LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
        LEFT JOIN fee_types ft ON fs.fee_type_id = ft.id
        WHERE fp.payment_date BETWEEN ? AND ?
        GROUP BY ft.id
        ORDER BY revenue DESC
      `, [startDate, endDate]);
      reportData.byFeeType = byFeeType;
    }

    if (reportType === 'payment_methods' || reportType === 'all') {
      const [byPaymentMethod] = await pool.query(`
        SELECT payment_method,
               COUNT(*) as transaction_count,
               SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as revenue
        FROM fee_payments
        WHERE payment_date BETWEEN ? AND ?
        GROUP BY payment_method
        ORDER BY revenue DESC
      `, [startDate, endDate]);
      reportData.paymentMethods = byPaymentMethod;
    }

    if (reportType === 'daily' || reportType === 'all') {
      const [daily] = await pool.query(`
        SELECT DATE(payment_date) as date,
               COUNT(*) as transaction_count,
               SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as revenue
        FROM fee_payments
        WHERE payment_date BETWEEN ? AND ?
        GROUP BY DATE(payment_date)
        ORDER BY date ASC
      `, [startDate, endDate]);
      reportData.daily = daily;
    }

    res.json({
      success: true,
      data: reportData,
      filters: { reportType, startDate, endDate, courseId, academicYearId }
    });
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ success: false, message: 'Failed to generate financial report', error: error.message });
  }
});

router.get('/outstanding-fees', async (req, res) => {
  try {
    const { courseId, academicYearId, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.id, u.username, u.first_name, u.last_name, u.email, u.student_id,
             c.name as course_name,
             ay.name as academic_year_name,
             SUM(fs.amount) as total_fees,
             COALESCE(SUM(fp.amount), 0) as paid_amount,
             (SUM(fs.amount) - COALESCE(SUM(fp.amount), 0)) as outstanding_amount
      FROM users u
      INNER JOIN enrollments e ON u.id = e.student_id
      INNER JOIN classes cl ON e.class_id = cl.id
      INNER JOIN courses c ON cl.course_id = c.id
      INNER JOIN academic_years ay ON cl.academic_year_id = ay.id
      LEFT JOIN fee_structures fs ON c.id = fs.course_id AND ay.id = fs.academic_year_id
      LEFT JOIN fee_payments fp ON u.id = fp.student_id AND fs.id = fp.fee_structure_id AND fp.status = 'paid'
      WHERE 1=1
    `;
    const params = [];

    if (courseId) {
      query += ' AND c.id = ?';
      params.push(courseId);
    }

    if (academicYearId) {
      query += ' AND ay.id = ?';
      params.push(academicYearId);
    }

    query += ' GROUP BY u.id, c.id, ay.id HAVING outstanding_amount > 0';

    const countQuery = query.replace(/SELECT.*GROUP BY/, 'SELECT COUNT(DISTINCT u.id) as total FROM (SELECT u.id, c.id, ay.id FROM users u INNER JOIN enrollments e ON u.id = e.student_id INNER JOIN classes cl ON e.class_id = cl.id INNER JOIN courses c ON cl.course_id = c.id INNER JOIN academic_years ay ON cl.academic_year_id = ay.id WHERE 1=1');
    const countQueryFull = countQuery + ') t';

    query += ' ORDER BY outstanding_amount DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [results] = await pool.query(query, params);

    res.json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.length
      }
    });
  } catch (error) {
    console.error('Error fetching outstanding fees:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch outstanding fees', error: error.message });
  }
});

module.exports = router;
