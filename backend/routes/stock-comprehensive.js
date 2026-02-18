const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const allowedRoles = ['admin', 'headmaster', 'stockmanager', 'accountant', 'dos', 'dod'];

router.get('/overview', authenticateToken, requireRole(allowedRoles), async (req, res) => {
  try {
    const [[stockStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN quantity > 0 THEN 1 ELSE 0 END) as in_stock_items,
        SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_items,
        SUM(CASE WHEN quantity <= reorder_level AND quantity > 0 THEN 1 ELSE 0 END) as low_stock_items,
        SUM(quantity * unit_price) as total_stock_value,
        SUM(quantity) as total_quantity
      FROM stock_items
      WHERE is_active = TRUE
    `);

    const [recentMovements] = await pool.execute(`
      SELECT 
        sm.*,
        si.item_name,
        si.item_code,
        CONCAT(u.first_name, ' ', u.last_name) as performed_by_name
      FROM stock_movements sm
      JOIN stock_items si ON sm.item_id = si.id
      LEFT JOIN users u ON sm.created_by = u.id
      ORDER BY sm.created_at DESC
      LIMIT 10
    `);

    const [categoryBreakdown] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        SUM(quantity * unit_price) as category_value
      FROM stock_items
      WHERE is_active = TRUE
      GROUP BY category
      ORDER BY category_value DESC
    `);

    const [lowStockAlerts] = await pool.execute(`
      SELECT 
        id,
        item_code,
        item_name,
        category,
        quantity,
        reorder_level,
        unit,
        location
      FROM stock_items
      WHERE quantity <= reorder_level AND quantity > 0 AND is_active = TRUE
      ORDER BY (quantity - reorder_level)
      LIMIT 20
    `);

    const [outOfStockAlerts] = await pool.execute(`
      SELECT 
        id,
        item_code,
        item_name,
        category,
        unit,
        location,
        reorder_level
      FROM stock_items
      WHERE quantity = 0 AND is_active = TRUE
      ORDER BY item_name
      LIMIT 20
    `);

    res.json({
      success: true,
      overview: stockStats,
      recentMovements,
      categoryBreakdown,
      alerts: {
        lowStock: lowStockAlerts,
        outOfStock: outOfStockAlerts
      }
    });
  } catch (error) {
    console.error('Stock overview error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch stock overview',
      error: error.message 
    });
  }
});

