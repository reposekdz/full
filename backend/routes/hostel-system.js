const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { notifyHostelAllocation, notifyHostelCheckout } = require('../utils/parentNotifications');

router.get('/rooms', async (req, res) => {
  try {
    const { hostel_name, room_type, gender, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM hostel_rooms WHERE 1=1';
    const params = [];

    if (hostel_name) {
      query += ' AND hostel_name = ?';
      params.push(hostel_name);
    }
    if (room_type) {
      query += ' AND room_type = ?';
      params.push(room_type);
    }
    if (gender) {
      query += ' AND gender = ?';
      params.push(gender);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [[{ total }]] = await pool.query(countQuery, params);

    query += ' ORDER BY hostel_name, room_number LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rooms] = await pool.query(query, params);

    res.json({
      success: true,
      rooms,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get hostel rooms error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hostel rooms', error: error.message });
  }
});

router.get('/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rooms] = await pool.query('SELECT * FROM hostel_rooms WHERE id = ?', [id]);

    if (rooms.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const [allocations] = await pool.query(
      `SELECT ha.*, u.first_name, u.last_name, u.email
       FROM hostel_allocations ha
       LEFT JOIN users u ON ha.student_id = u.id
       WHERE ha.room_id = ? AND ha.status = 'active'`,
      [id]
    );

    res.json({
      success: true,
      room: { ...rooms[0], current_allocations: allocations }
    });
  } catch (error) {
    console.error('Get hostel room error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hostel room', error: error.message });
  }
});

router.post('/rooms', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const {
      room_number, hostel_name, floor, room_type, capacity,
      gender, amenities, status, monthly_fee
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO hostel_rooms 
       (room_number, hostel_name, floor, room_type, capacity, current_occupancy, 
        gender, amenities, status, monthly_fee) 
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
      [room_number, hostel_name, floor, room_type, capacity, gender, 
       JSON.stringify(amenities), status || 'available', monthly_fee]
    );

    res.status(201).json({ success: true, message: 'Hostel room created', id: result.insertId });
  } catch (error) {
    console.error('Create hostel room error:', error);
    res.status(500).json({ success: false, message: 'Failed to create hostel room', error: error.message });
  }
});

router.put('/rooms/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      room_number, hostel_name, floor, room_type, capacity,
      gender, amenities, status, monthly_fee
    } = req.body;

    await pool.query(
      `UPDATE hostel_rooms 
       SET room_number = ?, hostel_name = ?, floor = ?, room_type = ?, capacity = ?,
           gender = ?, amenities = ?, status = ?, monthly_fee = ?
       WHERE id = ?`,
      [room_number, hostel_name, floor, room_type, capacity, gender,
       JSON.stringify(amenities), status, monthly_fee, id]
    );

    res.json({ success: true, message: 'Hostel room updated successfully' });
  } catch (error) {
    console.error('Update hostel room error:', error);
    res.status(500).json({ success: false, message: 'Failed to update hostel room', error: error.message });
  }
});

router.delete('/rooms/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;

    const [[room]] = await pool.query('SELECT current_occupancy FROM hostel_rooms WHERE id = ?', [id]);
    if (room && room.current_occupancy > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with active allocations'
      });
    }

    await pool.query('DELETE FROM hostel_rooms WHERE id = ?', [id]);
    res.json({ success: true, message: 'Hostel room deleted successfully' });
  } catch (error) {
    console.error('Delete hostel room error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete hostel room', error: error.message });
  }
});

