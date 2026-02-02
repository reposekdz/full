const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * ====================================
 * ULTRA-ADVANCED STOCK MANAGEMENT
 * ====================================
 * Powerful inventory management features
 * - Real-time stock tracking
 * - Analytics and visualizations
 * - Auto-alerts for low stock
 * - Supplier management
 * - Transaction history
 * - Stock valuation
 * - Reports generation
 */

// =====================================
// STOCK DASHBOARD
// =====================================

router.get('/dashboard', authenticateToken, requireRole(['stock_manager', 'accountant', 'admin', 'owner']), async (req, res) => {
  try {
    const [stockSummary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_items,
        COUNT(CASE WHEN quantity = 0 THEN 1 END) as out_of_stock,
        COUNT(CASE WHEN quantity > 0 AND quantity <= reorder_level THEN 1 END) as low_stock,
        COUNT(CASE WHEN quantity > reorder_level THEN 1 END) as in_stock,
        SUM(quantity * unit_price) as total_value,
        SUM(quantity) as total_quantity
      FROM stock_items
      WHERE is_active = 1
    `);
    
    const [recentTransactions] = await pool.execute(`
      SELECT 
        st.*,
        si.item_name,
        si.item_code,
        u1.first_name as issued_to_first_name,
        u1.last_name as issued_to_last_name,
        u2.first_name as issued_by_first_name,
        u2.last_name as issued_by_last_name
      FROM stock_transactions st
      JOIN stock_items si ON st.item_id = si.id
      LEFT JOIN users u1 ON st.issued_to = u1.id
      LEFT JOIN users u2 ON st.issued_by = u2.id
      ORDER BY st.transaction_date DESC, st.created_at DESC
      LIMIT 20
    `);
    
    const [categoryBreakdown] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        SUM(quantity * unit_price) as total_value,
        AVG(quantity) as avg_quantity
      FROM stock_items
      WHERE is_active = 1
      GROUP BY category
      ORDER BY total_value DESC
    `);
    
    const [lowStockItems] = await pool.execute(`
      SELECT *
      FROM stock_items
      WHERE quantity > 0 AND quantity <= reorder_level AND is_active = 1
      ORDER BY (reorder_level - quantity) DESC
      LIMIT 20
    `);
    
    const [outOfStockItems] = await pool.execute(`
      SELECT *
      FROM stock_items
      WHERE quantity = 0 AND is_active = 1
      ORDER BY updated_at DESC
      LIMIT 20
    `);
    
    const [monthlyConsumption] = await pool.execute(`
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        transaction_type,
        SUM(quantity) as total_quantity,
        COUNT(*) as transaction_count
      FROM stock_transactions
      WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m'), transaction_type
      ORDER BY month
    `);
    
    const [supplierStats] = await pool.execute(`
      SELECT 
        supplier,
        COUNT(*) as item_count,
        SUM(quantity * unit_price) as total_value
      FROM stock_items
      WHERE supplier IS NOT NULL AND supplier != '' AND is_active = 1
      GROUP BY supplier
      ORDER BY total_value DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      dashboard: {
        summary: stockSummary[0],
        recent_transactions: recentTransactions,
        category_breakdown: categoryBreakdown,
        low_stock_items: lowStockItems,
        out_of_stock_items: outOfStockItems,
        monthly_consumption: monthlyConsumption,
        supplier_stats: supplierStats
      }
    });
  } catch (error) {
    console.error('Stock dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// STOCK ITEMS MANAGEMENT
// =====================================

// Get all stock items with advanced filtering
router.get('/items', authenticateToken, requireRole(['stock_manager', 'accountant', 'admin', 'owner']), async (req, res) => {
  try {
    const {
      category,
      status,
      search,
      supplier,
      min_quantity,
      max_quantity,
      sort_by,
      order,
      page,
      limit
    } = req.query;
    
    const currentPage = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 50;
    const offset = (currentPage - 1) * pageLimit;
    
    let query = `SELECT * FROM stock_items WHERE is_active = 1`;
    const params = [];
    
    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }
    
    if (status) {
      if (status === 'out_of_stock') {
        query += ` AND quantity = 0`;
      } else if (status === 'low_stock') {
        query += ` AND quantity > 0 AND quantity <= reorder_level`;
      } else if (status === 'in_stock') {
        query += ` AND quantity > reorder_level`;
      }
    }
    
    if (search) {
      query += ` AND (item_name LIKE ? OR item_code LIKE ? OR description LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (supplier) {
      query += ` AND supplier LIKE ?`;
      params.push(`%${supplier}%`);
    }
    
    if (min_quantity) {
      query += ` AND quantity >= ?`;
      params.push(parseInt(min_quantity));
    }
    
    if (max_quantity) {
      query += ` AND quantity <= ?`;
      params.push(parseInt(max_quantity));
    }
    
    const sortBy = sort_by || 'item_name';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(pageLimit, offset);
    
    const [items] = await pool.execute(query, params);
    
    for (const item of items) {
      item.total_value = (item.quantity || 0) * (item.unit_price || 0);
      
      if (item.quantity === 0) {
        item.stock_status = 'out_of_stock';
      } else if (item.quantity <= item.reorder_level) {
        item.stock_status = 'low_stock';
      } else {
        item.stock_status = 'in_stock';
      }
    }
    
    const countQuery = query.split('ORDER BY')[0].replace('SELECT *', 'SELECT COUNT(*) as total');
    const [[{ total }]] = await pool.execute(countQuery, params.slice(0, -2));
    
    res.json({
      success: true,
      items: items,
      pagination: {
        current_page: currentPage,
        page_limit: pageLimit,
        total_items: total,
        total_pages: Math.ceil(total / pageLimit)
      }
    });
  } catch (error) {
    console.error('Get stock items error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add new stock item
router.post('/items', authenticateToken, requireRole(['stock_manager', 'admin']), async (req, res) => {
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
    
    if (!item_name || !item_code) {
      return res.status(400).json({ success: false, message: 'Item name and code are required' });
    }
    
    const [existing] = await pool.execute(
      'SELECT id FROM stock_items WHERE item_code = ?',
      [item_code]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Item code already exists' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO stock_items (
        item_name, item_code, category, description, quantity, unit,
        unit_price, reorder_level, location, supplier, supplier_contact,
        notes, created_by, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
      [
        item_name, item_code, category, description, quantity || 0, unit,
        unit_price || 0, reorder_level || 10, location, supplier,
        supplier_contact, notes, req.user.id
      ]
    );
    
    if (quantity > 0) {
      await pool.execute(
        `INSERT INTO stock_transactions (
          item_id, transaction_type, quantity, unit_price, total_cost,
          transaction_date, notes, issued_by, created_at
        ) VALUES (?, 'purchase', ?, ?, ?, NOW(), 'Initial stock', ?, NOW())`,
        [result.insertId, quantity, unit_price, (quantity * unit_price), req.user.id]
      );
    }
    
    res.json({
      success: true,
      message: 'Stock item added successfully',
      item_id: result.insertId
    });
  } catch (error) {
    console.error('Add stock item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update stock item
router.put('/items/:id', authenticateToken, requireRole(['stock_manager', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const allowedFields = [
      'item_name', 'category', 'description', 'unit', 'unit_price',
      'reorder_level', 'location', 'supplier', 'supplier_contact', 'notes'
    ];
    
    const updateFields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }
    
    updateFields.push('updated_at = NOW()');
    values.push(id);
    
    await pool.execute(
      `UPDATE stock_items SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({
      success: true,
      message: 'Stock item updated successfully'
    });
  } catch (error) {
    console.error('Update stock item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete/deactivate stock item
router.delete('/items/:id', authenticateToken, requireRole(['stock_manager', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;
    
    if (permanent === 'true') {
      await pool.execute('DELETE FROM stock_items WHERE id = ?', [id]);
      res.json({ success: true, message: 'Stock item deleted permanently' });
    } else {
      await pool.execute('UPDATE stock_items SET is_active = 0 WHERE id = ?', [id]);
      res.json({ success: true, message: 'Stock item deactivated' });
    }
  } catch (error) {
    console.error('Delete stock item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// STOCK TRANSACTIONS
// =====================================

// Record stock transaction
router.post('/transactions', authenticateToken, requireRole(['stock_manager', 'admin']), async (req, res) => {
  try {
    const {
      item_id,
      transaction_type,
      quantity,
      unit_price,
      issued_to,
      notes,
      transaction_date
    } = req.body;
    
    if (!item_id || !transaction_type || !quantity) {
      return res.status(400).json({ success: false, message: 'Item ID, transaction type, and quantity are required' });
    }
    
    const [item] = await pool.execute('SELECT * FROM stock_items WHERE id = ?', [item_id]);
    
    if (item.length === 0) {
      return res.status(404).json({ success: false, message: 'Stock item not found' });
    }
    
    let newQuantity = item[0].quantity;
    const price = unit_price || item[0].unit_price;
    const totalCost = quantity * price;
    
    if (transaction_type === 'purchase' || transaction_type === 'return') {
      newQuantity += parseInt(quantity);
    } else if (transaction_type === 'issue' || transaction_type === 'damaged' || transaction_type === 'lost') {
      newQuantity -= parseInt(quantity);
      if (newQuantity < 0) {
        return res.status(400).json({ success: false, message: 'Insufficient stock quantity' });
      }
    }
    
    const [result] = await pool.execute(
      `INSERT INTO stock_transactions (
        item_id, transaction_type, quantity, unit_price, total_cost,
        transaction_date, notes, issued_to, issued_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        item_id, transaction_type, quantity, price, totalCost,
        transaction_date || new Date().toISOString().split('T')[0],
        notes, issued_to, req.user.id
      ]
    );
    
    await pool.execute(
      'UPDATE stock_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
      [newQuantity, item_id]
    );
    
    if (transaction_type === 'purchase') {
      await pool.execute(
        `INSERT INTO transactions (
          type, category, amount, description, transaction_date, 
          reference_id, reference_type, created_by, status
        ) VALUES ('expense', 'Stock Purchase', ?, ?, ?, ?, 'stock_purchase', ?, 'completed')`,
        [
          totalCost,
          `Stock purchase: ${item[0].item_name} (${quantity} ${item[0].unit})`,
          transaction_date || new Date().toISOString().split('T')[0],
          result.insertId,
          req.user.id
        ]
      );
    }
    
    res.json({
      success: true,
      message: 'Stock transaction recorded successfully',
      transaction_id: result.insertId,
      new_quantity: newQuantity
    });
  } catch (error) {
    console.error('Record stock transaction error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get stock transactions
router.get('/transactions', authenticateToken, requireRole(['stock_manager', 'accountant', 'admin', 'owner']), async (req, res) => {
  try {
    const { item_id, transaction_type, start_date, end_date, page, limit } = req.query;
    
    const currentPage = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 50;
    const offset = (currentPage - 1) * pageLimit;
    
    let query = `
      SELECT 
        st.*,
        si.item_name,
        si.item_code,
        si.category,
        u1.first_name as issued_to_first_name,
        u1.last_name as issued_to_last_name,
        u2.first_name as issued_by_first_name,
        u2.last_name as issued_by_last_name
      FROM stock_transactions st
      JOIN stock_items si ON st.item_id = si.id
      LEFT JOIN users u1 ON st.issued_to = u1.id
      LEFT JOIN users u2 ON st.issued_by = u2.id
      WHERE 1=1
    `;
    const params = [];
    
    if (item_id) {
      query += ` AND st.item_id = ?`;
      params.push(item_id);
    }
    
    if (transaction_type) {
      query += ` AND st.transaction_type = ?`;
      params.push(transaction_type);
    }
    
    if (start_date) {
      query += ` AND st.transaction_date >= ?`;
      params.push(start_date);
    }
    
    if (end_date) {
      query += ` AND st.transaction_date <= ?`;
      params.push(end_date);
    }
    
    query += ` ORDER BY st.transaction_date DESC, st.created_at DESC LIMIT ? OFFSET ?`;
    params.push(pageLimit, offset);
    
    const [transactions] = await pool.execute(query, params);
    
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM').split('ORDER BY')[0];
    const [[{ total }]] = await pool.execute(countQuery, params.slice(0, -2));
    
    res.json({
      success: true,
      transactions: transactions,
      pagination: {
        current_page: currentPage,
        page_limit: pageLimit,
        total_transactions: total,
        total_pages: Math.ceil(total / pageLimit)
      }
    });
  } catch (error) {
    console.error('Get stock transactions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// ANALYTICS
// =====================================

// Get stock analytics
router.get('/analytics', authenticateToken, requireRole(['stock_manager', 'accountant', 'admin', 'owner']), async (req, res) => {
  try {
    const { period } = req.query;
    
    let startDate;
    if (period === 'week') {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else if (period === 'month') {
      startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    } else if (period === 'year') {
      startDate = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    } else {
      startDate = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    }
    
    const endDate = new Date().toISOString().split('T')[0];
    
    const [consumptionByCategory] = await pool.execute(`
      SELECT 
        si.category,
        SUM(CASE WHEN st.transaction_type IN ('issue', 'damaged', 'lost') THEN st.quantity ELSE 0 END) as consumed_quantity,
        SUM(CASE WHEN st.transaction_type IN ('issue', 'damaged', 'lost') THEN st.total_cost ELSE 0 END) as consumed_value,
        COUNT(DISTINCT st.item_id) as items_consumed
      FROM stock_transactions st
      JOIN stock_items si ON st.item_id = si.id
      WHERE st.transaction_date BETWEEN ? AND ?
      GROUP BY si.category
      ORDER BY consumed_value DESC
    `, [startDate, endDate]);
    
    const [purchaseTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        SUM(quantity) as total_quantity,
        SUM(total_cost) as total_cost,
        COUNT(*) as purchase_count
      FROM stock_transactions
      WHERE transaction_type = 'purchase' AND transaction_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
      ORDER BY month
    `);
    
    const [topConsumedItems] = await pool.execute(`
      SELECT 
        si.item_name,
        si.item_code,
        si.category,
        SUM(st.quantity) as total_consumed,
        SUM(st.total_cost) as total_cost_consumed
      FROM stock_transactions st
      JOIN stock_items si ON st.item_id = si.id
      WHERE st.transaction_type IN ('issue', 'damaged', 'lost')
      AND st.transaction_date BETWEEN ? AND ?
      GROUP BY si.id, si.item_name, si.item_code, si.category
      ORDER BY total_consumed DESC
      LIMIT 20
    `, [startDate, endDate]);
    
    const [stockTurnover] = await pool.execute(`
      SELECT 
        si.item_name,
        si.item_code,
        si.quantity as current_stock,
        si.reorder_level,
        COALESCE(SUM(CASE WHEN st.transaction_type IN ('issue', 'damaged', 'lost') THEN st.quantity ELSE 0 END), 0) as consumed,
        COALESCE(SUM(CASE WHEN st.transaction_type = 'purchase' THEN st.quantity ELSE 0 END), 0) as purchased,
        CASE 
          WHEN AVG(si.quantity) > 0 THEN COALESCE(SUM(CASE WHEN st.transaction_type IN ('issue', 'damaged', 'lost') THEN st.quantity ELSE 0 END), 0) / AVG(si.quantity)
          ELSE 0
        END as turnover_rate
      FROM stock_items si
      LEFT JOIN stock_transactions st ON si.id = st.item_id AND st.transaction_date BETWEEN ? AND ?
      WHERE si.is_active = 1
      GROUP BY si.id, si.item_name, si.item_code, si.quantity, si.reorder_level
      ORDER BY turnover_rate DESC
      LIMIT 20
    `, [startDate, endDate]);
    
    res.json({
      success: true,
      analytics: {
        period: { start_date: startDate, end_date: endDate },
        consumption_by_category: consumptionByCategory,
        purchase_trends: purchaseTrends,
        top_consumed_items: topConsumedItems,
        stock_turnover: stockTurnover
      }
    });
  } catch (error) {
    console.error('Get stock analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get stock valuation
router.get('/valuation', authenticateToken, requireRole(['stock_manager', 'accountant', 'admin', 'owner']), async (req, res) => {
  try {
    const [valuation] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        SUM(quantity * unit_price) as total_value,
        AVG(unit_price) as avg_unit_price
      FROM stock_items
      WHERE is_active = 1
      GROUP BY category
      ORDER BY total_value DESC
    `);
    
    const [overallValue] = await pool.execute(`
      SELECT 
        SUM(quantity * unit_price) as total_stock_value,
        COUNT(*) as total_items,
        SUM(quantity) as total_quantity
      FROM stock_items
      WHERE is_active = 1
    `);
    
    res.json({
      success: true,
      valuation: {
        overall: overallValue[0],
        by_category: valuation
      }
    });
  } catch (error) {
    console.error('Get stock valuation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// REPORTS
// =====================================

// Generate stock report
router.post('/reports/generate', authenticateToken, requireRole(['stock_manager', 'accountant', 'admin']), async (req, res) => {
  try {
    const { report_type, start_date, end_date, category } = req.body;
    
    const startDate = start_date || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const endDate = end_date || new Date().toISOString().split('T')[0];
    
    let query = `SELECT * FROM stock_items WHERE is_active = 1`;
    const params = [];
    
    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }
    
    const [items] = await pool.execute(query, params);
    
    const [transactions] = await pool.execute(
      `SELECT st.*, si.item_name, si.category 
       FROM stock_transactions st
       JOIN stock_items si ON st.item_id = si.id
       WHERE st.transaction_date BETWEEN ? AND ?
       ORDER BY st.transaction_date`,
      [startDate, endDate]
    );
    
    const report = {
      report_type: report_type || 'comprehensive',
      period: { start_date: startDate, end_date: endDate },
      summary: {
        total_items: items.length,
        total_stock_value: items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
        total_transactions: transactions.length,
        total_purchased: transactions.filter(t => t.transaction_type === 'purchase').reduce((sum, t) => sum + t.quantity, 0),
        total_issued: transactions.filter(t => t.transaction_type === 'issue').reduce((sum, t) => sum + t.quantity, 0)
      },
      items: items,
      transactions: transactions
    };
    
    const [result] = await pool.execute(
      `INSERT INTO stock_reports (
        report_type, start_date, end_date, category, report_data, generated_by, generated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [report_type || 'comprehensive', startDate, endDate, category || null, JSON.stringify(report), req.user.id]
    );
    
    res.json({
      success: true,
      message: 'Stock report generated successfully',
      report_id: result.insertId,
      report: report
    });
  } catch (error) {
    console.error('Generate stock report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
