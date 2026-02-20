/**
 * Stock Ultra Advanced API Routes
 * Comprehensive stock management endpoints for the Ultra Advanced Stock Dashboard
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../server');
const { authenticateToken, requireRole } = require('./auth');

// Helper function to get user info from token
const getUserInfo = (req) => {
  if (req.user) {
    return {
      userId: req.user.userId || req.user.id,
      name: req.user.name || `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Unknown'
    };
  }
  return { userId: 1, name: 'System' };
};

// ============================================
// DASHBOARD
// ============================================

// Get dashboard statistics
router.get('/dashboard', authenticateToken, requireRole(['stock_manager', 'admin', 'headmaster', 'super_admin', 'director_study', 'director_discipline', 'accountant', 'patron', 'matron']), async (req, res) => {
  try {
    // Get stock summary
    const [[stockSummary]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN quantity > reorder_level THEN 1 ELSE 0 END) as in_stock,
        SUM(CASE WHEN quantity <= reorder_level AND quantity > 0 THEN 1 ELSE 0 END) as low_stock,
        SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
        COALESCE(SUM(quantity * unit_price), 0) as total_value
      FROM stock_items 
      WHERE is_active = 1 OR is_active IS NULL
    `);

    // Get recent transactions
    const [recentTransactions] = await pool.execute(`
      SELECT st.*, si.item_name, si.category 
      FROM stock_transactions st
      LEFT JOIN stock_items si ON st.item_id = si.id
      ORDER BY st.transaction_date DESC LIMIT 10
    `);

    // Get low stock alerts
    const [lowStockAlerts] = await pool.execute(`
      SELECT * FROM stock_items 
      WHERE quantity <= reorder_level AND quantity > 0 AND (is_active = 1 OR is_active IS NULL)
      ORDER BY quantity ASC LIMIT 10
    `);

    // Get out of stock items
    const [outOfStock] = await pool.execute(`
      SELECT * FROM stock_items 
      WHERE quantity = 0 AND (is_active = 1 OR is_active IS NULL)
      ORDER BY item_name ASC LIMIT 10
    `);

    // Get this month statistics
    const [[thisMonthStats]] = await pool.execute(`
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type IN ('receive', 'purchase', 'stock_in') THEN quantity ELSE 0 END), 0) as received,
        COALESCE(SUM(CASE WHEN transaction_type IN ('issue', 'stock_out', 'distribution') THEN quantity ELSE 0 END), 0) as issued
      FROM stock_transactions 
      WHERE MONTH(transaction_date) = MONTH(CURDATE()) AND YEAR(transaction_date) = YEAR(CURDATE())
    `);

    // Get category breakdown
    const [categoryBreakdown] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        COALESCE(SUM(quantity * unit_price), 0) as total_value
      FROM stock_items 
      WHERE (is_active = 1 OR is_active IS NULL) AND category IS NOT NULL
      GROUP BY category
      ORDER BY total_value DESC
    `);

    res.json({
      success: true,
      dashboard: {
        summary: {
          total_items: stockSummary?.total_items || 0,
          in_stock: stockSummary?.in_stock || 0,
          low_stock: stockSummary?.low_stock || 0,
          out_of_stock: stockSummary?.out_of_stock || 0,
          total_value: stockSummary?.total_value || 0
        },
        recent_transactions: recentTransactions || [],
        low_stock_alerts: lowStockAlerts || [],
        out_of_stock: outOfStock || [],
        this_month: thisMonthStats || { received: 0, issued: 0 },
        category_breakdown: categoryBreakdown || []
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data', error: error.message });
  }
});

// ============================================
// STOCK ITEMS
// ============================================

// Get all stock items with pagination and filters
router.get('/items', authenticateToken, requireRole(['stock_manager', 'admin', 'headmaster', 'super_admin', 'director_study', 'director_discipline', 'accountant', 'patron', 'matron', 'teacher', 'staff']), async (req, res) => {
  try {
    const { page = 1, limit = 50, category, status, search, supplier, sort_by = 'id', order = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE (si.is_active = 1 OR si.is_active IS NULL)';
    const params = [];

    if (category) {
      whereClause += ' AND si.category = ?';
      params.push(category);
    }

    if (search) {
      whereClause += ' AND (si.item_name LIKE ? OR si.item_code LIKE ? OR si.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (status === 'low_stock') {
      whereClause += ' AND si.quantity <= si.reorder_level AND si.quantity > 0';
    } else if (status === 'out_of_stock') {
      whereClause += ' AND si.quantity = 0';
    } else if (status === 'in_stock') {
      whereClause += ' AND si.quantity > si.reorder_level';
    }

    if (supplier) {
      whereClause += ' AND si.supplier_id = ?';
      params.push(supplier);
    }

    const validSortFields = ['id', 'item_name', 'category', 'quantity', 'unit_price', 'reorder_level', 'created_at'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'id';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Get items
    const [items] = await pool.execute(`
      SELECT si.*, 
        CASE 
          WHEN si.quantity = 0 THEN 'out_of_stock'
          WHEN si.quantity <= si.reorder_level THEN 'low_stock'
          ELSE 'in_stock'
        END as status_label,
        ss.supplier_name
      FROM stock_items si
      LEFT JOIN stock_suppliers ss ON si.supplier_id = ss.id
      ${whereClause}
      ORDER BY si.${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    // Get total count
    const [[{ total }]] = await pool.execute(`
      SELECT COUNT(*) as total FROM stock_items si ${whereClause}
    `, params);

    // Get category list
    const [categories] = await pool.execute(`
      SELECT DISTINCT category as category_name FROM stock_items 
      WHERE (is_active = 1 OR is_active IS NULL) AND category IS NOT NULL
      ORDER BY category
    `);

    res.json({
      success: true,
      items: items || [],
      total: total || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      categories: categories || []
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch items', error: error.message });
  }
});

// Get single stock item
router.get('/items/:id', authenticateToken, requireRole(['stock_manager', 'admin', 'headmaster', 'super_admin', 'patron', 'matron']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [items] = await pool.execute(`
      SELECT si.*, ss.supplier_name, ss.phone as supplier_phone, ss.email as supplier_email
      FROM stock_items si
      LEFT JOIN stock_suppliers ss ON si.supplier_id = ss.id
      WHERE si.id = ? AND (si.is_active = 1 OR si.is_active IS NULL)
    `, [id]);

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Get transaction history
    const [transactions] = await pool.execute(`
      SELECT * FROM stock_transactions 
      WHERE item_id = ? 
      ORDER BY transaction_date DESC LIMIT 20
    `, [id]);

    res.json({
      success: true,
      item: items[0],
      transactions: transactions || []
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch item', error: error.message });
  }
});

// Create stock item
router.post('/items', authenticateToken, requireRole(['stock_manager', 'admin', 'patron', 'matron']), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { item_code, item_name, category, description, quantity, unit, unit_price, reorder_level, supplier_id, location } = req.body;
    const userInfo = getUserInfo(req);

    // Check for duplicate item code
    const [existing] = await connection.execute(
      'SELECT id FROM stock_items WHERE item_code = ?',
      [item_code]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Item code already exists' });
    }

    await connection.beginTransaction();

    // Insert item
    const [result] = await connection.execute(`
      INSERT INTO stock_items (
        item_code, item_name, category, description, quantity, unit, unit_price, 
        reorder_level, supplier_id, location, created_by, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [item_code, item_name, category || 'General', description || '', quantity || 0, unit || 'pieces', unit_price || 0, reorder_level || 10, supplier_id || null, location || 'Main Store', userInfo.userId]);

    // If initial quantity > 0, create initial transaction
    if (quantity && quantity > 0) {
      await connection.execute(`
        INSERT INTO stock_transactions (
          item_id, transaction_type, quantity, previous_quantity, new_quantity, 
          unit_price, total_amount, notes, performed_by, transaction_date
        ) VALUES (?, 'receive', ?, 0, ?, ?, ?, 'Initial stock entry', ?, NOW())
      `, [result.insertId, quantity, quantity, unit_price || 0, (quantity * (unit_price || 0)), userInfo.userId]);
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Stock item created successfully',
      item_id: result.insertId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create item error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create item' });
  } finally {
    connection.release();
  }
});

// Update stock item
router.put('/items/:id', authenticateToken, requireRole(['stock_manager', 'admin', 'patron', 'matron']), async (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, category, description, unit, unit_price, reorder_level, supplier_id, location } = req.body;

    const [existing] = await pool.execute(
      'SELECT * FROM stock_items WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    await pool.execute(`
      UPDATE stock_items SET
        item_name = COALESCE(?, item_name),
        category = COALESCE(?, category),
        description = COALESCE(?, description),
        unit = COALESCE(?, unit),
        unit_price = COALESCE(?, unit_price),
        reorder_level = COALESCE(?, reorder_level),
        supplier_id = COALESCE(?, supplier_id),
        location = COALESCE(?, location),
        updated_at = NOW()
      WHERE id = ?
    `, [item_name, category, description, unit, unit_price, reorder_level, supplier_id, location, id]);

    res.json({ success: true, message: 'Item updated successfully' });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ success: false, message: 'Failed to update item', error: error.message });
  }
});

// Delete stock item (soft delete)
router.delete('/items/:id', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'UPDATE stock_items SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete item', error: error.message });
  }
});

// Adjust stock quantity
router.post('/items/:id/adjust', authenticateToken, requireRole(['stock_manager', 'admin', 'patron', 'matron']), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { adjustment_type, quantity, reason } = req.body;
    const userInfo = getUserInfo(req);

    if (!['in', 'out'].includes(adjustment_type)) {
      return res.status(400).json({ success: false, message: 'Invalid adjustment type' });
    }

    await connection.beginTransaction();

    // Get current quantity
    const [[item]] = await connection.execute(
      'SELECT quantity, item_name FROM stock_items WHERE id = ?',
      [id]
    );

    if (!item) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const previousQuantity = item.quantity;
    let newQuantity;
    if (adjustment_type === 'in') {
      newQuantity = previousQuantity + parseInt(quantity);
    } else {
      newQuantity = previousQuantity - parseInt(quantity);
      if (newQuantity < 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Insufficient stock quantity' });
      }
    }

    // Update quantity
    await connection.execute(
      'UPDATE stock_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
      [newQuantity, id]
    );

    // Record transaction
    await connection.execute(`
      INSERT INTO stock_transactions (
        item_id, transaction_type, quantity, previous_quantity, new_quantity,
        notes, performed_by, transaction_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [id, adjustment_type === 'in' ? 'stock_in' : 'stock_out', quantity, previousQuantity, newQuantity, reason || 'Stock adjustment', userInfo.userId]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      previous_quantity: previousQuantity,
      new_quantity: newQuantity
    });
  } catch (error) {
    await connection.rollback();
    console.error('Adjust stock error:', error);
    res.status(500).json({ success: false, message: 'Failed to adjust stock', error: error.message });
  } finally {
    connection.release();
  }
});

// ============================================
// TRANSACTIONS
// ============================================

// Get stock transactions
router.get('/transactions', authenticateToken, requireRole(['stock_manager', 'admin', 'headmaster', 'super_admin', 'accountant', 'patron', 'matron']), async (req, res) => {
  try {
    const { item_id, transaction_type, start_date, end_date, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (item_id) {
      whereClause += ' AND st.item_id = ?';
      params.push(item_id);
    }

    if (transaction_type) {
      whereClause += ' AND st.transaction_type = ?';
      params.push(transaction_type);
    }

    if (start_date) {
      whereClause += ' AND DATE(st.transaction_date) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND DATE(st.transaction_date) <= ?';
      params.push(end_date);
    }

    const [transactions] = await pool.execute(`
      SELECT st.*, si.item_name, si.category, si.item_code,
        CONCAT(u.first_name, ' ', u.last_name) as performed_by_name
      FROM stock_transactions st
      LEFT JOIN stock_items si ON st.item_id = si.id
      LEFT JOIN users u ON st.performed_by = u.id
      ${whereClause}
      ORDER BY st.transaction_date DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    const [[{ total }]] = await pool.execute(`
      SELECT COUNT(*) as total FROM stock_transactions st ${whereClause}
    `, params);

    res.json({
      success: true,
      transactions: transactions || [],
      total: total || 0,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: error.message });
  }
});

// Create stock transaction
router.post('/transactions', authenticateToken, requireRole(['stock_manager', 'admin', 'patron', 'matron']), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { item_id, transaction_type, quantity, unit_price, issued_to, notes, transaction_date } = req.body;
    const userInfo = getUserInfo(req);

    await connection.beginTransaction();

    // Get current item
    const [[item]] = await connection.execute(
      'SELECT * FROM stock_items WHERE id = ?',
      [item_id]
    );

    if (!item) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const previousQuantity = item.quantity;
    let newQuantity;

    if (transaction_type === 'purchase' || transaction_type === 'stock_in' || transaction_type === 'receive') {
      newQuantity = previousQuantity + parseInt(quantity);
    } else if (transaction_type === 'stock_out' || transaction_type === 'issue' || transaction_type === 'distribution') {
      newQuantity = previousQuantity - parseInt(quantity);
      if (newQuantity < 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Insufficient stock quantity' });
      }
    } else {
      newQuantity = previousQuantity;
    }

    const totalAmount = quantity * (unit_price || item.unit_price || 0);

    // Update stock
    await connection.execute(
      'UPDATE stock_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
      [newQuantity, item_id]
    );

    // Record transaction
    const [result] = await connection.execute(`
      INSERT INTO stock_transactions (
        item_id, transaction_type, quantity, previous_quantity, new_quantity,
        unit_price, total_amount, issued_to, notes, performed_by, transaction_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [item_id, transaction_type, quantity, previousQuantity, newQuantity, unit_price || item.unit_price || 0, totalAmount, issued_to || null, notes || '', userInfo.userId, transaction_date || new Date()]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Transaction recorded successfully',
      transaction_id: result.insertId,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create transaction error:', error);
    res.status(500).json({ success: false, message: 'Failed to record transaction', error: error.message });
  } finally {
    connection.release();
  }
});

// ============================================
// SUPPLIERS
// ============================================

// Get suppliers
router.get('/suppliers', authenticateToken, requireRole(['stock_manager', 'admin', 'headmaster', 'super_admin', 'accountant', 'patron', 'matron']), async (req, res) => {
  try {
    const { search, is_active } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (supplier_name LIKE ? OR supplier_code LIKE ? OR contact_person LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (is_active !== undefined) {
      whereClause += ' AND is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    const [suppliers] = await pool.execute(`
      SELECT s.*,
        (SELECT COUNT(*) FROM stock_items WHERE supplier_id = s.id AND (is_active = 1 OR is_active IS NULL)) as item_count,
        (SELECT COALESCE(SUM(quantity * unit_price), 0) FROM stock_items WHERE supplier_id = s.id AND (is_active = 1 OR is_active IS NULL)) as total_value
      FROM stock_suppliers s
      ${whereClause}
      ORDER BY s.supplier_name ASC
    `, params);

    res.json({
      success: true,
      suppliers: suppliers || []
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch suppliers', error: error.message });
  }
});

// Create supplier
router.post('/suppliers', authenticateToken, requireRole(['stock_manager', 'admin', 'patron', 'matron']), async (req, res) => {
  try {
    const { supplier_code, supplier_name, contact_person, email, phone, address, tax_number, payment_terms, notes } = req.body;

    // Check for duplicate code
    const [existing] = await pool.execute(
      'SELECT id FROM stock_suppliers WHERE supplier_code = ?',
      [supplier_code]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Supplier code already exists' });
    }

    const [result] = await pool.execute(`
      INSERT INTO stock_suppliers (
        supplier_code, supplier_name, contact_person, email, phone, 
        address, tax_number, payment_terms, notes, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [supplier_code, supplier_name, contact_person || '', email || '', phone || '', address || '', tax_number || '', payment_terms || '', notes || '']);

    res.json({
      success: true,
      message: 'Supplier created successfully',
      supplier_id: result.insertId
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ success: false, message: 'Failed to create supplier', error: error.message });
  }
});

// Update supplier
router.put('/suppliers/:id', authenticateToken, requireRole(['stock_manager', 'admin', 'patron', 'matron']), async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier_name, contact_person, email, phone, address, tax_number, payment_terms, notes } = req.body;

    await pool.execute(`
      UPDATE stock_suppliers SET
        supplier_name = COALESCE(?, supplier_name),
        contact_person = COALESCE(?, contact_person),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        tax_number = COALESCE(?, tax_number),
        payment_terms = COALESCE(?, payment_terms),
        notes = COALESCE(?, notes)
      WHERE id = ?
    `, [supplier_name, contact_person, email, phone, address, tax_number, payment_terms, notes, id]);

    res.json({ success: true, message: 'Supplier updated successfully' });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ success: false, message: 'Failed to update supplier', error: error.message });
  }
});

// Delete supplier
router.delete('/suppliers/:id', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'UPDATE stock_suppliers SET is_active = 0 WHERE id = ?',
      [id]
    );

    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete supplier', error: error.message });
  }
});

// ============================================
// CATEGORIES
// ============================================

// Get categories
router.get('/categories', authenticateToken, requireRole(['stock_manager', 'admin', 'headmaster', 'super_admin', 'accountant', 'patron', 'matron']), async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT 
        sc.category_name,
        COUNT(si.id) as item_count,
        COALESCE(SUM(si.quantity), 0) as total_quantity,
        COALESCE(SUM(si.quantity * si.unit_price), 0) as total_value
      FROM stock_categories sc
      LEFT JOIN stock_items si ON sc.category_name = si.category AND (si.is_active = 1 OR si.is_active IS NULL)
      WHERE sc.is_active = 1
      GROUP BY sc.id, sc.category_name
      ORDER BY sc.category_name
    `);

    // Also get dynamic categories from items that might not be in stock_categories
    const [dynamicCategories] = await pool.execute(`
      SELECT 
        category as category_name,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        COALESCE(SUM(quantity * unit_price), 0) as total_value
      FROM stock_items 
      WHERE (is_active = 1 OR is_active IS NULL) AND category IS NOT NULL AND category != ''
      GROUP BY category
      HAVING category NOT IN (SELECT category_name FROM stock_categories WHERE is_active = 1)
    `);

    const allCategories = [...categories, ...dynamicCategories];

    res.json({
      success: true,
      categories: allCategories || []
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
  }
});

// Create category
router.post('/categories', authenticateToken, requireRole(['stock_manager', 'admin', 'patron', 'matron']), async (req, res) => {
  try {
    const { category_code, category_name, description, parent_category_id } = req.body;

    const [existing] = await pool.execute(
      'SELECT id FROM stock_categories WHERE category_name = ?',
      [category_name]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const [result] = await pool.execute(`
      INSERT INTO stock_categories (category_code, category_name, description, parent_category_id, is_active)
      VALUES (?, ?, ?, ?, 1)
    `, [category_code || category_name.substring(0, 3).toUpperCase(), category_name, description || '', parent_category_id || null]);

    res.json({
      success: true,
      message: 'Category created successfully',
      category_id: result.insertId
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
});

// ============================================
// LOCATIONS
// ============================================

// Get locations
router.get('/locations', authenticateToken, requireRole(['stock_manager', 'admin', 'headmaster', 'super_admin', 'patron', 'matron']), async (req, res) => {
  try {
    const [locations] = await pool.execute(`
      SELECT 
        location,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        COALESCE(SUM(quantity * unit_price), 0) as total_value
      FROM stock_items 
      WHERE (is_active = 1 OR is_active IS NULL) AND location IS NOT NULL AND location != ''
      GROUP BY location
      ORDER BY location
    `);

    res.json({
      success: true,
      locations: locations || []
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch locations', error: error.message });
  }
});

// Create location
router.post('/locations', authenticateToken, requireRole(['stock_manager', 'admin', 'patron', 'matron']), async (req, res) => {
  try {
    const { location_code, location_name, description } = req.body;

    // Since there's no locations table, we'll just return success
    // Locations are stored in the stock_items.location field
    res.json({
      success: true,
      message: 'Location noted',
      location: location_name
    });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ success: false, message: 'Failed to create location', error: error.message });
  }
});

// ============================================
// ALERTS
// ============================================

// Get alerts
router.get('/alerts', authenticateToken, requireRole(['stock_manager', 'admin', 'headmaster', 'super_admin', 'accountant', 'patron', 'matron']), async (req, res) => {
  try {
    const { is_resolved, alert_type, severity } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    // Get low stock alerts
    const [lowStockAlerts] = await pool.execute(`
      SELECT 
        si.id,
        si.item_name,
        si.item_code,
        si.category,
        si.quantity,
        si.reorder_level,
        si.supplier_id,
        'low_stock' as alert_type,
        CASE 
          WHEN si.quantity = 0 THEN 'critical'
          WHEN si.quantity <= si.reorder_level / 2 THEN 'high'
          ELSE 'medium'
        END as severity,
        CONCAT('Stock level (', si.quantity, ') is below reorder level (', si.reorder_level, ')') as message,
        FALSE as is_resolved
      FROM stock_items si
      WHERE si.quantity <= si.reorder_level AND si.quantity > 0 AND (si.is_active = 1 OR si.is_active IS NULL)
      ORDER BY si.quantity ASC
    `);

    // Get out of stock alerts
    const [outOfStockAlerts] = await pool.execute(`
      SELECT 
        si.id,
        si.item_name,
        si.item_code,
        si.category,
        si.quantity,
        si.reorder_level,
        si.supplier_id,
        'out_of_stock' as alert_type,
        'critical' as severity,
        CONCAT('Item is out of stock') as message,
        FALSE as is_resolved
      FROM stock_items si
      WHERE si.quantity = 0 AND (si.is_active = 1 OR si.is_active IS NULL)
      ORDER BY si.item_name ASC
    `);

    // Get expiring soon alerts (if expiry_date column exists)
    try {
      const [expiringAlerts] = await pool.execute(`
        SELECT 
          si.id,
          si.item_name,
          si.item_code,
          si.category,
          si.quantity,
          si.expiry_date,
          'expiring' as alert_type,
          'high' as severity,
          CONCAT('Item expires on ', si.expiry_date) as message,
          FALSE as is_resolved
        FROM stock_items si
        WHERE si.expiry_date IS NOT NULL 
          AND si.expiry_date <= DATE_ADD(NOW(), INTERVAL 30 DAY)
          AND si.expiry_date >= NOW()
          AND (si.is_active = 1 OR si.is_active IS NULL)
        ORDER BY si.expiry_date ASC
        LIMIT 10
      `);

      res.json({
        success: true,
        alerts: [...lowStockAlerts, ...outOfStockAlerts, ...expiringAlerts] || []
      });
    } catch (expiryError) {
      // Expiry date column might not exist
      res.json({
        success: true,
        alerts: [...lowStockAlerts, ...outOfStockAlerts] || []
      });
    }
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch alerts', error: error.message });
  }
});

// Resolve alert
router.put('/alerts/:id/resolve', authenticateToken, requireRole(['stock_manager', 'admin', 'patron', 'matron']), async (req, res) => {
  try {
    const { id } = req.params;
    // Alerts are derived from stock levels, so there's nothing to resolve in the database
    // This endpoint exists for API compatibility
    res.json({ success: true, message: 'Alert resolved' });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ success: false, message: 'Failed to resolve alert', error: error.message });
  }
});

// ============================================
// PURCHASE ORDERS
// ============================================

// Get purchase orders
router.get('/purchase-orders', authenticateToken, requireRole(['stock_manager', 'admin', 'headmaster', 'super_admin', 'accountant', 'patron', 'matron']), async (req, res) => {
  try {
    const { status, supplier_id } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND po.status = ?';
      params.push(status);
    }

    if (supplier_id) {
      whereClause += ' AND po.supplier_id = ?';
      params.push(supplier_id);
    }

    const [orders] = await pool.execute(`
      SELECT po.*, ss.supplier_name,
        (SELECT COUNT(*) FROM stock_order_items WHERE order_id = po.id) as item_count,
        (SELECT SUM(quantity * unit_price) FROM stock_order_items WHERE order_id = po.id) as total_value
      FROM stock_orders po
      LEFT JOIN stock_suppliers ss ON po.supplier_id = ss.id
      ${whereClause}
      ORDER BY po.created_at DESC
    `, params);

    res.json({
      success: true,
      orders: orders || []
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
});

// Create purchase order
router.post('/purchase-orders', authenticateToken, requireRole(['stock_manager', 'admin', 'patron', 'matron']), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { supplier_id, expected_delivery_date, items, notes } = req.body;
    const userInfo = getUserInfo(req);

    await connection.beginTransaction();

    // Generate order number
    const orderNumber = `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    // Create order
    const [orderResult] = await connection.execute(`
      INSERT INTO stock_orders (
        order_number, supplier_id, status, expected_delivery, notes, total_amount, created_by, created_at
      ) VALUES (?, ?, 'pending', ?, ?, ?, ?, NOW())
    `, [orderNumber, supplier_id, expected_delivery_date || null, notes || '', totalAmount, userInfo.userId]);

    // Add order items
    for (const item of items) {
      await connection.execute(`
        INSERT INTO stock_order_items (order_id, item_id, quantity, unit_price, total)
        VALUES (?, ?, ?, ?, ?)
      `, [orderResult.insertId, item.item_id, item.quantity, item.unit_price, item.quantity * item.unit_price]);
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Purchase order created successfully',
      order_id: orderResult.insertId,
      order_number: orderNumber
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  } finally {
    connection.release();
  }
});

// Update purchase order status
router.put('/purchase-orders/:id/status', authenticateToken, requireRole(['stock_manager', 'admin', 'patron', 'matron']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'ordered', 'received', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await pool.execute(
      'UPDATE stock_orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
  }
});

// ============================================
// STOCK TAKES
// ============================================

// Get stock takes
router.get('/stock-takes', authenticateToken, requireRole(['stock_manager', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const { status } = req.query;

    // Stock takes table might not exist, so we'll return empty array for now
    // This can be extended when stock_takes table is created
    res.json({
      success: true,
      stock_takes: []
    });
  } catch (error) {
    console.error('Get stock takes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock takes', error: error.message });
  }
});

// Create stock take
router.post('/stock-takes', authenticateToken, requireRole(['stock_manager', 'admin', 'patron', 'matron']), async (req, res) => {
  try {
    const { location_id, notes } = req.body;
    
    // Stock takes functionality can be implemented when stock_takes table is created
    res.json({
      success: true,
      message: 'Stock take initiated',
      stock_take_id: null
    });
  } catch (error) {
    console.error('Create stock take error:', error);
    res.status(500).json({ success: false, message: 'Failed to create stock take', error: error.message });
  }
});

// Complete stock take
router.put('/stock-takes/:id/complete', authenticateToken, requireRole(['stock_manager', 'admin', 'patron', 'matron']), async (req, res) => {
  try {
    const { id } = req.params;

    res.json({ success: true, message: 'Stock take completed' });
  } catch (error) {
    console.error('Complete stock take error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete stock take', error: error.message });
  }
});

// ============================================
// ANALYTICS
// ============================================

// Get stock analytics
router.get('/analytics', authenticateToken, requireRole(['stock_manager', 'admin', 'headmaster', 'super_admin', 'accountant', 'patron', 'matron']), async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateCondition;
    switch (period) {
      case 'week':
        dateCondition = 'AND transaction_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
        break;
      case 'year':
        dateCondition = 'AND transaction_date >= DATE_SUB(NOW(), INTERVAL 365 DAY)';
        break;
      case 'month':
      default:
        dateCondition = 'AND transaction_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }

    // Get transaction trends
    const [transactionTrends] = await pool.execute(`
      SELECT 
        DATE(transaction_date) as date,
        SUM(CASE WHEN transaction_type IN ('receive', 'purchase', 'stock_in') THEN quantity ELSE 0 END) as stock_in,
        SUM(CASE WHEN transaction_type IN ('issue', 'stock_out', 'distribution') THEN quantity ELSE 0 END) as stock_out
      FROM stock_transactions
      WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(transaction_date)
      ORDER BY date
    `);

    // Get category distribution
    const [categoryDistribution] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as item_count,
        COALESCE(SUM(quantity * unit_price), 0) as value
      FROM stock_items
      WHERE (is_active = 1 OR is_active IS NULL)
      GROUP BY category
      ORDER BY value DESC
    `);

    // Get top moving items
    const [topMovingItems] = await pool.execute(`
      SELECT 
        si.id,
        si.item_name,
        si.category,
        SUM(st.quantity) as total_movement
      FROM stock_transactions st
      JOIN stock_items si ON st.item_id = si.id
      WHERE st.transaction_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY si.id, si.item_name, si.category
      ORDER BY total_movement DESC
      LIMIT 10
    `);

    // Get stock value over time (simple current valuation)
    const [[stockValuation]] = await pool.execute(`
      SELECT 
        COALESCE(SUM(quantity * unit_price), 0) as total_value,
        COUNT(*) as total_items,
        SUM(quantity) as total_quantity
      FROM stock_items
      WHERE (is_active = 1 OR is_active IS NULL)
    `);

    res.json({
      success: true,
      analytics: {
        transaction_trends: transactionTrends || [],
        category_distribution: categoryDistribution || [],
        top_moving_items: topMovingItems || [],
        stock_valuation: stockValuation || { total_value: 0, total_items: 0, total_quantity: 0 }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
});

// ============================================
// REPORTS
// ============================================

// Generate stock report
router.post('/reports/:type', authenticateToken, requireRole(['stock_manager', 'admin', 'headmaster', 'super_admin', 'accountant', 'patron', 'matron']), async (req, res) => {
  try {
    const { type } = req.params;
    const { start_date, end_date, category } = req.body;

    let reportData = {};

    switch (type) {
      case 'stock-valuation':
        const [[valuation]] = await pool.execute(`
          SELECT 
            COALESCE(SUM(quantity * unit_price), 0) as total_value,
            COUNT(*) as total_items,
            SUM(quantity) as total_quantity,
            AVG(unit_price) as avg_price
          FROM stock_items
          WHERE (is_active = 1 OR is_active IS NULL) ${category ? 'AND category = ?' : ''}
        `, category ? [category] : []);
        reportData = { valuation };
        break;

      case 'movement':
        const [movements] = await pool.execute(`
          SELECT 
            st.*,
            si.item_name,
            si.category,
            CONCAT(u.first_name, ' ', u.last_name) as performed_by_name
          FROM stock_transactions st
          JOIN stock_items si ON st.item_id = si.id
          LEFT JOIN users u ON st.performed_by = u.id
          WHERE st.transaction_date BETWEEN ? AND ?
          ORDER BY st.transaction_date DESC
        `, [start_date || '2020-01-01', end_date || new Date().toISOString().split('T')[0]]);
        reportData = { movements };
        break;

      case 'low-stock':
        const [lowStock] = await pool.execute(`
          SELECT 
            si.*,
            (si.reorder_level - si.quantity) as shortage
          FROM stock_items si
          WHERE si.quantity <= si.reorder_level AND si.quantity > 0 AND (si.is_active = 1 OR si.is_active IS NULL)
          ORDER BY shortage DESC
        `);
        reportData = { low_stock: lowStock };
        break;

      default:
        reportData = { message: 'Report type not supported' };
    }

    res.json({
      success: true,
      report: reportData
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
  }
});

// Export stock data
router.get('/export', authenticateToken, requireRole(['stock_manager', 'admin', 'headmaster', 'super_admin', 'accountant']), async (req, res) => {
  try {
    const { format = 'excel' } = req.query;

    // Get all stock items
    const [items] = await pool.execute(`
      SELECT 
        si.*,
        CASE 
          WHEN si.quantity = 0 THEN 'Out of Stock'
          WHEN si.quantity <= si.reorder_level THEN 'Low Stock'
          ELSE 'In Stock'
        END as status,
        ss.supplier_name
      FROM stock_items si
      LEFT JOIN stock_suppliers ss ON si.supplier_id = ss.id
      WHERE si.is_active = 1 OR si.is_active IS NULL
      ORDER BY si.category, si.item_name
    `);

    // For now, return JSON. Excel/PDF export would require additional libraries
    res.json({
      success: true,
      data: items,
      format: format,
      message: `Export in ${format} format ready`
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, message: 'Failed to export data', error: error.message });
  }
});

// ============================================
// SEARCH
// ============================================

// Search stock items
router.get('/search', authenticateToken, requireRole(['stock_manager', 'admin', 'headmaster', 'super_admin', 'accountant', 'patron', 'matron', 'teacher', 'staff']), async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
    }

    const searchTerm = `%${q}%`;

    const [results] = await pool.execute(`
      SELECT 
        si.*,
        CASE 
          WHEN si.quantity = 0 THEN 'out_of_stock'
          WHEN si.quantity <= si.reorder_level THEN 'low_stock'
          ELSE 'in_stock'
        END as status_label,
        ss.supplier_name
      FROM stock_items si
      LEFT JOIN stock_suppliers ss ON si.supplier_id = ss.id
      WHERE (si.is_active = 1 OR si.is_active IS NULL)
        AND (si.item_name LIKE ? OR si.item_code LIKE ? OR si.category LIKE ? OR si.description LIKE ?)
      ORDER BY 
        CASE 
          WHEN si.item_name LIKE ? THEN 1
          WHEN si.item_code LIKE ? THEN 2
          ELSE 3
        END,
        si.item_name
      LIMIT 20
    `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]);

    res.json({
      success: true,
      results: results || [],
      count: results?.length || 0
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Failed to search', error: error.message });
  }
});

module.exports = router;