router.get('/applications', authenticateToken, async (req, res) => {
  try {
    const { student_id, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT ha.*, 
        s.first_name as student_first_name, s.last_name as student_last_name,
        r.room_number, r.hostel_name, r.room_type,
        a.first_name as approver_first_name, a.last_name as approver_last_name
      FROM hostel_applications ha
      LEFT JOIN users s ON ha.student_id = s.id
      LEFT JOIN hostel_rooms r ON ha.room_id = r.id
      LEFT JOIN users a ON ha.approved_by = a.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'student') {
      query += ' AND ha.student_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'parent') {
      query += ' AND ha.student_id IN (SELECT id FROM users WHERE parent_id = ?)';
      params.push(req.user.id);
    } else if (student_id) {
      query += ' AND ha.student_id = ?';
      params.push(student_id);
    }

    if (status) {
      query += ' AND ha.status = ?';
      params.push(status);
    }

    const countQuery = query.replace(
      'SELECT ha.*, s.first_name as student_first_name, s.last_name as student_last_name, r.room_number, r.hostel_name, r.room_type, a.first_name as approver_first_name, a.last_name as approver_last_name',
      'SELECT COUNT(*) as total'
    );
    const [[{ total }]] = await pool.query(countQuery, params);

    query += ' ORDER BY ha.application_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [applications] = await pool.query(query, params);

    res.json({
      success: true,
      applications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get hostel applications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications', error: error.message });
  }
});

router.post('/applications', authenticateToken, async (req, res) => {
  try {
    const { room_id, check_in_date } = req.body;
    const student_id = req.user.role === 'student' ? req.user.id : req.body.student_id;

    const [[room]] = await pool.query(
      'SELECT capacity, current_occupancy, status FROM hostel_rooms WHERE id = ?',
      [room_id]
    );

    if (!room || room.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Room not available' });
    }

    if (room.current_occupancy >= room.capacity) {
      return res.status(400).json({ success: false, message: 'Room is full' });
    }

    const [result] = await pool.query(
      `INSERT INTO hostel_applications (student_id, room_id, application_date, check_in_date, status) 
       VALUES (?, ?, NOW(), ?, 'pending')`,
      [student_id, room_id, check_in_date]
    );

    res.status(201).json({ success: true, message: 'Hostel application submitted', id: result.insertId });
  } catch (error) {
    console.error('Create hostel application error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit application', error: error.message });
  }
});

router.put('/applications/:id/approve', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { academic_year_id, bed_number, notes } = req.body;

    const [[application]] = await pool.query(
      'SELECT student_id, room_id, check_in_date FROM hostel_applications WHERE id = ?',
      [id]
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    await pool.query('BEGIN');

    await pool.query(
      'UPDATE hostel_applications SET status = ?, approved_by = ? WHERE id = ?',
      ['approved', req.user.id, id]
    );

    const [allocation] = await pool.query(
      `INSERT INTO hostel_allocations 
       (room_id, student_id, academic_year_id, check_in_date, status, bed_number, notes, allocated_by) 
       VALUES (?, ?, ?, ?, 'active', ?, ?, ?)`,
      [application.room_id, application.student_id, academic_year_id, application.check_in_date,
       bed_number, notes, req.user.id]
    );

    await pool.query(
      'UPDATE hostel_rooms SET current_occupancy = current_occupancy + 1 WHERE id = ?',
      [application.room_id]
    );

    await pool.query('COMMIT');

    // Notify parent
    try {
      const [[roomInfo]] = await pool.query(
        'SELECT room_number, hostel_name FROM hostel_rooms WHERE id = ?',
        [application.room_id]
      );
      await notifyHostelAllocation(application.student_id, {
        hostel_name: roomInfo.hostel_name,
        room_number: roomInfo.room_number,
        bed_number: bed_number,
        check_in_date: application.check_in_date
      });
    } catch (notifyError) {
      console.error('Failed to notify parent about hostel allocation:', notifyError);
    }

    res.json({
      success: true,
      message: 'Application approved and allocation created',
      allocation_id: allocation.insertId
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Approve hostel application error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve application', error: error.message });
  }
});

router.put('/applications/:id/reject', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE hostel_applications SET status = ?, approved_by = ? WHERE id = ?',
      ['rejected', req.user.id, id]
    );

    res.json({ success: true, message: 'Application rejected' });
  } catch (error) {
    console.error('Reject hostel application error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject application', error: error.message });
  }
});

