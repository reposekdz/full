const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all students with payment status
router.get('/student-payments', authenticateToken, authorizeRoles(['accountant', 'admin', 'headmaster']), async (req, res) => {
  try {
    const query = `
      SELECT 
        s.id,
        s.first_name,
        s.last_name,
        s.serial_code,
        s.trade_code,
        s.level_number,
        s.level_suffix,
        tc.class_name,
        COALESCE(sf.total_fees, 0) as total_fees,
        COALESCE(SUM(p.amount), 0) as paid_amount,
        COALESCE(sf.total_fees, 0) - COALESCE(SUM(p.amount), 0) as remaining_amount,
        CASE 
          WHEN COALESCE(SUM(p.amount), 0) >= COALESCE(sf.total_fees, 0) THEN 'paid'
          WHEN COALESCE(SUM(p.amount), 0) > 0 THEN 'partial'
          ELSE 'unpaid'
        END as payment_status,
        MAX(p.payment_date) as last_payment_date,
        u.phone as parent_phone,
        u.email as parent_email
      FROM students s
      LEFT JOIN trade_classes tc ON s.trade_code = tc.trade_code AND s.level_number = tc.level_number
      LEFT JOIN student_fees sf ON s.id = sf.student_id
      LEFT JOIN payments p ON s.id = p.student_id
      LEFT JOIN student_parents sp ON s.id = sp.student_id
      LEFT JOIN users u ON sp.parent_id = u.id
      GROUP BY s.id, s.first_name, s.last_name, s.serial_code, s.trade_code, s.level_number, s.level_suffix, tc.class_name, sf.total_fees, u.phone, u.email
      ORDER BY s.last_name, s.first_name
    `;
    
    const [students] = await db.query(query);
    res.json(students);
  } catch (error) {
    console.error('Error fetching student payments:', error);
    res.status(500).json({ error: 'Failed to fetch student payments' });
  }
});

