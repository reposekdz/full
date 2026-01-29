const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all stock items
router.get('/items', authenticateToken, async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT * FROM stock_items WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (item_name LIKE ? OR item_code LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY item_name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [items] = await pool.execute(query, params);

    // Update status based on quantity
    for (let item of items) {
      if (item.quantity === 0) {
        item.status = 'out_of_stock';
      } else if (item.quantity <= item.reorder_level) {
        item.status = 'low_stock';
      } else {
        item.status = 'available';
      }
    }

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM stock_items WHERE 1=1';
    const countParams = [];
    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    if (search) {
      countQuery += ' AND (item_name LIKE ? OR item_code LIKE ? OR description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [[{ total }]] = await pool.execute(countQuery, countParams);

    res.json({
      success: true,
      items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get stock items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock items'
    });
  }
});

// Get stock item by ID
router.get('/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.execute('SELECT * FROM stock_items WHERE id = ?', [id]);

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    // Get transaction history
    const [transactions] = await pool.execute(`
      SELECT st.*, 
        u1.first_name as issued_to_name, u1.last_name as issued_to_lastname,
        u2.first_name as issued_by_name, u2.last_name as issued_by_lastname
      FROM stock_transactions st
      LEFT JOIN users u1 ON st.issued_to = u1.id
      LEFT JOIN users u2 ON st.issued_by = u2.id
      WHERE st.item_id = ?
      ORDER BY st.transaction_date DESC, st.created_at DESC
      LIMIT 20
    `, [id]);

    res.json({
      success: true,
      item: items[0],
      transactions
    });
  } catch (error) {
    console.error('Get stock item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock item'
    });
  }
});

// Create new stock item
router.post('/items', [
  authenticateToken,
  requireRole('admin', 'super_admin', 'stock_manager')
], async (req, res) => {
  try {
    const {
      item_name,
      item_code,
      category,
      description,
      quantity,
      unit,
      unit_price,
      reorder_level,
      location,
      supplier,
      supplier_contact,
      notes
    } = req.body;

    if (!item_name) {
      return res.status(400).json({
        success: false,
        message: 'Item name is required'
      });
    }

    const status = quantity === 0 ? 'out_of_stock' : 
                   quantity <= (reorder_level || 10) ? 'low_stock' : 'available';

    const [result] = await pool.execute(`
      INSERT INTO stock_items (
        item_name, item_code, category, description, quantity, unit,
        unit_price, reorder_level, location, supplier, supplier_contact,
        status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      item_name,
      item_code || `STK${Date.now()}`,
      category || 'other',
      description,
      quantity || 0,
      unit || 'pcs',
      unit_price || 0,
      reorder_level || 10,
      location,
      supplier,
      supplier_contact,
      status,
      notes
    ]);

    res.json({
      success: true,
      message: 'Stock item created successfully',
      item: {
        id: result.insertId,
        item_name,
        item_code,
        quantity
      }
    });
  } catch (error) {
    console.error('Create stock item error:', error);
    res.status(500).json({
      success: false,
      message: error.code === 'ER_DUP_ENTRY' ? 'Item code already exists' : 'Failed to create stock item'
    });
  }
});

// Update stock item
router.put('/items/:id', [
  authenticateToken,
  requireRole('admin', 'super_admin', 'stock_manager')
], async (req, res) => {
  try {
    const { id } = req.params;
    const {
      item_name,
      item_code,
      category,
      description,
      quantity,
      unit,
      unit_price,
      reorder_level,
      location,
      supplier,
      supplier_contact,
      status,
      notes
    } = req.body;

    const [result] = await pool.execute(`
      UPDATE stock_items SET
        item_name = COALESCE(?, item_name),
        item_code = COALESCE(?, item_code),
        category = COALESCE(?, category),
        description = COALESCE(?, description),
        quantity = COALESCE(?, quantity),
        unit = COALESCE(?, unit),
        unit_price = COALESCE(?, unit_price),
        reorder_level = COALESCE(?, reorder_level),
        location = COALESCE(?, location),
        supplier = COALESCE(?, supplier),
        supplier_contact = COALESCE(?, supplier_contact),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      item_name, item_code, category, description, quantity, unit,
      unit_price, reorder_level, location, supplier, supplier_contact,
      status, notes, id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    res.json({
      success: true,
      message: 'Stock item updated successfully'
    });
  } catch (error) {
    console.error('Update stock item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock item'
    });
  }
});