router.get('/allocations', authenticateToken, async (req, res) => {
  try {
    const { student_id, room_id, status, academic_year_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT ha.*, 
        s.first_name as student_first_name, s.last_name as student_last_name,
        r.room_number, r.hostel_name, r.room_type, r.monthly_fee,
        ay.name as academic_year_name
      FROM hostel_allocations ha
      LEFT JOIN users s ON ha.student_id = s.id
      LEFT JOIN hostel_rooms r ON ha.room_id = r.id
      LEFT JOIN academic_years ay ON ha.academic_year_id = ay.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'student') {
      query += ' AND ha.student_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'parent') {
      query += ' AND ha.student_id IN (SELECT id FROM users WHERE parent_id = ?)';
      params.push(req.user.id);
    } else {
      if (student_id) {
        query += ' AND ha.student_id = ?';
        params.push(student_id);
      }
      if (room_id) {
        query += ' AND ha.room_id = ?';
        params.push(room_id);
      }
    }

    if (status) {
      query += ' AND ha.status = ?';
      params.push(status);
    }
    if (academic_year_id) {
      query += ' AND ha.academic_year_id = ?';
      params.push(academic_year_id);
    }

    const countQuery = query.replace(
      'SELECT ha.*, s.first_name as student_first_name, s.last_name as student_last_name, r.room_number, r.hostel_name, r.room_type, r.monthly_fee, ay.name as academic_year_name',
      'SELECT COUNT(*) as total'
    );
    const [[{ total }]] = await pool.query(countQuery, params);

    query += ' ORDER BY ha.check_in_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [allocations] = await pool.query(query, params);

    res.json({
      success: true,
      allocations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get hostel allocations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch allocations', error: error.message });
  }
});

router.put('/allocations/:id/checkout', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { check_out_date } = req.body;

    const [[allocation]] = await pool.query(
      'SELECT room_id, student_id, status FROM hostel_allocations WHERE id = ?',
      [id]
    );

    if (!allocation) {
      return res.status(404).json({ success: false, message: 'Allocation not found' });
    }

    if (allocation.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Allocation is not active' });
    }

    await pool.query('BEGIN');

    await pool.query(
      'UPDATE hostel_allocations SET status = ?, check_out_date = ? WHERE id = ?',
      ['checked_out', check_out_date || new Date(), id]
    );

    await pool.query(
      'UPDATE hostel_rooms SET current_occupancy = GREATEST(current_occupancy - 1, 0) WHERE id = ?',
      [allocation.room_id]
    );

    await pool.query('COMMIT');

    // Notify parent
    try {
      const [[roomInfo]] = await pool.query(
        'SELECT room_number, hostel_name FROM hostel_rooms WHERE id = ?',
        [allocation.room_id]
      );
      await notifyHostelCheckout(allocation.student_id, {
        hostel_name: roomInfo.hostel_name,
        room_number: roomInfo.room_number,
        check_out_date: check_out_date || new Date()
      });
    } catch (notifyError) {
      console.error('Failed to notify parent about hostel checkout:', notifyError);
    }

    res.json({ success: true, message: 'Student checked out successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Checkout hostel allocation error:', error);
    res.status(500).json({ success: false, message: 'Failed to checkout', error: error.message });
  }
});

router.get('/analytics', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const [totalRooms] = await pool.query('SELECT COUNT(*) as total FROM hostel_rooms');
    const [totalAllocations] = await pool.query(
      'SELECT COUNT(*) as total FROM hostel_allocations WHERE status = "active"'
    );
    
    const [occupancyRate] = await pool.query(
      `SELECT 
        SUM(capacity) as total_capacity,
        SUM(current_occupancy) as total_occupied
       FROM hostel_rooms WHERE status = 'available'`
    );

    const [byHostel] = await pool.query(
      `SELECT hostel_name, COUNT(*) as room_count, SUM(current_occupancy) as occupied, SUM(capacity) as capacity
       FROM hostel_rooms
       GROUP BY hostel_name`
    );

    const [byRoomType] = await pool.query(
      `SELECT room_type, COUNT(*) as count FROM hostel_rooms GROUP BY room_type`
    );

    const [byGender] = await pool.query(
      `SELECT gender, COUNT(*) as count FROM hostel_rooms GROUP BY gender`
    );

    const [applicationStats] = await pool.query(
      `SELECT status, COUNT(*) as count FROM hostel_applications GROUP BY status`
    );

    const [revenue] = await pool.query(
      `SELECT SUM(r.monthly_fee) as monthly_revenue
       FROM hostel_allocations ha
       JOIN hostel_rooms r ON ha.room_id = r.id
       WHERE ha.status = 'active'`
    );

    res.json({
      success: true,
      analytics: {
        total_rooms: totalRooms[0].total,
        total_active_allocations: totalAllocations[0].total,
        occupancy_rate: occupancyRate[0].total_capacity > 0 
          ? ((occupancyRate[0].total_occupied / occupancyRate[0].total_capacity) * 100).toFixed(2)
          : 0,
        by_hostel: byHostel,
        by_room_type: byRoomType,
        by_gender: byGender,
        application_stats: applicationStats,
        estimated_monthly_revenue: revenue[0].monthly_revenue || 0
      }
    });
  } catch (error) {
    console.error('Get hostel analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
});

module.exports = router;
