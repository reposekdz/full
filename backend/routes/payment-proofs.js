const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for payment proof uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/payment-proofs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG) and PDF files are allowed'));
    }
  }
});

// Parent: Submit payment proof
router.post('/submit', [
  authenticateToken,
  requireRole('parent'),
  upload.single('proof_image')
], async (req, res) => {
  try {
    const {
      student_id,
      amount_paid,
      payment_date,
      payment_method,
      reference_number,
      bank_name,
      transaction_id,
      notes
    } = req.body;

    if (!student_id || !amount_paid || !payment_date) {
      return res.status(400).json({
        success: false,
        message: 'Student, amount, and payment date are required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Payment proof image is required'
      });
    }

    // Get student details
    const [students] = await pool.execute(
      'SELECT first_name, last_name, student_code, trade, level FROM users WHERE id = ? AND role = "student"',
      [student_id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const student = students[0];
    const submission_number = `PP${Date.now()}`;
    const proof_image = `/uploads/payment-proofs/${req.file.filename}`;

    const [result] = await pool.execute(`
      INSERT INTO payment_proofs (
        submission_number, parent_id, student_id, student_name, student_code,
        trade, level, amount_paid, payment_date, payment_method,
        reference_number, bank_name, transaction_id, proof_image, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      submission_number,
      req.user.id,
      student_id,
      `${student.first_name} ${student.last_name}`,
      student.student_code,
      student.trade,
      student.level,
      amount_paid,
      payment_date,
      payment_method,
      reference_number,
      bank_name,
      transaction_id,
      proof_image,
      notes
    ]);

    // Notify accountants
    await pool.execute(`
      INSERT INTO notifications (user_id, title, message, type, priority, created_at)
      SELECT u.id, ?, ?, 'payment_proof', 'high', NOW()
      FROM users u
      WHERE u.role IN ('accountant', 'admin', 'super_admin')
    `, [
      'New Payment Proof Submitted',
      `Payment proof for ${student.student_code} - ${student.first_name} ${student.last_name} (${student.trade} ${student.level}). Amount: RWF ${amount_paid}`
    ]);

    res.json({
      success: true,
      message: 'Payment proof submitted successfully',
      submission: {
        id: result.insertId,
        submission_number,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Submit payment proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit payment proof'
    });
  }
});

// Parent: Get my submissions
router.get('/my-submissions', [
  authenticateToken,
  requireRole('parent')
], async (req, res) => {
  try {
    const { status, student_id } = req.query;

    let query = `
      SELECT pp.*, 
        u.first_name as verified_by_name, u.last_name as verified_by_lastname
      FROM payment_proofs pp
      LEFT JOIN users u ON pp.verified_by = u.id
      WHERE pp.parent_id = ?
    `;
    const params = [req.user.id];

    if (status) {
      query += ' AND pp.status = ?';
      params.push(status);
    }
    if (student_id) {
      query += ' AND pp.student_id = ?';
      params.push(student_id);
    }

    query += ' ORDER BY pp.created_at DESC';

    const [submissions] = await pool.execute(query, params);

    res.json({ success: true, submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    });
  }
});

// Accountant: Get all payment proofs
router.get('/all', [
  authenticateToken,
  requireRole('accountant', 'admin', 'super_admin')
], async (req, res) => {
  try {
    const { status, trade, level, search, start_date, end_date, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT pp.*,
        p.first_name as parent_first_name, p.last_name as parent_last_name,
        p.phone as parent_phone, p.email as parent_email,
        v.first_name as verified_by_name, v.last_name as verified_by_lastname
      FROM payment_proofs pp
      LEFT JOIN users p ON pp.parent_id = p.id
      LEFT JOIN users v ON pp.verified_by = v.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND pp.status = ?';
      params.push(status);
    }
    if (trade) {
      query += ' AND pp.trade = ?';
      params.push(trade);
    }
    if (level) {
      query += ' AND pp.level = ?';
      params.push(level);
    }
    if (search) {
      query += ' AND (pp.student_name LIKE ? OR pp.student_code LIKE ? OR pp.reference_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (start_date) {
      query += ' AND pp.payment_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND pp.payment_date <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY pp.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [proofs] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM payment_proofs pp WHERE 1=1';
    const countParams = [];
    if (status) { countQuery += ' AND pp.status = ?'; countParams.push(status); }
    if (trade) { countQuery += ' AND pp.trade = ?'; countParams.push(trade); }
    if (level) { countQuery += ' AND pp.level = ?'; countParams.push(level); }
    if (search) {
      countQuery += ' AND (pp.student_name LIKE ? OR pp.student_code LIKE ? OR pp.reference_number LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (start_date) { countQuery += ' AND pp.payment_date >= ?'; countParams.push(start_date); }
    if (end_date) { countQuery += ' AND pp.payment_date <= ?'; countParams.push(end_date); }

    const [[{ total }]] = await pool.execute(countQuery, countParams);

    res.json({
      success: true,
      proofs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all proofs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment proofs'
    });
  }
});

// Accountant: Get proof details
router.get('/:id', [
  authenticateToken,
  requireRole('accountant', 'admin', 'super_admin', 'parent')
], async (req, res) => {
  try {
    const [proofs] = await pool.execute(`
      SELECT pp.*,
        p.first_name as parent_first_name, p.last_name as parent_last_name,
        p.phone as parent_phone, p.email as parent_email,
        v.first_name as verified_by_name, v.last_name as verified_by_lastname
      FROM payment_proofs pp
      LEFT JOIN users p ON pp.parent_id = p.id
      LEFT JOIN users v ON pp.verified_by = v.id
      WHERE pp.id = ?
    `, [req.params.id]);

    if (proofs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment proof not found'
      });
    }

    // Check if parent can only view their own
    if (req.user.role === 'parent' && proofs[0].parent_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({ success: true, proof: proofs[0] });
  } catch (error) {
    console.error('Get proof details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proof details'
    });
  }
});

// Accountant: Verify/Reject payment proof
router.put('/:id/verify', [
  authenticateToken,
  requireRole('accountant', 'admin', 'super_admin')
], async (req, res) => {
  try {
    const { status, verification_notes, create_payment } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be verified or rejected'
      });
    }

    // Get proof details
    const [proofs] = await pool.execute('SELECT * FROM payment_proofs WHERE id = ?', [req.params.id]);
    
    if (proofs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment proof not found'
      });
    }

    const proof = proofs[0];

    // Update proof status
    await pool.execute(`
      UPDATE payment_proofs SET
        status = ?,
        verified_by = ?,
        verified_at = NOW(),
        verification_notes = ?
      WHERE id = ?
    `, [status, req.user.id, verification_notes, req.params.id]);

    // If verified and create_payment is true, create fee payment record
    if (status === 'verified' && create_payment) {
      await pool.execute(`
        INSERT INTO fee_payments (
          student_id, student_code, student_name, amount, payment_type,
          payment_method, reference_number, payment_date, status,
          processed_by, notes
        ) VALUES (?, ?, ?, ?, 'tuition', ?, ?, ?, 'completed', ?, ?)
      `, [
        proof.student_id,
        proof.student_code,
        proof.student_name,
        proof.amount_paid,
        proof.payment_method,
        proof.reference_number,
        proof.payment_date,
        req.user.id,
        `Payment verified from proof submission ${proof.submission_number}`
      ]);

      // Update proof status to processed
      await pool.execute('UPDATE payment_proofs SET status = "processed" WHERE id = ?', [req.params.id]);
    }

    // Notify parent
    await pool.execute(`
      INSERT INTO notifications (user_id, title, message, type, priority, created_at)
      VALUES (?, ?, ?, 'payment_proof', 'high', NOW())
    `, [
      proof.parent_id,
      `Payment Proof ${status === 'verified' ? 'Verified' : 'Rejected'}`,
      `Your payment proof for ${proof.student_name} (${proof.student_code}) has been ${status}. ${verification_notes || ''}`
    ]);

    res.json({
      success: true,
      message: `Payment proof ${status} successfully`
    });
  } catch (error) {
    console.error('Verify proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment proof'
    });
  }
});

// Accountant: Get statistics
router.get('/stats/summary', [
  authenticateToken,
  requireRole('accountant', 'admin', 'super_admin')
], async (req, res) => {
  try {
    const [[stats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_submissions,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        SUM(CASE WHEN status = 'processed' THEN 1 ELSE 0 END) as processed_count,
        SUM(CASE WHEN status = 'pending' THEN amount_paid ELSE 0 END) as pending_amount,
        SUM(CASE WHEN status IN ('verified', 'processed') THEN amount_paid ELSE 0 END) as verified_amount,
        SUM(amount_paid) as total_amount
      FROM payment_proofs
      WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
    `);

    const [byTrade] = await pool.execute(`
      SELECT 
        trade,
        COUNT(*) as count,
        SUM(amount_paid) as total_amount
      FROM payment_proofs
      WHERE status IN ('verified', 'processed')
      GROUP BY trade
    `);

    const [recent] = await pool.execute(`
      SELECT * FROM payment_proofs
      WHERE status = 'pending'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      stats,
      byTrade,
      recentPending: recent
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
