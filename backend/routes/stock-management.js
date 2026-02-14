const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// ===================== STOCK MANAGEMENT API =====================
// Comprehensive Stock Management System for Garden TVET School

// Get stock overview dashboard stats
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const [
      totalItems,
      totalValue,
      lowStock,
      outOfStock,
      pendingOrders,
      suppliers
    ] = await Promise.all([
      pool.execute('SELECT COUNT(*) as count FROM stock_items WHERE is_active = 1'),
      pool.execute('SELECT COALESCE(SUM(quantity * unit_price), 0) as total FROM stock_items WHERE is_active = 1'),
      pool.execute('SELECT COUNT(*) as count FROM stock_items WHERE quantity <= reorder_level AND quantity > 0 AND is_active = 1'),
      pool.execute('SELECT COUNT(*) as count FROM stock_items WHERE quantity = 0 AND is_active = 1'),
      pool.execute('SELECT COUNT(*) as count FROM stock_orders WHERE status = "pending"'),
      pool.execute('SELECT COUNT(*) as count FROM stock_suppliers WHERE is_active = 1')
    ]);

    // Get recent stock movements
    const [recentMovements] = await pool.execute(`
      SELECT sm.*, si.item_name, si.category 
      FROM stock_movements sm
      JOIN stock_items si ON sm.item_id = si.id
      ORDER BY sm.created_at DESC LIMIT 10
    `);

    // Get stock by category
    const [categoryBreakdown] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        SUM(quantity * unit_price) as total_value
      FROM stock_items 
      WHERE is_active = 1
      GROUP BY category
      ORDER BY total_value DESC
    `);

    // Get monthly movement trend
    const [monthlyTrend] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        SUM(CASE WHEN movement_type = 'in' THEN quantity ELSE 0 END) as stock_in,
        SUM(CASE WHEN movement_type = 'out' THEN quantity ELSE 0 END) as stock_out
      FROM stock_movements
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json({
      success: true,
      dashboard: {
        total_items: totalItems[0][0].count,
        total_value: totalItems[0][0].count > 0 ? parseFloat(totalValue[0][0].total) : 0,
        low_stock_count: lowStock[0][0].count,
        out_of_stock_count: outOfStock[0][0].count,
        pending_orders: pendingOrders[0][0].count,
        active_suppliers: suppliers[0][0].count
      },
      recent_movements: recentMovements[0],
      category_breakdown: categoryBreakdown[0],
      monthly_trend: monthlyTrend[0]
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== STOCK ITEMS =====================

// Get all stock items with pagination and filters
router.get('/items', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, category, search, low_stock, out_of_stock } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM stock_items WHERE is_active = 1';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND (item_name LIKE ? OR item_code LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (low_stock === 'true') {
      query += ' AND quantity <= reorder_level AND quantity > 0';
    }
    
    if (out_of_stock === 'true') {
      query += ' AND quantity = 0';
    }
    
    query += ' ORDER BY category, item_name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [items] = await pool.execute(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM stock_items WHERE is_active = 1';
    const countParams = [];
    
    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    
    if (search) {
      countQuery += ' AND (item_name LIKE ? OR item_code LIKE ? OR description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (low_stock === 'true') {
      countQuery += ' AND quantity <= reorder_level AND quantity > 0';
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    
    res.json({
      success: true,
      items: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single stock item with full details
router.get('/items/:id', authenticateToken, async (req, res) => {
  try {
    const [items] = await pool.execute(
      'SELECT * FROM stock_items WHERE id = ? AND is_active = 1',
      [req.params.id]
    );
    
    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    const item = items[0];
    
    // Get movement history
    const [history] = await pool.execute(`
      SELECT sm.*, u.username as created_by_name
      FROM stock_movements sm
      LEFT JOIN users u ON sm.created_by = u.id
      WHERE sm.item_id = ?
      ORDER BY sm.created_at DESC LIMIT 50
    `, [req.params.id]);
    
    // Get related orders
    const [orders] = await pool.execute(`
      SELECT * FROM stock_order_items 
      WHERE item_id = ?
      ORDER BY created_at DESC LIMIT 10
    `, [req.params.id]);
    
    res.json({
      success: true,
      item: item,
      movement_history: history,
      related_orders: orders
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new stock item
router.post('/items', authenticateToken, async (req, res) => {
  try {
    const {
      item_code,
      item_name,
      category,
      description,
      quantity,
      unit,
      unit_price,
      reorder_level,
      location,
      supplier_id,
      expiry_date,
      batch_number
    } = req.body;
    
    // Generate item code if not provided
    const code = item_code || `SI-${Date.now()}`;
    
    const [result] = await pool.execute(`
      INSERT INTO stock_items (
        item_code, item_name, category, description, quantity, unit,
        unit_price, reorder_level, location, supplier_id, expiry_date,
        batch_number, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      code, item_name, category, description || null, quantity || 0,
      unit || 'pcs', unit_price || 0, reorder_level || 5,
      location || null, supplier_id || null, expiry_date || null, batch_number || null
    ]);
    
    // Log initial stock entry
    if (quantity > 0) {
      await pool.execute(`
        INSERT INTO stock_movements (item_id, movement_type, quantity, notes, created_by, created_at)
        VALUES (?, 'in', ?, 'Initial stock entry', ?, NOW())
      `, [result.insertId, quantity, req.user.userId]);
    }
    
    res.json({
      success: true,
      id: result.insertId,
      message: 'Stock item created successfully'
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update stock item
router.put('/items/:id', authenticateToken, async (req, res) => {
  try {
    const {
      item_name,
      category,
      description,
      unit,
      unit_price,
      reorder_level,
      location,
      supplier_id,
      expiry_date,
      batch_number
    } = req.body;
    
    await pool.execute(`
      UPDATE stock_items SET
        item_name = ?, category = ?, description = ?, unit = ?,
        unit_price = ?, reorder_level = ?, location = ?, supplier_id = ?,
        expiry_date = ?, batch_number = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      item_name, category, description || null, unit || 'pcs',
      unit_price || 0, reorder_level || 5, location || null,
      supplier_id || null, expiry_date || null, batch_number || null,
      req.params.id
    ]);
    
    res.json({
      success: true,
      message: 'Stock item updated successfully'
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Adjust stock quantity
router.post('/items/:id/adjust', authenticateToken, async (req, res) => {
  try {
    const { adjustment_type, quantity, reason } = req.body;
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      const [items] = await connection.execute(
        'SELECT * FROM stock_items WHERE id = ? FOR UPDATE',
        [req.params.id]
      );
      
      if (items.length === 0) {
        throw new Error('Item not found');
      }
      
      const item = items[0];
      let newQuantity = item.quantity;
      
      if (adjustment_type === 'add') {
        newQuantity += quantity;
      } else if (adjustment_type === 'subtract') {
        if (item.quantity < quantity) {
          throw new Error('Insufficient quantity');
        }
        newQuantity -= quantity;
      } else if (adjustment_type === 'set') {
        newQuantity = quantity;
      } else if (adjustment_type === 'return') {
        newQuantity += quantity;
      } else if (adjustment_type === 'damage') {
        if (item.quantity < quantity) {
          throw new Error('Insufficient quantity');
        }
        newQuantity -= quantity;
      }
      
      await connection.execute(
        'UPDATE stock_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
        [newQuantity, req.params.id]
      );
      
      await connection.execute(`
        INSERT INTO stock_movements (item_id, movement_type, quantity, previous_qty, new_qty, notes, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        req.params.id, adjustment_type === 'add' ? 'in' : adjustment_type === 'subtract' ? 'out' : adjustment_type,
        quantity, item.quantity, newQuantity, reason || 'Stock adjustment', req.user.userId
      ]);
      
      await connection.commit();
      
      res.json({
        success: true,
        new_quantity: newQuantity,
        message: 'Stock adjusted successfully'
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete stock item (soft delete)
router.delete('/items/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute(
      'UPDATE stock_items SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Stock item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== STOCK MOVEMENTS =====================

// Record stock movement
router.post('/movements', authenticateToken, async (req, res) => {
  try {
    const { item_id, movement_type, quantity, reference_type, reference_id, notes } = req.body;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      const [items] = await connection.execute(
        'SELECT * FROM stock_items WHERE id = ? FOR UPDATE',
        [item_id]
      );
      
      if (items.length === 0) {
        throw new Error('Item not found');
      }
      
      const item = items[0];
      let newQuantity = item.quantity;
      
      if (movement_type === 'in') {
        newQuantity += quantity;
      } else if (movement_type === 'out') {
        if (item.quantity < quantity) {
          throw new Error('Insufficient quantity');
        }
        newQuantity -= quantity;
      }
      
      await connection.execute(
        'UPDATE stock_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
        [newQuantity, item_id]
      );
      
      const [result] = await connection.execute(`
        INSERT INTO stock_movements (
          item_id, movement_type, quantity, previous_qty, new_qty,
          reference_type, reference_id, notes, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        item_id, movement_type, quantity, item.quantity, newQuantity,
        reference_type || null, reference_id || null, notes || null, req.user.userId
      ]);
      
      await connection.commit();
      
      res.json({
        success: true,
        movement_id: result.insertId,
        new_quantity: newQuantity,
        message: 'Movement recorded successfully'
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create movement error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get stock movements
router.get('/movements', authenticateToken, async (req, res) => {
  try {
    const { item_id, movement_type, start_date, end_date, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT sm.*, si.item_name, si.category, u.username as created_by_name
      FROM stock_movements sm
      JOIN stock_items si ON sm.item_id = si.id
      LEFT JOIN users u ON sm.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (item_id) {
      query += ' AND sm.item_id = ?';
      params.push(item_id);
    }
    
    if (movement_type) {
      query += ' AND sm.movement_type = ?';
      params.push(movement_type);
    }
    
    if (start_date) {
      query += ' AND sm.created_at >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND sm.created_at <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY sm.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [movements] = await pool.execute(query, params);
    
    res.json({
      success: true,
      movements: movements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get movements error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== SUPPLIERS =====================

// Get all suppliers
router.get('/suppliers', authenticateToken, async (req, res) => {
  try {
    const [suppliers] = await pool.execute(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM stock_items WHERE supplier_id = s.id AND is_active = 1) as item_count,
        (SELECT SUM(quantity * unit_price) FROM stock_items WHERE supplier_id = s.id AND is_active = 1) as total_value
      FROM stock_suppliers s
      WHERE s.is_active = 1
      ORDER BY s.supplier_name
    `);
    
    res.json({ success: true, suppliers });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create supplier
router.post('/suppliers', authenticateToken, async (req, res) => {
  try {
    const { supplier_code, supplier_name, contact_person, phone, email, address, payment_terms, notes } = req.body;
    
    const code = supplier_code || `SUP-${Date.now()}`;
    
    const [result] = await pool.execute(`
      INSERT INTO stock_suppliers (
        supplier_code, supplier_name, contact_person, phone, email,
        address, payment_terms, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      code, supplier_name, contact_person || null, phone || null,
      email || null, address || null, payment_terms || null, notes || null
    ]);
    
    res.json({
      success: true,
      id: result.insertId,
      message: 'Supplier created successfully'
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update supplier
router.put('/suppliers/:id', authenticateToken, async (req, res) => {
  try {
    const { supplier_name, contact_person, phone, email, address, payment_terms, notes } = req.body;
    
    await pool.execute(`
      UPDATE stock_suppliers SET
        supplier_name = ?, contact_person = ?, phone = ?, email = ?,
        address = ?, payment_terms = ?, notes = ?
      WHERE id = ?
    `, [
      supplier_name, contact_person || null, phone || null, email || null,
      address || null, payment_terms || null, notes || null, req.params.id
    ]);
    
    res.json({ success: true, message: 'Supplier updated successfully' });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== PURCHASE ORDERS =====================

// Get all purchase orders
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const { status, supplier_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT po.*, s.supplier_name, u.username as created_by_name
      FROM stock_orders po
      LEFT JOIN stock_suppliers s ON po.supplier_id = s.id
      LEFT JOIN users u ON po.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND po.status = ?';
      params.push(status);
    }
    
    if (supplier_id) {
      query += ' AND po.supplier_id = ?';
      params.push(supplier_id);
    }
    
    query += ' ORDER BY po.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [orders] = await pool.execute(query, params);
    
    // Get order items for each order
    for (const order of orders) {
      const [items] = await pool.execute(`
        SELECT oi.*, si.item_name, si.unit
        FROM stock_order_items oi
        JOIN stock_items si ON oi.item_id = si.id
        WHERE oi.order_id = ?
      `, [order.id]);
      order.items = items;
    }
    
    res.json({
      success: true,
      orders: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create purchase order
router.post('/orders', authenticateToken, async (req, res) => {
  try {
    const { supplier_id, items, notes, expected_delivery } = req.body;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      
      const [orderResult] = await connection.execute(`
        INSERT INTO stock_orders (
          supplier_id, status, total_amount, notes, expected_delivery, created_by, created_at
        ) VALUES (?, 'pending', ?, ?, ?, ?, NOW())
      `, [supplier_id, total_amount, notes || null, expected_delivery || null, req.user.userId]);
      
      const orderId = orderResult.insertId;
      
      for (const item of items) {
        await connection.execute(`
          INSERT INTO stock_order_items (order_id, item_id, quantity, unit_price, total)
          VALUES (?, ?, ?, ?, ?)
        `, [orderId, item.item_id, item.quantity, item.unit_price || 0, item.quantity * (item.unit_price || 0)]);
      }
      
      await connection.commit();
      
      res.json({
        success: true,
        order_id: orderId,
        total_amount: total_amount,
        message: 'Purchase order created successfully'
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Receive purchase order (update stock)
router.post('/orders/:id/receive', authenticateToken, async (req, res) => {
  try {
    const { received_items, notes } = req.body;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Check order exists
      const [orders] = await connection.execute(
        'SELECT * FROM stock_orders WHERE id = ?',
        [req.params.id]
      );
      
      if (orders.length === 0) {
        throw new Error('Order not found');
      }
      
      const order = orders[0];
      
      // Update order status
      await connection.execute(
        'UPDATE stock_orders SET status = ?, received_at = NOW() WHERE id = ?',
        ['received', req.params.id]
      );
      
      // Process each received item
      for (const item of received_items) {
        // Update order item
        await connection.execute(`
          UPDATE stock_order_items SET received_quantity = ? WHERE id = ?
        `, [item.received_quantity, item.order_item_id]);
        
        // Update stock
        const [stockItems] = await connection.execute(
          'SELECT * FROM stock_items WHERE id = ? FOR UPDATE',
          [item.item_id]
        );
        
        if (stockItems.length > 0) {
          const newQty = stockItems[0].quantity + item.received_quantity;
          await connection.execute(
            'UPDATE stock_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
            [newQty, item.item_id]
          );
          
          // Record movement
          await connection.execute(`
            INSERT INTO stock_movements (item_id, movement_type, quantity, reference_type, reference_id, notes, created_by, created_at)
            VALUES (?, 'in', ?, 'purchase_order', ?, ?, ?, NOW())
          `, [item.item_id, item.received_quantity, req.params.id, notes || 'Purchase order received', req.user.userId]);
        }
      }
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'Purchase order received and stock updated'
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Receive order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== REPORTS =====================

// Generate stock report
router.get('/reports/stock', authenticateToken, async (req, res) => {
  try {
    const { category, low_stock } = req.query;
    
    let query = `
      SELECT 
        si.id, si.item_code, si.item_name, si.category, si.quantity, si.unit,
        si.unit_price, si.reorder_level, si.location, si.expiry_date,
        si.supplier_id, ss.supplier_name,
        CASE 
          WHEN si.quantity = 0 THEN 'Out of Stock'
          WHEN si.quantity <= si.reorder_level THEN 'Low Stock'
          ELSE 'In Stock'
        END as stock_status,
        CASE 
          WHEN si.quantity <= si.reorder_level THEN si.reorder_level - si.quantity
          ELSE 0
        END as reorder_needed
      FROM stock_items si
      LEFT JOIN stock_suppliers ss ON si.supplier_id = ss.id
      WHERE si.is_active = 1
    `;
    const params = [];
    
    if (category) {
      query += ' AND si.category = ?';
      params.push(category);
    }
    
    if (low_stock === 'true') {
      query += ' AND si.quantity <= si.reorder_level';
    }
    
    query += ' ORDER BY si.category, si.item_name';
    
    const [items] = await pool.execute(query, params);
    
    // Calculate summary
    const summary = {
      total_items: items.length,
      total_value: items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
      out_of_stock: items.filter(i => i.quantity === 0).length,
      low_stock: items.filter(i => i.quantity > 0 && i.quantity <= item.reorder_level).length,
      in_stock: items.filter(i => i.quantity > item.reorder_level).length,
      expiring_soon: items.filter(i => {
        if (!item.expiry_date) return false;
        const expiry = new Date(item.expiry_date);
        const now = new Date();
        const diff = (expiry - now) / (1000 * 60 * 60 * 24);
        return diff > 0 && diff <= 30;
      }).length
    };
    
    res.json({
      success: true,
      report: {
        generated_at: new Date().toISOString(),
        summary,
        items
      }
    });
  } catch (error) {
    console.error('Stock report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate movement report
router.get('/reports/movements', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, movement_type, category } = req.query;
    
    let query = `
      SELECT 
        sm.*, si.item_code, si.item_name, si.category,
        u.username as created_by_name
      FROM stock_movements sm
      JOIN stock_items si ON sm.item_id = si.id
      LEFT JOIN users u ON sm.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (start_date) {
      query += ' AND sm.created_at >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND sm.created_at <= ?';
      params.push(end_date);
    }
    
    if (movement_type) {
      query += ' AND sm.movement_type = ?';
      params.push(movement_type);
    }
    
    if (category) {
      query += ' AND si.category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY sm.created_at DESC';
    
    const [movements] = await pool.execute(query, params);
    
    // Summary by type
    const byType = {
      in: movements.filter(m => m.movement_type === 'in').reduce((sum, m) => sum + m.quantity, 0),
      out: movements.filter(m => m.movement_type === 'out').reduce((sum, m) => sum + m.quantity, 0),
      adjustment: movements.filter(m => ['adjustment', 'return', 'damage'].includes(m.movement_type)).reduce((sum, m) => sum + m.quantity, 0)
    };
    
    res.json({
      success: true,
      report: {
        generated_at: new Date().toISOString(),
        date_range: { start: start_date, end: end_date },
        summary: byType,
        movements
      }
    });
  } catch (error) {
    console.error('Movement report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== CATEGORIES =====================

// Get all categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        SUM(quantity * unit_price) as total_value,
        SUM(CASE WHEN quantity <= reorder_level THEN 1 ELSE 0 END) as low_stock_count
      FROM stock_items
      WHERE is_active = 1
      GROUP BY category
      ORDER BY category
    `);
    
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== ALERTS =====================

// Get stock alerts
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const [
      lowStockItems,
      outOfStockItems,
      expiringItems,
      pendingOrders
    ] = await Promise.all([
      pool.execute(`
        SELECT * FROM stock_items 
        WHERE quantity <= reorder_level AND quantity > 0 AND is_active = 1
        ORDER BY (quantity / reorder_level) ASC
        LIMIT 20
      `),
      pool.execute(`
        SELECT * FROM stock_items 
        WHERE quantity = 0 AND is_active = 1
        ORDER BY item_name
      `),
      pool.execute(`
        SELECT * FROM stock_items 
        WHERE expiry_date IS NOT NULL 
        AND expiry_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
        AND is_active = 1
        ORDER BY expiry_date ASC
      `),
      pool.execute(`
        SELECT po.*, s.supplier_name
        FROM stock_orders po
        LEFT JOIN stock_suppliers s ON po.supplier_id = s.id
        WHERE po.status = 'pending'
        ORDER BY po.created_at DESC
        LIMIT 10
      `)
    ]);
    
    res.json({
      success: true,
      alerts: {
        low_stock: {
          count: lowStockItems[0].length,
          items: lowStockItems[0]
        },
        out_of_stock: {
          count: outOfStockItems[0].length,
          items: outOfStockItems[0]
        },
        expiring_soon: {
          count: expiringItems[0].length,
          items: expiringItems[0]
        },
        pending_orders: {
          count: pendingOrders[0].length,
          orders: pendingOrders[0]
        }
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
