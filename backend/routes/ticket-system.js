const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for payment proof uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/tickets/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ==================== ACCOUNTANT ROUTES ====================

// Create ticket menu
router.post('/menu', authenticateToken, requireRole(['accountant', 'admin']), async (req, res) => {
  try {
    const { title, description, amount, category, academic_year, term, due_date, is_mandatory } = req.body;
    
    const [result] = await db.execute(
      `INSERT INTO ticket_menus (title, description, amount, category, academic_year, term, 
       due_date, is_mandatory, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [title, description, amount, category, academic_year, term, due_date, is_mandatory || 0, req.user.id]
    );

    res.json({ success: true, message: 'Ticket menu created', menuId: result.insertId });
  } catch (error) {
    console.error('Create menu error:', error);
    res.status(500).json({ success: false, message: 'Failed to create ticket menu' });
  }
});

// Get all ticket menus (with filters)
router.get('/menu', authenticateToken, async (req, res) => {
  try {
    const { status, category, academic_year, term } = req.query;
    let query = `SELECT tm.*, u.full_name as created_by_name FROM ticket_menus tm 
                 LEFT JOIN users u ON tm.created_by = u.id WHERE 1=1`;
    const params = [];

    if (status) { query += ' AND tm.status = ?'; params.push(status); }
    if (category) { query += ' AND tm.category = ?'; params.push(category); }
    if (academic_year) { query += ' AND tm.academic_year = ?'; params.push(academic_year); }
    if (term) { query += ' AND tm.term = ?'; params.push(term); }

    query += ' ORDER BY tm.created_at DESC';
    const [menus] = await db.execute(query, params);

    res.json({ success: true, menus });
  } catch (error) {
    console.error('Get menus error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch ticket menus' });
  }
});

// Update ticket menu
router.put('/menu/:id', authenticateToken, requireRole(['accountant', 'admin']), async (req, res) => {
  try {
    const { title, description, amount, category, due_date, is_mandatory, status } = req.body;
    
    await db.execute(
      `UPDATE ticket_menus SET title=?, description=?, amount=?, category=?, 
       due_date=?, is_mandatory=?, status=?, updated_at=NOW() WHERE id=?`,
      [title, description, amount, category, due_date, is_mandatory, status, req.params.id]
    );

    res.json({ success: true, message: 'Ticket menu updated' });
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ success: false, message: 'Failed to update ticket menu' });
  }
});

// Delete ticket menu
router.delete('/menu/:id', authenticateToken, requireRole(['accountant', 'admin']), async (req, res) => {
  try {
    await db.execute('UPDATE ticket_menus SET status="deleted" WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Ticket menu deleted' });
  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete ticket menu' });
  }
});

// Get ticket statistics for accountant
router.get('/statistics', authenticateToken, requireRole(['accountant', 'admin']), async (req, res) => {
  try {
    const { academic_year, term } = req.query;
    
    const [stats] = await db.execute(`
      SELECT 
        COUNT(DISTINCT tm.id) as total_menus,
        COUNT(DISTINCT tp.id) as total_payments,
        SUM(CASE WHEN tp.status='pending' THEN 1 ELSE 0 END) as pending_payments,
        SUM(CASE WHEN tp.status='approved' THEN 1 ELSE 0 END) as approved_payments,
        SUM(CASE WHEN tp.status='rejected' THEN 1 ELSE 0 END) as rejected_payments,
        SUM(CASE WHEN tp.status='approved' THEN tp.amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN tp.status='pending' THEN tp.amount ELSE 0 END) as pending_revenue
      FROM ticket_menus tm
      LEFT JOIN ticket_payments tp ON tm.id = tp.menu_id
      WHERE tm.status='active'
      ${academic_year ? 'AND tm.academic_year=?' : ''}
      ${term ? 'AND tm.term=?' : ''}
    `, [academic_year, term].filter(Boolean));

    res.json({ success: true, statistics: stats[0] });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// Get all payments for review
router.get('/payments/review', authenticateToken, requireRole(['accountant', 'admin']), async (req, res) => {
  try {
    const { status, menu_id } = req.query;
    let query = `
      SELECT tp.*, tm.title as menu_title, tm.category, 
             s.full_name as student_name, s.student_id,
             p.full_name as parent_name, p.phone as parent_phone
      FROM ticket_payments tp
      JOIN ticket_menus tm ON tp.menu_id = tm.id
      JOIN students s ON tp.student_id = s.id
      JOIN parents p ON tp.parent_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (status) { query += ' AND tp.status = ?'; params.push(status); }
    if (menu_id) { query += ' AND tp.menu_id = ?'; params.push(menu_id); }

    query += ' ORDER BY tp.created_at DESC';
    const [payments] = await db.execute(query, params);

    res.json({ success: true, payments });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
});

// Approve/Reject payment
router.put('/payments/:id/review', authenticateToken, requireRole(['accountant', 'admin']), async (req, res) => {
  try {
    const { status, remarks } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await db.execute(
      `UPDATE ticket_payments SET status=?, remarks=?, reviewed_by=?, reviewed_at=NOW() WHERE id=?`,
      [status, remarks, req.user.id, req.params.id]
    );

    // Send notification to parent
    const [payment] = await db.execute(
      'SELECT tp.*, p.phone FROM ticket_payments tp JOIN parents p ON tp.parent_id=p.id WHERE tp.id=?',
      [req.params.id]
    );

    if (payment[0]) {
      // TODO: Send SMS notification
      console.log(`Payment ${status} for parent: ${payment[0].phone}`);
    }

    res.json({ success: true, message: `Payment ${status}` });
  } catch (error) {
    console.error('Review payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to review payment' });
  }
});

// ==================== PARENT ROUTES ====================

// Get available ticket menus for parent's children
router.get('/parent/menus', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const [children] = await db.execute(
      'SELECT id, full_name, student_id FROM students WHERE parent_id=?',
      [req.user.id]
    );

    const [menus] = await db.execute(`
      SELECT tm.*, 
        (SELECT COUNT(*) FROM ticket_payments tp 
         WHERE tp.menu_id=tm.id AND tp.parent_id=? AND tp.status='approved') as paid_count
      FROM ticket_menus tm
      WHERE tm.status='active' AND tm.due_date >= CURDATE()
      ORDER BY tm.is_mandatory DESC, tm.due_date ASC
    `, [req.user.id]);

    res.json({ success: true, children, menus });
  } catch (error) {
    console.error('Get parent menus error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch ticket menus' });
  }
});

