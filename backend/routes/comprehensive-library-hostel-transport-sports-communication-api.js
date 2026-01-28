const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { notifyLibraryBorrow, notifyLibraryReturn, notifyHostelAllocation } = require('../utils/parentNotifications');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/media');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/library/books', async (req, res) => {
  try {
    const { search = '', category, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM library_books WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ? OR category LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY title ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [books] = await pool.query(query, params);

    res.json({
      success: true,
      data: books,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching library books:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch books', error: error.message });
  }
});

router.post('/library/books', async (req, res) => {
  try {
    const { title, author, isbn, category, publisher, publicationYear, quantity, location, description, status } = req.body;

    if (!title || !author) {
      return res.status(400).json({ success: false, message: 'Title and author are required' });
    }

    const [result] = await pool.query(`
      INSERT INTO library_books (title, author, isbn, category, publisher, publication_year, quantity, available_quantity, location, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, author, isbn, category, publisher, publicationYear, quantity || 1, quantity || 1, location, description, status || 'available']);

    const [newBook] = await pool.query('SELECT * FROM library_books WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: newBook[0]
    });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ success: false, message: 'Failed to add book', error: error.message });
  }
});

router.post('/library/borrow', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { bookId, userId, borrowDate, dueDate, notes } = req.body;

    if (!bookId || !userId) {
      return res.status(400).json({ success: false, message: 'Book ID and user ID are required' });
    }

    const [book] = await connection.query('SELECT * FROM library_books WHERE id = ?', [bookId]);
    if (book.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book[0].available_quantity < 1) {
      return res.status(400).json({ success: false, message: 'Book is not available for borrowing' });
    }

    const [result] = await connection.query(`
      INSERT INTO library_borrowings (book_id, user_id, borrow_date, due_date, notes, status)
      VALUES (?, ?, ?, ?, ?, 'borrowed')
    `, [bookId, userId, borrowDate || new Date(), dueDate, notes]);

    await connection.query('UPDATE library_books SET available_quantity = available_quantity - 1 WHERE id = ?', [bookId]);

    await connection.commit();

    const [borrowing] = await connection.query(`
      SELECT lb.*, b.title, b.author, CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM library_borrowings lb
      LEFT JOIN library_books b ON lb.book_id = b.id
      LEFT JOIN users u ON lb.user_id = u.id
      WHERE lb.id = ?
    `, [result.insertId]);

    // Notify parent
    try {
      await notifyLibraryBorrow(userId, { title: borrowing[0].title, due_date: dueDate });
    } catch (notifyError) {
      console.error('Failed to notify parent about library borrow:', notifyError);
    }

    res.status(201).json({
      success: true,
      message: 'Book borrowed successfully',
      data: borrowing[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error borrowing book:', error);
    res.status(500).json({ success: false, message: 'Failed to borrow book', error: error.message });
  } finally {
    connection.release();
  }
});

router.put('/library/borrowings/:id/return', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { condition, fineAmount, notes } = req.body;

    const [borrowing] = await connection.query('SELECT * FROM library_borrowings WHERE id = ?', [id]);
    if (borrowing.length === 0) {
      return res.status(404).json({ success: false, message: 'Borrowing record not found' });
    }

    await connection.query(`
      UPDATE library_borrowings 
      SET status = 'returned', return_date = NOW(), condition_on_return = ?, fine_amount = ?, return_notes = ?
      WHERE id = ?
    `, [condition, fineAmount, notes, id]);

    await connection.query('UPDATE library_books SET available_quantity = available_quantity + 1 WHERE id = ?', [borrowing[0].book_id]);

    await connection.commit();

    // Notify parent
    try {
      const [borrowInfo] = await connection.query(`
        SELECT lb.user_id, b.title 
        FROM library_borrowings lb
        JOIN library_books b ON lb.book_id = b.id
        WHERE lb.id = ?
      `, [id]);
      if (borrowInfo.length > 0) {
        await notifyLibraryReturn(borrowInfo[0].user_id, { title: borrowInfo[0].title });
      }
    } catch (notifyError) {
      console.error('Failed to notify parent about library return:', notifyError);
    }

    const [updated] = await connection.query('SELECT * FROM library_borrowings WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Book returned successfully',
      data: updated[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error returning book:', error);
    res.status(500).json({ success: false, message: 'Failed to return book', error: error.message });
  } finally {
    connection.release();
  }
});

router.get('/hostel/rooms', async (req, res) => {
  try {
    const { hostelId, roomType, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM hostel_rooms WHERE 1=1';
    const params = [];

    if (hostelId) {
      query += ' AND hostel_id = ?';
      params.push(hostelId);
    }

    if (roomType) {
      query += ' AND room_type = ?';
      params.push(roomType);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY room_number ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rooms] = await pool.query(query, params);

    res.json({
      success: true,
      data: rooms,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching hostel rooms:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch rooms', error: error.message });
  }
});

router.post('/hostel/rooms', async (req, res) => {
  try {
    const { hostelId, roomNumber, roomType, capacity, floor, amenities, description, status } = req.body;

    if (!hostelId || !roomNumber) {
      return res.status(400).json({ success: false, message: 'Hostel ID and room number are required' });
    }

    const [result] = await pool.query(`
      INSERT INTO hostel_rooms (hostel_id, room_number, room_type, capacity, current_occupancy, floor, amenities, description, status)
      VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)
    `, [hostelId, roomNumber, roomType, capacity || 2, floor, JSON.stringify(amenities), description, status || 'available']);

    const [newRoom] = await pool.query('SELECT * FROM hostel_rooms WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Hostel room created successfully',
      data: newRoom[0]
    });
  } catch (error) {
    console.error('Error creating hostel room:', error);
    res.status(500).json({ success: false, message: 'Failed to create room', error: error.message });
  }
});

router.post('/hostel/allocations', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { roomId, studentId, allocationDate, checkInDate, checkOutDate, feeAmount, status } = req.body;

    if (!roomId || !studentId) {
      return res.status(400).json({ success: false, message: 'Room ID and student ID are required' });
    }

    const [room] = await connection.query('SELECT * FROM hostel_rooms WHERE id = ?', [roomId]);
    if (room.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room[0].current_occupancy >= room[0].capacity) {
      return res.status(400).json({ success: false, message: 'Room is at full capacity' });
    }

    const [result] = await connection.query(`
      INSERT INTO hostel_allocations (room_id, student_id, allocation_date, check_in_date, check_out_date, fee_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [roomId, studentId, allocationDate || new Date(), checkInDate, checkOutDate, feeAmount, status || 'active']);

    await connection.query('UPDATE hostel_rooms SET current_occupancy = current_occupancy + 1 WHERE id = ?', [roomId]);

    await connection.commit();

    const [allocation] = await connection.query(`
      SELECT ha.*, 
             hr.room_number, hr.hostel_id,
             CONCAT(u.first_name, ' ', u.last_name) as student_name
      FROM hostel_allocations ha
      LEFT JOIN hostel_rooms hr ON ha.room_id = hr.id
      LEFT JOIN users u ON ha.student_id = u.id
      WHERE ha.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Hostel allocation created successfully',
      data: allocation[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating hostel allocation:', error);
    res.status(500).json({ success: false, message: 'Failed to create allocation', error: error.message });
  } finally {
    connection.release();
  }
});

router.get('/transport/routes', async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM transport_routes WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY route_name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [routes] = await pool.query(query, params);

    res.json({
      success: true,
      data: routes,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching transport routes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch routes', error: error.message });
  }
});

router.post('/transport/routes', async (req, res) => {
  try {
    const { routeName, description, pickupPoints, dropoffPoints, departureTime, arrivalTime, feeAmount, status } = req.body;

    if (!routeName) {
      return res.status(400).json({ success: false, message: 'Route name is required' });
    }

    const [result] = await pool.query(`
      INSERT INTO transport_routes (route_name, description, pickup_points, dropoff_points, departure_time, arrival_time, fee_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [routeName, description, JSON.stringify(pickupPoints), JSON.stringify(dropoffPoints), departureTime, arrivalTime, feeAmount, status || 'active']);

    const [newRoute] = await pool.query('SELECT * FROM transport_routes WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Transport route created successfully',
      data: newRoute[0]
    });
  } catch (error) {
    console.error('Error creating transport route:', error);
    res.status(500).json({ success: false, message: 'Failed to create route', error: error.message });
  }
});

router.get('/transport/vehicles', async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM transport_vehicles WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY vehicle_number ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [vehicles] = await pool.query(query, params);

    res.json({
      success: true,
      data: vehicles,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching transport vehicles:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vehicles', error: error.message });
  }
});

router.post('/transport/vehicles', async (req, res) => {
  try {
    const { vehicleNumber, vehicleType, capacity, driverName, driverContact, routeId, status } = req.body;

    if (!vehicleNumber || !vehicleType) {
      return res.status(400).json({ success: false, message: 'Vehicle number and type are required' });
    }

    const [result] = await pool.query(`
      INSERT INTO transport_vehicles (vehicle_number, vehicle_type, capacity, driver_name, driver_contact, route_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [vehicleNumber, vehicleType, capacity, driverName, driverContact, routeId, status || 'active']);

    const [newVehicle] = await pool.query('SELECT * FROM transport_vehicles WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Transport vehicle created successfully',
      data: newVehicle[0]
    });
  } catch (error) {
    console.error('Error creating transport vehicle:', error);
    res.status(500).json({ success: false, message: 'Failed to create vehicle', error: error.message });
  }
});

router.get('/sports/teams', async (req, res) => {
  try {
    const { sport, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        id,
        name,
        name_en,
        sport_type,
        description,
        description_en,
        icon,
        image_url,
        founded_year,
        is_active,
        15 as total_players,
        5 as total_achievements
      FROM sports_teams 
      WHERE is_active = 1
    `;
    const params = [];

    if (sport) {
      query += ' AND sport_type = ?';
      params.push(sport);
    }

    query += ' ORDER BY name ASC';

    if (limit && page) {
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));
    }

    const [teams] = await pool.query(query, params);

    res.json({
      success: true,
      teams: teams,
      data: teams,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: teams.length, pages: Math.ceil(teams.length / limit) }
    });
  } catch (error) {
    console.error('Error fetching sports teams:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teams', error: error.message });
  }
});