// Delete stock item
router.delete('/items/:id', [
  authenticateToken,
  requireRole('admin', 'super_admin')
], async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM stock_items WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    res.json({
      success: true,
      message: 'Stock item deleted successfully'
    });
  } catch (error) {
    console.error('Delete stock item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete stock item'
    });
  }
});

// Create stock transaction
router.post('/transactions', [
  authenticateToken,
  requireRole('admin', 'super_admin', 'stock_manager')
], async (req, res) => {
  try {
    const {
      item_id,
      transaction_type,
      quantity,
      unit_price,
      transaction_date,
      reference_number,
      issued_to,
      department,
      purpose,
      notes
    } = req.body;

    if (!item_id || !quantity || !transaction_type) {
      return res.status(400).json({
        success: false,
        message: 'Item ID, quantity, and transaction type are required'
      });
    }

    const total_value = quantity * (unit_price || 0);

    const [result] = await pool.execute(`
      INSERT INTO stock_transactions (
        item_id, transaction_type, quantity, unit_price, total_value,
        transaction_date, reference_number, issued_to, issued_by,
        department, purpose, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      item_id,
      transaction_type,
      quantity,
      unit_price || 0,
      total_value,
      transaction_date || new Date().toISOString().split('T')[0],
      reference_number,
      issued_to,
      req.user.id,
      department,
      purpose,
      notes
    ]);

    // Update stock quantity
    let quantityChange = 0;
    if (transaction_type === 'purchase' || transaction_type === 'return') {
      quantityChange = quantity;
    } else if (transaction_type === 'issue' || transaction_type === 'damage' || transaction_type === 'loss') {
      quantityChange = -quantity;
    }

    if (quantityChange !== 0) {
      await pool.execute(`
        UPDATE stock_items SET quantity = quantity + ? WHERE id = ?
      `, [quantityChange, item_id]);

      if (transaction_type === 'purchase') {
        await pool.execute(`
          UPDATE stock_items SET
            last_restock_date = ?,
            last_restock_quantity = ?
          WHERE id = ?
        `, [transaction_date || new Date().toISOString().split('T')[0], quantity, item_id]);
      }
    }

    res.json({
      success: true,
      message: 'Stock transaction recorded successfully',
      transaction: {
        id: result.insertId,
        item_id,
        transaction_type,
        quantity
      }
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record stock transaction'
    });
  }
});

// Get stock transactions
router.get('/transactions', [
  authenticateToken,
  requireRole('admin', 'super_admin', 'stock_manager')
], async (req, res) => {
  try {
    const { item_id, transaction_type, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT st.*, si.item_name, si.item_code,
        u1.first_name as issued_to_name, u1.last_name as issued_to_lastname,
        u2.first_name as issued_by_name, u2.last_name as issued_by_lastname
      FROM stock_transactions st
      LEFT JOIN stock_items si ON st.item_id = si.id
      LEFT JOIN users u1 ON st.issued_to = u1.id
      LEFT JOIN users u2 ON st.issued_by = u2.id
      WHERE 1=1
    `;
    const params = [];

    if (item_id) {
      query += ' AND st.item_id = ?';
      params.push(item_id);
    }
    if (transaction_type) {
      query += ' AND st.transaction_type = ?';
      params.push(transaction_type);
    }

    query += ' ORDER BY st.transaction_date DESC, st.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [transactions] = await pool.execute(query, params);

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

// Get stock statistics
router.get('/stats', [
  authenticateToken,
  requireRole('admin', 'super_admin', 'stock_manager')
], async (req, res) => {
  try {
    const [[totals]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity) as total_quantity,
        SUM(quantity * unit_price) as total_value
      FROM stock_items
    `);

    const [byCategory] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        SUM(quantity * unit_price) as category_value
      FROM stock_items
      GROUP BY category
    `);

    const [lowStock] = await pool.execute(`
      SELECT item_name, item_code, quantity, reorder_level
      FROM stock_items
      WHERE quantity <= reorder_level
      ORDER BY quantity ASC
      LIMIT 10
    `);

    const [outOfStock] = await pool.execute(`
      SELECT item_name, item_code
      FROM stock_items
      WHERE quantity = 0
    `);

    // Create notifications for low stock
    for (const item of lowStock) {
      await pool.execute(`
        INSERT IGNORE INTO notifications (user_id, title, message, type, priority, created_at)
        SELECT u.id, ?, ?, 'stock_alert', 'high', NOW()
        FROM users u
        WHERE u.role IN ('stock_manager', 'admin', 'super_admin', 'accountant')
      `, [
        `Low Stock: ${item.item_name}`,
        `${item.item_name} (${item.item_code}) has only ${item.quantity} units. Reorder level: ${item.reorder_level}`
      ]);
    }

    // Create critical notifications for out of stock
    for (const item of outOfStock) {
      await pool.execute(`
        INSERT IGNORE INTO notifications (user_id, title, message, type, priority, created_at)
        SELECT u.id, ?, ?, 'stock_alert', 'critical', NOW()
        FROM users u
        WHERE u.role IN ('stock_manager', 'admin', 'super_admin', 'accountant')
      `, [
        `CRITICAL: Out of Stock - ${item.item_name}`,
        `${item.item_name} (${item.item_code}) is out of stock. Immediate action required!`
      ]);
    }

    res.json({
      success: true,
      totals,
      byCategory,
      lowStock,
      outOfStock,
      alerts: {
        low_stock_count: lowStock.length,
        out_of_stock_count: outOfStock.length
      }
    });
  } catch (error) {
    console.error('Get stock stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock statistics'
    });
  }
});

// Get stock requisitions
router.get('/requisitions', [
  authenticateToken,
  requireRole('admin', 'super_admin', 'stock_manager')
], async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT sr.*, 
        u1.first_name as requested_by_name, u1.last_name as requested_by_lastname,
        u2.first_name as approved_by_name, u2.last_name as approved_by_lastname
      FROM stock_requisitions sr
      LEFT JOIN users u1 ON sr.requested_by = u1.id
      LEFT JOIN users u2 ON sr.approved_by = u2.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND sr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY sr.request_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [requisitions] = await pool.execute(query, params);

    // Get items for each requisition
    for (let req of requisitions) {
      const [items] = await pool.execute(`
        SELECT sri.*, si.item_name, si.item_code, si.unit
        FROM stock_requisition_items sri
        LEFT JOIN stock_items si ON sri.item_id = si.id
        WHERE sri.requisition_id = ?
      `, [req.id]);
      req.items = items;
    }

    res.json({
      success: true,
      requisitions
    });
  } catch (error) {
    console.error('Get requisitions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requisitions'
    });
  }
});