router.get('/items', authenticateToken, requireRole(allowedRoles), async (req, res) => {
  try {
    const { 
      category, 
      search, 
      status,
      page = 1, 
      limit = 50 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let conditions = ['si.is_active = TRUE'];
    let params = [];

    if (category) {
      conditions.push('si.category = ?');
      params.push(category);
    }

    if (search) {
      conditions.push('(si.item_name LIKE ? OR si.item_code LIKE ? OR si.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status === 'low_stock') {
      conditions.push('si.quantity <= si.reorder_level AND si.quantity > 0');
    } else if (status === 'out_of_stock') {
      conditions.push('si.quantity = 0');
    } else if (status === 'in_stock') {
      conditions.push('si.quantity > si.reorder_level');
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const [items] = await pool.execute(`
      SELECT 
        si.*,
        ss.supplier_name,
        ss.contact_person,
        ss.phone as supplier_phone,
        (si.quantity * si.unit_price) as total_value,
        CASE 
          WHEN si.quantity = 0 THEN 'out_of_stock'
          WHEN si.quantity <= si.reorder_level THEN 'low_stock'
          ELSE 'in_stock'
        END as status_label
      FROM stock_items si
      LEFT JOIN stock_suppliers ss ON si.supplier_id = ss.id
      ${whereClause}
      ORDER BY si.item_name ASC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [[{ total }]] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM stock_items si
      ${whereClause}
    `, params);

    res.json({
      success: true,
      items,
      pagination: {
        total: parseInt(total),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get stock items error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch stock items',
      error: error.message 
    });
  }
});

router.post('/items', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

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

    if (!item_code || !item_name || !category) {
      throw new Error('Item code, name, and category are required');
    }

    const [existing] = await connection.execute(
      'SELECT id FROM stock_items WHERE item_code = ?',
      [item_code]
    );

    if (existing.length > 0) {
      throw new Error('Item code already exists');
    }

    const [result] = await connection.execute(`
      INSERT INTO stock_items (
        item_code, item_name, category, description,
        quantity, unit, unit_price, reorder_level,
        location, supplier_id, expiry_date, batch_number,
        is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())
    `, [
      item_code,
      item_name,
      category,
      description || null,
      quantity || 0,
      unit || 'pcs',
      unit_price || 0,
      reorder_level || 10,
      location || null,
      supplier_id || null,
      expiry_date || null,
      batch_number || null
    ]);

    if (quantity && quantity > 0) {
      await connection.execute(`
        INSERT INTO stock_movements (
          item_id, movement_type, quantity, previous_qty,
          new_qty, notes, created_by, created_at
        ) VALUES (?, 'in', ?, 0, ?, 'Initial stock entry', ?, NOW())
      `, [result.insertId, quantity, quantity, req.user.userId]);
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Stock item created successfully',
      itemId: result.insertId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create stock item error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create stock item'
    });
  } finally {
    connection.release();
  }
});

router.put('/items/:id', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const { id } = req.params;
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

    const [existing] = await pool.execute(
      'SELECT id FROM stock_items WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    await pool.execute(`
      UPDATE stock_items SET
        item_name = COALESCE(?, item_name),
        category = COALESCE(?, category),
        description = COALESCE(?, description),
        unit = COALESCE(?, unit),
        unit_price = COALESCE(?, unit_price),
        reorder_level = COALESCE(?, reorder_level),
        location = COALESCE(?, location),
        supplier_id = COALESCE(?, supplier_id),
        expiry_date = COALESCE(?, expiry_date),
        batch_number = COALESCE(?, batch_number),
        updated_at = NOW()
      WHERE id = ?
    `, [
      item_name,
      category,
      description,
      unit,
      unit_price,
      reorder_level,
      location,
      supplier_id,
      expiry_date,
      batch_number,
      id
    ]);

    res.json({
      success: true,
      message: 'Stock item updated successfully'
    });
  } catch (error) {
    console.error('Update stock item error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update stock item'
    });
  }
});

router.post('/movements', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      item_id,
      movement_type,
      quantity,
      reference_type,
      reference_id,
      notes
    } = req.body;

    if (!item_id || !movement_type || !quantity) {
      throw new Error('Item ID, movement type, and quantity are required');
    }

    const validTypes = ['in', 'out', 'adjustment', 'return', 'damage', 'transfer'];
    if (!validTypes.includes(movement_type)) {
      throw new Error('Invalid movement type');
    }

    const [[item]] = await connection.execute(
      'SELECT id, quantity, item_name FROM stock_items WHERE id = ? AND is_active = TRUE',
      [item_id]
    );

    if (!item) {
      throw new Error('Stock item not found');
    }

    const previousQty = parseFloat(item.quantity);
    let newQty = previousQty;

    if (movement_type === 'in' || movement_type === 'return') {
      newQty = previousQty + parseFloat(quantity);
    } else if (movement_type === 'out' || movement_type === 'damage') {
      newQty = previousQty - parseFloat(quantity);
      if (newQty < 0) {
        throw new Error('Insufficient stock quantity');
      }
    } else if (movement_type === 'adjustment') {
      newQty = parseFloat(quantity);
    }

    await connection.execute(`
      INSERT INTO stock_movements (
        item_id, movement_type, quantity, previous_qty,
        new_qty, reference_type, reference_id, notes,
        created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      item_id,
      movement_type,
      quantity,
      previousQty,
      newQty,
      reference_type || null,
      reference_id || null,
      notes || null,
      req.user.userId
    ]);

    await connection.execute(
      'UPDATE stock_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
      [newQty, item_id]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: `Stock ${movement_type} recorded successfully`,
      previousQty,
      newQty
    });
  } catch (error) {
    await connection.rollback();
    console.error('Stock movement error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to record stock movement'
    });
  } finally {
    connection.release();
  }
});

router.get('/movements', authenticateToken, requireRole(allowedRoles), async (req, res) => {
  try {
    const { 
      item_id, 
      movement_type,
      page = 1, 
      limit = 50 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let conditions = [];
    let params = [];

    if (item_id) {
      conditions.push('sm.item_id = ?');
      params.push(item_id);
    }

    if (movement_type) {
      conditions.push('sm.movement_type = ?');
      params.push(movement_type);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const [movements] = await pool.execute(`
      SELECT 
        sm.*,
        si.item_name,
        si.item_code,
        si.unit,
        CONCAT(u.first_name, ' ', u.last_name) as performed_by_name,
        u.role as performed_by_role
      FROM stock_movements sm
      JOIN stock_items si ON sm.item_id = si.id
      LEFT JOIN users u ON sm.created_by = u.id
      ${whereClause}
      ORDER BY sm.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [[{ total }]] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM stock_movements sm
      ${whereClause}
    `, params);

    res.json({
      success: true,
      movements,
      pagination: {
        total: parseInt(total),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch stock movements',
      error: error.message 
    });
  }
});

router.get('/suppliers', authenticateToken, requireRole(allowedRoles), async (req, res) => {
  try {
    const [suppliers] = await pool.execute(`
      SELECT 
        ss.*,
        COUNT(si.id) as item_count,
        SUM(si.quantity * si.unit_price) as total_supply_value
      FROM stock_suppliers ss
      LEFT JOIN stock_items si ON ss.id = si.supplier_id AND si.is_active = TRUE
      WHERE ss.is_active = TRUE
      GROUP BY ss.id
      ORDER BY ss.supplier_name
    `);

    res.json({
      success: true,
      suppliers
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch suppliers',
      error: error.message 
    });
  }
});

router.post('/suppliers', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const {
      supplier_code,
      supplier_name,
      contact_person,
      phone,
      email,
      address,
      payment_terms,
      notes
    } = req.body;

    if (!supplier_code || !supplier_name) {
      return res.status(400).json({
        success: false,
        message: 'Supplier code and name are required'
      });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM stock_suppliers WHERE supplier_code = ?',
      [supplier_code]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Supplier code already exists'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO stock_suppliers (
        supplier_code, supplier_name, contact_person,
        phone, email, address, payment_terms, notes,
        is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())
    `, [
      supplier_code,
      supplier_name,
      contact_person || null,
      phone || null,
      email || null,
      address || null,
      payment_terms || null,
      notes || null
    ]);

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      supplierId: result.insertId
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create supplier'
    });
  }
});

router.get('/categories', authenticateToken, requireRole(allowedRoles), async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT 
        sc.*,
        COUNT(si.id) as item_count,
        SUM(si.quantity) as total_quantity,
        SUM(si.quantity * si.unit_price) as total_value
      FROM stock_categories sc
      LEFT JOIN stock_items si ON sc.category_name = si.category AND si.is_active = TRUE
      WHERE sc.is_active = TRUE
      GROUP BY sc.id
      ORDER BY sc.category_name
    `);

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch categories',
      error: error.message 
    });
  }
});

