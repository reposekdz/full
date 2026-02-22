const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Submit fee payment
router.post('/pay', authenticateToken, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    const parentId = req.user.userId || req.user.id;
    const { student_id, amount, payment_method, phone, reference_number, payment_type, term, notes } = req.body;
    
    // Verify parent has access to student
    const [links] = await conn.query(
      'SELECT * FROM parent_child_links WHERE parent_id = ? AND student_id = ? AND status = "active"',
      [parentId, student_id]
    );
    
    if (links.length === 0) {
      await conn.rollback();
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Get student details
    const [students] = await conn.query('SELECT * FROM global_student_sheets WHERE id = ?', [student_id]);
    if (students.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const student = students[0];
    
    // Create payment record
    const receiptNumber = `RCP${Date.now()}${Math.random().toString(36).slice(-4).toUpperCase()}`;
    const [paymentResult] = await conn.query(
      `INSERT INTO fee_payments (
        student_id, parent_id, amount, payment_method, phone, reference_number,
        payment_type, term, notes, receipt_number, status, payment_date, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
      [student_id, parentId, amount, payment_method, phone, reference_number, payment_type, term, notes, receiptNumber]
    );
    
    // Update student balance
    await conn.query(
      'UPDATE global_student_sheets SET paid_fees = paid_fees + ?, balance = balance - ? WHERE id = ?',
      [amount, amount, student_id]
    );
    
    await conn.commit();
    
    // Send SMS confirmation
    try {
      const smsService = require('../services/smsService');
      const smsMessage = `Payment Received!\\n\\nStudent: ${student.first_name} ${student.last_name}\\nAmount: ${amount} RWF\\nReceipt: ${receiptNumber}\\nMethod: ${payment_method}\\n\\nThank you! - Garden TVET`;
      await smsService.sendSMS({ to: phone || student.phone, message: smsMessage, type: 'payment_confirmation', priority: 'high' });
    } catch (smsError) {
      console.error('SMS error:', smsError);
    }
    
    res.json({
      success: true,
      message: 'Payment submitted successfully',
      payment_id: paymentResult.insertId,
      receipt_number: receiptNumber,
      status: 'pending'
    });
    
  } catch (error) {
    await conn.rollback();
    console.error('Payment error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    conn.release();
  }
});

// Get payment history
router.get('/history/:studentId', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId || req.user.id;
    const { studentId } = req.params;
    
    // Verify access
    const [links] = await db.query(
      'SELECT * FROM parent_child_links WHERE parent_id = ? AND student_id = ? AND status = "active"',
      [parentId, studentId]
    );
    
    if (links.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const [payments] = await db.query(
      `SELECT * FROM fee_payments 
       WHERE student_id = ? 
       ORDER BY payment_date DESC`,
      [studentId]
    );
    
    res.json({ success: true, payments });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
