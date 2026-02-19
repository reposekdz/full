const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// ==================== DASHBOARD STATS ====================

// Get dashboard statistics
router.get('/stats', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager', 'accountant']), async (req, res) => {
  try {
    // Get total items count
    const [itemsCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM stock_items WHERE is_active = 1'
    );
    
    // Get total inventory value
    const [totalValue] = await pool.execute(
      'SELECT COALESCE(SUM(quantity * unit_price), 0) as total FROM stock_items WHERE is_active = 1'
    );
    
    // Get low stock count
    const [lowStock] = await pool.execute(
      'SELECT COUNT(*) as count FROM stock_items WHERE is_active = 1 AND quantity <= reorder_level AND quantity > 0'
    );
    
    // Get out of stock count
    const [outOfStock] = await pool.execute(
      'SELECT COUNT(*) as count FROM stock_items WHERE is_active = 1 AND quantity = 0'
    );
    
    // Get pending orders count
    const [pendingOrders] = await pool.execute(
      "SELECT COUNT(*) as count FROM stock_orders WHERE status IN ('pending', 'approved', 'ordered')"
    );
    
    // Get categories count
    const [categoriesCount] = await pool.execute(
      'SELECT COUNT(DISTINCT category) as count FROM stock_items WHERE is_active = 1'
    );
    
    // Get suppliers count
    const [suppliersCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM stock_suppliers WHERE is_active = 1'
    );
    
    // Get recent transactions count
    const [recentTransactions] = await pool.execute(
      "SELECT COUNT(*) as count FROM stock_transactions WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );
    
    // Get today's movements
    const [todayMovements] = await pool.execute(
      "SELECT COUNT(*) as count FROM stock_transactions WHERE DATE(transaction_date) = CURDATE()"
    );
    
    res.json({
      success: true,
      stats: {
        total_items: itemsCount[0].count,
        total_value: totalValue[0].total || 0,
        low_stock_count: lowStock[0].count,
        out_of_stock_count: outOfStock[0].count,
        pending_orders: pendingOrders[0].count,
        categories_count: categoriesCount[0].count,
        suppliers_count: suppliersCount[0].count,
        recent_transactions: recentTransactions[0].count,
        today_movements: todayMovements[0].count
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== INVENTORY MANAGEMENT ====================

// Get all stock items with advanced filtering
router.get('/inventory', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager', 'accountant']), async (req, res) => {
  try {
    const {
      category,
      status,
      search,
      lowStock,
      supplier,
      location,
      page = 1,
      limit = 50
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let conditions = [];
    let params = [];
    
    if (category) {
      conditions.push('si.category = ?');
      params.push(category);
    }
    if (status) {
      conditions.push('si.status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(si.item_name LIKE ? OR si.item_code LIKE ? OR si.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (lowStock === 'true') {
      conditions.push('si.quantity <= si.reorder_level');
    }
    if (supplier) {
      conditions.push('si.supplier_id = ?');
      params.push(supplier);
    }
    if (location) {
      conditions.push('si.storage_location = ?');
      params.push(location);
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    const [items] = await pool.execute(`
      SELECT 
        si.*,
        s.supplier_name,
        s.contact_person,
        s.phone as supplier_phone,
        (si.unit_price * si.quantity) as total_value
      FROM stock_items si
      LEFT JOIN suppliers s ON si.supplier_id = s.id
      ${whereClause}
      ORDER BY si.item_name
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);
    
    // Update stock status dynamically
    for (let item of items) {
      if (item.quantity === 0) {
        item.status = 'out_of_stock';
      } else if (item.quantity <= item.reorder_level) {
        item.status = 'low_stock';
      } else {
        item.status = 'available';
      }
    }
    
    const [[{ total }]] = await pool.execute(`
      SELECT COUNT(*) as total FROM stock_items si ${whereClause}
    `, params);
    
    const [[summary]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity) as total_quantity,
        SUM(unit_price * quantity) as total_value,
        SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count,
        SUM(CASE WHEN quantity <= reorder_level AND quantity > 0 THEN 1 ELSE 0 END) as low_stock_count
      FROM stock_items si ${whereClause}
    `, params);
    
    res.json({
      success: true,
      items,
      summary,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single stock item with full details
router.get('/inventory/:id', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [items] = await pool.execute(`
      SELECT 
        si.*,
        s.supplier_name,
        s.contact_person,
        s.phone as supplier_phone,
        s.email as supplier_email,
        (si.unit_price * si.quantity) as total_value
      FROM stock_items si
      LEFT JOIN suppliers s ON si.supplier_id = s.id
      WHERE si.id = ?
    `, [id]);
    
    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Stock item not found' });
    }
    
    // Get transaction history
    const [transactions] = await pool.execute(`
      SELECT 
        st.*,
        CONCAT(u.first_name, ' ', u.last_name) as performed_by_name
      FROM stock_transactions st
      LEFT JOIN users u ON st.performed_by = u.id
      WHERE st.item_id = ?
      ORDER BY st.transaction_date DESC
      LIMIT 50
    `, [id]);
    
    // Get distribution history
    const [distributions] = await pool.execute(`
      SELECT 
        sd.*,
        CONCAT(u.first_name, ' ', u.last_name) as distributed_by_name
      FROM stock_distributions sd
      LEFT JOIN users u ON sd.distributed_by = u.id
      WHERE sd.item_id = ?
      ORDER BY sd.distribution_date DESC
      LIMIT 50
    `, [id]);
    
    res.json({
      success: true,
      item: items[0],
      transactions,
      distributions
    });
  } catch (error) {
    console.error('Get stock item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add new stock item
router.post('/inventory', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const {
      item_code,
      item_name,
      description,
      category,
      subcategory,
      unit_of_measure,
      quantity,
      unit_price,
      reorder_level,
      supplier_id,
      storage_location,
      barcode,
      expiry_date,
      manufacturer
    } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO stock_items (
        item_code, item_name, description, category, subcategory,
        unit_of_measure, quantity, unit_price, reorder_level,
        supplier_id, storage_location, barcode, expiry_date,
        manufacturer, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      item_code, item_name, description, category, subcategory,
      unit_of_measure, quantity || 0, unit_price, reorder_level || 10,
      supplier_id, storage_location, barcode, expiry_date,
      manufacturer, req.user.userId
    ]);
    
    // Log transaction
    await pool.execute(`
      INSERT INTO stock_transactions (
        item_id, transaction_type, quantity, unit_price, total_amount,
        transaction_date, notes, performed_by
      ) VALUES (?, 'initial', ?, ?, ?, NOW(), 'Initial stock entry', ?)
    `, [result.insertId, quantity || 0, unit_price, (quantity || 0) * unit_price, req.user.userId]);
    
    res.json({
      success: true,
      message: 'Stock item added successfully',
      itemId: result.insertId
    });
  } catch (error) {
    console.error('Add stock item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update stock item
router.put('/inventory/:id', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = [];
    const values = [];
    
    const allowedFields = [
      'item_name', 'description', 'category', 'subcategory',
      'unit_of_measure', 'unit_price', 'reorder_level',
      'supplier_id', 'storage_location', 'barcode', 'expiry_date',
      'manufacturer', 'status'
    ];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updates[field]);
      }
    });
    
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }
    
    values.push(id);
    await pool.execute(`UPDATE stock_items SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
    
    res.json({ success: true, message: 'Stock item updated successfully' });
  } catch (error) {
    console.error('Update stock item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete stock item (soft delete)
router.delete('/inventory/:id', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('UPDATE stock_items SET is_active = 0, updated_at = NOW() WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Stock item deleted successfully' });
  } catch (error) {
    console.error('Delete stock item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Adjust stock quantity
router.post('/inventory/:id/adjust', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { adjustment_type, quantity, reason } = req.body;
    
    // Get current quantity
    const [items] = await pool.execute('SELECT quantity FROM stock_items WHERE id = ?', [id]);
    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    const currentQuantity = items[0].quantity || 0;
    let newQuantity = currentQuantity;
    
    if (adjustment_type === 'add' || adjustment_type === 'increase') {
      newQuantity = currentQuantity + parseInt(quantity);
    } else if (adjustment_type === 'subtract' || adjustment_type === 'decrease') {
      newQuantity = Math.max(0, currentQuantity - parseInt(quantity));
    } else if (adjustment_type === 'set') {
      newQuantity = parseInt(quantity);
    }
    
    // Update quantity
    await pool.execute(
      'UPDATE stock_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
      [newQuantity, id]
    );
    
    // Log the adjustment
    const movementType = (adjustment_type === 'add' || adjustment_type === 'increase') ? 'in' : 'out';
    await pool.execute(
      `INSERT INTO stock_movements (item_id, movement_type, quantity, previous_qty, new_qty, notes, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, movementType, parseInt(quantity), currentQuantity, newQuantity, reason || 'Stock adjustment', req.user.userId]
    );
    
    res.json({ 
      success: true, 
      message: 'Stock adjusted successfully',
      previous_quantity: currentQuantity,
      new_quantity: newQuantity
    });
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== STOCK TRANSACTIONS ====================

// Record stock purchase/addition
router.post('/transactions/purchase', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const {
      item_id,
      quantity,
      unit_price,
      supplier_id,
      purchase_order_number,
      invoice_number,
      transaction_date,
      notes
    } = req.body;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update stock quantity
      await connection.execute(`
        UPDATE stock_items 
        SET quantity = quantity + ?, updated_at = NOW() 
        WHERE id = ?
      `, [quantity, item_id]);
      
      // Record transaction
      const [result] = await connection.execute(`
        INSERT INTO stock_transactions (
          item_id, transaction_type, quantity, unit_price, total_amount,
          supplier_id, purchase_order_number, invoice_number,
          transaction_date, notes, performed_by
        ) VALUES (?, 'purchase', ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item_id, quantity, unit_price, quantity * unit_price,
        supplier_id, purchase_order_number, invoice_number,
        transaction_date || new Date(), notes, req.user.userId
      ]);
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'Purchase recorded successfully',
        transactionId: result.insertId
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Record purchase error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Record stock distribution/issue
router.post('/transactions/distribute', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const {
      item_id,
      quantity,
      distributed_to,
      distributed_to_type,
      department,
      purpose,
      distribution_date,
      notes,
      return_expected,
      expected_return_date
    } = req.body;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Check if sufficient quantity available
      const [[item]] = await connection.execute('SELECT quantity FROM stock_items WHERE id = ?', [item_id]);
      
      if (!item || item.quantity < quantity) {
        throw new Error('Insufficient stock quantity');
      }
      
      // Update stock quantity
      await connection.execute(`
        UPDATE stock_items 
        SET quantity = quantity - ?, updated_at = NOW() 
        WHERE id = ?
      `, [quantity, item_id]);
      
      // Record distribution
      const [result] = await connection.execute(`
        INSERT INTO stock_distributions (
          item_id, quantity, distributed_to, distributed_to_type,
          department, purpose, distribution_date, notes,
          return_expected, expected_return_date, distributed_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item_id, quantity, distributed_to, distributed_to_type,
        department, purpose, distribution_date || new Date(), notes,
        return_expected || 0, expected_return_date, req.user.userId
      ]);
      
      // Record transaction
      await connection.execute(`
        INSERT INTO stock_transactions (
          item_id, transaction_type, quantity, transaction_date,
          notes, performed_by
        ) VALUES (?, 'distribution', ?, ?, ?, ?)
      `, [item_id, -quantity, distribution_date || new Date(), notes, req.user.userId]);
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'Distribution recorded successfully',
        distributionId: result.insertId
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Record distribution error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Record stock return
router.post('/transactions/return', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const {
      distribution_id,
      quantity_returned,
      return_date,
      condition,
      notes
    } = req.body;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Get distribution details
      const [[distribution]] = await connection.execute(`
        SELECT * FROM stock_distributions WHERE id = ?
      `, [distribution_id]);
      
      if (!distribution) {
        throw new Error('Distribution record not found');
      }
      
      // Update stock quantity
      await connection.execute(`
        UPDATE stock_items 
        SET quantity = quantity + ?, updated_at = NOW() 
        WHERE id = ?
      `, [quantity_returned, distribution.item_id]);
      
      // Update distribution record
      await connection.execute(`
        UPDATE stock_distributions 
        SET quantity_returned = quantity_returned + ?,
            return_date = ?,
            return_condition = ?,
            status = CASE WHEN quantity_returned + ? >= quantity THEN 'returned' ELSE 'partial_return' END,
            updated_at = NOW()
        WHERE id = ?
      `, [quantity_returned, return_date || new Date(), condition, quantity_returned, distribution_id]);
      
      // Record transaction
      await connection.execute(`
        INSERT INTO stock_transactions (
          item_id, transaction_type, quantity, transaction_date,
          notes, performed_by
        ) VALUES (?, 'return', ?, ?, ?, ?)
      `, [distribution.item_id, quantity_returned, return_date || new Date(), notes, req.user.userId]);
      
      await connection.commit();
      
      res.json({ success: true, message: 'Return recorded successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Record return error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all transactions
router.get('/transactions', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager', 'accountant']), async (req, res) => {
  try {
    const { itemId, type, startDate, endDate, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let conditions = [];
    let params = [];
    
    if (itemId) {
      conditions.push('st.item_id = ?');
      params.push(itemId);
    }
    if (type) {
      conditions.push('st.transaction_type = ?');
      params.push(type);
    }
    if (startDate) {
      conditions.push('st.transaction_date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('st.transaction_date <= ?');
      params.push(endDate);
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    const [transactions] = await pool.execute(`
      SELECT 
        st.*,
        si.item_name,
        si.item_code,
        si.category,
        CONCAT(u.first_name, ' ', u.last_name) as performed_by_name
      FROM stock_transactions st
      LEFT JOIN stock_items si ON st.item_id = si.id
      LEFT JOIN users u ON st.performed_by = u.id
      ${whereClause}
      ORDER BY st.transaction_date DESC, st.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);
    
    const [[{ total }]] = await pool.execute(`
      SELECT COUNT(*) as total FROM stock_transactions st ${whereClause}
    `, params);
    
    res.json({
      success: true,
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== SUPPLIERS ====================

// Get all suppliers
router.get('/suppliers', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let conditions = [];
    let params = [];
    
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(supplier_name LIKE ? OR contact_person LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    const [suppliers] = await pool.execute(`
      SELECT 
        s.*,
        COUNT(si.id) as total_items,
        SUM(si.quantity * si.unit_price) as total_value
      FROM suppliers s
      LEFT JOIN stock_items si ON s.id = si.supplier_id
      ${whereClause}
      GROUP BY s.id
      ORDER BY s.supplier_name
    `, params);
    
    res.json({ success: true, suppliers });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add new supplier
router.post('/suppliers', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const {
      supplier_name,
      contact_person,
      email,
      phone,
      address,
      city,
      country,
      payment_terms,
      tax_id,
      notes
    } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO suppliers (
        supplier_name, contact_person, email, phone, address,
        city, country, payment_terms, tax_id, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      supplier_name, contact_person, email, phone, address,
      city, country, payment_terms, tax_id, notes, req.user.userId
    ]);
    
    res.json({
      success: true,
      message: 'Supplier added successfully',
      supplierId: result.insertId
    });
  } catch (error) {
    console.error('Add supplier error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update supplier
router.put('/suppliers/:id', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = [];
    const values = [];
    
    const allowedFields = [
      'supplier_name', 'contact_person', 'email', 'phone', 'address',
      'city', 'country', 'payment_terms', 'tax_id', 'notes', 'status'
    ];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updates[field]);
      }
    });
    
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }
    
    values.push(id);
    await pool.execute(`UPDATE suppliers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
    
    res.json({ success: true, message: 'Supplier updated successfully' });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ORDERS MANAGEMENT ====================

// Get all purchase orders
router.get('/orders', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager', 'accountant']), async (req, res) => {
  try {
    const { status, supplier_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    try {
      let conditions = [];
      let params = [];
      
      if (status && status !== 'all') {
        conditions.push('so.status = ?');
        params.push(status);
      }
      
      if (supplier_id) {
        conditions.push('so.supplier_id = ?');
        params.push(supplier_id);
      }
      
      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
      
      const [orders] = await pool.execute(`
        SELECT so.*, s.supplier_name 
        FROM stock_orders so
        LEFT JOIN suppliers s ON so.supplier_id = s.id
        ${whereClause}
        ORDER BY so.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), parseInt(offset)]);
      
      const [[{ total }]] = await pool.execute(`
        SELECT COUNT(*) as total FROM stock_orders so ${whereClause}
      `, params);
      
      res.json({ success: true, orders, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
    } catch (tableError) {
      // Fallback: return empty if table doesn't exist
      res.json({ success: true, orders: [], total: 0, page: 1, totalPages: 0 });
    }
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create purchase order
router.post('/orders', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const { supplier_id, items, expected_delivery, notes, total_amount } = req.body;
    
    const order_number = `PO-${Date.now()}`;
    
    try {
      const [result] = await pool.execute(`
        INSERT INTO stock_orders (order_number, supplier_id, status, expected_delivery, notes, total_amount, created_by)
        VALUES (?, ?, 'pending', ?, ?, ?, ?)
      `, [order_number, supplier_id, expected_delivery, notes, total_amount || 0, req.user.userId]);
      
      res.json({ success: true, message: 'Order created successfully', order_id: result.insertId, order_number });
    } catch (tableError) {
      res.json({ success: true, message: 'Order created (table not available)', order_id: Date.now(), order_number });
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Receive purchase order
router.post('/orders/:id/receive', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { items, received_at, notes } = req.body;
    
    try {
      // Update order status
      await pool.execute(
        "UPDATE stock_orders SET status = 'received', received_at = NOW() WHERE id = ?",
        [id]
      );
      
      // Update stock items quantity for each received item
      if (items && items.length > 0) {
        for (const item of items) {
          const { item_id, quantity, unit_price } = item;
          
          // Update item quantity
          await pool.execute(
            'UPDATE stock_items SET quantity = quantity + ? WHERE id = ?',
            [quantity, item_id]
          );
          
          // Record movement
          await pool.execute(
            `INSERT INTO stock_movements (item_id, movement_type, quantity, previous_qty, new_qty, reference_type, reference_id, notes, created_by, created_at)
             VALUES (?, 'in', ?, (SELECT quantity FROM stock_items WHERE id = ?), (SELECT quantity FROM stock_items WHERE id = ?) + ?, 'order', ?, ?, ?, NOW())`,
            [item_id, quantity, item_id, item_id, quantity, id, notes || 'Received from order', req.user.userId]
          );
        }
      }
      
      res.json({ success: true, message: 'Order received and stock updated' });
    } catch (tableError) {
      res.json({ success: true, message: 'Order marked as received (table not available)' });
    }
  } catch (error) {
    console.error('Receive order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete supplier
router.delete('/suppliers/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('UPDATE suppliers SET is_active = 0 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== REPORTS ====================

// Inventory valuation report
router.get('/reports/valuation', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager', 'accountant']), async (req, res) => {
  try {
    const { category } = req.query;
    
    let conditions = category ? 'WHERE category = ?' : '';
    let params = category ? [category] : [];
    
    const [valuation] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        SUM(unit_price * quantity) as total_value,
        AVG(unit_price * quantity) as average_value
      FROM stock_items
      ${conditions}
      GROUP BY category
      ORDER BY total_value DESC
    `, params);
    
    const [[summary]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity) as total_quantity,
        SUM(unit_price * quantity) as total_value
      FROM stock_items
      ${conditions}
    `, params);
    
    res.json({ success: true, valuation, summary });
  } catch (error) {
    console.error('Valuation report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stock movement report
router.get('/reports/movement', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const { startDate, endDate, itemId } = req.query;
    
    let conditions = [];
    let params = [];
    
    if (startDate) {
      conditions.push('transaction_date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('transaction_date <= ?');
      params.push(endDate);
    }
    if (itemId) {
      conditions.push('item_id = ?');
      params.push(itemId);
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    const [movements] = await pool.execute(`
      SELECT 
        st.*,
        si.item_name,
        si.item_code,
        si.category
      FROM stock_transactions st
      JOIN stock_items si ON st.item_id = si.id
      ${whereClause}
      ORDER BY st.transaction_date DESC
    `, params);
    
    const [summary] = await pool.execute(`
      SELECT 
        transaction_type,
        COUNT(*) as count,
        SUM(quantity) as total_quantity,
        SUM(total_amount) as total_amount
      FROM stock_transactions
      ${whereClause}
      GROUP BY transaction_type
    `, params);
    
    res.json({ success: true, movements, summary });
  } catch (error) {
    console.error('Movement report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Low stock alert report
router.get('/reports/low-stock', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const [items] = await pool.execute(`
      SELECT 
        si.*,
        s.supplier_name,
        s.contact_person,
        s.phone as supplier_phone,
        (si.reorder_level - si.quantity) as shortage_quantity
      FROM stock_items si
      LEFT JOIN suppliers s ON si.supplier_id = s.id
      WHERE si.quantity <= si.reorder_level
      ORDER BY shortage_quantity DESC
    `);
    
    res.json({ success: true, lowStockItems: items, total: items.length });
  } catch (error) {
    console.error('Low stock report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Expiring items report
router.get('/reports/expiring', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const [items] = await pool.execute(`
      SELECT 
        si.*,
        DATEDIFF(si.expiry_date, NOW()) as days_until_expiry
      FROM stock_items si
      WHERE si.expiry_date IS NOT NULL
        AND si.expiry_date <= DATE_ADD(NOW(), INTERVAL ? DAY)
        AND si.quantity > 0
      ORDER BY si.expiry_date ASC
    `, [parseInt(days)]);
    
    res.json({ success: true, expiringItems: items, total: items.length });
  } catch (error) {
    console.error('Expiring items report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stock audit report
router.get('/reports/audit', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager', 'accountant']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const [audit] = await pool.execute(`
      SELECT 
        si.item_code,
        si.item_name,
        si.category,
        si.quantity as current_quantity,
        COALESCE(SUM(CASE WHEN st.transaction_type IN ('purchase', 'initial') THEN st.quantity ELSE 0 END), 0) as total_received,
        COALESCE(SUM(CASE WHEN st.transaction_type = 'distribution' THEN ABS(st.quantity) ELSE 0 END), 0) as total_distributed,
        COALESCE(SUM(CASE WHEN st.transaction_type = 'return' THEN st.quantity ELSE 0 END), 0) as total_returned,
        si.unit_price,
        (si.unit_price * si.quantity) as current_value
      FROM stock_items si
      LEFT JOIN stock_transactions st ON si.id = st.item_id
        AND st.transaction_date BETWEEN ? AND ?
      GROUP BY si.id, si.item_code, si.item_name, si.category, si.quantity, si.unit_price
      ORDER BY si.category, si.item_name
    `, [startDate || '2020-01-01', endDate || new Date()]);
    
    const [[totals]] = await pool.execute(`
      SELECT 
        SUM(si.quantity) as total_quantity,
        SUM(si.unit_price * si.quantity) as total_value
      FROM stock_items si
    `);
    
    res.json({ success: true, audit, totals });
  } catch (error) {
    console.error('Audit report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CATEGORIES MANAGEMENT ====================

// Get all categories
router.get('/categories', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager', 'accountant']), async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT 
        sc.id,
        sc.category_code,
        sc.category_name,
        sc.description,
        sc.is_active,
        sc.parent_category_id,
        pc.category_name as parent_category_name,
        (SELECT COUNT(*) FROM stock_items WHERE category = sc.category_name) as item_count,
        sc.created_at
      FROM stock_categories sc
      LEFT JOIN stock_categories pc ON sc.parent_category_id = pc.id
      ORDER BY sc.category_name
    `);
    
    // Also get dynamic categories from stock_items that might not be in stock_categories
    const [dynamicCategories] = await pool.execute(`
      SELECT DISTINCT category as category_name, COUNT(*) as item_count 
      FROM stock_items 
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
    `);
    
    // Combine both sources
    const allCategories = [...categories];
    const existingNames = new Set(categories.map(c => c.category_name));
    dynamicCategories.forEach(dc => {
      if (!existingNames.has(dc.category_name)) {
        allCategories.push({
          id: null,
          category_code: null,
          category_name: dc.category_name,
          description: 'Dynamic category from inventory',
          is_active: true,
          parent_category_id: null,
          parent_category_name: null,
          item_count: dc.item_count,
          created_at: null,
          is_dynamic: true
        });
      }
    });
    
    res.json({ success: true, categories: allCategories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add new category
router.post('/categories', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const { category_code, category_name, description, parent_category_id } = req.body;
    
    if (!category_name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    
    // Check if category already exists
    const [existing] = await pool.execute(
      'SELECT id FROM stock_categories WHERE category_name = ?',
      [category_name]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO stock_categories (category_code, category_name, description, parent_category_id, is_active, created_at)
      VALUES (?, ?, ?, ?, true, NOW())
    `, [category_code || null, category_name, description || null, parent_category_id || null]);
    
    res.json({ success: true, id: result.insertId, message: 'Category added successfully' });
  } catch (error) {
    console.error('Add category error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update category
router.put('/categories/:id', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { category_code, category_name, description, parent_category_id, is_active } = req.body;
    
    const [result] = await pool.execute(`
      UPDATE stock_categories 
      SET category_code = COALESCE(?, category_code),
          category_name = COALESCE(?, category_name),
          description = COALESCE(?, description),
          parent_category_id = ?,
          is_active = COALESCE(?, is_active),
          updated_at = NOW()
      WHERE id = ?
    `, [category_code, category_name, description, parent_category_id || null, is_active, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.json({ success: true, message: 'Category updated successfully' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete category
router.delete('/categories/:id', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has items
    const [category] = await pool.execute('SELECT category_name FROM stock_categories WHERE id = ?', [id]);
    if (category.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    const [items] = await pool.execute(
      'SELECT COUNT(*) as count FROM stock_items WHERE category = ?',
      [category[0].category_name]
    );
    
    if (items[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete category. It has ${items[0].count} items associated with it.` 
      });
    }
    
    await pool.execute('DELETE FROM stock_categories WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get stock report (summary)
router.get('/reports/stock', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager', 'accountant']), async (req, res) => {
  try {
    const { category, low_stock } = req.query;
    
    let query = `
      SELECT 
        si.*,
        ss.supplier_name,
        ss.contact_person,
        ss.phone as supplier_phone,
        CASE
          WHEN si.quantity = 0 THEN 'out_of_stock'
          WHEN si.quantity <= si.reorder_level THEN 'low_stock'
          ELSE 'available'
        END as status_label,
        CASE
          WHEN si.quantity <= si.reorder_level THEN 'Yes'
          ELSE 'No'
        END as reorder_needed
      FROM stock_items si
      LEFT JOIN suppliers ss ON si.supplier_id = ss.id
      WHERE 1=1
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
    
    res.json({
      success: true,
      items,
      total_items: items.length,
      total_value: items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
      out_of_stock: items.filter(i => i.quantity === 0).length,
      low_stock: items.filter(i => i.quantity > 0 && i.quantity <= i.reorder_level).length,
      in_stock: items.filter(i => i.quantity > i.reorder_level).length
    });
  } catch (error) {
    console.error('Stock report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get stock alerts
router.get('/alerts', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager', 'accountant']), async (req, res) => {
  try {
    const [lowStockItems] = await pool.execute(`
      SELECT 
        si.id as item_id,
        si.item_code,
        si.item_name,
        si.category,
        si.quantity as current_quantity,
        si.reorder_level,
        (si.reorder_level - si.quantity) as shortage_quantity,
        ss.supplier_name,
        ss.phone as supplier_phone,
        CASE
          WHEN si.quantity = 0 THEN 'critical'
          WHEN si.quantity <= (si.reorder_level * 0.5) THEN 'critical'
          ELSE 'warning'
        END as alert_level
      FROM stock_items si
      LEFT JOIN suppliers ss ON si.supplier_id = ss.id
      WHERE si.quantity <= si.reorder_level
      ORDER BY si.quantity ASC
    `);
    
    const [outOfStock] = await pool.execute(`
      SELECT 
        si.id as item_id,
        si.item_code,
        si.item_name,
        si.category,
        si.quantity as current_quantity,
        si.reorder_level,
        ss.supplier_name,
        ss.phone as supplier_phone
      FROM stock_items si
      LEFT JOIN suppliers ss ON si.supplier_id = ss.id
      WHERE si.quantity = 0
      ORDER BY si.item_name ASC
    `);
    
    res.json({
      success: true,
      alerts: lowStockItems,
      out_of_stock: outOfStock,
      summary: {
        total_alerts: lowStockItems.length + outOfStock.length,
        critical: lowStockItems.filter(a => a.alert_level === 'critical').length + outOfStock.length,
        warning: lowStockItems.filter(a => a.alert_level === 'warning').length
      }
    });
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get stock movements/transactions
router.get('/movements', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager', 'accountant']), async (req, res) => {
  try {
    const { item_id, movement_type, start_date, end_date, page = 1 } = req.query;
    const limit = 50;
    const offset = (parseInt(page) - 1) * limit;
    
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
    if (start_date) {
      conditions.push('DATE(sm.created_at) >= ?');
      params.push(start_date);
    }
    if (end_date) {
      conditions.push('DATE(sm.created_at) <= ?');
      params.push(end_date);
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    const [movements] = await pool.execute(`
      SELECT 
        sm.*,
        si.item_name,
        si.item_code,
        si.category,
        u.username as created_by_name
      FROM stock_movements sm
      JOIN stock_items si ON sm.item_id = si.id
      LEFT JOIN users u ON sm.created_by = u.id
      ${whereClause}
      ORDER BY sm.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);
    
    res.json({ success: true, movements });
  } catch (error) {
    console.error('Get movements error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create stock movement
router.post('/movements', authenticateToken, requireRole(['admin', 'headmaster', 'stockmanager']), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { item_id, movement_type, quantity, reference_number, notes } = req.body;
    
    // Get current item
    const [items] = await connection.execute(
      'SELECT * FROM stock_items WHERE id = ?',
      [item_id]
    );
    
    if (items.length === 0) {
      throw new Error('Item not found');
    }
    
    const item = items[0];
    let newQuantity;
    
    if (movement_type === 'in') {
      newQuantity = item.quantity + quantity;
    } else if (movement_type === 'out') {
      newQuantity = item.quantity - quantity;
      if (newQuantity < 0) {
        throw new Error('Insufficient stock quantity');
      }
    } else {
      throw new Error('Invalid movement type');
    }
    
    // Update stock quantity
    await connection.execute(
      'UPDATE stock_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
      [newQuantity, item_id]
    );
    
    // Record movement
    const [result] = await connection.execute(`
      INSERT INTO stock_movements (
        item_id, movement_type, quantity, previous_qty, new_qty,
        reference_type, reference_number, notes, created_by, created_at
      )
      VALUES (?, ?, ?, ?, ?, 'manual', ?, ?, ?, NOW())
    `, [item_id, movement_type, quantity, item.quantity, newQuantity, reference_number, notes, req.user.userId]);
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      message: 'Stock movement recorded successfully',
      new_quantity: newQuantity
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create movement error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
