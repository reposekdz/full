const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Dashboard Stats
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const [[stats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN quantity > reorder_level THEN 1 ELSE 0 END) as in_stock,
        SUM(CASE WHEN quantity <= reorder_level AND quantity > 0 THEN 1 ELSE 0 END) as low_stock,
        SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
        COALESCE(SUM(quantity * unit_price), 0) as total_value,
        COALESCE(SUM(quantity * selling_price), 0) as potential_revenue
      FROM stock_items WHERE is_active = 1
    `);

    const [recentTransactions] = await pool.execute(`
      SELECT st.*, si.item_name, si.item_code, u.first_name, u.last_name
      FROM stock_transactions st
      JOIN stock_items si ON st.item_id = si.id
      LEFT JOIN users u ON st.performed_by = u.id
      ORDER BY st.transaction_date DESC LIMIT 10
    `);

    const [lowStockItems] = await pool.execute(`
      SELECT si.*, sc.category_name, sl.location_name
      FROM stock_items si
      LEFT JOIN stock_categories sc ON si.category_id = sc.id
      LEFT JOIN stock_locations sl ON si.location_id = sl.id
      WHERE si.quantity <= si.reorder_level AND si.is_active = 1
      ORDER BY si.quantity ASC LIMIT 10
    `);

    const [categoryBreakdown] = await pool.execute(`
      SELECT sc.category_name, COUNT(si.id) as item_count, 
        SUM(si.quantity) as total_quantity,
        COALESCE(SUM(si.quantity * si.unit_price), 0) as total_value
      FROM stock_categories sc
      LEFT JOIN stock_items si ON sc.id = si.category_id AND si.is_active = 1
      GROUP BY sc.id, sc.category_name
      ORDER BY total_value DESC
    `);

    res.json({ success: true, stats, recentTransactions, lowStockItems, categoryBreakdown });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all items with filters
router.get('/items', authenticateToken, async (req, res) => {
  try {
    const { search, category, location, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    let where = ['si.is_active = 1'];
    const params = [];

    if (search) {
      where.push('(si.item_name LIKE ? OR si.item_code LIKE ? OR si.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category) { where.push('si.category_id = ?'); params.push(category); }
    if (location) { where.push('si.location_id = ?'); params.push(location); }
    if (status === 'low') where.push('si.quantity <= si.reorder_level AND si.quantity > 0');
    if (status === 'out') where.push('si.quantity = 0');

    const [items] = await pool.execute(`
      SELECT si.*, sc.category_name, sl.location_name, ss.supplier_name,
        CASE WHEN si.quantity = 0 THEN 'out' WHEN si.quantity <= si.reorder_level THEN 'low' ELSE 'ok' END as stock_status
      FROM stock_items si
      LEFT JOIN stock_categories sc ON si.category_id = sc.id
      LEFT JOIN stock_locations sl ON si.location_id = sl.id
      LEFT JOIN stock_suppliers ss ON si.supplier_id = ss.id
      WHERE ${where.join(' AND ')}
      ORDER BY si.item_name LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [[{total}]] = await pool.execute(`SELECT COUNT(*) as total FROM stock_items si WHERE ${where.join(' AND ')}`, params);

    res.json({ success: true, items, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create item
router.post('/items', authenticateToken, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { item_code, item_name, category_id, description, unit, quantity, reorder_level, unit_price, selling_price, supplier_id, location_id } = req.body;
    
    await conn.beginTransaction();
    
    const [result] = await conn.execute(`
      INSERT INTO stock_items (item_code, item_name, category_id, description, unit, quantity, reorder_level, unit_price, selling_price, supplier_id, location_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [item_code, item_name, category_id, description, unit || 'pieces', quantity || 0, reorder_level || 10, unit_price || 0, selling_price || 0, supplier_id, location_id, req.user.userId]);

    if (quantity > 0) {
      const transCode = `TXN-${Date.now()}`;
      await conn.execute(`
        INSERT INTO stock_transactions (transaction_code, item_id, transaction_type, quantity, previous_quantity, new_quantity, unit_price, total_amount, notes, performed_by)
        VALUES (?, ?, 'stock_in', ?, 0, ?, ?, ?, 'Initial stock', ?)
      `, [transCode, result.insertId, quantity, quantity, unit_price, quantity * unit_price, req.user.userId]);
    }

    await conn.commit();
    res.json({ success: true, message: 'Item created', item_id: result.insertId });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
});

// Update item
router.put('/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = [];
    const params = [];
    
    ['item_name', 'category_id', 'description', 'unit', 'reorder_level', 'unit_price', 'selling_price', 'supplier_id', 'location_id'].forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    });

    if (updates.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });

    params.push(id);
    await pool.execute(`UPDATE stock_items SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
    res.json({ success: true, message: 'Item updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete item
router.delete('/items/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('UPDATE stock_items SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stock adjustment
router.post('/items/:id/adjust', authenticateToken, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const { type, quantity, reason } = req.body;
    
    await conn.beginTransaction();
    
    const [[item]] = await conn.execute('SELECT * FROM stock_items WHERE id = ?', [id]);
    if (!item) throw new Error('Item not found');

    const newQty = type === 'in' ? item.quantity + quantity : item.quantity - quantity;
    if (newQty < 0) throw new Error('Insufficient stock');

    await conn.execute('UPDATE stock_items SET quantity = ? WHERE id = ?', [newQty, id]);

    const transCode = `TXN-${Date.now()}`;
    await conn.execute(`
      INSERT INTO stock_transactions (transaction_code, item_id, transaction_type, quantity, previous_quantity, new_quantity, notes, performed_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [transCode, id, type === 'in' ? 'stock_in' : 'stock_out', quantity, item.quantity, newQty, reason, req.user.userId]);

    await conn.commit();
    res.json({ success: true, message: 'Stock adjusted', previous: item.quantity, new: newQty });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
});

// Transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const { item_id, type, start_date, end_date, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    let where = ['1=1'];
    const params = [];

    if (item_id) { where.push('st.item_id = ?'); params.push(item_id); }
    if (type) { where.push('st.transaction_type = ?'); params.push(type); }
    if (start_date) { where.push('DATE(st.transaction_date) >= ?'); params.push(start_date); }
    if (end_date) { where.push('DATE(st.transaction_date) <= ?'); params.push(end_date); }

    const [transactions] = await pool.execute(`
      SELECT st.*, si.item_name, si.item_code, u.first_name, u.last_name
      FROM stock_transactions st
      JOIN stock_items si ON st.item_id = si.id
      LEFT JOIN users u ON st.performed_by = u.id
      WHERE ${where.join(' AND ')}
      ORDER BY st.transaction_date DESC LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [[{total}]] = await pool.execute(`SELECT COUNT(*) as total FROM stock_transactions st WHERE ${where.join(' AND ')}`, params);

    res.json({ success: true, transactions, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT sc.*, COUNT(si.id) as item_count, COALESCE(SUM(si.quantity * si.unit_price), 0) as total_value
      FROM stock_categories sc
      LEFT JOIN stock_items si ON sc.id = si.category_id AND si.is_active = 1
      WHERE sc.is_active = 1
      GROUP BY sc.id ORDER BY sc.category_name
    `);
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/categories', authenticateToken, async (req, res) => {
  try {
    const { category_code, category_name, description } = req.body;
    const [result] = await pool.execute('INSERT INTO stock_categories (category_code, category_name, description) VALUES (?, ?, ?)', [category_code, category_name, description]);
    res.json({ success: true, message: 'Category created', category_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Locations
router.get('/locations', authenticateToken, async (req, res) => {
  try {
    const [locations] = await pool.execute(`
      SELECT sl.*, COUNT(si.id) as item_count, COALESCE(SUM(si.quantity), 0) as total_quantity
      FROM stock_locations sl
      LEFT JOIN stock_items si ON sl.id = si.location_id AND si.is_active = 1
      WHERE sl.is_active = 1
      GROUP BY sl.id ORDER BY sl.location_name
    `);
    res.json({ success: true, locations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/locations', authenticateToken, async (req, res) => {
  try {
    const { location_code, location_name, location_type, capacity } = req.body;
    const [result] = await pool.execute('INSERT INTO stock_locations (location_code, location_name, location_type, capacity) VALUES (?, ?, ?, ?)', [location_code, location_name, location_type, capacity]);
    res.json({ success: true, message: 'Location created', location_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Suppliers
router.get('/suppliers', authenticateToken, async (req, res) => {
  try {
    const [suppliers] = await pool.execute(`
      SELECT ss.*, COUNT(si.id) as item_count, COALESCE(SUM(si.quantity * si.unit_price), 0) as total_value
      FROM stock_suppliers ss
      LEFT JOIN stock_items si ON ss.id = si.supplier_id AND si.is_active = 1
      WHERE ss.is_active = 1
      GROUP BY ss.id ORDER BY ss.supplier_name
    `);
    res.json({ success: true, suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/suppliers', authenticateToken, async (req, res) => {
  try {
    const { supplier_code, supplier_name, contact_person, email, phone, address } = req.body;
    const [result] = await pool.execute('INSERT INTO stock_suppliers (supplier_code, supplier_name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?, ?)', [supplier_code, supplier_name, contact_person, email, phone, address]);
    res.json({ success: true, message: 'Supplier created', supplier_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Alerts
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const [alerts] = await pool.execute(`
      SELECT sa.*, si.item_name, si.item_code, si.quantity, si.reorder_level
      FROM stock_alerts sa
      JOIN stock_items si ON sa.item_id = si.id
      WHERE sa.is_resolved = 0
      ORDER BY sa.severity DESC, sa.created_at DESC
    `);
    res.json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const [trends] = await pool.execute(`
      SELECT DATE(transaction_date) as date,
        SUM(CASE WHEN transaction_type IN ('stock_in', 'purchase') THEN quantity ELSE 0 END) as stock_in,
        SUM(CASE WHEN transaction_type IN ('stock_out', 'sale') THEN quantity ELSE 0 END) as stock_out
      FROM stock_transactions
      WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(transaction_date) ORDER BY date
    `);

    const [topItems] = await pool.execute(`
      SELECT si.item_name, si.item_code, SUM(st.quantity) as total_movement
      FROM stock_transactions st
      JOIN stock_items si ON st.item_id = si.id
      WHERE st.transaction_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY si.id ORDER BY total_movement DESC LIMIT 10
    `);

    res.json({ success: true, trends, topItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