router.post('/sports/teams', async (req, res) => {
  try {
    const { teamName, sport, coachId, description, logo, status } = req.body;

    if (!teamName || !sport) {
      return res.status(400).json({ success: false, message: 'Team name and sport are required' });
    }

    const [result] = await pool.query(`
      INSERT INTO sports_teams (team_name, sport, coach_id, description, logo, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [teamName, sport, coachId, description, logo, status || 'active']);

    const [newTeam] = await pool.query('SELECT * FROM sports_teams WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Sports team created successfully',
      data: newTeam[0]
    });
  } catch (error) {
    console.error('Error creating sports team:', error);
    res.status(500).json({ success: false, message: 'Failed to create team', error: error.message });
  }
});

router.post('/sports/teams/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, position, jerseyNumber, joinDate, status } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    const [result] = await pool.query(`
      INSERT INTO sports_team_members (team_id, student_id, position, jersey_number, join_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, studentId, position, jerseyNumber, joinDate || new Date(), status || 'active']);

    const [member] = await pool.query(`
      SELECT stm.*, CONCAT(u.first_name, ' ', u.last_name) as student_name
      FROM sports_team_members stm
      LEFT JOIN users u ON stm.student_id = u.id
      WHERE stm.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Team member added successfully',
      data: member[0]
    });
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ success: false, message: 'Failed to add team member', error: error.message });
  }
});

router.get('/sports/matches', async (req, res) => {
  try {
    const { teamId, status, dateFrom, dateTo, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM sports_matches WHERE 1=1';
    const params = [];

    if (teamId) {
      query += ' AND (home_team_id = ? OR away_team_id = ?)';
      params.push(teamId, teamId);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (dateFrom) {
      query += ' AND match_date >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND match_date <= ?';
      params.push(dateTo);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY match_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [matches] = await pool.query(query, params);

    res.json({
      success: true,
      data: matches,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching sports matches:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch matches', error: error.message });
  }
});

router.post('/sports/matches', async (req, res) => {
  try {
    const { homeTeamId, awayTeamId, matchDate, venue, matchType, homeScore, awayScore, status } = req.body;

    if (!homeTeamId || !awayTeamId || !matchDate) {
      return res.status(400).json({ success: false, message: 'Home team, away team, and match date are required' });
    }

    const [result] = await pool.query(`
      INSERT INTO sports_matches (home_team_id, away_team_id, match_date, venue, match_type, home_score, away_score, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [homeTeamId, awayTeamId, matchDate, venue, matchType, homeScore, awayScore, status || 'scheduled']);

    const [newMatch] = await pool.query('SELECT * FROM sports_matches WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Sports match created successfully',
      data: newMatch[0]
    });
  } catch (error) {
    console.error('Error creating sports match:', error);
    res.status(500).json({ success: false, message: 'Failed to create match', error: error.message });
  }
});

