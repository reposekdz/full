const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// ===============================
// STOCK CATEGORIES MANAGEMENT
// ===============================

// Get all stock categories
router.get('/categories', [authenticateToken], async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT sc.*, 
        COUNT(si.id) as item_count,
        COALESCE(SUM(si.current_quantity * si.unit_price), 0) as total_value
      FROM stock_categories sc
      LEFT JOIN stock_items si ON sc.id = si.category_id AND si.is_active = true
      WHERE sc.is_active = true
      GROUP BY sc.id
      ORDER BY sc.name
    `);

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get stock categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create stock category
router.post('/categories', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'stock_manager'),
  body('name').notEmpty().withMessage('Category name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, description } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO stock_categories (name, description)
      VALUES (?, ?)
    `, [name, description]);

    res.status(201).json({
      success: true,
      message: 'Stock category created successfully',
      category: {
        id: result.insertId,
        name,
        description
      }
    });
  } catch (error) {
    console.error('Create stock category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update stock category
router.put('/categories/:id', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'stock_manager'),
  body('name').optional().notEmpty().withMessage('Category name cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    await pool.execute(
      `UPDATE stock_categories SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Stock category updated successfully'
    });
  } catch (error) {
    console.error('Update stock category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ===============================
// STOCK ITEMS MANAGEMENT
// ===============================

// Get all stock items
router.get('/items', [authenticateToken], async (req, res) => {
  try {
    const { category_id, low_stock, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE si.is_active = true';
    const params = [];

    if (category_id) {
      whereClause += ' AND si.category_id = ?';
      params.push(category_id);
    }

    if (low_stock === 'true') {
      whereClause += ' AND si.current_quantity <= si.minimum_quantity';
    }

    if (search) {
      whereClause += ' AND (si.name LIKE ? OR si.sku LIKE ? OR si.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const [items] = await pool.execute(`
      SELECT si.*, sc.name as category_name,
        (si.current_quantity * si.unit_price) as total_value,
        CASE 
          WHEN si.current_quantity <= si.minimum_quantity THEN 'low'
          WHEN si.current_quantity >= si.maximum_quantity THEN 'high'
          ELSE 'normal'
        END as stock_status
      FROM stock_items si
      JOIN stock_categories sc ON si.category_id = sc.id
      ${whereClause}
      ORDER BY si.name
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM stock_items si
      ${whereClause}
    `, params);

    res.json({
      success: true,
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get stock items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get stock item by ID
router.get('/items/:id', [authenticateToken], async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.execute(`
      SELECT si.*, sc.name as category_name,
        (si.current_quantity * si.unit_price) as total_value
      FROM stock_items si
      JOIN stock_categories sc ON si.category_id = sc.id
      WHERE si.id = ?
    `, [id]);

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    // Get recent movements for this item
    const [movements] = await pool.execute(`
      SELECT sm.*, CONCAT(u.first_name, ' ', u.last_name) as moved_by_name
      FROM stock_movements sm
      JOIN users u ON sm.moved_by = u.id
      WHERE sm.stock_item_id = ?
      ORDER BY sm.movement_date DESC
      LIMIT 10
    `, [id]);

    res.json({
      success: true,
      item: {
        ...items[0],
        recent_movements: movements
      }
    });
  } catch (error) {
    console.error('Get stock item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create stock item
router.post('/items', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'stock_manager'),
  body('name').notEmpty().withMessage('Item name is required'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('category_id').isInt().withMessage('Valid category ID is required'),
  body('unit_price').optional().isFloat({ min: 0 }).withMessage('Unit price must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      name, description, category_id, sku, current_quantity, minimum_quantity,
      maximum_quantity, unit_price, unit_of_measurement, supplier, location
    } = req.body;

    // Check if SKU already exists
    const [existing] = await pool.execute('SELECT id FROM stock_items WHERE sku = ?', [sku]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO stock_items (
        name, description, category_id, sku, current_quantity, minimum_quantity,
        maximum_quantity, unit_price, unit_of_measurement, supplier, location
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, description, category_id, sku, current_quantity || 0,
      minimum_quantity || 10, maximum_quantity || 1000, unit_price || 0,
      unit_of_measurement || 'piece', supplier, location
    ]);

    // Create initial stock movement if quantity > 0
    if (current_quantity > 0) {
      await pool.execute(`
        INSERT INTO stock_movements (
          stock_item_id, movement_type, quantity, unit_price, total_value,
          reason, moved_by, notes
        ) VALUES (?, 'in', ?, ?, ?, 'Initial stock', ?, 'Initial stock entry')
      `, [
        result.insertId, current_quantity, unit_price || 0,
        (current_quantity || 0) * (unit_price || 0), req.user.id
      ]);
    }

    res.status(201).json({
      success: true,
      message: 'Stock item created successfully',
      item: {
        id: result.insertId,
        name,
        sku,
        category_id,
        current_quantity,
        unit_price
      }
    });
  } catch (error) {
    console.error('Create stock item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update stock item
router.put('/items/:id', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'stock_manager'),
  body('name').optional().notEmpty().withMessage('Item name cannot be empty'),
  body('sku').optional().notEmpty().withMessage('SKU cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const {
      name, description, sku, minimum_quantity, maximum_quantity,
      unit_price, unit_of_measurement, supplier, location, is_active
    } = req.body;

    // Check if SKU already exists (excluding current item)
    if (sku) {
      const [existing] = await pool.execute('SELECT id FROM stock_items WHERE sku = ? AND id != ?', [sku, id]);
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'SKU already exists'
        });
      }
    }

    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (sku) {
      updates.push('sku = ?');
      values.push(sku);
    }
    if (minimum_quantity !== undefined) {
      updates.push('minimum_quantity = ?');
      values.push(minimum_quantity);
    }
    if (maximum_quantity !== undefined) {
      updates.push('maximum_quantity = ?');
      values.push(maximum_quantity);
    }
    if (unit_price !== undefined) {
      updates.push('unit_price = ?');
      values.push(unit_price);
    }
    if (unit_of_measurement) {
      updates.push('unit_of_measurement = ?');
      values.push(unit_of_measurement);
    }
    if (supplier !== undefined) {
      updates.push('supplier = ?');
      values.push(supplier);
    }
    if (location !== undefined) {
      updates.push('location = ?');
      values.push(location);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    await pool.execute(
      `UPDATE stock_items SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Stock item updated successfully'
    });
  } catch (error) {
    console.error('Update stock item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ===============================
// STOCK MOVEMENTS MANAGEMENT
// ===============================

// Get stock movements
router.get('/movements', [authenticateToken], async (req, res) => {
  try {
    const { stock_item_id, movement_type, date_from, date_to, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (stock_item_id) {
      whereClause += ' AND sm.stock_item_id = ?';
      params.push(stock_item_id);
    }

    if (movement_type) {
      whereClause += ' AND sm.movement_type = ?';
      params.push(movement_type);
    }

    if (date_from) {
      whereClause += ' AND DATE(sm.movement_date) >= ?';
      params.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND DATE(sm.movement_date) <= ?';
      params.push(date_to);
    }

    const [movements] = await pool.execute(`
      SELECT sm.*, 
        si.name as item_name,
        si.sku as item_sku,
        sc.name as category_name,
        CONCAT(u.first_name, ' ', u.last_name) as moved_by_name,
        CONCAT(a.first_name, ' ', a.last_name) as approved_by_name
      FROM stock_movements sm
      JOIN stock_items si ON sm.stock_item_id = si.id
      JOIN stock_categories sc ON si.category_id = sc.id
      JOIN users u ON sm.moved_by = u.id
      LEFT JOIN users a ON sm.approved_by = a.id
      ${whereClause}
      ORDER BY sm.movement_date DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM stock_movements sm
      ${whereClause}
    `, params);

    res.json({
      success: true,
      movements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create stock movement (Stock In/Out/Adjustment)
router.post('/movements', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'stock_manager'),
  body('stock_item_id').isInt().withMessage('Valid stock item ID is required'),
  body('movement_type').isIn(['in', 'out', 'adjustment', 'transfer']).withMessage('Valid movement type is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('reason').notEmpty().withMessage('Reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      stock_item_id, movement_type, quantity, unit_price, reference_number,
      reason, notes, approved_by
    } = req.body;

    // Get current stock item info
    const [stockItem] = await pool.execute(
      'SELECT current_quantity, unit_price as item_unit_price FROM stock_items WHERE id = ?',
      [stock_item_id]
    );

    if (stockItem.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    const currentQuantity = stockItem[0].current_quantity;
    const itemUnitPrice = unit_price || stockItem[0].item_unit_price;

    // Check if we have enough stock for 'out' movements
    if (movement_type === 'out' && quantity > currentQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock quantity'
      });
    }

    // Calculate new quantity based on movement type
    let newQuantity = currentQuantity;
    switch (movement_type) {
      case 'in':
        newQuantity = currentQuantity + quantity;
        break;
      case 'out':
        newQuantity = currentQuantity - quantity;
        break;
      case 'adjustment':
        newQuantity = quantity; // Direct adjustment to specific quantity
        break;
      case 'transfer':
        newQuantity = currentQuantity - quantity;
        break;
    }

    const totalValue = quantity * itemUnitPrice;

    // Start transaction
    await pool.execute('START TRANSACTION');

    try {
      // Create movement record
      const [result] = await pool.execute(`
        INSERT INTO stock_movements (
          stock_item_id, movement_type, quantity, unit_price, total_value,
          reference_number, reason, moved_by, approved_by, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        stock_item_id, movement_type, quantity, itemUnitPrice, totalValue,
        reference_number, reason, req.user.id, approved_by, notes
      ]);

      // Update stock item quantity
      await pool.execute(
        'UPDATE stock_items SET current_quantity = ? WHERE id = ?',
        [newQuantity, stock_item_id]
      );

      await pool.execute('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Stock movement recorded successfully',
        movement: {
          id: result.insertId,
          stock_item_id,
          movement_type,
          quantity,
          unit_price: itemUnitPrice,
          total_value: totalValue,
          new_quantity: newQuantity
        }
      });
    } catch (error) {
      await pool.execute('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Create stock movement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get stock reports
router.get('/reports/summary', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'stock_manager')
], async (req, res) => {
  try {
    // Total stock value
    const [totalValue] = await pool.execute(`
      SELECT 
        COUNT(si.id) as total_items,
        SUM(si.current_quantity * si.unit_price) as total_value,
        SUM(si.current_quantity) as total_quantity
      FROM stock_items si
      WHERE si.is_active = true
    `);

    // Low stock items
    const [lowStockItems] = await pool.execute(`
      SELECT si.*, sc.name as category_name
      FROM stock_items si
      JOIN stock_categories sc ON si.category_id = sc.id
      WHERE si.is_active = true AND si.current_quantity <= si.minimum_quantity
      ORDER BY (si.current_quantity / si.minimum_quantity) ASC
      LIMIT 10
    `);

    // Stock by category
    const [stockByCategory] = await pool.execute(`
      SELECT 
        sc.name as category_name,
        COUNT(si.id) as item_count,
        SUM(si.current_quantity) as total_quantity,
        SUM(si.current_quantity * si.unit_price) as total_value
      FROM stock_categories sc
      LEFT JOIN stock_items si ON sc.id = si.category_id AND si.is_active = true
      WHERE sc.is_active = true
      GROUP BY sc.id
      ORDER BY total_value DESC
    `);

    // Recent movements
    const [recentMovements] = await pool.execute(`
      SELECT sm.*, si.name as item_name, si.sku,
        CONCAT(u.first_name, ' ', u.last_name) as moved_by_name
      FROM stock_movements sm
      JOIN stock_items si ON sm.stock_item_id = si.id
      JOIN users u ON sm.moved_by = u.id
      ORDER BY sm.movement_date DESC
      LIMIT 10
    `);

    // Movement summary for current month
    const [movementSummary] = await pool.execute(`
      SELECT 
        movement_type,
        COUNT(*) as movement_count,
        SUM(quantity) as total_quantity,
        SUM(total_value) as total_value
      FROM stock_movements
      WHERE MONTH(movement_date) = MONTH(CURRENT_DATE())
        AND YEAR(movement_date) = YEAR(CURRENT_DATE())
      GROUP BY movement_type
    `);

    res.json({
      success: true,
      report: {
        summary: totalValue[0],
        low_stock_items: lowStockItems,
        stock_by_category: stockByCategory,
        recent_movements: recentMovements,
        movement_summary: movementSummary
      }
    });
  } catch (error) {
    console.error('Get stock reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get stock valuation report
router.get('/reports/valuation', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'stock_manager')
], async (req, res) => {
  try {
    const { category_id } = req.query;

    let whereClause = 'WHERE si.is_active = true';
    const params = [];

    if (category_id) {
      whereClause += ' AND si.category_id = ?';
      params.push(category_id);
    }

    const [valuation] = await pool.execute(`
      SELECT 
        si.id,
        si.name,
        si.sku,
        sc.name as category_name,
        si.current_quantity,
        si.unit_price,
        (si.current_quantity * si.unit_price) as total_value,
        si.minimum_quantity,
        si.maximum_quantity,
        CASE 
          WHEN si.current_quantity <= si.minimum_quantity THEN 'Low Stock'
          WHEN si.current_quantity >= si.maximum_quantity THEN 'Overstock'
          ELSE 'Normal'
        END as stock_status
      FROM stock_items si
      JOIN stock_categories sc ON si.category_id = sc.id
      ${whereClause}
      ORDER BY total_value DESC
    `, params);

    const totalValue = valuation.reduce((sum, item) => sum + parseFloat(item.total_value), 0);
    const totalItems = valuation.length;
    const lowStockCount = valuation.filter(item => item.stock_status === 'Low Stock').length;
    const overstockCount = valuation.filter(item => item.stock_status === 'Overstock').length;

    res.json({
      success: true,
      valuation: {
        summary: {
          total_value: totalValue,
          total_items: totalItems,
          low_stock_count: lowStockCount,
          overstock_count: overstockCount
        },
        items: valuation
      }
    });
  } catch (error) {
    console.error('Get stock valuation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;