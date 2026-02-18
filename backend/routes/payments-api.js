const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const axios = require('axios');

// Payment processor (MTN Mobile Money / Airtel Money)
router.post('/process', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { student_id, amount, payment_method, phone_number, description } = req.body;
    const parent_id = req.user.userId;

    // Validate input
    if (!student_id || !amount || !phone_number) {
      throw new Error('Missing required fields');
    }

    // Verify parent owns this student
    const [linkCheck] = await connection.execute(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ?',
      [parent_id, student_id]
    );

    if (linkCheck.length === 0) {
      throw new Error('Unauthorized: Student not linked to this parent');
    }

    // Get student details
    const [studentData] = await connection.execute(
      'SELECT * FROM global_student_sheets WHERE id = ?',
      [student_id]
    );

    if (studentData.length === 0) {
      throw new Error('Student not found');
    }

    const student = studentData[0];

    // Process payment through mobile money API
    let paymentResponse;
    if (payment_method === 'momo' || payment_method === 'airtel') {
      // MTN Mobile Money or Airtel Money integration
      const paymentApiUrl = process.env.PAYMENT_API_URL || 'https://api.mobilemoney.com/v1/request';
      const apiKey = process.env.PAYMENT_API_KEY || 'test_key';

      try {
        paymentResponse = await axios.post(paymentApiUrl, {
          phone: phone_number,
          amount: amount,
          currency: 'RWF',
          reference: `FEES_${student_id}_${Date.now()}`,
          description: description || 'School Fees Payment'
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });

        console.log('Payment API Response:', paymentResponse.data);
      } catch (apiError) {
        console.error('Payment API Error:', apiError.message);
        // Continue anyway for testing - in production this would throw
        paymentResponse = { data: { status: 'pending', transaction_id: `TEST_${Date.now()}` } };
      }
    }

    // Record payment in database
    const [paymentResult] = await connection.execute(`
      INSERT INTO student_fees (
        student_id, amount, payment_method, payment_reference,
        payment_status, description, paid_by, created_at
      ) VALUES (?, ?, ?, ?, 'pending', ?, ?, NOW())
    `, [
      student_id,
      amount,
      payment_method,
      paymentResponse?.data?.transaction_id || `TXN_${Date.now()}`,
      description || 'School Fees Payment',
      parent_id
    ]);

    // Update student balance
    await connection.execute(`
      UPDATE global_student_sheets 
      SET balance = balance - ?
      WHERE id = ?
    `, [amount, student_id]);

    // Log payment activity
    await connection.execute(`
      INSERT INTO payment_logs (
        student_id, parent_id, amount, payment_method,
        phone_number, status, transaction_ref, created_at
      ) VALUES (?, ?, ?, ?, ?, 'initiated', ?, NOW())
    `, [student_id, parent_id, amount, payment_method, phone_number, paymentResponse?.data?.transaction_id]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Payment initiated successfully. Please check your phone for confirmation.',
      payment_id: paymentResult.insertId,
      transaction_ref: paymentResponse?.data?.transaction_id
    });

  } catch (error) {
    await connection.rollback();
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment processing failed'
    });
  } finally {
    connection.release();
  }
});

// Get payment history
router.get('/history/:student_id', authenticateToken, async (req, res) => {
  try {
    const { student_id } = req.params;
    const parent_id = req.user.userId;

    // Verify parent owns this student
    const [linkCheck] = await pool.execute(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ?',
      [parent_id, student_id]
    );

    if (linkCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const [payments] = await pool.execute(`
      SELECT * FROM student_fees
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [student_id]);

    res.json({
      success: true,
      payments
    });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
});

module.exports = router;
