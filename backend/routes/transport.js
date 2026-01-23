const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Get all routes
router.get('/routes', authenticate, async (req, res) => {
  try {
    const [routes] = await db.query('SELECT * FROM transport_routes WHERE is_active = true');
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Book transport
router.post('/book', authenticate, authorize(['student']), async (req, res) => {
  try {
    const { route_id, booking_date } = req.body;
    const student_id = req.user.id;
    
    const [route] = await db.query('SELECT * FROM transport_routes WHERE id = ?', [route_id]);
    if (!route.length) return res.status(404).json({ error: 'Route not found' });
    
    const [result] = await db.query(
      'INSERT INTO transport_bookings (student_id, route_id, booking_date, status, amount) VALUES (?, ?, ?, "pending", ?)',
      [student_id, route_id, booking_date, route[0].fare]
    );
    
    res.json({ success: true, booking_id: result.insertId, amount: route[0].fare });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my bookings
router.get('/my-bookings', authenticate, authorize(['student']), async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT tb.*, tr.route_name, tr.departure_time, tr.vehicle_number 
      FROM transport_bookings tb 
      JOIN transport_routes tr ON tb.route_id = tr.id 
      WHERE tb.student_id = ? 
      ORDER BY tb.booking_date DESC
    `, [req.user.id]);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