// Create stock requisition
router.post('/requisitions', [
  authenticateToken,
  requireRole('admin', 'super_admin', 'stock_manager', 'teacher', 'staff')
], async (req, res) => {
  try {
    const {
      department,
      required_date,
      items,
      notes
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    const requisition_number = `REQ${Date.now()}`;
    const request_date = new Date().toISOString().split('T')[0];

    const [result] = await pool.execute(`
      INSERT INTO stock_requisitions (
        requisition_number, requested_by, department, request_date,
        required_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      requisition_number,
      req.user.id,
      department,
      request_date,
      required_date,
      notes
    ]);

    const requisitionId = result.insertId;

    // Insert requisition items
    for (let item of items) {
      await pool.execute(`
        INSERT INTO stock_requisition_items (
          requisition_id, item_id, quantity_requested, purpose
        ) VALUES (?, ?, ?, ?)
      `, [requisitionId, item.item_id, item.quantity, item.purpose]);
    }

    res.json({
      success: true,
      message: 'Requisition created successfully',
      requisition: {
        id: requisitionId,
        requisition_number
      }
    });
  } catch (error) {
    console.error('Create requisition error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create requisition'
    });
  }
});

// Update requisition status
router.put('/requisitions/:id', [
  authenticateToken,
  requireRole('admin', 'super_admin', 'stock_manager')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { status, items } = req.body;

    await pool.execute(`
      UPDATE stock_requisitions SET
        status = ?,
        approved_by = ?,
        approval_date = ?
      WHERE id = ?
    `, [status, req.user.id, new Date().toISOString().split('T')[0], id]);

    // Update approved quantities if provided
    if (items && Array.isArray(items)) {
      for (let item of items) {
        await pool.execute(`
          UPDATE stock_requisition_items SET
            quantity_approved = ?
          WHERE id = ?
        `, [item.quantity_approved, item.id]);
      }
    }

    res.json({
      success: true,
      message: 'Requisition updated successfully'
    });
  } catch (error) {
    console.error('Update requisition error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update requisition'
    });
  }
});

// Get procurement orders
router.get('/procurement', [
  authenticateToken,
  requireRole('admin', 'super_admin', 'stock_manager')
], async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT po.*, 
        u1.first_name as ordered_by_name, u1.last_name as ordered_by_lastname,
        u2.first_name as received_by_name, u2.last_name as received_by_lastname
      FROM procurement_orders po
      LEFT JOIN users u1 ON po.ordered_by = u1.id
      LEFT JOIN users u2 ON po.received_by = u2.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND po.status = ?';
      params.push(status);
    }

    query += ' ORDER BY po.order_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [orders] = await pool.execute(query, params);

    // Get items for each order
    for (let order of orders) {
      const [items] = await pool.execute(`
        SELECT poi.*, si.item_code, si.unit
        FROM procurement_order_items poi
        LEFT JOIN stock_items si ON poi.item_id = si.id
        WHERE poi.order_id = ?
      `, [order.id]);
      order.items = items;
    }

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get procurement orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch procurement orders'
    });
  }
});

// Create procurement order
router.post('/procurement', [
  authenticateToken,
  requireRole('admin', 'super_admin', 'stock_manager')
], async (req, res) => {
  try {
    const {
      supplier,
      supplier_contact,
      expected_delivery_date,
      items,
      notes
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    const order_number = `PO${Date.now()}`;
    const order_date = new Date().toISOString().split('T')[0];
    const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    const [result] = await pool.execute(`
      INSERT INTO procurement_orders (
        order_number, supplier, supplier_contact, order_date,
        expected_delivery_date, total_amount, ordered_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      order_number,
      supplier,
      supplier_contact,
      order_date,
      expected_delivery_date,
      total_amount,
      req.user.id,
      notes
    ]);

    const orderId = result.insertId;

    // Insert order items
    for (let item of items) {
      await pool.execute(`
        INSERT INTO procurement_order_items (
          order_id, item_id, item_name, quantity_ordered,
          unit_price, total_price
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        orderId,
        item.item_id,
        item.item_name,
        item.quantity,
        item.unit_price,
        item.quantity * item.unit_price
      ]);
    }

    res.json({
      success: true,
      message: 'Procurement order created successfully',
      order: {
        id: orderId,
        order_number,
        total_amount
      }
    });
  } catch (error) {
    console.error('Create procurement order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create procurement order'
    });
  }
});

// Get suppliers
router.get('/suppliers', [
  authenticateToken,
  requireRole('admin', 'super_admin', 'stock_manager')
], async (req, res) => {
  try {
    const { status, category } = req.query;

    let query = 'SELECT * FROM stock_suppliers WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY supplier_name';

    const [suppliers] = await pool.execute(query, params);

    res.json({
      success: true,
      suppliers
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suppliers'
    });
  }
});

// Create supplier
router.post('/suppliers', [
  authenticateToken,
  requireRole('admin', 'super_admin', 'stock_manager')
], async (req, res) => {
  try {
    const {
      supplier_name,
      contact_person,
      phone,
      email,
      address,
      category,
      notes
    } = req.body;

    if (!supplier_name) {
      return res.status(400).json({
        success: false,
        message: 'Supplier name is required'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO stock_suppliers (
        supplier_name, contact_person, phone, email,
        address, category, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      supplier_name,
      contact_person,
      phone,
      email,
      address,
      category,
      notes
    ]);

    res.json({
      success: true,
      message: 'Supplier created successfully',
      supplier: {
        id: result.insertId,
        supplier_name
      }
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create supplier'
    });
  }
});

// Get stock notifications
router.get('/notifications', [
  authenticateToken,
  requireRole('admin', 'super_admin', 'stock_manager', 'accountant')
], async (req, res) => {
  try {
    const [notifications] = await pool.execute(`
      SELECT * FROM notifications
      WHERE user_id = ? AND type = 'stock_alert'
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.user.id]);

    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

module.exports = router;