router.get('/orders', authenticateToken, requireRole(allowedRoles), async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let conditions = [];
    let params = [];

    if (status) {
      conditions.push('so.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const [orders] = await pool.execute(`
      SELECT 
        so.*,
        ss.supplier_name,
        ss.contact_person,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        COUNT(soi.id) as item_count
      FROM stock_orders so
      LEFT JOIN stock_suppliers ss ON so.supplier_id = ss.id
      LEFT JOIN users u ON so.created_by = u.id
      LEFT JOIN stock_order_items soi ON so.id = soi.order_id
      ${whereClause}
      GROUP BY so.id
      ORDER BY so.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [[{ total }]] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM stock_orders so
      ${whereClause}
    `, params);

    res.json({
      success: true,
      orders,
      pagination: {
        total: parseInt(total),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get stock orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch stock orders',
      error: error.message 
    });
  }
});

router.post('/orders', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      order_number,
      supplier_id,
      expected_delivery,
      notes,
      items
    } = req.body;

    if (!order_number || !items || items.length === 0) {
      throw new Error('Order number and items are required');
    }

    const [result] = await connection.execute(`
      INSERT INTO stock_orders (
        order_number, supplier_id, status, expected_delivery,
        notes, created_by, created_at, updated_at
      ) VALUES (?, ?, 'draft', ?, ?, ?, NOW(), NOW())
    `, [
      order_number,
      supplier_id || null,
      expected_delivery || null,
      notes || null,
      req.user.userId
    ]);

    const orderId = result.insertId;
    let totalAmount = 0;

    for (const item of items) {
      const itemTotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
      totalAmount += itemTotal;

      await connection.execute(`
        INSERT INTO stock_order_items (
          order_id, item_id, quantity, unit_price, total, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `, [
        orderId,
        item.item_id,
        item.quantity,
        item.unit_price,
        itemTotal
      ]);
    }

    await connection.execute(
      'UPDATE stock_orders SET total_amount = ? WHERE id = ?',
      [totalAmount, orderId]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Stock order created successfully',
      orderId,
      totalAmount
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create stock order error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create stock order'
    });
  } finally {
    connection.release();
  }
});

router.get('/reports/summary', authenticateToken, requireRole(allowedRoles), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let dateCondition = '';
    let params = [];

    if (start_date && end_date) {
      dateCondition = 'WHERE sm.created_at BETWEEN ? AND ?';
      params = [start_date, end_date];
    }

    const [movementSummary] = await pool.execute(`
      SELECT 
        movement_type,
        COUNT(*) as movement_count,
        SUM(quantity) as total_quantity
      FROM stock_movements sm
      ${dateCondition}
      GROUP BY movement_type
      ORDER BY movement_count DESC
    `, params);

    const [[valueReport]] = await pool.execute(`
      SELECT 
        SUM(quantity * unit_price) as current_stock_value,
        COUNT(*) as total_items,
        SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) as zero_stock_items
      FROM stock_items
      WHERE is_active = TRUE
    `);

    const [topCategories] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity * unit_price) as category_value
      FROM stock_items
      WHERE is_active = TRUE
      GROUP BY category
      ORDER BY category_value DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      report: {
        movementSummary,
        valueReport,
        topCategories
      }
    });
  } catch (error) {
    console.error('Stock report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate stock report',
      error: error.message 
    });
  }
});

module.exports = router;
