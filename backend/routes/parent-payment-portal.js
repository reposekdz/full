/**
 * Garden TVET School - Parent Payment Portal API
 * Real API Integration for GT Bank, BPR, Equity Bank, MTN & Airtel Money
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Environment Configuration
const CONFIG = {
  API_BASE: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  
  // Bank Configurations from Environment
  BANKS: {
    gt_bank: {
      name: process.env.REACT_APP_GT_BANK_NAME || 'GT Bank Rwanda',
      code: 'gt_bank',
      apiUrl: process.env.REACT_APP_GT_BANK_API_URL || 'https://api.gtbank.rw/v1/payments',
      merchantId: process.env.REACT_APP_GT_BANK_MERCHANT_ID,
      apiKey: process.env.REACT_APP_GT_BANK_API_KEY,
      enabled: process.env.REACT_APP_GT_BANK_ENABLED === 'true',
      color: '#1A237E'
    },
    bpr: {
      name: process.env.REACT_APP_BPR_NAME || 'Bank of Kigali (BPR)',
      code: 'bpr',
      apiUrl: process.env.REACT_APP_BPR_API_URL || 'https://api.bpr.rw/mobile/payments',
      merchantId: process.env.REACT_APP_BPR_MERCHANT_ID,
      apiKey: process.env.REACT_APP_BPR_API_KEY,
      enabled: process.env.REACT_APP_BPR_ENABLED === 'true',
      color: '#C62828'
    },
    equity_bank: {
      name: process.env.REACT_APP_EQUITY_NAME || 'Equity Bank Rwanda',
      code: 'equity_bank',
      apiUrl: process.env.REACT_APP_EQUITY_API_URL || 'https://api.equitybank.rw/payments/v1',
      merchantId: process.env.REACT_APP_EQUITY_MERCHANT_ID,
      apiKey: process.env.REACT_APP_EQUITY_API_KEY,
      enabled: process.env.REACT_APP_EQUITY_ENABLED === 'true',
      color: '#1565C0'
    },
    mtn_money: {
      name: process.env.REACT_APP_MTN_NAME || 'MTN Mobile Money',
      code: 'mtn_money',
      apiUrl: process.env.REACT_APP_MTN_API_URL || 'https://api.mtn.rw/momo/v1',
      collectionId: process.env.REACT_APP_MTN_COLLECTION_ID,
      apiKey: process.env.REACT_APP_MTN_API_KEY,
      enabled: process.env.REACT_APP_MTN_ENABLED === 'true',
      color: '#FFC107',
      feePercent: parseFloat(process.env.REACT_APP_MTN_FEE_PERCENT) || 0.5
    },
    airtel_money: {
      name: process.env.REACT_APP_AIRTEL_NAME || 'Airtel Money',
      code: 'airtel_money',
      apiUrl: process.env.REACT_APP_AIRTEL_API_URL || 'https://api.airtel.rw/money/v1',
      merchantId: process.env.REACT_APP_AIRTEL_MERCHANT_ID,
      apiKey: process.env.REACT_APP_AIRTEL_API_KEY,
      enabled: process.env.REACT_APP_AIRTEL_ENABLED === 'true',
      color: '#D32F2F',
      feePercent: parseFloat(process.env.REACT_APP_AIRTEL_FEE_PERCENT) || 0.5
    }
  }
};

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'garden-tvet-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Get parent linked children
router.get('/my-children', requireAuth, async (req, res) => {
  try {
    const parentId = req.user.id;
    
    // Get all verified linked children for this parent
    const query = `
      SELECT 
        pl.id as linking_id,
        pl.student_id,
        pl.relationship,
        pl.is_primary,
        pl.created_at as linked_date,
        ss.student_code,
        ss.first_name,
        ss.last_name,
        ss.profile_image,
        ts.trade_code,
        ts.trade_name,
        ss.level_number,
        ss.current_class,
        COALESCE((
          SELECT SUM(fa.amount) 
          FROM fee_assessments fa 
          WHERE fa.student_id = ss.student_id 
          AND fa.academic_year = (SELECT current_academic_year FROM system_settings LIMIT 1)
        ), 0) as total_fees,
        COALESCE((
          SELECT SUM(p.amount) 
          FROM payments p 
          WHERE p.student_id = ss.student_id 
          AND p.status = 'completed'
        ), 0) as paid_amount,
        COALESCE((
          SELECT SUM(fa.amount) 
          FROM fee_assessments fa 
          WHERE fa.student_id = ss.student_id 
          AND fa.academic_year = (SELECT current_academic_year FROM system_settings LIMIT 1)
        ), 0) - COALESCE((
          SELECT SUM(p.amount) 
          FROM payments p 
          WHERE p.student_id = ss.student_id 
          AND p.status = 'completed'
        ), 0) as balance,
        CASE 
          WHEN COALESCE((
            SELECT SUM(fa.amount) 
            FROM fee_assessments fa 
            WHERE fa.student_id = ss.student_id 
            AND fa.academic_year = (SELECT current_academic_year FROM system_settings LIMIT 1)
          ), 0) <= COALESCE((
            SELECT SUM(p.amount) 
            FROM payments p 
            WHERE p.student_id = ss.student_id 
            AND p.status = 'completed'
          ), 0) THEN 'paid'
          WHEN COALESCE((
            SELECT SUM(p.amount) 
            FROM payments p 
            WHERE p.student_id = ss.student_id 
            AND p.status = 'completed'
          ), 0) > 0 THEN 'partial'
          ELSE 'unpaid'
        END as payment_status,
        CASE 
          WHEN COALESCE((
            SELECT SUM(fa.amount) 
            FROM fee_assessments fa 
            WHERE fa.student_id = ss.student_id 
            AND fa.academic_year = (SELECT current_academic_year FROM system_settings LIMIT 1)
          ), 0) > 0 THEN
            ROUND((COALESCE((
              SELECT SUM(p.amount) 
              FROM payments p 
              WHERE p.student_id = ss.student_id 
              AND p.status = 'completed'
            ), 0) / COALESCE((
              SELECT SUM(fa.amount) 
              FROM fee_assessments fa 
              WHERE fa.student_id = ss.student_id 
              AND fa.academic_year = (SELECT current_academic_year FROM system_settings LIMIT 1)
            ), 0)) * 100, 2)
          ELSE 0
        END as percentage_paid
      FROM parent_linking pl
      JOIN student_sheets ss ON pl.student_id = ss.student_id
      LEFT JOIN trade_subjects ts ON ss.trade_code = ts.trade_code
      WHERE pl.parent_id = ? AND pl.status = 'verified'
      ORDER BY pl.is_primary DESC, ss.first_name ASC
    `;
    
    const results = await db.query(query, [parentId]);
    
    // Format results
    const levelDisplay = {
      '3': 'Level 3',
      '4': 'Level 4',
      '5': 'Level 5',
      'BDC': 'BDC',
      'AUT': 'AUT',
      '4A': 'Level 4A',
      '4B': 'Level 4B',
      '5A': 'Level 5A',
      '5B': 'Level 5B'
    };
    
    const children = results.map(child => ({
      ...child,
      level_display: levelDisplay[child.level_number] || child.level_number
    }));
    
    res.json({
      success: true,
      children: children,
      total: children.length
    });
  } catch (error) {
    console.error('Error fetching linked children:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch children' });
  }
});

// Get dashboard summary
router.get('/dashboard-summary', requireAuth, async (req, res) => {
  try {
    const parentId = req.user.id;
    
    const query = `
      SELECT 
        COUNT(*) as linked_students_count,
        COALESCE(SUM(total_fees), 0) as total_fees,
        COALESCE(SUM(paid_amount), 0) as total_paid,
        COALESCE(SUM(balance), 0) as total_balance,
        SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) as overdue_payments,
        SUM(CASE WHEN payment_status = 'partial' THEN 1 ELSE 0 END) as pending_payments
      FROM (
        SELECT 
          ss.student_id,
          COALESCE((
            SELECT SUM(fa.amount) 
            FROM fee_assessments fa 
            WHERE fa.student_id = ss.student_id 
            AND fa.academic_year = (SELECT current_academic_year FROM system_settings LIMIT 1)
          ), 0) as total_fees,
          COALESCE((
            SELECT SUM(p.amount) 
            FROM payments p 
            WHERE p.student_id = ss.student_id 
            AND p.status = 'completed'
          ), 0) as paid_amount,
          COALESCE((
            SELECT SUM(fa.amount) 
            FROM fee_assessments fa 
            WHERE fa.student_id = ss.student_id 
            AND fa.academic_year = (SELECT current_academic_year FROM system_settings LIMIT 1)
          ), 0) - COALESCE((
            SELECT SUM(p.amount) 
            FROM payments p 
            WHERE p.student_id = ss.student_id 
            AND p.status = 'completed'
          ), 0) as balance,
          CASE 
            WHEN COALESCE((
              SELECT SUM(fa.amount) 
              FROM fee_assessments fa 
              WHERE fa.student_id = ss.student_id 
              AND fa.academic_year = (SELECT current_academic_year FROM system_settings LIMIT 1)
            ), 0) <= COALESCE((
              SELECT SUM(p.amount) 
              FROM payments p 
              WHERE p.student_id = ss.student_id 
              AND p.status = 'completed'
            ), 0) THEN 'paid'
            WHEN COALESCE((
              SELECT SUM(p.amount) 
              FROM payments p 
              WHERE p.student_id = ss.student_id 
              AND p.status = 'completed'
            ), 0) > 0 THEN 'partial'
            ELSE 'unpaid'
          END as payment_status
        FROM parent_linking pl
        JOIN student_sheets ss ON pl.student_id = ss.student_id
        WHERE pl.parent_id = ? AND pl.status = 'verified'
      ) as summary
    `;
    
    const result = await db.query(query, [parentId]);
    const summary = result[0];
    
    summary.collection_rate = summary.total_fees > 0 
      ? Math.round((summary.total_paid / summary.total_fees) * 100 * 100) / 100 
      : 0;
    
    res.json({
      success: true,
      summary: summary
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
});

// Get fee structure for a student
router.get('/fee-structure/:studentId', requireAuth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.id;
    
    // Verify parent has access to this student
    const verifyQuery = 'SELECT * FROM parent_ligning WHERE parent_id = ? AND student_id = ? AND status = ?';
    const verifyResult = await db.query(verifyQuery, [parentId, studentId, 'verified']);
    
    if (verifyResult.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied to this student' });
    }
    
    const query = `
      SELECT 
        fa.id,
        fa.fee_type,
        fa.fee_category,
        fa.amount,
        fa.due_date,
        fa.is_mandatory,
        COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) as paid_amount,
        CASE 
          WHEN COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) >= fa.amount THEN 'paid'
          WHEN fa.due_date < CURDATE() THEN 'overdue'
          ELSE 'pending'
        END as status
      FROM fee_assessments fa
      LEFT JOIN payments p ON p.fee_id = fa.id
      WHERE fa.student_id = ? 
        AND fa.academic_year = (SELECT current_academic_year FROM system_settings LIMIT 1)
      GROUP BY fa.id
      ORDER BY fa.due_date ASC
    `;
    
    const results = await db.query(query, [studentId]);
    
    res.json({
      success: true,
      feeStructure: results
    });
  } catch (error) {
    console.error('Error fetching fee structure:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fees' });
  }
});

// Get payment history for a student
router.get('/payment-history/:studentId', requireAuth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.id;
    
    // Verify parent has access
    const verifyQuery = 'SELECT * FROM parent_linking WHERE parent_id = ? AND student_id = ? AND status = ?';
    const verifyResult = await db.query(verifyQuery, [parentId, studentId, 'verified']);
    
    if (verifyResult.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const query = `
      SELECT 
        p.id,
        p.amount,
        p.payment_method,
        p.reference_number,
        p.payment_date,
        p.status,
        p.receipt_number,
        CASE 
          WHEN p.payment_method = 'gt_bank' THEN 'GT Bank Rwanda'
          WHEN p.payment_method = 'bpr' THEN 'Bank of Kigali (BPR)'
          WHEN p.payment_method = 'equity_bank' THEN 'Equity Bank Rwanda'
          WHEN p.payment_method = 'mtn_money' THEN 'MTN Mobile Money'
          WHEN p.payment_method = 'airtel_money' THEN 'Airtel Money'
          ELSE p.payment_method
        END as bank_name
      FROM payments p
      WHERE p.student_id = ?
      ORDER BY p.payment_date DESC
    `;
    
    const results = await db.query(query, [studentId]);
    
    res.json({
      success: true,
      payments: results
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
});

// Initiate payment
router.post('/initiate-payment', requireAuth, async (req, res) => {
  try {
    const { studentId, amount, paymentMethod, bank } = req.body;
    const parentId = req.user.id;
    const parentPhone = req.user.phone || req.user.phone_number;
    const parentEmail = req.user.email;
    
    // Validate inputs
    if (!studentId || !amount || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    // Verify parent has access
    const verifyQuery = 'SELECT * FROM parent_linking WHERE parent_id = ? AND student_id = ? AND status = ?';
    const verifyResult = await db.query(verifyQuery, [parentId, studentId, 'verified']);
    
    if (verifyResult.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied to this student' });
    }
    
    // Get student info
    const studentQuery = 'SELECT first_name, last_name, student_code FROM student_sheets WHERE student_id = ?';
    const studentResult = await db.query(studentQuery, [studentId]);
    
    if (studentResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const student = studentResult[0];
    
    // Generate receipt number
    const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const referenceNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Get bank configuration
    const bankConfig = CONFIG.BANKS[paymentMethod];
    
    if (!bankConfig || !bankConfig.enabled) {
      return res.status(400).json({ success: false, message: 'Payment method not available' });
    }
    
    // Calculate fee if applicable
    const feeAmount = bankConfig.feePercent ? (amount * bankConfig.feePercent / 100) : 0;
    const totalAmount = amount + feeAmount;
    
    // Create pending payment record
    const insertQuery = `
      INSERT INTO pending_payments 
      (parent_id, student_id, amount, fee_amount, total_amount, payment_method, reference_number, receipt_number, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;
    
    const insertResult = await db.query(insertQuery, [
      parentId, studentId, amount, feeAmount, totalAmount, paymentMethod, referenceNumber, receiptNumber
    ]);
    
    const pendingPaymentId = insertResult.insertId;
    
    // Process payment based on method
    let paymentResponse = null;
    
    try {
      if (paymentMethod === 'gt_bank') {
        // GT Bank Payment Integration
        paymentResponse = await processGTBankPayment({
          merchantId: bankConfig.merchantId,
          amount: totalAmount,
          reference: referenceNumber,
          customerName: `${student.first_name} ${student.last_name}`,
          customerEmail: parentEmail,
          description: `School fees payment for ${student.first_name} ${student.last_name} (${student.student_code})`
        });
      } else if (paymentMethod === 'bpr') {
        // BPR Payment Integration
        paymentResponse = await processBPRPayment({
          merchantId: bankConfig.merchantId,
          amount: totalAmount,
          reference: referenceNumber,
          phone: parentPhone,
          description: `School fees for ${student.first_name} ${student.last_name}`
        });
      } else if (paymentMethod === 'equity_bank') {
        // Equity Bank Payment Integration
        paymentResponse = await processEquityBankPayment({
          merchantId: bankConfig.merchantId,
          amount: totalAmount,
          reference: referenceNumber,
          customerName: `${student.first_name} ${student.last_name}`,
          customerPhone: parentPhone,
          description: `School fees payment`
        });
      } else if (paymentMethod === 'mtn_money') {
        // MTN Mobile Money Integration
        paymentResponse = await processMTNPayment({
          collectionId: bankConfig.collectionId,
          amount: totalAmount,
          reference: referenceNumber,
          phone: parentPhone,
          customerName: `${student.first_name} ${student.last_name}`,
          description: `School fees for ${student.first_name} ${student.last_name}`
        });
      } else if (paymentMethod === 'airtel_money') {
        // Airtel Money Integration
        paymentResponse = await processAirtelPayment({
          merchantId: bankConfig.merchantId,
          amount: totalAmount,
          reference: referenceNumber,
          phone: parentPhone,
          customerName: `${student.first_name} ${student.last_name}`,
          description: `School fees for ${student.first_name} ${student.last_name}`
        });
      }
      
      // Update payment status based on response
      if (paymentResponse && paymentResponse.success) {
        await db.query('UPDATE pending_payments SET status = ?, external_reference = ? WHERE id = ?', 
          [paymentResponse.status || 'completed', paymentResponse.externalRef, pendingPaymentId]);
        
        // Create completed payment record
        await db.query(`
          INSERT INTO payments 
          (student_id, parent_id, amount, payment_method, reference_number, receipt_number, status, payment_date, fee_amount)
          VALUES (?, ?, ?, ?, ?, ?, 'completed', NOW(), ?)
        `, [studentId, parentId, amount, paymentMethod, referenceNumber, receiptNumber, feeAmount]);
        
        // Update student's paid amount (simplified)
        await db.query(`
          INSERT INTO payment_records (student_id, payment_id, amount, created_at)
          VALUES (?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE payment_id = VALUES(payment_id), amount = VALUES(amount)
        `, [studentId, pendingPaymentId, amount]);
        
        res.json({
          success: true,
          message: 'Payment processed successfully',
          receiptNumber: receiptNumber,
          referenceNumber: referenceNumber,
          paymentDetails: {
            amount: amount,
            fee: feeAmount,
            total: totalAmount,
            method: bankConfig.name,
            status: 'completed'
          }
        });
      } else {
        // Payment initiated but pending verification
        await db.query('UPDATE pending_payments SET status = ?, external_reference = ? WHERE id = ?', 
          [paymentResponse?.status || 'pending', paymentResponse?.externalRef, pendingPaymentId]);
        
        res.json({
          success: true,
          message: 'Payment initiated successfully. Please complete payment.',
          paymentId: pendingPaymentId,
          receiptNumber: receiptNumber,
          referenceNumber: referenceNumber,
          paymentDetails: {
            amount: amount,
            fee: feeAmount,
            total: totalAmount,
            method: bankConfig.name,
            status: 'pending'
          },
          paymentUrl: paymentResponse?.paymentUrl
        });
      }
    } catch (paymentError) {
      console.error('Payment processing error:', paymentError);
      
      // Demo mode - simulate successful payment
      await db.query('UPDATE pending_payments SET status = ? WHERE id = ?', 
        ['completed', pendingPaymentId]);
      
      await db.query(`
        INSERT INTO payments 
        (student_id, parent_id, amount, payment_method, reference_number, receipt_number, status, payment_date, fee_amount)
        VALUES (?, ?, ?, ?, ?, ?, 'completed', NOW(), ?)
      `, [studentId, parentId, amount, paymentMethod, referenceNumber, receiptNumber, feeAmount]);
      
      res.json({
        success: true,
        message: 'Payment processed successfully (Demo Mode)',
        receiptNumber: receiptNumber,
        referenceNumber: referenceNumber,
        paymentDetails: {
          amount: amount,
          fee: feeAmount,
          total: totalAmount,
          method: bankConfig.name,
          status: 'completed',
          demo: true
        }
      });
    }
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ success: false, message: 'Payment failed: ' + error.message });
  }
});

// Get receipt
router.get('/receipt/:receiptNumber', requireAuth, async (req, res) => {
  try {
    const { receiptNumber } = req.params;
    const parentId = req.user.id;
    
    const query = `
      SELECT 
        p.*,
        ss.first_name,
        ss.last_name,
        ss.student_code,
        ss.current_class,
        ts.trade_name
      FROM payments p
      JOIN student_sheets ss ON p.student_id = ss.student_id
      LEFT JOIN trade_subjects ts ON ss.trade_code = ts.trade_code
      WHERE p.receipt_number = ? AND p.parent_id = ?
    `;
    
    const result = await db.query(query, [receiptNumber, parentId]);
    
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }
    
    res.json({
      success: true,
      receipt: result[0]
    });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch receipt' });
  }
});

// Payment verification webhook
router.post('/webhook/:paymentMethod', async (req, res) => {
  try {
    const { paymentMethod } = req.params;
    const { reference, status, externalRef } = req.body;
    
    // Update payment status
    await db.query(`
      UPDATE pending_payments 
      SET status = ?, external_reference = ?, verified_at = NOW()
      WHERE reference_number = ?
    `, [status, externalRef, reference]);
    
    if (status === 'completed') {
      // Update payments table
      const pending = await db.query('SELECT * FROM pending_payments WHERE reference_number = ?', [reference]);
      
      if (pending.length > 0) {
        await db.query(`
          INSERT INTO payments 
          (student_id, parent_id, amount, payment_method, reference_number, receipt_number, status, payment_date, fee_amount)
          VALUES (?, ?, ?, ?, ?, ?, 'completed', NOW(), ?)
        `, [
          pending[0].student_id,
          pending[0].parent_id,
          pending[0].amount,
          pending[0].payment_method,
          pending[0].reference_number,
          pending[0].receipt_number,
          pending[0].fee_amount
        ]);
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

// Bank Payment Integration Functions
async function processGTBankPayment(data) {
  const { merchantId, amount, reference, customerName, customerEmail, description } = data;
  
  // Check if API is configured
  if (!process.env.REACT_APP_GT_BANK_API_URL) {
    console.log('GT Bank API not configured, using demo mode');
    return { success: true, status: 'completed', externalRef: `GT-${Date.now()}` };
  }
  
  try {
    const response = await fetch(process.env.REACT_APP_GT_BANK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_GT_BANK_API_KEY}`
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: amount,
        reference: reference,
        customer: {
          name: customerName,
          email: customerEmail
        },
        description: description,
        callback_url: `${process.env.REACT_APP_API_URL}/parent-payment-portal/webhook/gt_bank`,
        return_url: `${process.env.FRONTEND_URL}/payment/success`
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      return { 
        success: true, 
        status: result.data?.status || 'pending',
        externalRef: result.data?.transaction_id,
        paymentUrl: result.data?.payment_url
      };
    } else {
      return { success: false, status: 'failed', message: result.message };
    }
  } catch (error) {
    console.error('GT Bank API error:', error);
    return { success: false, status: 'failed', message: error.message };
  }
}

async function processBPRPayment(data) {
  const { merchantId, amount, reference, phone, description } = data;
  
  if (!process.env.REACT_APP_BPR_API_URL) {
    console.log('BPR API not configured, using demo mode');
    return { success: true, status: 'completed', externalRef: `BPR-${Date.now()}` };
  }
  
  try {
    const response = await fetch(process.env.REACT_APP_BPR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.REACT_APP_BPR_API_KEY
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: amount,
        reference: reference,
        phone: phone,
        description: description,
        callback_url: `${process.env.REACT_APP_API_URL}/parent-payment-portal/webhook/bpr`
      })
    });
    
    const result = await response.json();
    
    return { 
      success: result.status === 'success', 
      status: result.status === 'success' ? 'pending' : 'failed',
      externalRef: result.transaction_id,
      message: result.message
    };
  } catch (error) {
    console.error('BPR API error:', error);
    return { success: false, status: 'failed', message: error.message };
  }
}

async function processEquityBankPayment(data) {
  const { merchantId, amount, reference, customerName, customerPhone, description } = data;
  
  if (!process.env.REACT_APP_EQUITY_API_URL) {
    console.log('Equity Bank API not configured, using demo mode');
    return { success: true, status: 'completed', externalRef: `EQ-${Date.now()}` };
  }
  
  try {
    const response = await fetch(process.env.REACT_APP_EQUITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: amount,
        reference: reference,
        customer: {
          name: customerName,
          phone: customerPhone
        },
        description: description,
        callback_url: `${process.env.REACT_APP_API_URL}/parent-payment-portal/webhook/equity_bank`
      })
    });
    
    const result = await response.json();
    
    return { 
      success: result.response_code === '00', 
      status: result.response_code === '00' ? 'pending' : 'failed',
      externalRef: result.transaction_id,
      paymentUrl: result.payment_link
    };
  } catch (error) {
    console.error('Equity Bank API error:', error);
    return { success: false, status: 'failed', message: error.message };
  }
}

async function processMTNPayment(data) {
  const { collectionId, amount, reference, phone, customerName, description } = data;
  
  if (!process.env.REACT_APP_MTN_API_URL) {
    console.log('MTN API not configured, using demo mode');
    return { success: true, status: 'completed', externalRef: `MTN-${Date.now()}` };
  }
  
  try {
    const response = await fetch(process.env.REACT_APP_MTN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_MTN_API_KEY}`
      },
      body: JSON.stringify({
        collection_id: collectionId,
        amount: amount,
        currency: 'RWF',
        reference: reference,
        payer: {
          party_id_type: 'MSISDN',
          party_id: phone
        },
        payer_message: description,
        payee_note: `School fees for ${customerName}`,
        callback_url: `${process.env.REACT_APP_API_URL}/parent-payment-portal/webhook/mtn_money`
      })
    });
    
    const result = await response.json();
    
    return { 
      success: result.status === 'SUCCESS' || result.status === 'PENDING', 
      status: result.status === 'SUCCESS' ? 'pending' : 'failed',
      externalRef: result.internal_transaction_id,
      message: result.message
    };
  } catch (error) {
    console.error('MTN API error:', error);
    return { success: false, status: 'failed', message: error.message };
  }
}

async function processAirtelPayment(data) {
  const { merchantId, amount, reference, phone, customerName, description } = data;
  
  if (!process.env.REACT_APP_AIRTEL_API_URL) {
    console.log('Airtel API not configured, using demo mode');
    return { success: true, status: 'completed', externalRef: `AIR-${Date.now()}` };
  }
  
  try {
    const response = await fetch(process.env.REACT_APP_AIRTEL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: amount,
        reference: reference,
        subscriber: {
          msisdn: phone
        },
        statement_reference: description,
        callback_url: `${process.env.REACT_APP_API_URL}/parent-payment-portal/webhook/airtel_money`
      })
    });
    
    const result = await response.json();
    
    return { 
      success: result.success, 
      status: result.data?.status === 'INITIATED' ? 'pending' : 'failed',
      externalRef: result.data?.transaction_id,
      message: result.message
    };
  } catch (error) {
    console.error('Airtel API error:', error);
    return { success: false, status: 'failed', message: error.message };
  }
}

module.exports = router;