// Get payment history for parent
router.get('/parent/payments', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const [payments] = await db.execute(`
      SELECT tp.*, tm.title, tm.category, s.full_name as student_name, s.student_id
      FROM ticket_payments tp
      JOIN ticket_menus tm ON tp.menu_id = tm.id
      JOIN students s ON tp.student_id = s.id
      WHERE tp.parent_id = ?
      ORDER BY tp.created_at DESC
    `, [req.user.id]);

    res.json({ success: true, payments });
  } catch (error) {
    console.error('Get parent payments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment history' });
  }
});

// Submit payment
router.post('/parent/pay', authenticateToken, requireRole(['parent']), upload.single('payment_proof'), async (req, res) => {
  try {
    const { menu_id, student_id, amount, payment_method, transaction_reference, notes } = req.body;
    
    // Verify student belongs to parent
    const [student] = await db.execute(
      'SELECT id FROM students WHERE id=? AND parent_id=?',
      [student_id, req.user.id]
    );

    if (student.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized student access' });
    }

    // Check if already paid
    const [existing] = await db.execute(
      'SELECT id FROM ticket_payments WHERE menu_id=? AND student_id=? AND status IN ("pending", "approved")',
      [menu_id, student_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Payment already submitted for this student' });
    }

    const payment_proof = req.file ? req.file.filename : null;

    const [result] = await db.execute(
      `INSERT INTO ticket_payments (menu_id, student_id, parent_id, amount, payment_method, 
       transaction_reference, payment_proof, notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [menu_id, student_id, req.user.id, amount, payment_method, transaction_reference, payment_proof, notes]
    );

    res.json({ success: true, message: 'Payment submitted successfully', paymentId: result.insertId });
  } catch (error) {
    console.error('Submit payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit payment' });
  }
});

// Get payment details
router.get('/parent/payments/:id', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const [payment] = await db.execute(`
      SELECT tp.*, tm.title, tm.description, tm.category, 
             s.full_name as student_name, s.student_id,
             u.full_name as reviewed_by_name
      FROM ticket_payments tp
      JOIN ticket_menus tm ON tp.menu_id = tm.id
      JOIN students s ON tp.student_id = s.id
      LEFT JOIN users u ON tp.reviewed_by = u.id
      WHERE tp.id = ? AND tp.parent_id = ?
    `, [req.params.id, req.user.id]);

    if (payment.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({ success: true, payment: payment[0] });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment details' });
  }
});

// Get parent dashboard summary
router.get('/parent/summary', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const [summary] = await db.execute(`
      SELECT 
        COUNT(DISTINCT s.id) as total_children,
        COUNT(DISTINCT tm.id) as available_menus,
        COUNT(DISTINCT CASE WHEN tp.status='approved' THEN tp.id END) as paid_tickets,
        COUNT(DISTINCT CASE WHEN tp.status='pending' THEN tp.id END) as pending_tickets,
        SUM(CASE WHEN tp.status='approved' THEN tp.amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN tp.status='pending' THEN tp.amount ELSE 0 END) as pending_amount
      FROM students s
      LEFT JOIN ticket_menus tm ON tm.status='active' AND tm.due_date >= CURDATE()
      LEFT JOIN ticket_payments tp ON tp.student_id=s.id AND tp.parent_id=?
      WHERE s.parent_id=?
    `, [req.user.id, req.user.id]);

    res.json({ success: true, summary: summary[0] });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
});

// ==================== SHARED ROUTES ====================

// Get ticket categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categories = [
      { value: 'tuition', label: 'Tuition Fees' },
      { value: 'transport', label: 'Transport' },
      { value: 'meals', label: 'Meals' },
      { value: 'uniform', label: 'Uniform' },
      { value: 'books', label: 'Books & Materials' },
      { value: 'activities', label: 'Extra Activities' },
      { value: 'exam', label: 'Examination Fees' },
      { value: 'hostel', label: 'Hostel Fees' },
      { value: 'other', label: 'Other' }
    ];
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// Get payment methods
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const methods = [
      { value: 'momo', label: 'Mobile Money (MTN/Airtel)' },
      { value: 'bank_transfer', label: 'Bank Transfer' },
      { value: 'cash', label: 'Cash Payment' },
      { value: 'card', label: 'Card Payment' }
    ];
    res.json({ success: true, methods });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payment methods' });
  }
});

module.exports = router;
