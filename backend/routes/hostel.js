const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Get available rooms
router.get('/rooms', authenticate, async (req, res) => {
  try {
    const [rooms] = await db.query('SELECT * FROM hostel_rooms WHERE available_beds > 0');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply for hostel
router.post('/apply', authenticate, authorize(['student']), async (req, res) => {
  try {
    const { room_id, reason } = req.body;
    const student_id = req.user.id;
    
    const [room] = await db.query('SELECT * FROM hostel_rooms WHERE id = ? AND available_beds > 0', [room_id]);
    if (!room.length) return res.status(400).json({ error: 'Room not available' });
    
    await db.query(
      'INSERT INTO hostel_applications (student_id, room_id, reason, status) VALUES (?, ?, ?, "pending")',
      [student_id, room_id, reason]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my applications
router.get('/my-applications', authenticate, authorize(['student']), async (req, res) => {
  try {
    const [applications] = await db.query(`
      SELECT ha.*, hr.room_number, hr.room_type, hr.monthly_fee 
      FROM hostel_applications ha 
      JOIN hostel_rooms hr ON ha.room_id = hr.id 
      WHERE ha.student_id = ? 
      ORDER BY ha.applied_at DESC
    `, [req.user.id]);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