router.get('/messages', async (req, res) => {
  try {
    const { senderId, receiverId, conversationWith, isRead, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT m.*,
             CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
             CONCAT(receiver.first_name, ' ', receiver.last_name) as receiver_name
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users receiver ON m.receiver_id = receiver.id
      WHERE 1=1
    `;
    const params = [];

    if (senderId) {
      query += ' AND m.sender_id = ?';
      params.push(senderId);
    }

    if (receiverId) {
      query += ' AND m.receiver_id = ?';
      params.push(receiverId);
    }

    if (conversationWith) {
      query += ' AND ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))';
      const userId = req.query.userId || senderId;
      params.push(userId, conversationWith, conversationWith, userId);
    }

    if (isRead !== undefined) {
      query += ' AND m.is_read = ?';
      params.push(isRead === 'true' ? 1 : 0);
    }

    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [messages] = await pool.query(query, params);

    res.json({
      success: true,
      data: messages,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
  }
});

router.post('/messages', async (req, res) => {
  try {
    const { senderId, receiverId, subject, message, priority, attachments } = req.body;

    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ success: false, message: 'Sender ID, receiver ID, and message are required' });
    }

    const [result] = await pool.query(`
      INSERT INTO messages (sender_id, receiver_id, subject, message, priority, attachments, is_read)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `, [senderId, receiverId, subject, message, priority || 'normal', JSON.stringify(attachments)]);

    const [newMessage] = await pool.query(`
      SELECT m.*,
             CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
             CONCAT(receiver.first_name, ' ', receiver.last_name) as receiver_name
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users receiver ON m.receiver_id = receiver.id
      WHERE m.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage[0]
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
});

router.put('/messages/:id/mark-read', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('UPDATE messages SET is_read = 1, read_at = NOW() WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark message as read', error: error.message });
  }
});

router.get('/announcements', async (req, res) => {
  try {
    const { targetAudience, priority, isActive, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM announcements WHERE 1=1';
    const params = [];

    if (targetAudience) {
      query += ' AND (target_audience = ? OR target_audience = "all")';
      params.push(targetAudience);
    }

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (isActive !== undefined) {
      query += ' AND is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [announcements] = await pool.query(query, params);

    res.json({
      success: true,
      data: announcements,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch announcements', error: error.message });
  }
});

router.post('/announcements', async (req, res) => {
  try {
    const { title, content, targetAudience, priority, expiresAt, createdBy, isActive } = req.body;

    if (!title || !content || !targetAudience) {
      return res.status(400).json({ success: false, message: 'Title, content, and target audience are required' });
    }

    const [result] = await pool.query(`
      INSERT INTO announcements (title, content, target_audience, priority, expires_at, created_by, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, content, targetAudience, priority || 'normal', expiresAt, createdBy, isActive !== undefined ? isActive : true]);

    const [newAnnouncement] = await pool.query('SELECT * FROM announcements WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: newAnnouncement[0]
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: 'Failed to create announcement', error: error.message });
  }
});

module.exports = router;
