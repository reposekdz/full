const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/staff');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `staff_${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET all staff with trades and levels
router.get('/', async (req, res) => {
  try {
    const { role, trade_id, level, status, search } = req.query;
    
    let query = `
      SELECT s.*, t.name as trade_name, t.code as trade_code
      FROM staff s
      LEFT JOIN trades t ON s.trade_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      query += ' AND s.role = ?';
      params.push(role);
    }
    if (trade_id) {
      query += ' AND s.trade_id = ?';
      params.push(trade_id);
    }
    if (level) {
      query += ' AND s.level = ?';
      params.push(level);
    }
    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (s.name LIKE ? OR s.email LIKE ? OR s.phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY s.created_at DESC';

    const [staff] = await pool.execute(query, params);
    res.json({ success: true, staff });
  } catch (error) {
    console.error('Fetch staff error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch staff' });
  }
});

// GET staff by ID
router.get('/:id', async (req, res) => {
  try {
    const [staff] = await pool.execute(`
      SELECT s.*, t.name as trade_name, t.code as trade_code
      FROM staff s
      LEFT JOIN trades t ON s.trade_id = t.id
      WHERE s.id = ?
    `, [req.params.id]);
    
    if (staff.length === 0) {
      return res.status(404).json({ success: false, error: 'Staff not found' });
    }
    
    res.json({ success: true, staff: staff[0] });
  } catch (error) {
    console.error('Fetch staff error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch staff' });
  }
});

// CREATE new staff
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      name, email, phone, role, trade_id, level, specialization,
      qualifications, experience_years, hire_date, salary, status,
      emergency_contact, address, bio, bio_rw
    } = req.body;

    const image = req.file ? `/uploads/staff/${req.file.filename}` : null;

    const [result] = await pool.execute(`
      INSERT INTO staff (
        name, email, phone, role, trade_id, level, specialization,
        qualifications, experience_years, hire_date, salary, status,
        emergency_contact, address, bio, bio_rw, image, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      name, email, phone, role, trade_id || null, level || null, specialization || null,
      qualifications || null, experience_years || 0, hire_date || null, salary || 0, status || 'active',
      emergency_contact || null, address || null, bio || null, bio_rw || null, image
    ]);

    const [newStaff] = await pool.execute('SELECT * FROM staff WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, staff: newStaff[0] });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ success: false, error: 'Failed to create staff' });
  }
});

// UPDATE staff
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const {
      name, email, phone, role, trade_id, level, specialization,
      qualifications, experience_years, hire_date, salary, status,
      emergency_contact, address, bio, bio_rw
    } = req.body;

    // Get existing staff
    const [existing] = await pool.execute('SELECT * FROM staff WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Staff not found' });
    }

    let image = existing[0].image;
    if (req.file) {
      image = `/uploads/staff/${req.file.filename}`;
      // Delete old image
      if (existing[0].image) {
        const oldPath = path.join(__dirname, '..', existing[0].image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    await pool.execute(`
      UPDATE staff SET
        name = ?, email = ?, phone = ?, role = ?, trade_id = ?, level = ?,
        specialization = ?, qualifications = ?, experience_years = ?,
        hire_date = ?, salary = ?, status = ?, emergency_contact = ?,
        address = ?, bio = ?, bio_rw = ?, image = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      name, email, phone, role, trade_id || null, level || null, specialization || null,
      qualifications || null, experience_years || 0, hire_date || null, salary || 0,
      status || 'active', emergency_contact || null, address || null, bio || null,
      bio_rw || null, image, req.params.id
    ]);

    const [updated] = await pool.execute('SELECT * FROM staff WHERE id = ?', [req.params.id]);
    res.json({ success: true, staff: updated[0] });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ success: false, error: 'Failed to update staff' });
  }
});

// DELETE staff
router.delete('/:id', async (req, res) => {
  try {
    const [staff] = await pool.execute('SELECT * FROM staff WHERE id = ?', [req.params.id]);
    if (staff.length === 0) {
      return res.status(404).json({ success: false, error: 'Staff not found' });
    }

    // Delete image
    if (staff[0].image) {
      const imagePath = path.join(__dirname, '..', staff[0].image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await pool.execute('DELETE FROM staff WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete staff' });
  }
});

// GET staff by trade
router.get('/by-trade/:tradeId', async (req, res) => {
  try {
    const [staff] = await pool.execute(`
      SELECT s.*, t.name as trade_name
      FROM staff s
      LEFT JOIN trades t ON s.trade_id = t.id
      WHERE s.trade_id = ? AND s.status = 'active'
      ORDER BY s.name ASC
    `, [req.params.tradeId]);
    
    res.json({ success: true, staff });
  } catch (error) {
    console.error('Fetch staff by trade error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch staff' });
  }
});

// GET staff by level
router.get('/by-level/:level', async (req, res) => {
  try {
    const [staff] = await pool.execute(`
      SELECT s.*, t.name as trade_name
      FROM staff s
      LEFT JOIN trades t ON s.trade_id = t.id
      WHERE s.level = ? AND s.status = 'active'
      ORDER BY s.name ASC
    `, [req.params.level]);
    
    res.json({ success: true, staff });
  } catch (error) {
    console.error('Fetch staff by level error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch staff' });
  }
});

// GET staff statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [totalStaff] = await pool.execute('SELECT COUNT(*) as count FROM staff WHERE status = "active"');
    const [byRole] = await pool.execute('SELECT role, COUNT(*) as count FROM staff WHERE status = "active" GROUP BY role');
    const [byTrade] = await pool.execute(`
      SELECT t.name, COUNT(s.id) as count
      FROM trades t
      LEFT JOIN staff s ON t.id = s.trade_id AND s.status = 'active'
      GROUP BY t.id, t.name
    `);
    const [byLevel] = await pool.execute('SELECT level, COUNT(*) as count FROM staff WHERE status = "active" AND level IS NOT NULL GROUP BY level');

    res.json({
      success: true,
      stats: {
        total: totalStaff[0].count,
        byRole,
        byTrade,
        byLevel
      }
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
  }
});

// Assign staff to trade
router.post('/:id/assign-trade', async (req, res) => {
  try {
    const { trade_id, level } = req.body;
    
    await pool.execute('UPDATE staff SET trade_id = ?, level = ?, updated_at = NOW() WHERE id = ?', 
      [trade_id, level || null, req.params.id]);
    
    const [updated] = await pool.execute('SELECT * FROM staff WHERE id = ?', [req.params.id]);
    res.json({ success: true, staff: updated[0] });
  } catch (error) {
    console.error('Assign trade error:', error);
    res.status(500).json({ success: false, error: 'Failed to assign trade' });
  }
});

// Create staff table if not exists
async function ensureStaffTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS staff (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        role VARCHAR(100),
        trade_id INT,
        level VARCHAR(50),
        specialization VARCHAR(255),
        qualifications TEXT,
        experience_years INT DEFAULT 0,
        hire_date DATE,
        salary DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        emergency_contact VARCHAR(255),
        address TEXT,
        bio TEXT,
        bio_rw TEXT,
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Staff table ensured');
  } catch (error) {
    console.error('Error ensuring staff table:', error);
  }
}

ensureStaffTable();

module.exports = router;