const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET All Staff with Trade, Level, and Class filtering
router.get('/staff', async (req, res) => {
  try {
    const { trade_code, level, class_name, role_name, search } = req.query;
    
    let query = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.employee_id,
        r.name as role_name, t.code as trade_code, t.name as trade_name, u.level, u.class,
        u.is_active, u.created_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN trades t ON u.trade_id = t.id
      WHERE r.name IN ('instructor', 'admin', 'director_discipline', 'director_studies')
    `;
    const params = [];
    
    if (trade_code) {
      query += ' AND t.code = ?';
      params.push(trade_code);
    }
    
    if (level) {
      query += ' AND u.level = ?';
      params.push(level);
    }
    
    if (class_name) {
      query += ' AND u.class = ?';
      params.push(class_name);
    }
    
    if (role_name) {
      query += ' AND r.name = ?';
      params.push(role_name);
    }
    
    if (search) {
      query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.employee_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY u.first_name ASC';
    
    const [staff] = await db.pool.query(query, params);
    res.json({ success: true, staff });
  } catch (error) {
    console.error('Staff error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET Staff by ID
router.get('/staff/:id', async (req, res) => {
  try {
    const [staff] = await db.pool.query(`
      SELECT u.*, r.name as role_name, t.code as trade_code, t.name as trade_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN trades t ON u.trade_id = t.id
      WHERE u.id = ?
    `, [req.params.id]);
    
    if (staff.length === 0) {
      return res.status(404).json({ success: false, error: 'Staff not found' });
    }
    
    res.json({ success: true, staff: staff[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST Create Staff
router.post('/staff', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, role_name, trade_code, level, class_name, employee_id } = req.body;
    
    // Get role_id
    const [role] = await db.pool.query('SELECT id FROM roles WHERE name = ?', [role_name]);
    if (role.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }
    
    // Get trade_id if trade_code provided
    let trade_id = null;
    if (trade_code) {
      const [trade] = await db.pool.query('SELECT id FROM trades WHERE code = ?', [trade_code]);
      if (trade.length === 0) {
        return res.status(400).json({ success: false, error: 'Invalid trade code' });
      }
      trade_id = trade[0].id;
    }
    
    const [result] = await db.pool.query(`
      INSERT INTO users (first_name, last_name, email, phone, password, role_id, trade_id, level, class, employee_id, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
    `, [first_name, last_name, email, phone, password, role[0].id, trade_id, level, class_name, employee_id]);
    
    res.json({ success: true, id: result.insertId, message: 'Staff created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT Update Staff
router.put('/staff/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, role_name, trade_code, level, class_name, employee_id, is_active } = req.body;
    
    // Get role_id
    const [role] = await db.pool.query('SELECT id FROM roles WHERE name = ?', [role_name]);
    if (role.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }
    
    // Get trade_id if trade_code provided
    let trade_id = null;
    if (trade_code) {
      const [trade] = await db.pool.query('SELECT id FROM trades WHERE code = ?', [trade_code]);
      if (trade.length === 0) {
        return res.status(400).json({ success: false, error: 'Invalid trade code' });
      }
      trade_id = trade[0].id;
    }
    
    await db.pool.query(`
      UPDATE users 
      SET first_name = ?, last_name = ?, email = ?, phone = ?, role_id = ?, trade_id = ?, level = ?, class = ?, employee_id = ?, is_active = ?
      WHERE id = ?
    `, [first_name, last_name, email, phone, role[0].id, trade_id, level, class_name, employee_id, is_active, req.params.id]);
    
    res.json({ success: true, message: 'Staff updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE Staff
router.delete('/staff/:id', async (req, res) => {
  try {
    await db.pool.query('UPDATE users SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Staff deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET Trades with Levels
router.get('/trades', async (req, res) => {
  try {
    const [trades] = await db.pool.query('SELECT * FROM trades WHERE is_active = 1 ORDER BY code ASC');
    
    // Group by credential (BDC, AUTO, SOD)
    const grouped = {
      BDC: trades.filter(t => t.code.includes('BDC')),
      AUTO: trades.filter(t => t.code.includes('AUTO')),
      SOD: trades.filter(t => t.code.includes('SOD'))
    };
    
    res.json({ success: true, trades, grouped });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET Staff Statistics by Trade and Level
router.get('/staff/stats/by-trade', async (req, res) => {
  try {
    const [stats] = await db.pool.query(`
      SELECT t.code, t.name, u.level, COUNT(*) as count
      FROM users u
      LEFT JOIN trades t ON u.trade_id = t.id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE r.name IN ('instructor', 'admin')
      GROUP BY t.code, t.name, u.level
      ORDER BY t.code, u.level
    `);
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET Available Levels (3, 4, 5)
router.get('/levels', async (req, res) => {
  try {
    const levels = [
      { value: 3, label: 'Level 3', label_rw: 'Urwego rwa 3' },
      { value: 4, label: 'Level 4', label_rw: 'Urwego rwa 4' },
      { value: 5, label: 'Level 5', label_rw: 'Urwego rwa 5' }
    ];
    res.json({ success: true, levels });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET Available Classes (A, B)
router.get('/classes', async (req, res) => {
  try {
    const classes = [
      { value: 'A', label: 'Class A', label_rw: 'Icyiciro A' },
      { value: 'B', label: 'Class B', label_rw: 'Icyiciro B' }
    ];
    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET Staff Roles
router.get('/roles', async (req, res) => {
  try {
    const [roles] = await db.pool.query(`
      SELECT id, name
      FROM roles 
      WHERE name IN ('instructor', 'admin', 'director_discipline', 'director_studies')
      ORDER BY name
    `);
    res.json({ success: true, roles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST Assign Staff to Trade, Level, and Class
router.post('/staff/:id/assign', async (req, res) => {
  try {
    const { trade_code, level, class_name } = req.body;
    
    const [trade] = await db.pool.query('SELECT id FROM trades WHERE code = ?', [trade_code]);
    if (trade.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid trade code' });
    }
    
    await db.pool.query('UPDATE users SET trade_id = ?, level = ?, class = ? WHERE id = ?', [trade[0].id, level, class_name, req.params.id]);
    
    res.json({ success: true, message: 'Staff assigned successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET Staff by Credential (BDC, AUTO, SOD) with Level and Class
router.get('/staff/by-credential/:credential', async (req, res) => {
  try {
    const { credential } = req.params;
    const { level, class_name } = req.query;
    
    let query = `
      SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) as name, u.email, u.phone,
        r.name as role_name, t.code as trade_code, t.name as trade_name, u.level, u.class
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN trades t ON u.trade_id = t.id
      WHERE t.code LIKE ? AND u.is_active = 1
    `;
    const params = [`%${credential}%`];
    
    if (level) {
      query += ' AND u.level = ?';
      params.push(level);
    }
    
    if (class_name) {
      query += ' AND u.class = ?';
      params.push(class_name);
    }
    
    query += ' ORDER BY u.level, u.class, u.first_name';
    
    const [staff] = await db.pool.query(query, params);
    res.json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
