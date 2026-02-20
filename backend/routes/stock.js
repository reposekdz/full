const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all stock items with filters
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = `
      SELECT s.*, 
        CASE 
          WHEN s.quantity <= s.reorder_level THEN 'low'
          WHEN s.quantity = 0 THEN 'out'
          ELSE 'normal'
        END as stock_status
      FROM stock_items s
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND s.category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (s.item_name LIKE ? OR s.item_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY s.created_at DESC';

    const [items] = await db.query(query, params);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stock statistics
router.get('/stats', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity * unit_price) as total_value,
        SUM(CASE WHEN quantity <= reorder_level THEN 1 ELSE 0 END) as low_stock,
        SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
        COUNT(DISTINCT category) as categories
      FROM stock_items
    `);
    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stock by category
router.get('/by-category', async (req, res) => {
  try {
    const [data] = await db.query(`
      SELECT category, COUNT(*) as count, SUM(quantity * unit_price) as value
      FROM stock_items
      GROUP BY category
    `);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const [items] = await db.query('SELECT * FROM stock_items WHERE id = ?', [req.params.id]);
    if (items.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(items[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create stock item
router.post('/', async (req, res) => {
  try {
    const { item_code, item_name, category, quantity, unit, unit_price, reorder_level, supplier, location } = req.body;
    const [result] = await db.query(
      `INSERT INTO stock_items (item_code, item_name, category, quantity, unit, unit_price, reorder_level, supplier, location) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [item_code, item_name, category, quantity, unit, unit_price, reorder_level, supplier, location]
    );
    
    // Log transaction
    await db.query(
      `INSERT INTO stock_transactions (stock_item_id, transaction_type, quantity, unit_price, total_amount, performed_by, notes) 
       VALUES (?, 'in', ?, ?, ?, ?, 'Initial stock')`,
      [result.insertId, quantity, unit_price, quantity * unit_price, req.user?.id || 1]
    );

    res.status(201).json({ id: result.insertId, message: 'Stock item created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update stock item
router.put('/:id', async (req, res) => {
  try {
    const { item_name, category, quantity, unit, unit_price, reorder_level, supplier, location } = req.body;
    await db.query(
      `UPDATE stock_items SET item_name=?, category=?, quantity=?, unit=?, unit_price=?, reorder_level=?, supplier=?, location=?, updated_at=NOW() 
       WHERE id=?`,
      [item_name, category, quantity, unit, unit_price, reorder_level, supplier, location, req.params.id]
    );
    res.json({ message: 'Stock item updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete stock item
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM stock_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Stock item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stock in/out transaction
router.post('/transaction', async (req, res) => {
  try {
    const { stock_item_id, transaction_type, quantity, notes } = req.body;
    
    const [items] = await db.query('SELECT * FROM stock_items WHERE id = ?', [stock_item_id]);
    if (items.length === 0) return res.status(404).json({ error: 'Item not found' });
    
    const item = items[0];
    const newQuantity = transaction_type === 'in' ? item.quantity + quantity : item.quantity - quantity;
    
    if (newQuantity < 0) return res.status(400).json({ error: 'Insufficient stock' });
    
    await db.query('UPDATE stock_items SET quantity = ?, updated_at = NOW() WHERE id = ?', [newQuantity, stock_item_id]);
    
    await db.query(
      `INSERT INTO stock_transactions (stock_item_id, transaction_type, quantity, unit_price, total_amount, performed_by, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [stock_item_id, transaction_type, quantity, item.unit_price, quantity * item.unit_price, req.user?.id || 1, notes]
    );
    
    res.json({ message: 'Transaction recorded', new_quantity: newQuantity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction history
router.get('/transactions/:id', async (req, res) => {
  try {
    const [transactions] = await db.query(
      `SELECT t.*, u.username as performed_by_name 
       FROM stock_transactions t
       LEFT JOIN users u ON t.performed_by = u.id
       WHERE t.stock_item_id = ?
       ORDER BY t.created_at DESC`,
      [req.params.id]
    );
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