// Record payment
router.post('/record-payment', authenticateToken, authorizeRoles(['accountant', 'admin']), async (req, res) => {
  const { student_id, amount, payment_method, reference_number } = req.body;
  
  try {
    // Insert payment record
    const insertQuery = `
      INSERT INTO payments (student_id, amount, payment_date, payment_method, reference_number, recorded_by, status)
      VALUES (?, ?, NOW(), ?, ?, ?, 'approved')
    `;
    
    await db.query(insertQuery, [student_id, amount, payment_method, reference_number, req.user.id]);
    
    // Get student and parent info
    const [studentInfo] = await db.query(`
      SELECT s.first_name, s.last_name, s.serial_code, u.id as parent_id, u.phone, u.email,
             COALESCE(sf.total_fees, 0) - COALESCE(SUM(p.amount), 0) as remaining_amount
      FROM students s
      LEFT JOIN student_fees sf ON s.id = sf.student_id
      LEFT JOIN payments p ON s.id = p.student_id
      LEFT JOIN student_parents sp ON s.id = sp.student_id
      LEFT JOIN users u ON sp.parent_id = u.id
      WHERE s.id = ?
      GROUP BY s.id, s.first_name, s.last_name, s.serial_code, u.id, u.phone, u.email, sf.total_fees
    `, [student_id]);
    
    // Send notification to parent
    if (studentInfo.length > 0 && studentInfo[0].parent_id) {
      const student = studentInfo[0];
      const message = `Kwishyura kw'umwana wanyu ${student.first_name} ${student.last_name} (${student.serial_code}): ${amount.toLocaleString()} RWF byakiriwe. Amafaranga asigaye: ${student.remaining_amount.toLocaleString()} RWF`;
      
      await db.query(`
        INSERT INTO notifications (user_id, title, message, type, created_at)
        VALUES (?, 'Kwishyura Byakiriwe', ?, 'payment', NOW())
      `, [student.parent_id, message]);
      
      // Send SMS if phone exists
      if (student.phone) {
        // TODO: Integrate SMS API
        console.log(`SMS to ${student.phone}: ${message}`);
      }
    }
    
    res.json({ success: true, message: 'Payment recorded successfully' });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// Send notification to parent
router.post('/notify-parent', authenticateToken, authorizeRoles(['accountant', 'admin', 'headmaster']), async (req, res) => {
  const { student_id, message, parent_phone, parent_email } = req.body;
  
  try {
    // Get parent info
    const [parents] = await db.query(`
      SELECT u.id, u.phone, u.email, s.first_name, s.last_name
      FROM student_parents sp
      JOIN users u ON sp.parent_id = u.id
      JOIN students s ON sp.student_id = s.id
      WHERE sp.student_id = ?
    `, [student_id]);
    
    if (parents.length === 0) {
      return res.status(404).json({ error: 'No parent found for this student' });
    }
    
    // Send notification to all parents
    for (const parent of parents) {
      await db.query(`
        INSERT INTO notifications (user_id, title, message, type, created_at)
        VALUES (?, 'Ubutumwa ku Kwishyura', ?, 'payment_reminder', NOW())
      `, [parent.id, message]);
      
      // Send SMS if phone exists
      if (parent.phone) {
        // TODO: Integrate SMS API
        console.log(`SMS to ${parent.phone}: ${message}`);
      }
      
      // Send email if email exists
      if (parent.email) {
        // TODO: Integrate Email API
        console.log(`Email to ${parent.email}: ${message}`);
      }
    }
    
    res.json({ success: true, message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Bulk notify parents
router.post('/bulk-notify', authenticateToken, authorizeRoles(['accountant', 'admin', 'headmaster']), async (req, res) => {
  const { student_ids, status } = req.body;
  
  try {
    let message = '';
    if (status === 'unpaid') {
      message = 'Mwaramutse, turabamenyesha ko umwana wanyu atarashyura amafaranga y\'ishuri. Mwemerewe kubimenyesha vuba bishoboka.';
    } else if (status === 'partial') {
      message = 'Mwaramutse, turabamenyesha ko umwana wanyu yishyuye igice cy\'amafaranga y\'ishuri. Mwemerewe kurangiza kwishyura.';
    }
    
    for (const student_id of student_ids) {
      const [parents] = await db.query(`
        SELECT u.id, u.phone, u.email, s.first_name, s.last_name,
               COALESCE(sf.total_fees, 0) - COALESCE(SUM(p.amount), 0) as remaining_amount
        FROM student_parents sp
        JOIN users u ON sp.parent_id = u.id
        JOIN students s ON sp.student_id = s.id
        LEFT JOIN student_fees sf ON s.id = sf.student_id
        LEFT JOIN payments p ON s.id = p.student_id
        WHERE sp.student_id = ?
        GROUP BY u.id, u.phone, u.email, s.first_name, s.last_name, sf.total_fees
      `, [student_id]);
      
      for (const parent of parents) {
        const fullMessage = `${message} Umwana: ${parent.first_name} ${parent.last_name}. Amafaranga asigaye: ${parent.remaining_amount.toLocaleString()} RWF`;
        
        await db.query(`
          INSERT INTO notifications (user_id, title, message, type, created_at)
          VALUES (?, 'Kwibutsa Kwishyura', ?, 'payment_reminder', NOW())
        `, [parent.id, fullMessage]);
        
        if (parent.phone) {
          console.log(`SMS to ${parent.phone}: ${fullMessage}`);
        }
      }
    }
    
    res.json({ success: true, message: 'Bulk notifications sent successfully' });
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    res.status(500).json({ error: 'Failed to send bulk notifications' });
  }
});

// Get payment history for a student
router.get('/payment-history/:student_id', authenticateToken, async (req, res) => {
  const { student_id } = req.params;
  
  try {
    const [payments] = await db.query(`
      SELECT p.*, u.first_name as recorded_by_name
      FROM payments p
      LEFT JOIN users u ON p.recorded_by = u.id
      WHERE p.student_id = ?
      ORDER BY p.payment_date DESC
    `, [student_id]);
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Update student fees
router.post('/update-fees', authenticateToken, authorizeRoles(['accountant', 'admin', 'headmaster']), async (req, res) => {
  const { student_id, total_fees, academic_year } = req.body;
  
  try {
    const [existing] = await db.query('SELECT id FROM student_fees WHERE student_id = ? AND academic_year = ?', [student_id, academic_year]);
    
    if (existing.length > 0) {
      await db.query('UPDATE student_fees SET total_fees = ? WHERE id = ?', [total_fees, existing[0].id]);
    } else {
      await db.query('INSERT INTO student_fees (student_id, total_fees, academic_year) VALUES (?, ?, ?)', [student_id, total_fees, academic_year]);
    }
    
    res.json({ success: true, message: 'Fees updated successfully' });
  } catch (error) {
    console.error('Error updating fees:', error);
    res.status(500).json({ error: 'Failed to update fees' });
  }
});

// Get payment statistics
router.get('/payment-stats', authenticateToken, authorizeRoles(['accountant', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(DISTINCT s.id) as total_students,
        SUM(CASE WHEN COALESCE(SUM(p.amount), 0) >= COALESCE(sf.total_fees, 0) THEN 1 ELSE 0 END) as paid_students,
        SUM(CASE WHEN COALESCE(SUM(p.amount), 0) > 0 AND COALESCE(SUM(p.amount), 0) < COALESCE(sf.total_fees, 0) THEN 1 ELSE 0 END) as partial_students,
        SUM(CASE WHEN COALESCE(SUM(p.amount), 0) = 0 THEN 1 ELSE 0 END) as unpaid_students,
        SUM(COALESCE(p.amount, 0)) as total_collected,
        SUM(COALESCE(sf.total_fees, 0)) - SUM(COALESCE(p.amount, 0)) as total_remaining
      FROM students s
      LEFT JOIN student_fees sf ON s.id = sf.student_id
      LEFT JOIN payments p ON s.id = p.student_id
    `);
    
    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ error: 'Failed to fetch payment stats' });
  }
});

module.exports = router;
