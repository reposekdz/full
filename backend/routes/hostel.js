const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Get all rooms
router.get('/rooms', authenticate, async (req, res) => {
  try {
    const { available, room_type, block, floor } = req.query;
    let query = 'SELECT * FROM hostel_rooms WHERE 1=1';
    const params = [];
    
    if (available === 'true') {
      query += ' AND available_beds > 0';
    }
    if (room_type) {
      query += ' AND room_type = ?';
      params.push(room_type);
    }
    if (block) {
      query += ' AND block = ?';
      params.push(block);
    }
    if (floor) {
      query += ' AND floor = ?';
      params.push(floor);
    }
    
    query += ' ORDER BY block, floor, room_number';
    const [rooms] = await db.query(query, params);
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create room (Admin)
router.post('/rooms', authenticate, authorize(['admin', 'hostel_manager']), async (req, res) => {
  try {
    const { room_number, room_type, block, floor, total_beds, available_beds, monthly_fee, amenities, description, status } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO hostel_rooms (room_number, room_type, block, floor, total_beds, available_beds, monthly_fee, amenities, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [room_number, room_type, block, floor, total_beds, available_beds, monthly_fee, JSON.stringify(amenities), description, status || 'available']
    );
    
    res.status(201).json({ success: true, id: result.insertId, message: 'Room created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update room
router.put('/rooms/:id', authenticate, authorize(['admin', 'hostel_manager']), async (req, res) => {
  try {
    const { room_number, room_type, block, floor, total_beds, available_beds, monthly_fee, amenities, description, status } = req.body;
    
    await db.query(
      'UPDATE hostel_rooms SET room_number = ?, room_type = ?, block = ?, floor = ?, total_beds = ?, available_beds = ?, monthly_fee = ?, amenities = ?, description = ?, status = ? WHERE id = ?',
      [room_number, room_type, block, floor, total_beds, available_beds, monthly_fee, JSON.stringify(amenities), description, status, req.params.id]
    );
    
    res.json({ success: true, message: 'Room updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Apply for hostel
router.post('/apply', authenticate, authorize(['student']), async (req, res) => {
  try {
    const { room_id, reason, emergency_contact, parent_consent } = req.body;
    const student_id = req.user.id;
    
    const [room] = await db.query('SELECT * FROM hostel_rooms WHERE id = ? AND available_beds > 0 AND status = "available"', [room_id]);
    if (!room.length) return res.status(400).json({ success: false, message: 'Room not available' });
    
    const [result] = await db.query(
      'INSERT INTO hostel_applications (student_id, room_id, reason, emergency_contact, parent_consent, status) VALUES (?, ?, ?, ?, ?, "pending")',
      [student_id, room_id, reason, JSON.stringify(emergency_contact), parent_consent]
    );
    
    res.status(201).json({ success: true, applicationId: result.insertId, message: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get my applications
router.get('/my-applications', authenticate, authorize(['student']), async (req, res) => {
  try {
    const [applications] = await db.query(`
      SELECT ha.*, hr.room_number, hr.room_type, hr.block, hr.floor, hr.monthly_fee 
      FROM hostel_applications ha 
      JOIN hostel_rooms hr ON ha.room_id = hr.id 
      WHERE ha.student_id = ? 
      ORDER BY ha.applied_at DESC
    `, [req.user.id]);
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all applications (Admin)
router.get('/applications', authenticate, authorize(['admin', 'hostel_manager']), async (req, res) => {
  try {
    const { status } = req.query;
    let query = `SELECT ha.*, hr.room_number, hr.room_type, hr.block, u.name as student_name, u.email as student_email 
                 FROM hostel_applications ha 
                 JOIN hostel_rooms hr ON ha.room_id = hr.id 
                 JOIN users u ON ha.student_id = u.id 
                 WHERE 1=1`;
    const params = [];
    
    if (status) {
      query += ' AND ha.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY ha.applied_at DESC';
    const [applications] = await db.query(query, params);
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve/Reject application (Admin)
router.put('/applications/:id/status', authenticate, authorize(['admin', 'hostel_manager']), async (req, res) => {
  try {
    const { status, remarks, allocation_date } = req.body;
    
    const [application] = await db.query('SELECT * FROM hostel_applications WHERE id = ?', [req.params.id]);
    if (!application.length) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    await db.query(
      'UPDATE hostel_applications SET status = ?, remarks = ?, processed_at = NOW() WHERE id = ?',
      [status, remarks, req.params.id]
    );
    
    if (status === 'approved') {
      const [room] = await db.query('SELECT * FROM hostel_rooms WHERE id = ?', [application[0].room_id]);
      if (room[0].available_beds > 0) {
        await db.query('UPDATE hostel_rooms SET available_beds = available_beds - 1 WHERE id = ?', [application[0].room_id]);
        
        await db.query(
          'INSERT INTO hostel_allocations (student_id, room_id, application_id, allocation_date, monthly_fee, status) VALUES (?, ?, ?, ?, ?, "active")',
          [application[0].student_id, application[0].room_id, req.params.id, allocation_date || new Date(), room[0].monthly_fee]
        );
      }
    }
    
    res.json({ success: true, message: `Application ${status} successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get my allocation
router.get('/my-allocation', authenticate, authorize(['student']), async (req, res) => {
  try {
    const [allocation] = await db.query(`
      SELECT ha.*, hr.room_number, hr.room_type, hr.block, hr.floor, hr.amenities 
      FROM hostel_allocations ha 
      JOIN hostel_rooms hr ON ha.room_id = hr.id 
      WHERE ha.student_id = ? AND ha.status = 'active'
    `, [req.user.id]);
    
    res.json({ success: true, allocation: allocation[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Record payment
router.post('/payments', authenticate, authorize(['student']), async (req, res) => {
  try {
    const { allocation_id, amount, payment_method, transaction_id, month, year } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO hostel_payments (allocation_id, student_id, amount, payment_method, transaction_id, month, year, status) VALUES (?, ?, ?, ?, ?, ?, ?, "completed")',
      [allocation_id, req.user.id, amount, payment_method, transaction_id, month, year]
    );
    
    res.status(201).json({ success: true, paymentId: result.insertId, message: 'Payment recorded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get my payments
router.get('/my-payments', authenticate, authorize(['student']), async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT hp.*, ha.room_id, hr.room_number 
      FROM hostel_payments hp 
      JOIN hostel_allocations ha ON hp.allocation_id = ha.id 
      JOIN hostel_rooms hr ON ha.room_id = hr.id 
      WHERE hp.student_id = ? 
      ORDER BY hp.payment_date DESC
    `, [req.user.id]);
    
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get allocations (Admin)
router.get('/allocations', authenticate, authorize(['admin', 'hostel_manager']), async (req, res) => {
  try {
    const { status, room_id } = req.query;
    let query = `SELECT ha.*, hr.room_number, hr.block, u.name as student_name, u.email as student_email 
                 FROM hostel_allocations ha 
                 JOIN hostel_rooms hr ON ha.room_id = hr.id 
                 JOIN users u ON ha.student_id = u.id 
                 WHERE 1=1`;
    const params = [];
    
    if (status) {
      query += ' AND ha.status = ?';
      params.push(status);
    }
    if (room_id) {
      query += ' AND ha.room_id = ?';
      params.push(room_id);
    }
    
    query += ' ORDER BY ha.allocation_date DESC';
    const [allocations] = await db.query(query, params);
    res.json({ success: true, allocations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Report maintenance issue
router.post('/maintenance', authenticate, async (req, res) => {
  try {
    const { room_id, issue_type, description, priority } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO hostel_maintenance (room_id, reported_by, issue_type, description, priority, status) VALUES (?, ?, ?, ?, ?, "pending")',
      [room_id, req.user.id, issue_type, description, priority || 'medium']
    );
    
    res.status(201).json({ success: true, ticketId: result.insertId, message: 'Maintenance request submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get maintenance requests
router.get('/maintenance', authenticate, authorize(['admin', 'hostel_manager']), async (req, res) => {
  try {
    const { status, priority, room_id } = req.query;
    let query = `SELECT hm.*, hr.room_number, hr.block, u.name as reported_by_name 
                 FROM hostel_maintenance hm 
                 JOIN hostel_rooms hr ON hm.room_id = hr.id 
                 JOIN users u ON hm.reported_by = u.id 
                 WHERE 1=1`;
    const params = [];
    
    if (status) {
      query += ' AND hm.status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND hm.priority = ?';
      params.push(priority);
    }
    if (room_id) {
      query += ' AND hm.room_id = ?';
      params.push(room_id);
    }
    
    query += ' ORDER BY hm.created_at DESC';
    const [requests] = await db.query(query, params);
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
