const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * ULTRA-COMPREHENSIVE STOCK MANAGER PORTAL
 * Inventory tracking, predictive analytics, automated reordering
 * Supplier management, consumption tracking, cost optimization
 */

// ============================================
// STOCK MANAGER DASHBOARD
// ============================================
router.get('/dashboard', authenticateToken, requireRole(['stock_manager', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [inventorySummary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity * unit_price) as total_value,
        COUNT(CASE WHEN quantity <= reorder_level THEN 1 END) as low_stock_items,
        COUNT(CASE WHEN quantity = 0 THEN 1 END) as out_of_stock_items
      FROM stock_items
    `);
    
    const [categoryBreakdown] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        SUM(quantity * unit_price) as category_value
      FROM stock_items
      GROUP BY category
      ORDER BY category_value DESC
    `);
    
    const [recentTransactions] = await pool.execute(`
      SELECT st.*, si.item_name, si.category
      FROM stock_transactions st
      JOIN stock_items si ON st.item_id = si.id
      ORDER BY st.transaction_date DESC
      LIMIT 10
    `);
    
    const [lowStockAlerts] = await pool.execute(`
      SELECT * FROM stock_items 
      WHERE quantity <= reorder_level AND quantity > 0
      ORDER BY (quantity / reorder_level) ASC
      LIMIT 20
    `);
    
    const [outOfStock] = await pool.execute(`
      SELECT * FROM stock_items 
      WHERE quantity = 0
      ORDER BY last_updated DESC
    `);
    
    const [thisMonthConsumption] = await pool.execute(`
      SELECT 
        COUNT(*) as transaction_count,
        SUM(CASE WHEN transaction_type = 'issue' THEN quantity ELSE 0 END) as issued,
        SUM(CASE WHEN transaction_type = 'receive' THEN quantity ELSE 0 END) as received
      FROM stock_transactions
      WHERE MONTH(transaction_date) = MONTH(CURDATE()) 
        AND YEAR(transaction_date) = YEAR(CURDATE())
    `);
    
    res.json({
      success: true,
      dashboard: {
        summary: inventorySummary[0],
        category_breakdown: categoryBreakdown,
        recent_transactions: recentTransactions,
        low_stock_alerts: lowStockAlerts,
        out_of_stock: outOfStock,
        this_month: thisMonthConsumption[0]
      }
    });
  } catch (error) {
    console.error('Stock Manager Dashboard Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// INVENTORY MANAGEMENT
// ============================================
router.get('/inventory', authenticateToken, requireRole(['stock_manager', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { category, status, search } = req.query;
    
    let query = 'SELECT * FROM stock_items WHERE 1=1';
    const params = [];
    
    if (category) { query += ' AND category = ?'; params.push(category); }
    if (status === 'low') { query += ' AND quantity <= reorder_level'; }
    if (status === 'out') { query += ' AND quantity = 0'; }
    if (search) {
      query += ' AND (item_name LIKE ? OR item_code LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY category, item_name';
    
    const [items] = await pool.execute(query, params);
    
    res.json({ success: true, inventory: items, total: items.length });
  } catch (error) {
    console.error('Inventory Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/inventory/add-item', authenticateToken, requireRole(['stock_manager', 'patron', 'matron']), async (req, res) => {
  try {
    const { item_code, item_name, description, category, unit, unit_price, quantity, reorder_level, supplier_id, location } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO stock_items 
      (item_code, item_name, description, category, unit, unit_price, quantity, reorder_level, supplier_id, location, created_by, created_by_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [item_code, item_name, description, category, unit, unit_price, quantity, reorder_level, supplier_id, location, req.user.userId, req.user.name]);
    
    await pool.execute(`
      INSERT INTO stock_transactions 
      (item_id, transaction_type, quantity, previous_quantity, new_quantity, notes, performed_by, performed_by_name)
      VALUES (?, 'receive', ?, 0, ?, 'Initial stock entry', ?, ?)
    `, [result.insertId, quantity, quantity, req.user.userId, req.user.name]);
    
    res.json({ success: true, message: 'Item added successfully', item_id: result.insertId });
  } catch (error) {
    console.error('Add Item Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/inventory/:itemId', authenticateToken, requireRole(['stock_manager', 'patron', 'matron']), async (req, res) => {
  try {
    const { item_name, description, category, unit, unit_price, reorder_level, supplier_id, location } = req.body;
    
    await pool.execute(`
      UPDATE stock_items 
      SET item_name = ?, description = ?, category = ?, unit = ?, unit_price = ?, reorder_level = ?, supplier_id = ?, location = ?, last_updated = NOW()
      WHERE id = ?
    `, [item_name, description, category, unit, unit_price, reorder_level, supplier_id, location, req.params.itemId]);
    
    res.json({ success: true, message: 'Item updated successfully' });
  } catch (error) {
    console.error('Update Item Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STOCK TRANSACTIONS
// ============================================
router.post('/transactions/receive', authenticateToken, requireRole(['stock_manager', 'patron', 'matron']), async (req, res) => {
  try {
    const { item_id, quantity, supplier_id, invoice_number, unit_cost, notes } = req.body;
    
    const [item] = await pool.execute('SELECT * FROM stock_items WHERE id = ?', [item_id]);
    if (!item[0]) return res.status(404).json({ success: false, message: 'Item not found' });
    
    const newQuantity = parseFloat(item[0].quantity) + parseFloat(quantity);
    
    await pool.execute(`
      UPDATE stock_items 
      SET quantity = ?, last_updated = NOW()
      WHERE id = ?
    `, [newQuantity, item_id]);
    
    const [result] = await pool.execute(`
      INSERT INTO stock_transactions 
      (item_id, transaction_type, quantity, previous_quantity, new_quantity, supplier_id, invoice_number, unit_cost, notes, performed_by, performed_by_name)
      VALUES (?, 'receive', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [item_id, quantity, item[0].quantity, newQuantity, supplier_id, invoice_number, unit_cost, notes, req.user.userId, req.user.name]);
    
    res.json({ success: true, message: 'Stock received successfully', new_quantity: newQuantity, transaction_id: result.insertId });
  } catch (error) {
    console.error('Receive Stock Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/transactions/issue', authenticateToken, requireRole(['stock_manager', 'patron', 'matron']), async (req, res) => {
  try {
    const { item_id, quantity, issued_to, issued_to_role, department, purpose, notes } = req.body;
    
    const [item] = await pool.execute('SELECT * FROM stock_items WHERE id = ?', [item_id]);
    if (!item[0]) return res.status(404).json({ success: false, message: 'Item not found' });
    
    if (parseFloat(item[0].quantity) < parseFloat(quantity)) {
      return res.status(400).json({ success: false, message: 'Insufficient stock quantity' });
    }
    
    const newQuantity = parseFloat(item[0].quantity) - parseFloat(quantity);
    
    await pool.execute(`
      UPDATE stock_items 
      SET quantity = ?, last_updated = NOW()
      WHERE id = ?
    `, [newQuantity, item_id]);
    
    const [result] = await pool.execute(`
      INSERT INTO stock_transactions 
      (item_id, transaction_type, quantity, previous_quantity, new_quantity, issued_to, issued_to_role, department, purpose, notes, performed_by, performed_by_name)
      VALUES (?, 'issue', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [item_id, quantity, item[0].quantity, newQuantity, issued_to, issued_to_role, department, purpose, notes, req.user.userId, req.user.name]);
    
    res.json({ success: true, message: 'Stock issued successfully', new_quantity: newQuantity, transaction_id: result.insertId });
  } catch (error) {
    console.error('Issue Stock Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/transactions/history', authenticateToken, requireRole(['stock_manager', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { item_id, transaction_type, start_date, end_date } = req.query;
    
    let query = `
      SELECT st.*, si.item_name, si.category, si.unit
      FROM stock_transactions st
      JOIN stock_items si ON st.item_id = si.id
      WHERE 1=1
    `;
    const params = [];
    
    if (item_id) { query += ' AND st.item_id = ?'; params.push(item_id); }
    if (transaction_type) { query += ' AND st.transaction_type = ?'; params.push(transaction_type); }
    if (start_date && end_date) { 
      query += ' AND st.transaction_date BETWEEN ? AND ?'; 
      params.push(start_date, end_date); 
    }
    
    query += ' ORDER BY st.transaction_date DESC, st.id DESC LIMIT 100';
    
    const [transactions] = await pool.execute(query, params);
    
    res.json({ success: true, transactions, total: transactions.length });
  } catch (error) {
    console.error('Transaction History Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// SUPPLIER MANAGEMENT
// ============================================
router.get('/suppliers', authenticateToken, requireRole(['stock_manager', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [suppliers] = await pool.execute(`
      SELECT s.*, COUNT(si.id) as items_supplied
      FROM suppliers s
      LEFT JOIN stock_items si ON s.id = si.supplier_id
      GROUP BY s.id
      ORDER BY s.supplier_name
    `);
    
    res.json({ success: true, suppliers, total: suppliers.length });
  } catch (error) {
    console.error('Suppliers Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/suppliers/create', authenticateToken, requireRole(['stock_manager', 'patron', 'matron']), async (req, res) => {
  try {
    const { supplier_name, contact_person, phone, email, address, notes } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO suppliers 
      (supplier_name, contact_person, phone, email, address, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [supplier_name, contact_person, phone, email, address, notes, req.user.userId]);
    
    res.json({ success: true, message: 'Supplier created successfully', supplier_id: result.insertId });
  } catch (error) {
    console.error('Create Supplier Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ANALYTICS & REPORTS
// ============================================
router.get('/analytics/consumption-trends', authenticateToken, requireRole(['stock_manager', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [monthlyConsumption] = await pool.execute(`
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        category,
        SUM(quantity) as total_consumed,
        COUNT(*) as transaction_count
      FROM stock_transactions st
      JOIN stock_items si ON st.item_id = si.id
      WHERE st.transaction_type = 'issue'
        AND st.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m'), category
      ORDER BY month DESC, category
    `);
    
    const [topConsumedItems] = await pool.execute(`
      SELECT 
        si.item_name,
        si.category,
        SUM(st.quantity) as total_consumed,
        COUNT(*) as issue_count
      FROM stock_transactions st
      JOIN stock_items si ON st.item_id = si.id
      WHERE st.transaction_type = 'issue'
        AND st.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
      GROUP BY si.id, si.item_name, si.category
      ORDER BY total_consumed DESC
      LIMIT 20
    `);
    
    const [costAnalysis] = await pool.execute(`
      SELECT 
        si.category,
        COUNT(DISTINCT si.id) as item_count,
        SUM(si.quantity * si.unit_price) as current_value,
        AVG(si.unit_price) as avg_unit_price
      FROM stock_items si
      GROUP BY si.category
      ORDER BY current_value DESC
    `);
    
    res.json({
      success: true,
      analytics: {
        monthly_consumption: monthlyConsumption,
        top_consumed_items: topConsumedItems,
        cost_analysis: costAnalysis
      }
    });
  } catch (error) {
    console.error('Consumption Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/analytics/predictive-reorder', authenticateToken, requireRole(['stock_manager', 'patron', 'matron']), async (req, res) => {
  try {
    const [predictions] = await pool.execute(`
      SELECT 
        si.id,
        si.item_name,
        si.category,
        si.quantity as current_quantity,
        si.reorder_level,
        COALESCE(AVG(st.quantity), 0) as avg_monthly_consumption,
        ROUND(si.quantity / NULLIF(AVG(st.quantity), 0), 1) as months_of_stock,
        CASE 
          WHEN si.quantity <= si.reorder_level THEN 'Urgent'
          WHEN si.quantity / NULLIF(AVG(st.quantity), 0) < 2 THEN 'Soon'
          ELSE 'Adequate'
        END as reorder_status
      FROM stock_items si
      LEFT JOIN stock_transactions st ON si.id = st.item_id 
        AND st.transaction_type = 'issue'
        AND st.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
      GROUP BY si.id, si.item_name, si.category, si.quantity, si.reorder_level
      HAVING reorder_status IN ('Urgent', 'Soon')
      ORDER BY 
        CASE reorder_status 
          WHEN 'Urgent' THEN 1
          WHEN 'Soon' THEN 2
          ELSE 3
        END,
        months_of_stock ASC
    `);
    
    res.json({ success: true, reorder_predictions: predictions });
  } catch (error) {
    console.error('Predictive Reorder Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/reports/stock-valuation', authenticateToken, requireRole(['stock_manager', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [valuation] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        SUM(quantity * unit_price) as total_value,
        AVG(unit_price) as avg_price
      FROM stock_items
      GROUP BY category
      ORDER BY total_value DESC
    `);
    
    const grandTotal = valuation.reduce((sum, cat) => sum + parseFloat(cat.total_value || 0), 0);
    
    res.json({
      success: true,
      valuation: {
        by_category: valuation,
        grand_total: grandTotal
      }
    });
  } catch (error) {
    console.error('Stock Valuation Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ADVANCED STOCK MANAGEMENT
// ============================================
router.post('/transactions/wastage', authenticateToken, requireRole(['stock_manager', 'patron', 'matron']), async (req, res) => {
  try {
    const { item_id, quantity, reason, notes } = req.body;
    
    const [item] = await pool.execute('SELECT * FROM stock_items WHERE id = ?', [item_id]);
    if (!item[0]) return res.status(404).json({ success: false, message: 'Item not found' });
    
    if (parseFloat(item[0].quantity) < parseFloat(quantity)) {
      return res.status(400).json({ success: false, message: 'Wastage quantity exceeds available stock' });
    }
    
    const newQuantity = parseFloat(item[0].quantity) - parseFloat(quantity);
    
    await pool.execute('UPDATE stock_items SET quantity = ?, last_updated = NOW() WHERE id = ?', [newQuantity, item_id]);
    
    const [result] = await pool.execute(`
      INSERT INTO stock_transactions 
      (item_id, transaction_type, quantity, previous_quantity, new_quantity, purpose, notes, performed_by, performed_by_name)
      VALUES (?, 'wastage', ?, ?, ?, ?, ?, ?, ?)
    `, [item_id, quantity, item[0].quantity, newQuantity, reason, notes, req.user.userId, req.user.name]);
    
    await pool.execute(`
      INSERT INTO system_activity_log 
      (user_id, user_name, action, details, created_at)
      VALUES (?, ?, 'stock_wastage', ?, NOW())
    `, [req.user.userId, req.user.name, JSON.stringify({
      item_name: item[0].item_name,
      quantity: quantity,
      reason: reason,
      value_lost: parseFloat(quantity) * parseFloat(item[0].unit_price)
    })]);
    
    res.json({ success: true, message: 'Wastage recorded successfully', new_quantity: newQuantity, transaction_id: result.insertId });
  } catch (error) {
    console.error('Record Wastage Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/alerts/low-stock', authenticateToken, requireRole(['stock_manager', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [lowStock] = await pool.execute(`
      SELECT 
        si.*,
        s.supplier_name,
        s.phone as supplier_phone,
        ROUND((si.quantity / si.reorder_level) * 100, 1) as stock_percentage,
        CASE 
          WHEN si.quantity = 0 THEN 'critical'
          WHEN si.quantity <= (si.reorder_level * 0.5) THEN 'urgent'
          WHEN si.quantity <= si.reorder_level THEN 'warning'
          ELSE 'normal'
        END as alert_level
      FROM stock_items si
      LEFT JOIN suppliers s ON si.supplier_id = s.id
      WHERE si.quantity <= si.reorder_level
      ORDER BY 
        CASE 
          WHEN si.quantity = 0 THEN 1
          WHEN si.quantity <= (si.reorder_level * 0.5) THEN 2
          WHEN si.quantity <= si.reorder_level THEN 3
          ELSE 4
        END,
        (si.quantity / si.reorder_level) ASC
    `);
    
    const alerts = {
      critical: lowStock.filter(item => item.alert_level === 'critical'),
      urgent: lowStock.filter(item => item.alert_level === 'urgent'),
      warning: lowStock.filter(item => item.alert_level === 'warning')
    };
    
    res.json({
      success: true,
      alerts: alerts,
      total_alerts: lowStock.length,
      summary: {
        critical_count: alerts.critical.length,
        urgent_count: alerts.urgent.length,
        warning_count: alerts.warning.length
      }
    });
  } catch (error) {
    console.error('Low Stock Alerts Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/analytics/wastage-report', authenticateToken, requireRole(['stock_manager', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        si.item_name,
        si.category,
        si.unit,
        si.unit_price,
        SUM(st.quantity) as total_wasted,
        SUM(st.quantity * si.unit_price) as value_lost,
        COUNT(*) as wastage_count,
        st.purpose as reason
      FROM stock_transactions st
      JOIN stock_items si ON st.item_id = si.id
      WHERE st.transaction_type = 'wastage'
    `;
    const params = [];
    
    if (start_date && end_date) {
      query += ' AND st.transaction_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    } else {
      query += ' AND st.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)';
    }
    
    query += ' GROUP BY si.id, si.item_name, si.category, si.unit, si.unit_price, st.purpose ORDER BY value_lost DESC';
    
    const [wastageData] = await pool.execute(query, params);
    
    const totalValueLost = wastageData.reduce((sum, item) => sum + parseFloat(item.value_lost || 0), 0);
    const totalQuantity = wastageData.reduce((sum, item) => sum + parseFloat(item.total_wasted || 0), 0);
    
    res.json({
      success: true,
      wastage_report: wastageData,
      summary: {
        total_value_lost: totalValueLost,
        total_quantity_wasted: totalQuantity,
        unique_items: wastageData.length
      }
    });
  } catch (error) {
    console.error('Wastage Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/auto-reorder/configure', authenticateToken, requireRole(['stock_manager', 'patron', 'matron']), async (req, res) => {
  try {
    const { item_id, enable_auto_reorder, reorder_quantity, preferred_supplier_id } = req.body;
    
    await pool.execute(`
      UPDATE stock_items 
      SET auto_reorder_enabled = ?, auto_reorder_quantity = ?, supplier_id = ?
      WHERE id = ?
    `, [enable_auto_reorder, reorder_quantity, preferred_supplier_id, item_id]);
    
    res.json({ success: true, message: 'Auto-reorder configuration updated' });
  } catch (error) {
    console.error('Auto-reorder Config Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/inventory/expiring-soon', authenticateToken, requireRole(['stock_manager', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { days_threshold = 30 } = req.query;
    
    const [expiringItems] = await pool.execute(`
      SELECT 
        si.*,
        DATEDIFF(si.expiry_date, CURDATE()) as days_until_expiry,
        CASE 
          WHEN DATEDIFF(si.expiry_date, CURDATE()) <= 7 THEN 'critical'
          WHEN DATEDIFF(si.expiry_date, CURDATE()) <= 14 THEN 'urgent'
          WHEN DATEDIFF(si.expiry_date, CURDATE()) <= 30 THEN 'warning'
          ELSE 'normal'
        END as expiry_alert_level
      FROM stock_items si
      WHERE si.expiry_date IS NOT NULL 
        AND si.expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
        AND si.quantity > 0
      ORDER BY si.expiry_date ASC
    `, [days_threshold]);
    
    res.json({
      success: true,
      expiring_items: expiringItems,
      total: expiringItems.length,
      summary: {
        critical: expiringItems.filter(i => i.expiry_alert_level === 'critical').length,
        urgent: expiringItems.filter(i => i.expiry_alert_level === 'urgent').length,
        warning: expiringItems.filter(i => i.expiry_alert_level === 'warning').length
      }
    });
  } catch (error) {
    console.error('Expiring Items Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
