const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Stock Stats Endpoint
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [totalItems] = await pool.execute('SELECT COUNT(*) as count FROM inventory WHERE status = "active"');
    const [totalValue] = await pool.execute('SELECT COALESCE(SUM(quantity * unit_price), 0) as total FROM inventory WHERE status = "active"');
    const [lowStock] = await pool.execute('SELECT COUNT(*) as count FROM inventory WHERE quantity <= reorder_level AND quantity > 0 AND status = "active"');
    const [outOfStock] = await pool.execute('SELECT COUNT(*) as count FROM inventory WHERE quantity = 0 AND status = "active"');
    const [byCategory] = await pool.execute(
      'SELECT category, COUNT(*) as item_count, SUM(quantity) as total_quantity, SUM(quantity * unit_price) as category_value FROM inventory WHERE status = "active" GROUP BY category'
    );
    const [lowStockItems] = await pool.execute('SELECT * FROM inventory WHERE quantity <= reorder_level AND status = "active" ORDER BY (quantity / reorder_level) ASC LIMIT 20');
    
    res.json({
      success: true,
      totals: {
        total_items: totalItems[0].count,
        total_value: totalValue[0].total
      },
      alerts: {
        low_stock_count: lowStock[0].count,
        out_of_stock_count: outOfStock[0].count
      },
      byCategory,
      lowStock: lowStockItems
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/inventory-items', authenticateToken, async (req, res) => {
  try {
    const { category, low_stock } = req.query;
    
    let query = 'SELECT * FROM inventory WHERE 1=1';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (low_stock === 'true') {
      query += ' AND quantity <= reorder_level';
    }
    
    query += ' ORDER BY item_name';
    
    const [items] = await pool.execute(query, params);
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/inventory-items/:id', authenticateToken, async (req, res) => {
  try {
    const [items] = await pool.execute('SELECT * FROM inventory WHERE id = ?', [req.params.id]);
    
    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    const [history] = await pool.execute(
      'SELECT * FROM inventory_transactions WHERE item_id = ? ORDER BY transaction_date DESC LIMIT 50',
      [req.params.id]
    );
    
    res.json({ success: true, item: items[0], history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/inventory-items', authenticateToken, async (req, res) => {
  try {
    const { item_name, category, quantity, unit, unit_price, reorder_level, supplier, location } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO inventory (item_name, category, quantity, unit, unit_price, reorder_level, supplier, location, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [item_name, category, quantity, unit, unit_price, reorder_level, supplier, location]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/inventory-items/:id', authenticateToken, async (req, res) => {
  try {
    const { item_name, category, quantity, unit, unit_price, reorder_level, supplier, location } = req.body;
    
    await pool.execute(
      `UPDATE inventory 
       SET item_name = ?, category = ?, quantity = ?, unit = ?, unit_price = ?, reorder_level = ?, supplier = ?, location = ?, updated_at = NOW()
       WHERE id = ?`,
      [item_name, category, quantity, unit, unit_price, reorder_level, supplier, location, req.params.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/inventory-items/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM inventory WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/inventory-transactions', authenticateToken, async (req, res) => {
  try {
    const { item_id, transaction_type, quantity, notes, user_id } = req.body;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      const [items] = await connection.execute('SELECT * FROM inventory WHERE id = ?', [item_id]);
      
      if (items.length === 0) {
        throw new Error('Item not found');
      }
      
      const item = items[0];
      let newQuantity = item.quantity;
      
      if (transaction_type === 'in') {
        newQuantity += quantity;
      } else if (transaction_type === 'out') {
        if (item.quantity < quantity) {
          throw new Error('Insufficient quantity');
        }
        newQuantity -= quantity;
      }
      
      await connection.execute(
        'UPDATE inventory SET quantity = ?, updated_at = NOW() WHERE id = ?',
        [newQuantity, item_id]
      );
      
      const [result] = await connection.execute(
        `INSERT INTO inventory_transactions (item_id, transaction_type, quantity, previous_quantity, new_quantity, notes, user_id, transaction_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [item_id, transaction_type, quantity, item.quantity, newQuantity, notes, user_id]
      );
      
      await connection.commit();
      res.json({ success: true, id: result.insertId, newQuantity });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/inventory-transactions', authenticateToken, async (req, res) => {
  try {
    const { item_id, start_date, end_date } = req.query;
    
    let query = `
      SELECT it.*, i.item_name, u.first_name, u.last_name
      FROM inventory_transactions it
      JOIN inventory i ON it.item_id = i.id
      LEFT JOIN users u ON it.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (item_id) {
      query += ' AND it.item_id = ?';
      params.push(item_id);
    }
    
    if (start_date && end_date) {
      query += ' AND it.transaction_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    query += ' ORDER BY it.transaction_date DESC LIMIT 100';
    
    const [transactions] = await pool.execute(query, params);
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/low-stock-alerts', authenticateToken, async (req, res) => {
  try {
    const [alerts] = await pool.execute(`
      SELECT * FROM inventory 
      WHERE quantity <= reorder_level 
      ORDER BY (quantity / reorder_level) ASC
    `);
    
    res.json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/inventory-categories', authenticateToken, async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        SUM(quantity * unit_price) as total_value
      FROM inventory
      GROUP BY category
      ORDER BY total_value DESC
    `);
    
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/inventory-valuation', authenticateToken, async (req, res) => {
  try {
    const [valuation] = await pool.execute(`
      SELECT 
        SUM(quantity * unit_price) as total_value,
        COUNT(*) as total_items,
        SUM(quantity) as total_units
      FROM inventory
    `);
    
    res.json({ success: true, valuation: valuation[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/purchase-orders', authenticateToken, async (req, res) => {
  try {
    const { supplier_id, items, expected_delivery_date, notes } = req.body;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      
      const [result] = await connection.execute(
        `INSERT INTO purchase_orders (supplier_id, total_amount, expected_delivery_date, notes, status, order_date, created_at)
         VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())`,
        [supplier_id, totalAmount, expected_delivery_date, notes]
      );
      
      const orderId = result.insertId;
      
      for (const item of items) {
        await connection.execute(
          `INSERT INTO purchase_order_items (order_id, item_id, quantity, unit_price, total_price)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.item_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
        );
      }
      
      await connection.commit();
      res.json({ success: true, id: orderId });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/purchase-orders', authenticateToken, async (req, res) => {
  try {
    const [orders] = await pool.execute(`
      SELECT po.*, s.name as supplier_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      ORDER BY po.order_date DESC
    `);
    
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/purchase-orders/:id', authenticateToken, async (req, res) => {
  try {
    const [orders] = await pool.execute(`
      SELECT po.*, s.name as supplier_name, s.contact_person, s.phone, s.email
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.id = ?
    `, [req.params.id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const [items] = await pool.execute(`
      SELECT poi.*, i.item_name, i.unit
      FROM purchase_order_items poi
      JOIN inventory i ON poi.item_id = i.id
      WHERE poi.order_id = ?
    `, [req.params.id]);
    
    res.json({ success: true, order: orders[0], items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/purchase-orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    await pool.execute(
      'UPDATE purchase_orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, req.params.id]
    );
    
    if (status === 'received') {
      const [items] = await pool.execute(
        'SELECT * FROM purchase_order_items WHERE order_id = ?',
        [req.params.id]
      );
      
      for (const item of items) {
        await pool.execute(
          'UPDATE inventory SET quantity = quantity + ? WHERE id = ?',
          [item.quantity, item.item_id]
        );
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/suppliers', authenticateToken, async (req, res) => {
  try {
    const [suppliers] = await pool.execute(`
      SELECT s.*,
        (SELECT COUNT(*) FROM purchase_orders WHERE supplier_id = s.id) as total_orders,
        (SELECT SUM(total_amount) FROM purchase_orders WHERE supplier_id = s.id) as total_purchases
      FROM suppliers s
      WHERE s.is_active = true
      ORDER BY s.name
    `);
    
    res.json({ success: true, suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/suppliers', authenticateToken, async (req, res) => {
  try {
    const { name, contact_person, phone, email, address, payment_terms } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO suppliers (name, contact_person, phone, email, address, payment_terms, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, true, NOW())`,
      [name, contact_person, phone, email, address, payment_terms]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/suppliers/:id', authenticateToken, async (req, res) => {
  try {
    const { name, contact_person, phone, email, address, payment_terms } = req.body;
    
    await pool.execute(
      `UPDATE suppliers 
       SET name = ?, contact_person = ?, phone = ?, email = ?, address = ?, payment_terms = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, contact_person, phone, email, address, payment_terms, req.params.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/suppliers/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('UPDATE suppliers SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/inventory-audit', authenticateToken, async (req, res) => {
  try {
    const [audit] = await pool.execute(`
      SELECT 
        i.*,
        (SELECT COUNT(*) FROM inventory_transactions WHERE item_id = i.id) as transaction_count,
        (SELECT SUM(CASE WHEN transaction_type = 'in' THEN quantity ELSE 0 END) FROM inventory_transactions WHERE item_id = i.id) as total_in,
        (SELECT SUM(CASE WHEN transaction_type = 'out' THEN quantity ELSE 0 END) FROM inventory_transactions WHERE item_id = i.id) as total_out
      FROM inventory i
      ORDER BY i.category, i.item_name
    `);
    
    res.json({ success: true, audit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/stock-take', authenticateToken, async (req, res) => {
  try {
    const { items, conducted_by, notes } = req.body;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      const [result] = await connection.execute(
        `INSERT INTO stock_takes (conducted_by, notes, status, date_conducted, created_at)
         VALUES (?, ?, 'completed', NOW(), NOW())`,
        [conducted_by, notes]
      );
      
      const stockTakeId = result.insertId;
      
      for (const item of items) {
        const [currentStock] = await connection.execute(
          'SELECT quantity FROM inventory WHERE id = ?',
          [item.item_id]
        );
        
        const systemQuantity = currentStock[0].quantity;
        const variance = item.actual_quantity - systemQuantity;
        
        await connection.execute(
          `INSERT INTO stock_take_items (stock_take_id, item_id, system_quantity, actual_quantity, variance, notes)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [stockTakeId, item.item_id, systemQuantity, item.actual_quantity, variance, item.notes]
        );
        
        await connection.execute(
          'UPDATE inventory SET quantity = ? WHERE id = ?',
          [item.actual_quantity, item.item_id]
        );
      }
      
      await connection.commit();
      res.json({ success: true, id: stockTakeId });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stock-takes', authenticateToken, async (req, res) => {
  try {
    const [stockTakes] = await pool.execute(`
      SELECT st.*, u.first_name, u.last_name
      FROM stock_takes st
      LEFT JOIN users u ON st.conducted_by = u.id
      ORDER BY st.date_conducted DESC
    `);
    
    res.json({ success: true, stockTakes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
